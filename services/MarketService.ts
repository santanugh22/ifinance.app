// services/MarketService.ts

import { InvestmentAsset, MarketHighlight } from "@/types";
import {API_KEY_L} from "../env"
const API_KEY = API_KEY_L;
const BASE_URL = "https://www.alphavantage.co/query";
const REQUEST_INTERVAL_MS = 1200;
const QUOTE_CACHE_TTL_MS = 10 * 60 * 1000;
const HIGHLIGHT_CACHE_TTL_MS = 5 * 60 * 1000;
const BURST_LIMIT_COOLDOWN_MS = 75 * 1000;
const DAILY_LIMIT_COOLDOWN_MS = 6 * 60 * 60 * 1000;

type Exchange = InvestmentAsset["exchange"];

const SYMBOL_META: Record<string, { name: string; exchange: Exchange }> = {
  AAPL: { name: "Apple", exchange: "NASDAQ" },
  MSFT: { name: "Microsoft", exchange: "NASDAQ" },
  NVDA: { name: "NVIDIA", exchange: "NASDAQ" },
  AMZN: { name: "Amazon", exchange: "NASDAQ" },
  GOOGL: { name: "Alphabet", exchange: "NASDAQ" },
  SPY: { name: "S&P 500 ETF", exchange: "NYSE" },
  QQQ: { name: "Nasdaq 100 ETF", exchange: "NASDAQ" },
  DIA: { name: "Dow Jones ETF", exchange: "NYSE" },
  "RELIANCE.BSE": { name: "Reliance Industries", exchange: "BSE" },
  "TCS.BSE": { name: "TCS", exchange: "BSE" },
  "INFY.BSE": { name: "Infosys", exchange: "BSE" },
  "HDFCBANK.BSE": { name: "HDFC Bank", exchange: "BSE" },
  "ICICIBANK.BSE": { name: "ICICI Bank", exchange: "BSE" },
};

const HIGHLIGHT_SYMBOLS = [
  "SPY",
  "QQQ",
  "AAPL",
  "RELIANCE.BSE",
  "TCS.BSE",
  "INFY.BSE",
];

const resolveExchange = (symbol: string): Exchange => {
  const upper = symbol.toUpperCase();
  if (SYMBOL_META[upper]) return SYMBOL_META[upper].exchange;
  if (upper.endsWith(".BSE")) return "BSE";
  if (upper.endsWith(".NSE") || upper.endsWith(".NS")) return "NSE";
  return "NASDAQ";
};

const cleanName = (symbol: string) =>
  symbol.replace(".BSE", "").replace(".NSE", "").replace(".NS", "");

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

const quoteCache = new Map<string, InvestmentAsset>();
const inFlightQuoteRequests = new Map<
  string,
  Promise<InvestmentAsset | null>
>();

let cachedHighlights: { data: MarketHighlight[]; cachedAt: number } | null =
  null;
let lastRequestAt = 0;
let rateLimitedUntil = 0;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimited = () => Date.now() < rateLimitedUntil;

const getCachedQuote = (
  symbol: string,
  includeStale: boolean = false,
): InvestmentAsset | null => {
  const cached = quoteCache.get(normalizeSymbol(symbol));
  if (!cached) return null;
  if (includeStale) return cached;
  return Date.now() - cached.lastUpdated <= QUOTE_CACHE_TTL_MS ? cached : null;
};

const paceRequests = async () => {
  const elapsed = Date.now() - lastRequestAt;
  const waitTime = REQUEST_INTERVAL_MS - elapsed;
  if (waitTime > 0) {
    await delay(waitTime);
  }
  lastRequestAt = Date.now();
};

const applyRateLimitBackoff = (message: string) => {
  const lowerMessage = message.toLowerCase();
  const isDailyLimit =
    lowerMessage.includes("25 requests per day") ||
    lowerMessage.includes("daily rate limit") ||
    lowerMessage.includes("standard api rate limit");

  const cooldown = isDailyLimit
    ? DAILY_LIMIT_COOLDOWN_MS
    : BURST_LIMIT_COOLDOWN_MS;

  rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + cooldown);
};

const formatChangePercent = (raw: string | undefined, change: number) => {
  const parsed = Number.parseFloat(String(raw ?? "").replace("%", ""));
  const magnitude = Number.isFinite(parsed)
    ? Math.abs(parsed)
    : Math.abs(change || 0);
  const signedValue = change < 0 ? -magnitude : magnitude;
  return `${signedValue >= 0 ? "+" : ""}${signedValue.toFixed(2)}%`;
};

