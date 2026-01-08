import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb, getFinancialData, getValuation } from "./db";
import { financialData, valuations } from "../drizzle/schema";
import { fetchCompanyFinancials, fetchStockPrice, getCryptoId, fetchCryptoPrice } from "./market";
import {
  calculateDCF,
  calculateMarginOfSafety,
  generateSensitivityMatrix,
  getVultureStatus,
  calculateCAGR,
} from "./valuation";
import { eq, desc } from "drizzle-orm";

export const valuationRouter = router({
  // Fetch and cache financial data for a ticker
  fetchFinancials: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .mutation(async ({ input }) => {
      const ticker = input.ticker.toUpperCase();
      const financials = await fetchCompanyFinancials(ticker);

      if (!financials) {
        throw new Error(`Failed to fetch financials for ${ticker}`);
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if record exists
      const existing = await db
        .select()
        .from(financialData)
        .where(eq(financialData.ticker, ticker))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(financialData)
          .set({
            revenue: financials.revenue.toString(),
            operatingCashFlow: financials.operatingCashFlow.toString(),
            capex: financials.capex.toString(),
            totalDebt: financials.totalDebt.toString(),
            cash: financials.cash.toString(),
            sharesOutstanding: financials.sharesOutstanding.toString(),
            updatedAt: new Date(),
          })
          .where(eq(financialData.ticker, ticker));
      } else {
        // Insert new
        await db.insert(financialData).values({
          ticker,
          revenue: financials.revenue.toString(),
          operatingCashFlow: financials.operatingCashFlow.toString(),
          capex: financials.capex.toString(),
          totalDebt: financials.totalDebt.toString(),
          cash: financials.cash.toString(),
          sharesOutstanding: financials.sharesOutstanding.toString(),
        });
      }

      return financials;
    }),

  // Calculate DCF valuation
  calculateValuation: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        assetType: z.enum(["stock", "crypto"]).default("stock"),
        customGrowthRate: z.number().optional(),
        customWacc: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const ticker = input.ticker.toUpperCase();
      let financials = await getFinancialData(ticker);

      if (!financials) {
        throw new Error(`No financial data found for ${ticker}. Please fetch financials first.`);
      }

      // Get current price
      let currentPrice = 0;
      if (input.assetType === "crypto") {
        const cryptoId = getCryptoId(ticker);
        if (cryptoId) {
          currentPrice = (await fetchCryptoPrice(cryptoId)) || 0;
        }
      } else {
        currentPrice = (await fetchStockPrice(ticker)) || 0;
      }

      const metrics = {
        revenue: parseFloat(financials.revenue?.toString() || "0"),
        operatingCashFlow: parseFloat(financials.operatingCashFlow?.toString() || "0"),
        capex: parseFloat(financials.capex?.toString() || "0"),
        totalDebt: parseFloat(financials.totalDebt?.toString() || "0"),
        cash: parseFloat(financials.cash?.toString() || "0"),
        sharesOutstanding: parseFloat(financials.sharesOutstanding?.toString() || "1"),
        growthRate: input.customGrowthRate || parseFloat(financials.growthRate?.toString() || "20"),
        wacc: input.customWacc || parseFloat(financials.wacc?.toString() || "10"),
        currentPrice,
      };

      const dcfResult = calculateDCF(metrics);
      const marginOfSafety = calculateMarginOfSafety(dcfResult.intrinsicValue, currentPrice);
      const hasMoat = financials.hasMoat ? true : false;
      const vultureStatus = getVultureStatus(
        dcfResult.intrinsicValue,
        currentPrice,
        marginOfSafety,
        dcfResult.debtToEquity,
        hasMoat
      );

      // Save valuation to database
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(valuations)
        .where(eq(valuations.ticker, ticker))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(valuations)
          .set({
            intrinsicValue: dcfResult.intrinsicValue.toString(),
            marginOfSafety: marginOfSafety.toString(),
            fcf: dcfResult.fcf.toString(),
            fcfMargin: dcfResult.fcfMargin.toString(),
            debtToEquity: dcfResult.debtToEquity.toString(),
            vultureStatus,
            calculatedAt: new Date(),
          })
          .where(eq(valuations.ticker, ticker));
      } else {
        await db.insert(valuations).values({
          ticker,
          intrinsicValue: dcfResult.intrinsicValue.toString(),
          marginOfSafety: marginOfSafety.toString(),
          fcf: dcfResult.fcf.toString(),
          fcfMargin: dcfResult.fcfMargin.toString(),
          debtToEquity: dcfResult.debtToEquity.toString(),
          vultureStatus,
        });
      }

      return {
        ...dcfResult,
        marginOfSafety,
        vultureStatus,
        currentPrice,
      };
    }),

  // Get sensitivity analysis
  getSensitivityAnalysis: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
      const ticker = input.ticker.toUpperCase();
      const financials = await getFinancialData(ticker);

      if (!financials) {
        throw new Error(`No financial data found for ${ticker}`);
      }

      const metrics = {
        revenue: parseFloat(financials.revenue?.toString() || "0"),
        operatingCashFlow: parseFloat(financials.operatingCashFlow?.toString() || "0"),
        capex: parseFloat(financials.capex?.toString() || "0"),
        totalDebt: parseFloat(financials.totalDebt?.toString() || "0"),
        cash: parseFloat(financials.cash?.toString() || "0"),
        sharesOutstanding: parseFloat(financials.sharesOutstanding?.toString() || "1"),
        growthRate: parseFloat(financials.growthRate?.toString() || "20"),
        wacc: parseFloat(financials.wacc?.toString() || "10"),
        currentPrice: 0,
      };

      return generateSensitivityMatrix(
        metrics,
        metrics.growthRate,
        metrics.wacc
      );
    }),

  // Get valuation history
  getValuationHistory: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db
        .select()
        .from(valuations)
        .where(eq(valuations.ticker, input.ticker.toUpperCase()))
        .orderBy(desc(valuations.calculatedAt))
        .limit(10);
    }),

  // Update financial assumptions (growth rate, WACC)
  updateAssumptions: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        growthRate: z.number().optional(),
        wacc: z.number().optional(),
        hasMoat: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const ticker = input.ticker.toUpperCase();
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: Record<string, any> = {};
      if (input.growthRate !== undefined) updates.growthRate = input.growthRate.toString();
      if (input.wacc !== undefined) updates.wacc = input.wacc.toString();
      if (input.hasMoat !== undefined) updates.hasMoat = input.hasMoat ? 1 : 0;
      updates.updatedAt = new Date();

      await db
        .update(financialData)
        .set(updates)
        .where(eq(financialData.ticker, ticker));

      return { success: true };
    }),
});
