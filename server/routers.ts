import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { portfolioRouter } from "./portfolio.router";
import { valuationRouter } from "./valuation.router";
import { insightsRouter } from "./insights.router";
import { benchmarkRouter } from "./benchmark.router";

// Local-only user (no authentication needed)
const LOCAL_USER = {
  id: 1,
  openId: "local-user",
  name: "Local User",
  email: "local@localhost",
  loginMethod: "local",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export const appRouter = router({
  system: systemRouter,
  
  // Simple auth endpoint - always returns local user
  auth: router({
    me: publicProcedure.query(() => LOCAL_USER),
    logout: publicProcedure.mutation(() => ({
      success: true,
    })),
  }),

  // Feature routers
  portfolio: portfolioRouter,
  valuation: valuationRouter,
  insights: insightsRouter,
  benchmark: benchmarkRouter,
});

export type AppRouter = typeof appRouter;
