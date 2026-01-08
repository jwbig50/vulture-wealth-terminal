import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { fetchStockPrice, fetchCryptoPrice } from "./market";
import { calculateCAGR } from "./valuation";

interface BenchmarkData {
  ticker: string;
  name: string;
  currentPrice: number;
  priceOneMonthAgo: number;
  priceOneYearAgo: number;
  priceThreeYearsAgo: number;
  priceFiveYearsAgo: number;
  cagr1M: number | null;
  cagr1Y: number | null;
  cagr3Y: number | null;
  cagr5Y: number | null;
}

// Historical price data (approximate, in production would fetch from API)
const BENCHMARK_HISTORICAL_DATA: Record<string, Record<string, number>> = {
  "^GSPC": {
    // S&P 500
    current: 5900,
    "1m_ago": 5850,
    "1y_ago": 5200,
    "3y_ago": 3800,
    "5y_ago": 2800,
  },
  "GC=F": {
    // Gold
    current: 2050,
    "1m_ago": 2000,
    "1y_ago": 1900,
    "3y_ago": 1700,
    "5y_ago": 1200,
  },
  BTC: {
    // Bitcoin
    current: 42000,
    "1m_ago": 38000,
    "1y_ago": 26000,
    "3y_ago": 19000,
    "5y_ago": 6500,
  },
};

export const benchmarkRouter = router({
  // Get benchmark comparison data
  getBenchmarks: publicProcedure
    .input(
      z.object({
        portfolioCAGR1Y: z.number().optional(),
        portfolioCAGR3Y: z.number().optional(),
        portfolioCAGR5Y: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const benchmarks: BenchmarkData[] = [];

      // S&P 500
      const sp500Data = BENCHMARK_HISTORICAL_DATA["^GSPC"];
      benchmarks.push({
        ticker: "^GSPC",
        name: "S&P 500",
        currentPrice: sp500Data.current,
        priceOneMonthAgo: sp500Data["1m_ago"],
        priceOneYearAgo: sp500Data["1y_ago"],
        priceThreeYearsAgo: sp500Data["3y_ago"],
        priceFiveYearsAgo: sp500Data["5y_ago"],
        cagr1M: calculateCAGR(sp500Data["1m_ago"], sp500Data.current, 1 / 12),
        cagr1Y: calculateCAGR(sp500Data["1y_ago"], sp500Data.current, 1),
        cagr3Y: calculateCAGR(sp500Data["3y_ago"], sp500Data.current, 3),
        cagr5Y: calculateCAGR(sp500Data["5y_ago"], sp500Data.current, 5),
      });

      // Gold
      const goldData = BENCHMARK_HISTORICAL_DATA["GC=F"];
      benchmarks.push({
        ticker: "GC=F",
        name: "Gold (USD/oz)",
        currentPrice: goldData.current,
        priceOneMonthAgo: goldData["1m_ago"],
        priceOneYearAgo: goldData["1y_ago"],
        priceThreeYearsAgo: goldData["3y_ago"],
        priceFiveYearsAgo: goldData["5y_ago"],
        cagr1M: calculateCAGR(goldData["1m_ago"], goldData.current, 1 / 12),
        cagr1Y: calculateCAGR(goldData["1y_ago"], goldData.current, 1),
        cagr3Y: calculateCAGR(goldData["3y_ago"], goldData.current, 3),
        cagr5Y: calculateCAGR(goldData["5y_ago"], goldData.current, 5),
      });

      // Bitcoin
      const btcData = BENCHMARK_HISTORICAL_DATA.BTC;
      benchmarks.push({
        ticker: "BTC",
        name: "Bitcoin",
        currentPrice: btcData.current,
        priceOneMonthAgo: btcData["1m_ago"],
        priceOneYearAgo: btcData["1y_ago"],
        priceThreeYearsAgo: btcData["3y_ago"],
        priceFiveYearsAgo: btcData["5y_ago"],
        cagr1M: calculateCAGR(btcData["1m_ago"], btcData.current, 1 / 12),
        cagr1Y: calculateCAGR(btcData["1y_ago"], btcData.current, 1),
        cagr3Y: calculateCAGR(btcData["3y_ago"], btcData.current, 3),
        cagr5Y: calculateCAGR(btcData["5y_ago"], btcData.current, 5),
      });

      return {
        benchmarks,
        portfolio: {
          cagr1Y: input.portfolioCAGR1Y || 0,
          cagr3Y: input.portfolioCAGR3Y || 0,
          cagr5Y: input.portfolioCAGR5Y || 0,
        },
      };
    }),

  // Get individual benchmark
  getBenchmark: publicProcedure
    .input(z.object({ ticker: z.enum(["^GSPC", "GC=F", "BTC"]) }))
    .query(async ({ input }) => {
      const data = BENCHMARK_HISTORICAL_DATA[input.ticker];
      if (!data) {
        throw new Error(`Benchmark ${input.ticker} not found`);
      }

      const names: Record<string, string> = {
        "^GSPC": "S&P 500",
        "GC=F": "Gold (USD/oz)",
        BTC: "Bitcoin",
      };

      return {
        ticker: input.ticker,
        name: names[input.ticker],
        currentPrice: data.current,
        priceOneMonthAgo: data["1m_ago"],
        priceOneYearAgo: data["1y_ago"],
        priceThreeYearsAgo: data["3y_ago"],
        priceFiveYearsAgo: data["5y_ago"],
        cagr1M: calculateCAGR(data["1m_ago"], data.current, 1 / 12),
        cagr1Y: calculateCAGR(data["1y_ago"], data.current, 1),
        cagr3Y: calculateCAGR(data["3y_ago"], data.current, 3),
        cagr5Y: calculateCAGR(data["5y_ago"], data.current, 5),
      };
    }),
});
