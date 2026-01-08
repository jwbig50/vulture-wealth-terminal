import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateDCF, calculateMarginOfSafety, getVultureStatus, calculateCAGR } from "./valuation";

describe("Valuation Functions", () => {
  describe("calculateDCF", () => {
    it("should calculate DCF with valid financial metrics", () => {
      const metrics = {
        revenue: 1000000,
        operatingCashFlow: 300000,
        capex: 50000,
        totalDebt: 100000,
        cash: 200000,
        sharesOutstanding: 100,
        growthRate: 15,
        wacc: 10,
        currentPrice: 100,
      };

      const result = calculateDCF(metrics);

      expect(result).toHaveProperty("intrinsicValue");
      expect(result).toHaveProperty("fcf");
      expect(result).toHaveProperty("fcfMargin");
      expect(result.fcf).toBe(250000); // 300000 - 50000
      expect(result.intrinsicValue).toBeGreaterThan(0);
    });

    it("should handle zero revenue gracefully", () => {
      const metrics = {
        revenue: 0,
        operatingCashFlow: 100000,
        capex: 10000,
        totalDebt: 50000,
        cash: 100000,
        sharesOutstanding: 100,
        growthRate: 10,
        wacc: 8,
        currentPrice: 50,
      };

      const result = calculateDCF(metrics);
      expect(result.fcfMargin).toBe(0);
      expect(result.intrinsicValue).toBeGreaterThan(0);
    });

    it("should calculate debt-to-equity ratio correctly", () => {
      const metrics = {
        revenue: 1000000,
        operatingCashFlow: 300000,
        capex: 50000,
        totalDebt: 500000,
        cash: 100000,
        sharesOutstanding: 100,
        growthRate: 10,
        wacc: 8,
        currentPrice: 100,
      };

      const result = calculateDCF(metrics);
      expect(result.debtToEquity).toBeGreaterThan(0);
    });
  });

  describe("calculateMarginOfSafety", () => {
    it("should calculate positive MOS when intrinsic > current price", () => {
      const mos = calculateMarginOfSafety(100, 80);
      expect(mos).toBe(20); // (100-80)/100 * 100
    });

    it("should calculate negative MOS when intrinsic < current price", () => {
      const mos = calculateMarginOfSafety(80, 100);
      expect(mos).toBe(-25); // (80-100)/80 * 100
    });

    it("should return 0 for zero intrinsic value", () => {
      const mos = calculateMarginOfSafety(0, 100);
      expect(mos).toBe(0);
    });

    it("should return 0 for negative intrinsic value", () => {
      const mos = calculateMarginOfSafety(-50, 100);
      expect(mos).toBe(0);
    });
  });

  describe("getVultureStatus", () => {
    it("should return STRONG BUY for MOS > 20", () => {
      const status = getVultureStatus(100, 70, 30, 30, true);
      expect(status).toBe("STRONG BUY");
    });

    it("should return FAIR VALUE for 0 < MOS <= 20", () => {
      const status = getVultureStatus(100, 85, 15, 30, true);
      expect(status).toBe("FAIR VALUE");
    });

    it("should return OVERVALUED for MOS < 0", () => {
      const status = getVultureStatus(80, 100, -25, 30, true);
      expect(status).toBe("OVERVALUED");
    });

    it("should return VALUE TRAP for no moat", () => {
      const status = getVultureStatus(100, 70, 30, 30, false);
      expect(status).toBe("VALUE TRAP: No Moat");
    });

    it("should return CAUTION for high leverage", () => {
      const status = getVultureStatus(100, 70, 30, 60, true);
      expect(status).toBe("CAUTION: High Leverage");
    });

    it("should return SPECULATIVE for negative intrinsic value", () => {
      const status = getVultureStatus(-50, 100, -150, 30, true);
      expect(status).toBe("SPECULATIVE: Monitor Cash");
    });
  });

  describe("calculateCAGR", () => {
    it("should calculate CAGR correctly", () => {
      const cagr = calculateCAGR(100, 121, 1);
      expect(cagr).toBeCloseTo(21, 0); // 21% annual growth
    });

    it("should calculate CAGR over multiple years", () => {
      const cagr = calculateCAGR(100, 146.41, 2);
      expect(cagr).toBeCloseTo(21, 0); // ~21% CAGR over 2 years
    });

    it("should return null for invalid inputs", () => {
      expect(calculateCAGR(0, 100, 1)).toBeNull();
      expect(calculateCAGR(100, 0, 1)).toBeNull();
      expect(calculateCAGR(100, 100, 0)).toBeNull();
      expect(calculateCAGR(-100, 100, 1)).toBeNull();
    });

    it("should return null for extreme values", () => {
      const cagr = calculateCAGR(100, 10000000, 1);
      expect(cagr).toBeNull(); // Result > 100000
    });
  });
});

describe("Portfolio Calculations", () => {
  it("should calculate allocation weights for equal strategy", () => {
    const holdings = [
      { ticker: "AAPL", marginOfSafety: 15 },
      { ticker: "MSFT", marginOfSafety: 20 },
      { ticker: "GOOGL", marginOfSafety: 10 },
    ];

    const weights = calculateAllocationWeights(holdings, "equal");
    expect(weights.AAPL).toBeCloseTo(33.33, 1);
    expect(weights.MSFT).toBeCloseTo(33.33, 1);
    expect(weights.GOOGL).toBeCloseTo(33.33, 1);
  });

  it("should calculate allocation weights for value-weighted strategy", () => {
    const holdings = [
      { ticker: "AAPL", marginOfSafety: 20 },
      { ticker: "MSFT", marginOfSafety: 10 },
    ];

    const weights = calculateAllocationWeights(holdings, "value-weighted");
    expect(weights.AAPL).toBeCloseTo(66.67, 1);
    expect(weights.MSFT).toBeCloseTo(33.33, 1);
  });

  it("should calculate allocation weights for conviction strategy", () => {
    const holdings = [
      { ticker: "A", marginOfSafety: 50 },
      { ticker: "B", marginOfSafety: 40 },
      { ticker: "C", marginOfSafety: 30 },
      { ticker: "D", marginOfSafety: 20 },
      { ticker: "E", marginOfSafety: 10 },
      { ticker: "F", marginOfSafety: 5 },
    ];

    const weights = calculateAllocationWeights(holdings, "conviction");
    expect(weights.A).toBe(15); // Top 5
    expect(weights.B).toBe(15);
    expect(weights.C).toBe(15);
    expect(weights.D).toBe(15);
    expect(weights.E).toBe(15);
    expect(weights.F).toBe(5); // Rest
  });
});

// Import the function we're testing
import { calculateAllocationWeights } from "./valuation";
