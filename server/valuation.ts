import { Decimal } from "decimal.js";

interface FinancialMetrics {
  revenue: number;
  operatingCashFlow: number;
  capex: number;
  totalDebt: number;
  cash: number;
  sharesOutstanding: number;
  growthRate: number;
  wacc: number;
  currentPrice: number;
}

interface DCFResult {
  fcf: number;
  projectedFCF: number[];
  pvFCF: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  intrinsicValue: number;
  fcfMargin: number;
  debtToEquity: number;
  cashFlowQuality: number;
}

interface SensitivityMatrix {
  growthSteps: number[];
  waccSteps: number[];
  matrix: Array<Array<{ growth: number; wacc: number; value: number }>>;
}

/**
 * Calculate Discounted Cash Flow (DCF) valuation
 */
export function calculateDCF(metrics: FinancialMetrics): DCFResult {
  const revenue = new Decimal(metrics.revenue);
  const opCashFlow = new Decimal(metrics.operatingCashFlow);
  const capex = new Decimal(metrics.capex);
  const debt = new Decimal(metrics.totalDebt);
  const cash = new Decimal(metrics.cash);
  const shares = new Decimal(metrics.sharesOutstanding || 1);
  const growthRate = new Decimal(metrics.growthRate).div(100);
  const wacc = new Decimal(metrics.wacc).div(100);
  const terminalGrowth = new Decimal(0.02);

  // Free Cash Flow = Operating Cash Flow - CapEx
  const fcf = opCashFlow.minus(capex);

  // Project FCF for 5 years
  const projectedFCF: Decimal[] = [];
  let currentFCF = fcf;
  for (let i = 0; i < 5; i++) {
    currentFCF = currentFCF.times(new Decimal(1).plus(growthRate));
    projectedFCF.push(currentFCF);
  }

  // Calculate Present Value of projected FCF
  let pvFCF = new Decimal(0);
  projectedFCF.forEach((cf, i) => {
    const discountFactor = new Decimal(1).div(
      new Decimal(1).plus(wacc).pow(i + 1)
    );
    pvFCF = pvFCF.plus(cf.times(discountFactor));
  });

  // Terminal Value
  const terminalFCF = projectedFCF[4].times(
    new Decimal(1).plus(terminalGrowth)
  );
  const terminalValue = terminalFCF.div(wacc.minus(terminalGrowth));
  const pvTerminal = terminalValue.div(
    new Decimal(1).plus(wacc).pow(5)
  );

  // Enterprise Value & Equity Value
  const enterpriseValue = pvFCF.plus(pvTerminal);
  const equityValue = enterpriseValue.plus(cash).minus(debt);
  const intrinsicValue = equityValue.div(shares);

  // Financial ratios
  const fcfMargin = revenue.gt(0)
    ? fcf.div(revenue).times(100).toNumber()
    : 0;
  const debtToEquity = equityValue.gt(0)
    ? debt.div(equityValue).times(100).toNumber()
    : 0;
  const cashFlowQuality = revenue.gt(0)
    ? opCashFlow.div(revenue).times(100).toNumber()
    : 0;

  return {
    fcf: fcf.toNumber(),
    projectedFCF: projectedFCF.map(cf => cf.toNumber()),
    pvFCF: pvFCF.toNumber(),
    terminalValue: terminalValue.toNumber(),
    pvTerminal: pvTerminal.toNumber(),
    enterpriseValue: enterpriseValue.toNumber(),
    equityValue: equityValue.toNumber(),
    intrinsicValue: intrinsicValue.toNumber(),
    fcfMargin,
    debtToEquity,
    cashFlowQuality,
  };
}

/**
 * Calculate Margin of Safety
 */
export function calculateMarginOfSafety(
  intrinsicValue: number,
  currentPrice: number
): number {
  if (intrinsicValue <= 0) return 0;
  return ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
}

/**
 * Generate sensitivity analysis matrix
 */
export function generateSensitivityMatrix(
  metrics: FinancialMetrics,
  baseGrowth: number,
  baseWacc: number
): SensitivityMatrix {
  const growthSteps = [
    baseGrowth - 5,
    baseGrowth - 2,
    baseGrowth,
    baseGrowth + 2,
    baseGrowth + 5,
  ];
  const waccSteps = [
    baseWacc + 2,
    baseWacc + 1,
    baseWacc,
    baseWacc - 1,
    baseWacc - 2,
  ];

  const matrix = waccSteps.map(wacc => {
    return growthSteps.map(growth => {
      const result = calculateDCF({
        ...metrics,
        growthRate: growth,
        wacc,
      });
      return {
        growth,
        wacc,
        value: result.intrinsicValue,
      };
    });
  });

  return { growthSteps, waccSteps, matrix };
}

/**
 * Determine Vulture Status based on valuation metrics
 */
export function getVultureStatus(
  intrinsicValue: number,
  currentPrice: number,
  marginOfSafety: number,
  debtToEquity: number,
  hasMoat: boolean
): string {
  // Gate 1: Profitability check
  if (intrinsicValue <= 0) {
    return "SPECULATIVE: Monitor Cash";
  }

  // Gate 2: Moat check (value trap detection)
  if (!hasMoat) {
    return "VALUE TRAP: No Moat";
  }

  // Gate 3: Anti-fragile check (debt/equity)
  if (marginOfSafety > 20 && debtToEquity > 50) {
    return "CAUTION: High Leverage";
  }

  // Standard logic
  if (marginOfSafety > 20) {
    return "STRONG BUY";
  }
  if (marginOfSafety > 0) {
    return "FAIR VALUE";
  }
  return "OVERVALUED";
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
export function calculateCAGR(
  beginValue: number,
  endValue: number,
  years: number
): number | null {
  if (!beginValue || beginValue <= 0 || !endValue || endValue <= 0 || years <= 0) {
    return null;
  }

  const result = (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
  return isFinite(result) && result < 100000 ? result : null;
}

/**
 * Calculate portfolio allocation weights
 */
export function calculateAllocationWeights(
  holdings: Array<{ ticker: string; marginOfSafety: number }>,
  strategy: "equal" | "value-weighted" | "conviction"
): Record<string, number> {
  const weights: Record<string, number> = {};

  if (strategy === "equal") {
    const weight = 100 / holdings.length;
    holdings.forEach(h => {
      weights[h.ticker] = weight;
    });
  } else if (strategy === "value-weighted") {
    const opportunities = holdings.map(h => ({
      ticker: h.ticker,
      mos: Math.max(h.marginOfSafety, 0),
    }));
    const totalMOS = opportunities.reduce((sum, o) => sum + o.mos, 0);
    if (totalMOS > 0) {
      opportunities.forEach(o => {
        weights[o.ticker] = (o.mos / totalMOS) * 100;
      });
    }
  } else if (strategy === "conviction") {
    const sorted = [...holdings].sort(
      (a, b) => b.marginOfSafety - a.marginOfSafety
    );
    sorted.forEach((h, i) => {
      weights[h.ticker] = i < 5 ? 15 : 5;
    });
  }

  return weights;
}
