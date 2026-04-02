import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";

import { StockTicker } from "@/components/investments/StockTicker";
import { Typography } from "@/constants/Typography";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AIService } from "@/services/AIService";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { InvestmentAsset, MarketHighlight } from "@/types";

const { width } = Dimensions.get("window");

type RiskLevel = "conservative" | "balanced" | "aggressive";
type StrategyStyle =
  | "core-index"
  | "dividend-income"
  | "growth-momentum"
  | "value-compound";

const STRATEGY_OPTIONS: {
  key: StrategyStyle;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "core-index", label: "Core Index", icon: "layers-outline" },
  {
    key: "dividend-income",
    label: "Dividend Income",
    icon: "cash-outline",
  },
  {
    key: "growth-momentum",
    label: "Growth Momentum",
    icon: "trending-up-outline",
  },
  {
    key: "value-compound",
    label: "Value Compound",
    icon: "analytics-outline",
  },
];

const isUsAsset = (asset: InvestmentAsset) =>
  asset.exchange === "NASDAQ" || asset.exchange === "NYSE";

const isIndiaAsset = (asset: InvestmentAsset) =>
  asset.exchange === "NSE" || asset.exchange === "BSE";

const getAssetCurrencySymbol = (asset: InvestmentAsset) =>
  isIndiaAsset(asset) ? "INR" : "USD";

