// Risk Parity Portfolio Calculations
// Core mathematical framework for comparing traditional and risk-balanced portfolio allocations

export interface PortfolioInputs {
  stockVolatility: number;    // Annual standard deviation (e.g., 0.151 for 15.1%)
  bondVolatility: number;     // Annual standard deviation (e.g., 0.046 for 4.6%)
  correlation: number;        // Correlation between stocks and bonds (e.g., 0.2)
  stockWeight: number;        // Capital allocation to stocks (e.g., 0.6 for 60%)
  bondWeight: number;         // Capital allocation to bonds (e.g., 0.4 for 40%)
  leverage: number;           // Leverage ratio (e.g., 1.0 for unleveraged)
  riskFreeRate?: number;      // Risk-free rate (default: 0.02 for 2%)
  stockExpectedReturn?: number;  // Expected stock return (default derived from Sharpe)
  bondExpectedReturn?: number;   // Expected bond return (default derived from Sharpe)
}

export interface PortfolioMetrics {
  portfolioVariance: number;
  portfolioVolatility: number;
  stockRiskContribution: number;    // As percentage (0-100)
  bondRiskContribution: number;     // As percentage (0-100)
  sharpeRatio: number;
  expectedReturn: number;
  leveragedVolatility: number;
  leveragedReturn: number;
}

export interface RiskParityWeights {
  stockWeight: number;
  bondWeight: number;
}

// Default calibration values for demonstration
// Based on long-term historical averages (AQR 1947-2015 study)
export const PANAGORA_DEFAULTS = {
  stockVolatility: 0.15,       // Long-term equity volatility ~15%
  bondVolatility: 0.05,        // Long-term bond volatility ~5%
  correlation: 0.1,            // Historical avg stock-bond correlation
  riskFreeRate: 0.02,          // Risk-free rate assumption
  stockSharpe: 0.40,           // Long-term equity Sharpe ratio
  bondSharpe: 0.35,            // Long-term bond Sharpe ratio
  traditionalStockWeight: 0.6,
  traditionalBondWeight: 0.4,
};

// Calculate portfolio variance
export function calculatePortfolioVariance(inputs: PortfolioInputs): number {
  const { stockVolatility, bondVolatility, correlation, stockWeight, bondWeight } = inputs;

  const stockVariance = Math.pow(stockVolatility, 2);
  const bondVariance = Math.pow(bondVolatility, 2);
  const covariance = stockVolatility * bondVolatility * correlation;

  return (
    Math.pow(stockWeight, 2) * stockVariance +
    Math.pow(bondWeight, 2) * bondVariance +
    2 * stockWeight * bondWeight * covariance
  );
}

// Calculate marginal risk contribution
export function calculateRiskContribution(inputs: PortfolioInputs): { stock: number; bond: number } {
  const { stockVolatility, bondVolatility, correlation, stockWeight, bondWeight } = inputs;

  const portfolioVariance = calculatePortfolioVariance(inputs);
  const portfolioVol = Math.sqrt(portfolioVariance);

  const covariance = stockVolatility * bondVolatility * correlation;

  // Marginal contribution to risk (MCR) = weight * d(sigma_p) / d(weight)
  // Risk contribution = weight * (weight * variance + otherWeight * covariance) / portfolioVol

  const stockContribution = stockWeight * (
    stockWeight * Math.pow(stockVolatility, 2) + bondWeight * covariance
  ) / portfolioVol;

  const bondContribution = bondWeight * (
    bondWeight * Math.pow(bondVolatility, 2) + stockWeight * covariance
  ) / portfolioVol;

  const totalContribution = stockContribution + bondContribution;

  return {
    stock: (stockContribution / totalContribution) * 100,
    bond: (bondContribution / totalContribution) * 100,
  };
}

