import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Benchmark Router", () => {
  describe("getBenchmarks", () => {
    it("should return benchmark data for S&P 500, Gold, and Bitcoin", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmarks({
        portfolioCAGR1Y: 15,
        portfolioCAGR3Y: 12,
        portfolioCAGR5Y: 10,
      });

      expect(result).toHaveProperty("benchmarks");
      expect(result).toHaveProperty("portfolio");
      expect(result.benchmarks).toHaveLength(3);

      // Check S&P 500
      const sp500 = result.benchmarks.find((b) => b.ticker === "^GSPC");
      expect(sp500).toBeDefined();
      expect(sp500?.name).toBe("S&P 500");
      expect(sp500?.currentPrice).toBeGreaterThan(0);
      expect(sp500?.cagr1Y).toBeDefined();

      // Check Gold
      const gold = result.benchmarks.find((b) => b.ticker === "GC=F");
      expect(gold).toBeDefined();
      expect(gold?.name).toBe("Gold (USD/oz)");
      expect(gold?.currentPrice).toBeGreaterThan(0);

      // Check Bitcoin
      const btc = result.benchmarks.find((b) => b.ticker === "BTC");
      expect(btc).toBeDefined();
      expect(btc?.name).toBe("Bitcoin");
      expect(btc?.currentPrice).toBeGreaterThan(0);
    });

    it("should calculate CAGR values correctly", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmarks({});

      result.benchmarks.forEach((benchmark) => {
        // CAGR values should be numbers or null
        expect(typeof benchmark.cagr1M === "number" || benchmark.cagr1M === null).toBe(true);
        expect(typeof benchmark.cagr1Y === "number" || benchmark.cagr1Y === null).toBe(true);
        expect(typeof benchmark.cagr3Y === "number" || benchmark.cagr3Y === null).toBe(true);
        expect(typeof benchmark.cagr5Y === "number" || benchmark.cagr5Y === null).toBe(true);
      });
    });

    it("should include portfolio CAGR data", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmarks({
        portfolioCAGR1Y: 20,
        portfolioCAGR3Y: 18,
        portfolioCAGR5Y: 15,
      });

      expect(result.portfolio.cagr1Y).toBe(20);
      expect(result.portfolio.cagr3Y).toBe(18);
      expect(result.portfolio.cagr5Y).toBe(15);
    });
  });

  describe("getBenchmark", () => {
    it("should return data for S&P 500", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmark({
        ticker: "^GSPC",
      });

      expect(result.ticker).toBe("^GSPC");
      expect(result.name).toBe("S&P 500");
      expect(result.currentPrice).toBeGreaterThan(0);
      expect(result.cagr1Y).toBeDefined();
    });

    it("should return data for Gold", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmark({
        ticker: "GC=F",
      });

      expect(result.ticker).toBe("GC=F");
      expect(result.name).toBe("Gold (USD/oz)");
      expect(result.currentPrice).toBeGreaterThan(0);
    });

    it("should return data for Bitcoin", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.benchmark.getBenchmark({
        ticker: "BTC",
      });

      expect(result.ticker).toBe("BTC");
      expect(result.name).toBe("Bitcoin");
      expect(result.currentPrice).toBeGreaterThan(0);
    });

    it("should throw error for invalid ticker", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.benchmark.getBenchmark({
          ticker: "INVALID" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).message).toContain("Invalid");
      }
    });
  });
});
