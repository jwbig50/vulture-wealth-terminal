import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getUserHoldings, getValuation, getFinancialData } from "./db";

export const insightsRouter = router({
  // Generate portfolio analysis
  analyzePortfolio: protectedProcedure.query(async ({ ctx }) => {
    const holdings = await getUserHoldings(ctx.user.id);

    if (holdings.length === 0) {
      return {
        analysis: "Your portfolio is empty. Start by adding your first position to begin tracking.",
        recommendations: [],
        riskAssessment: "N/A",
      };
    }

    // Gather valuation data for all holdings
    const valuationData = await Promise.all(
      holdings.map(async (h) => {
        const valuation = await getValuation(h.ticker);
        const financials = await getFinancialData(h.ticker);
        return {
          ticker: h.ticker,
          shares: parseFloat(h.shares.toString()),
          valuation: valuation ? {
            marginOfSafety: parseFloat(valuation.marginOfSafety?.toString() || "0"),
            vultureStatus: valuation.vultureStatus,
            intrinsicValue: parseFloat(valuation.intrinsicValue?.toString() || "0"),
          } : null,
          financials,
        };
      })
    );

    const portfolioSummary = valuationData
      .map(
        (d) =>
          `${d.ticker}: ${d.shares} shares, Status: ${d.valuation?.vultureStatus || "Unknown"}, MOS: ${d.valuation?.marginOfSafety.toFixed(1) || "N/A"}%`
      )
      .join("\n");

    const prompt = `You are an expert investment analyst. Analyze this portfolio and provide insights:

Portfolio Holdings:
${portfolioSummary}

Provide:
1. A brief assessment of the portfolio's overall health
2. Key risks or concerns
3. 2-3 specific recommendations for improvement
4. Educational insight about one investment principle relevant to this portfolio

Keep the tone professional but accessible. Focus on actionable insights.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert investment analyst specializing in value investing and fundamental analysis. Provide clear, actionable insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const analysis = response.choices[0]?.message.content || "";

      return {
        analysis,
        recommendations: [
          "Review holdings with MOS < 10% for potential exit opportunities",
          "Consider rebalancing to equal-weight allocation quarterly",
          "Monitor debt-to-equity ratios for financial stability",
        ],
        riskAssessment: "Moderate",
      };
    } catch (error) {
      console.error("Failed to generate AI analysis:", error);
      return {
        analysis: "Unable to generate AI analysis at this time. Please try again later.",
        recommendations: [],
        riskAssessment: "Unknown",
      };
    }
  }),

  // Get educational content about a topic
  getEducationalContent: protectedProcedure
    .input(z.object({ topic: z.string() }))
    .query(async ({ input }) => {
      const topics: Record<string, string> = {
        dcf: "DCF (Discounted Cash Flow) Valuation",
        mos: "Margin of Safety",
        cagr: "CAGR (Compound Annual Growth Rate)",
        moat: "Economic Moat",
        dca: "Dollar-Cost Averaging",
      };

      const topicName = topics[input.topic.toLowerCase()] || input.topic;

      const prompt = `Explain "${topicName}" in the context of value investing. Include:
1. What it is and why it matters
2. How to calculate or assess it
3. A practical example
4. Common mistakes to avoid

Keep it concise but informative (2-3 paragraphs).`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert investment educator. Explain investment concepts clearly and practically.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return {
          topic: topicName,
          content: response.choices[0]?.message.content || "",
        };
      } catch (error) {
        console.error("Failed to generate educational content:", error);
        return {
          topic: topicName,
          content: "Unable to generate educational content at this time.",
        };
      }
    }),

  // Assess if user is being a "Vulture" or "Sheep"
  getVultureAssessment: protectedProcedure.query(async ({ ctx }) => {
    const holdings = await getUserHoldings(ctx.user.id);

    if (holdings.length === 0) {
      return {
        assessment: "NEUTRAL",
        message: "Add holdings to get your Vulture/Sheep assessment.",
        score: 0,
      };
    }

    // Calculate average margin of safety
    const valuations = await Promise.all(
      holdings.map(async (h) => {
        const val = await getValuation(h.ticker);
        return parseFloat(val?.marginOfSafety?.toString() || "0");
      })
    );

    const avgMOS = valuations.reduce((a, b) => a + b, 0) / valuations.length;

    let assessment = "SHEEP";
    let message = "You're buying at market prices. Consider waiting for better opportunities.";
    let score = 0;

    if (avgMOS > 20) {
      assessment = "VULTURE";
      message = "Excellent! You're buying with a strong margin of safety. This is disciplined value investing.";
      score = 100;
    } else if (avgMOS > 10) {
      assessment = "SMART INVESTOR";
      message = "Good! You have a reasonable margin of safety. Keep looking for better opportunities.";
      score = 75;
    } else if (avgMOS > 0) {
      assessment = "FAIR PRICE BUYER";
      message = "You're buying at fair value. Consider waiting for dips to build positions.";
      score = 50;
    } else {
      assessment = "SHEEP";
      message = "You're buying overvalued assets. Channel your inner Vulture and wait for better prices!";
      score = 0;
    }

    return {
      assessment,
      message,
      score,
      avgMOS: avgMOS.toFixed(1),
    };
  }),
});