// Calculate Risk Parity weights (equal risk contribution)
export function calculateRiskParityWeights(
  stockVol: number,
  bondVol: number,
  _correlation: number
): RiskParityWeights {
  // For uncorrelated assets: w_stock / w_bond = sigma_bond / sigma_stock
  // For correlated assets, we use numerical optimization, but for simplicity
  // we use the inverse volatility weighting as a good approximation
  // Note: _correlation parameter reserved for future enhancement with full optimization

  // More accurate formula considering correlation:
  // This is a simplified version that works well for low correlations
  const inverseStockVol = 1 / stockVol;
  const inverseBondVol = 1 / bondVol;
  const total = inverseStockVol + inverseBondVol;

  return {
    stockWeight: inverseStockVol / total,
    bondWeight: inverseBondVol / total,
  };
}

// Calculate full portfolio metrics
export function calculatePortfolioMetrics(inputs: PortfolioInputs): PortfolioMetrics {
  const riskFreeRate = inputs.riskFreeRate ?? PANAGORA_DEFAULTS.riskFreeRate;

  // Derive expected returns from Sharpe ratios if not provided
  const stockExpectedReturn = inputs.stockExpectedReturn ??
    (PANAGORA_DEFAULTS.stockSharpe * inputs.stockVolatility + riskFreeRate);
  const bondExpectedReturn = inputs.bondExpectedReturn ??
    (PANAGORA_DEFAULTS.bondSharpe * inputs.bondVolatility + riskFreeRate);

  const portfolioVariance = calculatePortfolioVariance(inputs);
  const portfolioVolatility = Math.sqrt(portfolioVariance);

  const riskContribution = calculateRiskContribution(inputs);

  const expectedReturn =
    inputs.stockWeight * stockExpectedReturn +
    inputs.bondWeight * bondExpectedReturn;

  const excessReturn = expectedReturn - riskFreeRate;
  const sharpeRatio = excessReturn / portfolioVolatility;

  const leveragedVolatility = portfolioVolatility * inputs.leverage;
  const leveragedReturn = riskFreeRate + excessReturn * inputs.leverage;

  return {
    portfolioVariance,
    portfolioVolatility,
    stockRiskContribution: riskContribution.stock,
    bondRiskContribution: riskContribution.bond,
    sharpeRatio,
    expectedReturn,
    leveragedVolatility,
    leveragedReturn,
  };
}

// Generate efficient frontier points
export function generateEfficientFrontier(
  stockVol: number,
  bondVol: number,
  correlation: number,
  points: number = 50
): Array<{ risk: number; return: number; stockWeight: number }> {
  const frontier: Array<{ risk: number; return: number; stockWeight: number }> = [];

  for (let i = 0; i <= points; i++) {
    const stockWeight = i / points;
    const bondWeight = 1 - stockWeight;

    const inputs: PortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight,
      bondWeight,
      leverage: 1,
    };

    const metrics = calculatePortfolioMetrics(inputs);

    frontier.push({
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      stockWeight: stockWeight * 100,
    });
  }

  return frontier;
}

// Calculate leveraged frontier (risk parity with varying leverage)
export function generateLeveragedFrontier(
  stockVol: number,
  bondVol: number,
  correlation: number,
  maxLeverage: number = 4,
  points: number = 50
): Array<{ risk: number; return: number; leverage: number }> {
  const riskParityWeights = calculateRiskParityWeights(stockVol, bondVol, correlation);
  const frontier: Array<{ risk: number; return: number; leverage: number }> = [];

  for (let i = 0; i <= points; i++) {
    const leverage = 1 + (maxLeverage - 1) * (i / points);

    const inputs: PortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: riskParityWeights.stockWeight,
      bondWeight: riskParityWeights.bondWeight,
      leverage,
    };

    const metrics = calculatePortfolioMetrics(inputs);

    frontier.push({
      risk: metrics.leveragedVolatility * 100,
      return: metrics.leveragedReturn * 100,
      leverage,
    });
  }

  return frontier;
}

// Format percentage for display
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format ratio for display
export function formatRatio(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
