// services/AIService.ts

import { AIResponse, Goal, MarketHighlight, Transaction } from "@/types";
import { getAI, getGenerativeModel, Schema } from "@react-native-firebase/ai";
import { getApp } from "@react-native-firebase/app";

const financialSchema = Schema.object({
  properties: {
    summary: Schema.string({
      description: "A 2-sentence summary of the user's financial health.",
    }),
    insights: Schema.array({
      items: Schema.object({
        properties: {
          type: Schema.string({
            enum: ["savings", "investment", "spending", "habit"],
          }),
          title: Schema.string(),
          description: Schema.string(),
          action: Schema.string({
            description:
              'A 1-word or short imperative action (e.g., "Reduce", "Invest", "Save")',
          }),
          impact: Schema.string({ enum: ["high", "medium", "low"] }),
        },
      }),
    }),
    investmentPlan: Schema.object({
      properties: {
        riskProfile: Schema.string(),
        allocation: Schema.array({
          items: Schema.object({
            properties: {
              asset: Schema.string(),
              percentage: Schema.number(),
            },
          }),
        }),
        strategy: Schema.string(),
        recommendations: Schema.array({ items: Schema.string() }),
      },
    }),
    challenges: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.string(),
          title: Schema.string(),
          description: Schema.string(),
          type: Schema.string({
            enum: ["no-spend", "savings-streak", "budget-limit"],
          }),
          targetDays: Schema.number(),
          icon: Schema.string({
            description:
              'Ionicons name string (e.g., "cafe-outline", "card-outline")',
          }),
        },
      }),
    }),
  },
});

export const AIService = {
  getInsights: async (
    transactions: Transaction[],
    goals: Goal[],
    currencySymbol: string,
    marketData?: MarketHighlight[],
    riskAppetite: string = "balanced",
    strategyStyle: string = "core-index",
  ): Promise<AIResponse> => {
    try {
      const app = getApp();
      const ai = getAI(app);
      const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: financialSchema,
        },
      });

      // Prepare minimized data for prompt
      const summary = transactions.slice(0, 50).map((t) => ({
        amount: t.amount,
        type: t.type,
        cat: t.categoryId,
        date: new Date(t.date).toISOString().split("T")[0],
      }));

      const goalsSummary = goals.map((g) => ({
        title: g.title,
        target: g.targetAmount,
        current: g.currentAmount,
        deadline: new Date(g.deadline).toISOString().split("T")[0],
        progress: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
      }));

      const prompt = `
        Act as a high-end AI Financial Advisor for a user using currency ${currencySymbol}.
        User's Risk Appetite: ${riskAppetite}
        Preferred Strategy Style: ${strategyStyle}
        
        FINANCIAL DATA:
        Recent Transactions: ${JSON.stringify(summary)}
        Active Goals: ${JSON.stringify(goalsSummary)}
        Current Market Benchmarks: ${JSON.stringify(marketData || [])}
        
        TASK:
        Provide professional, actionable financial advice. 
        1. Identify specific unnecessary spending patterns.
        2. Give target-driven saving adjustments that directly reference the user's GOAL DEADLINES.
        3. Create a SOPHISTICATED investment plan spanning US and Indian markets.
        4. Strategy for asset allocation.
        4a. Ensure allocation and recommendations align with the preferred strategy style.
        5. Generate 3-5 PERSONALIZED CHALLENGES to build better habits.
           - Challenges must be high-impact based on the user's spending (e.g., if "Entertainment" is high, suggest "No Subscriptions Week").
           - Challenge Types: 'no-spend' (skip category), 'savings-streak' (save $X daily), 'budget-limit' (daily cap).
           - Provide unique IDs, catchy titles, and descriptions.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return JSON.parse(responseText) as AIResponse;
    } catch (error) {
      console.error("AI Insights Error:", error);
      throw new Error(
        "Failed to generate AI insights. Please try again later.",
      );
    }
  },
};