const formatAssetPrice = (asset: InvestmentAsset) => {
  const currency = getAssetCurrencySymbol(asset);
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${asset.price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatChangePercent = (asset: InvestmentAsset) => {
  const raw = asset.changePercent?.trim() || `${asset.change.toFixed(2)}%`;
  if (asset.change >= 0 && !raw.startsWith("+")) {
    return `+${raw}`;
  }
  return raw;
};

export default function InvestmentPlanModal() {
  const transactions = useFinanceStore((s) => s.transactions);
  const goals = useFinanceStore((s) => s.goals);
  const investmentWatchlist = useFinanceStore((s) => s.investmentWatchlist);
  const refreshMarketData = useFinanceStore((s) => s.refreshMarketData);
  const isSyncing = useFinanceStore((s) => s.isSyncing);
  const cachedPlan = useFinanceStore((s) => s.cachedAiInvestmentPlan);
  const setAiInsights = useFinanceStore((s) => s.setAiInsights);
  const canRefreshAi = useFinanceStore((s) => s.canRefreshAi);
  const isHydrated = useFinanceStore((s) => s.isHydrated);

  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();
  const router = useRouter();

  const [risk, setRisk] = useState<RiskLevel>("balanced");
  const [strategyStyle, setStrategyStyle] =
    useState<StrategyStyle>("core-index");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const riskSyncRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || riskSyncRef.current) {
      return;
    }

    const cachedRisk =
      cachedPlan?.investmentPlan?.riskProfile?.toLowerCase() as
        | RiskLevel
        | undefined;

    if (
      cachedRisk &&
      ["conservative", "balanced", "aggressive"].includes(cachedRisk)
    ) {
      setRisk(cachedRisk);
    }

    riskSyncRef.current = true;
  }, [isHydrated, cachedPlan]);

  useEffect(() => {
    if (!isHydrated) return;
    refreshMarketData();
  }, [isHydrated, refreshMarketData]);

  const generatePlan = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    if (!canRefreshAi()) {
      Alert.alert(
        "Daily Limit Reached",
        "You have reached your daily AI limit.",
      );
      return;
    }

    if (transactions.length < 3) {
      setFetchError("Add at least 3 transactions to unlock AI strategies.");
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoadingAi(true);
      setFetchError(null);

      const marketSnapshot: MarketHighlight[] = investmentWatchlist
        .slice(0, 10)
        .map((asset) => ({
          name: asset.name,
          symbol: asset.symbol,
          price: formatAssetPrice(asset),
          change: formatChangePercent(asset),
          isUp: asset.change >= 0,
        }));

      const res = await AIService.getInsights(
        transactions,
        goals,
        selectedCurrency.symbol,
        marketSnapshot,
        risk,
        strategyStyle,
      );

      setAiInsights(res, true);
    } catch (err: any) {
      setFetchError(
        err?.message ?? "Failed to generate strategy. Please try again.",
      );
    } finally {
      isFetchingRef.current = false;
      setIsLoadingAi(false);
    }
  }, [
    canRefreshAi,
    transactions,
    investmentWatchlist,
    goals,
    selectedCurrency.symbol,
    risk,
    strategyStyle,
    setAiInsights,
  ]);

  const currentPlan = cachedPlan?.investmentPlan;
  const currentPlanRisk = currentPlan?.riskProfile?.toLowerCase();
  const hasPlanForCurrentRisk = !!currentPlan && currentPlanRisk === risk;

  const usaWatchlist = investmentWatchlist.filter(isUsAsset);
  const indiaWatchlist = investmentWatchlist.filter(isIndiaAsset);

  const renderStockCard = (asset: InvestmentAsset, index: number) => (
    <Animated.View
      key={asset.symbol}
      entering={FadeInRight.delay(index * 80)}
      style={[
        styles.stockCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.stockHeader}>
        <Text style={[styles.stockSymbol, { color: colors.text }]}>
          {asset.symbol}
        </Text>
        <View
          style={[
            styles.exchangeBadge,
            { backgroundColor: `${colors.primary}10` },
          ]}
        >
          <Text style={[styles.exchangeText, { color: colors.primary }]}>
            {asset.exchange}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.stockName, { color: colors.tabIconDefault }]}
        numberOfLines={1}
      >
        {asset.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.stockPrice, { color: colors.text }]}>
          {formatAssetPrice(asset)}
        </Text>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor:
                asset.change >= 0
                  ? `${colors.success}15`
                  : `${colors.danger}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.changeText,
              {
                color: asset.change >= 0 ? colors.success : colors.danger,
              },
            ]}
          >
            {formatChangePercent(asset)}
          </Text>
        </View>
      </View>
      <Text style={[styles.updatedText, { color: colors.tabIconDefault }]}>
        Updated {new Date(asset.lastUpdated).toLocaleTimeString()}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          Alpha Investment Plan
        </Text>
        <TouchableOpacity
          onPress={() => refreshMarketData(true)}
          disabled={isSyncing}
          style={styles.closeBtn}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <StockTicker />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            RISK APPETITE
          </Text>
          <View
            style={[styles.riskContainer, { backgroundColor: colors.surface }]}
          >
            {(["conservative", "balanced", "aggressive"] as RiskLevel[]).map(
              (level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.riskButton,
                    risk === level && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setRisk(level)}
                  disabled={isLoadingAi}
                >
                  <Text
                    style={[
                      styles.riskButtonText,
                      {
                        color: risk === level ? "#FFF" : colors.tabIconDefault,
                      },
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            AI STRATEGY HUB
          </Text>

          <View style={styles.strategyOptionGrid}>
            {STRATEGY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setStrategyStyle(option.key)}
                disabled={isLoadingAi}
                style={[
                  styles.strategyOption,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  strategyStyle === option.key && {
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}12`,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={
                    strategyStyle === option.key
                      ? colors.primary
                      : colors.tabIconDefault
                  }
                />
                <Text
                  style={[
                    styles.strategyOptionText,
                    {
                      color:
                        strategyStyle === option.key
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
            Strategy generation runs only when you tap the button below.
          </Text>

          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={generatePlan}
            disabled={isLoadingAi}
          >
            {isLoadingAi ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons name="sparkles" size={16} color="#FFF" />
            )}
            <Text style={styles.generateButtonText}>
              {isLoadingAi ? "Generating Strategy..." : "Generate Strategy"}
            </Text>
          </TouchableOpacity>

          {fetchError ? (
            <View
              style={[
                styles.aiCard,
                {
                  backgroundColor: colors.surface,
                  padding: 24,
                  alignItems: "center",
                  gap: 12,
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={colors.danger}
              />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                {fetchError}
              </Text>
              <TouchableOpacity
                onPress={generatePlan}
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : hasPlanForCurrentRisk && currentPlan ? (
            <Animated.View
              entering={FadeInUp}
              style={[styles.aiCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.aiBadge,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
                    {currentPlan.riskProfile} Plan
                  </Text>
                </View>
              </View>

              <Text style={[styles.strategySummary, { color: colors.text }]}>
                {currentPlan.strategy}
              </Text>

              <View style={styles.allocationContent}>
                {currentPlan.allocation.map((item, index) => (
                  <View
                    key={`${item.asset}-${index}`}
                    style={styles.allocationRow}
                  >
                    <View style={styles.allocationLabel}>
                      <View
                        style={[
                          styles.allocationDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                      <Text
                        style={[styles.allocationName, { color: colors.text }]}
                      >
                        {item.asset}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.allocationPercent,
                        { color: colors.primary },
                      ]}
                    >
                      {item.percentage}%
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <Text style={[styles.subTitle, { color: colors.text }]}>
                Recommendations
              </Text>
              {currentPlan.recommendations.map((rec, index) => (
                <View key={`${rec}-${index}`} style={styles.recItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text
                    style={[styles.recText, { color: colors.textSecondary }]}
                  >
                    {rec}
                  </Text>
                </View>
              ))}
            </Animated.View>
          ) : currentPlan ? (
            <View
              style={[
                styles.aiCard,
                {
                  backgroundColor: colors.surface,
                  padding: 24,
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Latest saved plan is for {currentPlan.riskProfile}. Tap Generate
                Strategy for {risk} risk.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.aiCard,
                {
                  backgroundColor: colors.surface,
                  padding: 32,
                  alignItems: "center",
                },
              ]}
            >
              <Text
                style={[styles.loadingText, { color: colors.tabIconDefault }]}
              >
                Pick risk and strategy style, then tap Generate Strategy.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              MARKET WATCHLIST
            </Text>
            {isSyncing && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>

          <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
            Main USA and India stocks with local currency pricing.
          </Text>

          {usaWatchlist.length > 0 && (
            <View style={styles.regionSection}>
              <Text style={[styles.regionTitle, { color: colors.text }]}>
                USA
              </Text>
              <View style={styles.watchlistGrid}>
                {usaWatchlist.map((asset, index) =>
                  renderStockCard(asset, index),
                )}
              </View>
            </View>
          )}

          {indiaWatchlist.length > 0 && (
            <View style={styles.regionSection}>
              <Text style={[styles.regionTitle, { color: colors.text }]}>
                India
              </Text>
              <View style={styles.watchlistGrid}>
                {indiaWatchlist.map((asset, index) =>
                  renderStockCard(asset, usaWatchlist.length + index),
                )}
              </View>
            </View>
          )}

          {!isSyncing &&
            usaWatchlist.length === 0 &&
            indiaWatchlist.length === 0 && (
              <View
                style={[
                  styles.aiCard,
                  {
                    backgroundColor: colors.surface,
                    padding: 24,
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={[styles.loadingText, { color: colors.tabIconDefault }]}
                >
                  Market data is not available right now. Pull to refresh or try
                  again in a few seconds.
                </Text>
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { padding: 24 },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 16,
  },
  riskContainer: { flexDirection: "row", borderRadius: 16, padding: 6 },
  riskButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  riskButtonText: { fontSize: 12, fontWeight: "800" },
  strategyOptionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  strategyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  strategyOptionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  generateButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
  aiCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  strategySummary: {
    fontSize: Typography.sizes.base,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 20,
  },
  allocationContent: { gap: 12, marginBottom: 20 },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allocationLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  allocationDot: { width: 8, height: 8, borderRadius: 4 },
  allocationName: { fontSize: Typography.sizes.sm, fontWeight: "600" },
  allocationPercent: { fontSize: Typography.sizes.sm, fontWeight: "800" },
  divider: { height: 1, marginBottom: 20 },
  subTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  recItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  recText: { fontSize: Typography.sizes.xs, fontWeight: "600", flex: 1 },
  regionSection: {
    marginTop: 8,
    marginBottom: 14,
  },
  regionTitle: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 1,
  },
  watchlistGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stockCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stockSymbol: { fontSize: 14, fontWeight: "900" },
  exchangeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  exchangeText: { fontSize: 8, fontWeight: "800" },
  stockName: { fontSize: 10, fontWeight: "600", marginBottom: 12 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockPrice: { fontSize: 14, fontWeight: "800" },
  changeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  changeText: { fontSize: 9, fontWeight: "800" },
  updatedText: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: "600",
  },
});