const toAsset = (
  requestedSymbol: string,
  quote: any,
): InvestmentAsset | null => {
  const apiSymbol = normalizeSymbol(quote["01. symbol"] || requestedSymbol);
  const meta = SYMBOL_META[apiSymbol] || SYMBOL_META[requestedSymbol];
  const exchange = meta?.exchange || resolveExchange(apiSymbol);

  const price = Number.parseFloat(quote["05. price"]);
  const change = Number.parseFloat(quote["09. change"]);

  if (!Number.isFinite(price) || !Number.isFinite(change)) {
    return null;
  }

  return {
    symbol: apiSymbol,
    name: meta?.name || cleanName(apiSymbol),
    price,
    change,
    changePercent: formatChangePercent(quote["10. change percent"], change),
    exchange,
    lastUpdated: Date.now(),
  };
};

const FALLBACK_HIGHLIGHTS: MarketHighlight[] = [
  {
    name: "S&P 500 ETF",
    symbol: "SPY",
    price: "$521.40",
    change: "+0.42%",
    isUp: true,
  },
  {
    name: "Nasdaq 100 ETF",
    symbol: "QQQ",
    price: "$446.12",
    change: "+0.55%",
    isUp: true,
  },
  {
    name: "Reliance Industries",
    symbol: "RELIANCE.BSE",
    price: "₹2901.30",
    change: "+0.33%",
    isUp: true,
  },
  {
    name: "TCS",
    symbol: "TCS.BSE",
    price: "₹4023.55",
    change: "-0.18%",
    isUp: false,
  },
];

export const MarketService = {
  /**
   * Fetches the latest quote for a given symbol (e.g. "RELIANCE.BSE" or "AAPL")
   */
  getGlobalQuote: async (symbol: string): Promise<InvestmentAsset | null> => {
    const normalized = normalizeSymbol(symbol);

    const freshCachedQuote = getCachedQuote(normalized);
    if (freshCachedQuote) {
      return freshCachedQuote;
    }

    if (inFlightQuoteRequests.has(normalized)) {
      return inFlightQuoteRequests.get(normalized)!;
    }

    if (isRateLimited()) {
      return getCachedQuote(normalized, true);
    }

    const request = (async () => {
      await paceRequests();

      const response = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${normalized}&apikey=${API_KEY}`,
      );
      const data = await response.json();

      const infoMessage =
        typeof data?.Information === "string" ? data.Information : null;
      if (infoMessage) {
        applyRateLimitBackoff(infoMessage);
        return getCachedQuote(normalized, true);
      }

      const quote = data?.["Global Quote"];
      if (!quote) {
        return getCachedQuote(normalized, true);
      }

      const asset = toAsset(normalized, quote);
      if (!asset) {
        return getCachedQuote(normalized, true);
      }

      quoteCache.set(normalized, asset);
      quoteCache.set(asset.symbol, asset);
      return asset;
    })()
      .catch((error) => {
        console.error(`MarketService Error for ${normalized}:`, error);
        return getCachedQuote(normalized, true);
      })
      .finally(() => {
        inFlightQuoteRequests.delete(normalized);
      });

    inFlightQuoteRequests.set(normalized, request);

    try {
      return await request;
    } catch {
      return getCachedQuote(normalized, true);
    }
  },

  getGlobalQuotes: async (symbols: string[]): Promise<InvestmentAsset[]> => {
    const uniqueSymbols = Array.from(new Set(symbols.map(normalizeSymbol)));
    const results: InvestmentAsset[] = [];

    for (const symbol of uniqueSymbols) {
      const quote = await MarketService.getGlobalQuote(symbol);
      if (quote) {
        results.push(quote);
      }

      if (isRateLimited() && !quote) {
        // Stop hammering the API when we know it is currently throttling.
        break;
      }
    }

    return results;
  },

  /**
   * Fetches a batch of market indices for the dashboard ticker
   */
  getMarketHighlights: async (): Promise<MarketHighlight[]> => {
    if (
      cachedHighlights &&
      Date.now() - cachedHighlights.cachedAt <= HIGHLIGHT_CACHE_TTL_MS
    ) {
      return cachedHighlights.data;
    }

    const quotes = await MarketService.getGlobalQuotes(HIGHLIGHT_SYMBOLS);
    const quoteBySymbol = new Map(
      quotes.map((quote) => [normalizeSymbol(quote.symbol), quote]),
    );

    const results = HIGHLIGHT_SYMBOLS.map((symbol) => {
      const quote = quoteBySymbol.get(normalizeSymbol(symbol));
      if (!quote) return null;

      const isIndia = quote.exchange === "BSE" || quote.exchange === "NSE";
      return {
        name: quote.name,
        symbol: quote.symbol,
        price: `${isIndia ? "₹" : "$"}${quote.price.toFixed(2)}`,
        change: quote.changePercent,
        isUp: quote.change >= 0,
      };
    }).filter((item): item is MarketHighlight => item !== null);

    const data = results.length > 0 ? results : FALLBACK_HIGHLIGHTS;
    cachedHighlights = { data, cachedAt: Date.now() };

    return data;
  },
};
