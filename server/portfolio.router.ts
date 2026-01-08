import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getUserHoldings,
  getUserWatchlist,
  getHoldingByUserAndTicker,
  getFinancialData,
  getValuation,
  getPriceHistory,
  getUserAllocations,
  getDb,
} from "./db";
import { holdings, watchlist, financialData, valuations, allocations } from "../drizzle/schema";
import { fetchStockPrice, fetchCryptoPrice, getCryptoId, cachePriceHistory } from "./market";
import { calculateDCF, calculateMarginOfSafety, getVultureStatus, calculateCAGR } from "./valuation";
import { eq } from "drizzle-orm";

export const portfolioRouter = router({
  // Get user's portfolio holdings
  getHoldings: protectedProcedure.query(async ({ ctx }) => {
    return getUserHoldings(ctx.user.id);
  }),

  // Get user's watchlist
  getWatchlist: protectedProcedure.query(async ({ ctx }) => {
    return getUserWatchlist(ctx.user.id);
  }),

  // Add to watchlist
  addToWatchlist: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1),
        assetType: z.enum(["stock", "crypto"]).default("stock"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(watchlist).values({
        userId: ctx.user.id,
        ticker: input.ticker.toUpperCase(),
        assetType: input.assetType,
      });

      return { success: true };
    }),

  // Remove from watchlist
  removeFromWatchlist: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(watchlist)
        .where(
          eq(watchlist.userId, ctx.user.id) &&
            eq(watchlist.ticker, input.ticker.toUpperCase())
        );

      return { success: true };
    }),

  // Add or update holding (DCA)
  updatePosition: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1),
        shares: z.number().positive(),
        purchasePrice: z.number().positive(),
        assetType: z.enum(["stock", "crypto"]).default("stock"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await getHoldingByUserAndTicker(ctx.user.id, input.ticker);

      if (existing) {
        // Update existing holding with new average cost basis
        const totalShares = parseFloat(existing.shares.toString()) + input.shares;
        const totalCost =
          parseFloat(existing.totalCostBasis.toString()) +
          input.shares * input.purchasePrice;
        const newAvgCost = totalCost / totalShares;

        await db
          .update(holdings)
          .set({
            shares: totalShares.toString(),
            averageCostBasis: newAvgCost.toString(),
            totalCostBasis: totalCost.toString(),
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, existing.id));
      } else {
        // Create new holding
        const totalCost = input.shares * input.purchasePrice;
        await db.insert(holdings).values({
          userId: ctx.user.id,
          ticker: input.ticker.toUpperCase(),
          assetType: input.assetType,
          shares: input.shares.toString(),
          averageCostBasis: input.purchasePrice.toString(),
          totalCostBasis: totalCost.toString(),
        });
      }

      return { success: true };
    }),

  // Remove holding
  removeHolding: protectedProcedure
    .input(z.object({ ticker: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(holdings)
        .where(
          eq(holdings.userId, ctx.user.id) &&
            eq(holdings.ticker, input.ticker.toUpperCase())
        );

      return { success: true };
    }),

  // Get current price for ticker
  getCurrentPrice: protectedProcedure
    .input(z.object({ ticker: z.string(), assetType: z.enum(["stock", "crypto"]) }))
    .query(async ({ input }) => {
      let price: number | null = null;

      if (input.assetType === "crypto") {
        const cryptoId = getCryptoId(input.ticker);
        if (cryptoId) {
          price = await fetchCryptoPrice(cryptoId);
        }
      } else {
        price = await fetchStockPrice(input.ticker);
      }

      if (price) {
        await cachePriceHistory(input.ticker, input.assetType, price);
      }

      return { price, timestamp: new Date() };
    }),

  // Get portfolio summary with all metrics
  getPortfolioSummary: protectedProcedure.query(async ({ ctx }) => {
    const userHoldings = await getUserHoldings(ctx.user.id);
    let totalValue = 0;
    let totalCostBasis = 0;
    const holdings_data = [];

    for (const holding of userHoldings) {
      const ticker = holding.ticker;
      let currentPrice = 0;

      // Fetch current price
      if (holding.assetType === "crypto") {
        const cryptoId = getCryptoId(ticker);
        if (cryptoId) {
          currentPrice = (await fetchCryptoPrice(cryptoId)) || 0;
        }
      } else {
        currentPrice = (await fetchStockPrice(ticker)) || 0;
      }

      const shares = parseFloat(holding.shares.toString());
      const avgCost = parseFloat(holding.averageCostBasis.toString());
      const marketValue = shares * currentPrice;
      const gain = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

      totalValue += marketValue;
      totalCostBasis += parseFloat(holding.totalCostBasis.toString());

      holdings_data.push({
        ticker,
        shares,
        averageCostBasis: avgCost,
        currentPrice,
        marketValue,
        gainPercent: gain,
        gainDollar: marketValue - parseFloat(holding.totalCostBasis.toString()),
      });
    }

    const totalGain = totalValue - totalCostBasis;
    const totalGainPercent = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

    return {
      totalValue,
      totalCostBasis,
      totalGain,
      totalGainPercent,
      holdings: holdings_data,
    };
  }),

  // Get allocation for user
  getAllocations: protectedProcedure.query(async ({ ctx }) => {
    return getUserAllocations(ctx.user.id);
  }),

  // Update allocation weight
  updateAllocationWeight: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        weight: z.number().min(0).max(100),
        accountType: z.enum(["brokerage", "roth-ira", "traditional-ira"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(allocations)
        .where(
          eq(allocations.userId, ctx.user.id) &&
            eq(allocations.ticker, input.ticker.toUpperCase())
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(allocations)
          .set({
            weight: input.weight.toString(),
            accountType: input.accountType,
            updatedAt: new Date(),
          })
          .where(eq(allocations.id, existing[0].id));
      } else {
        await db.insert(allocations).values({
          userId: ctx.user.id,
          ticker: input.ticker.toUpperCase(),
          weight: input.weight.toString(),
          strategy: "manual",
          accountType: input.accountType,
        });
      }

      return { success: true };
    }),
});
