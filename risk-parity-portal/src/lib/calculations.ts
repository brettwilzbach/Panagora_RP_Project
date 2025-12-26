// Risk Parity Portfolio Calculations
// Core mathematical framework for comparing traditional and risk-balanced portfolio allocations
// Supports 4 asset classes: Global Equity, Global Bonds, Commodities, Cash

export interface AssetClass {
  name: string;
  volatility: number;      // Annual standard deviation
  weight: number;          // Capital allocation (0-1)
  expectedReturn?: number; // Expected return (derived from Sharpe if not provided)
  sharpe?: number;         // Sharpe ratio for deriving expected return
  color: string;           // Display color
}

export interface PortfolioInputs {
  assets: AssetClass[];
  correlationMatrix: number[][]; // Correlation between all asset pairs
  leverage: number;
  riskFreeRate?: number;
}

export interface PortfolioMetrics {
  portfolioVariance: number;
  portfolioVolatility: number;
  riskContributions: number[];   // Risk contribution per asset (0-100)
  sharpeRatio: number;
  expectedReturn: number;
  leveragedVolatility: number;
  leveragedReturn: number;
}

export interface RiskParityWeights {
  weights: number[];
}

// Asset class colors
export const ASSET_COLORS = {
  equity: 'hsl(var(--primary))',      // Teal
  bonds: '#9ca3af',                    // Gray
  commodities: '#d97706',              // Amber/Orange
  cash: '#6b7280',                     // Dark gray
};

// Default 4 asset classes based on PanAgora paper
// Using equal Sharpe ratios for risky assets (efficient market assumption)
export const DEFAULT_ASSETS: AssetClass[] = [
  { name: 'Global Equity', volatility: 0.15, weight: 0.60, sharpe: 0.40, color: ASSET_COLORS.equity },
  { name: 'Global Bonds', volatility: 0.05, weight: 0.30, sharpe: 0.40, color: ASSET_COLORS.bonds },
  { name: 'Commodities', volatility: 0.20, weight: 0.10, sharpe: 0.30, color: ASSET_COLORS.commodities },
  { name: 'Cash', volatility: 0.01, weight: 0.00, sharpe: 0.00, color: ASSET_COLORS.cash },
];

// Traditional 60/40 allocation (stocks/bonds only, no commodities)
export const TRADITIONAL_WEIGHTS = [0.60, 0.40, 0.00, 0.00];

// Default correlation matrix (simplified, realistic assumptions)
// Equity, Bonds, Commodities, Cash
export const DEFAULT_CORRELATIONS: number[][] = [
  [1.00, 0.10, 0.30, 0.00],  // Equity
  [0.10, 1.00, 0.00, 0.00],  // Bonds
  [0.30, 0.00, 1.00, 0.00],  // Commodities
  [0.00, 0.00, 0.00, 1.00],  // Cash
];

// Default calibration values for demonstration
export const PANAGORA_DEFAULTS = {
  stockVolatility: 0.15,
  bondVolatility: 0.05,
  commodityVolatility: 0.20,
  cashVolatility: 0.01,
  correlation: 0.1,
  riskFreeRate: 0.02,
  stockSharpe: 0.40,
  bondSharpe: 0.40,        // Equal Sharpe = max diversification benefit
  commoditySharpe: 0.30,
  traditionalStockWeight: 0.6,
  traditionalBondWeight: 0.4,
};

// Calculate portfolio variance with multiple assets
export function calculatePortfolioVariance(inputs: PortfolioInputs): number {
  const { assets, correlationMatrix } = inputs;
  let variance = 0;

  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      const wi = assets[i].weight;
      const wj = assets[j].weight;
      const sigmaI = assets[i].volatility;
      const sigmaJ = assets[j].volatility;
      const rhoIJ = correlationMatrix[i][j];

      variance += wi * wj * sigmaI * sigmaJ * rhoIJ;
    }
  }

  return variance;
}

// Calculate risk contribution for each asset
export function calculateRiskContributions(inputs: PortfolioInputs): number[] {
  const { assets, correlationMatrix } = inputs;
  const portfolioVariance = calculatePortfolioVariance(inputs);
  const portfolioVol = Math.sqrt(portfolioVariance);

  if (portfolioVol === 0) {
    return assets.map(() => 0);
  }

  const contributions: number[] = [];

  for (let i = 0; i < assets.length; i++) {
    let marginalContrib = 0;

    for (let j = 0; j < assets.length; j++) {
      const wj = assets[j].weight;
      const sigmaI = assets[i].volatility;
      const sigmaJ = assets[j].volatility;
      const rhoIJ = correlationMatrix[i][j];

      marginalContrib += wj * sigmaI * sigmaJ * rhoIJ;
    }

    // Risk contribution = weight * marginal contribution / portfolio vol
    const riskContrib = assets[i].weight * marginalContrib / portfolioVol;
    contributions.push(riskContrib);
  }

  // Normalize to percentages
  const total = contributions.reduce((a, b) => a + b, 0);
  return contributions.map(c => (c / total) * 100);
}

// Calculate Risk Parity weights (equal risk contribution) using inverse volatility
// Excludes cash (very low vol assets) from allocation to keep leverage reasonable
export function calculateRiskParityWeights(assets: AssetClass[]): RiskParityWeights {
  // Simplified: inverse volatility weighting
  // Exclude cash (vol < 2%) to keep leverage reasonable - only allocate to risky assets
  const inverseVols = assets.map(a => a.volatility >= 0.02 ? 1 / a.volatility : 0);
  const total = inverseVols.reduce((a, b) => a + b, 0);

  return {
    weights: inverseVols.map(iv => total > 0 ? iv / total : 0),
  };
}

// Calculate full portfolio metrics
export function calculatePortfolioMetrics(inputs: PortfolioInputs): PortfolioMetrics {
  const riskFreeRate = inputs.riskFreeRate ?? PANAGORA_DEFAULTS.riskFreeRate;
  const { assets, leverage } = inputs;

  // Calculate expected returns from Sharpe ratios
  const expectedReturns = assets.map(a => {
    if (a.expectedReturn !== undefined) return a.expectedReturn;
    const sharpe = a.sharpe ?? 0;
    return sharpe * a.volatility + riskFreeRate;
  });

  const portfolioVariance = calculatePortfolioVariance(inputs);
  const portfolioVolatility = Math.sqrt(portfolioVariance);
  const riskContributions = calculateRiskContributions(inputs);

  // Portfolio expected return
  const expectedReturn = assets.reduce((sum, a, i) => sum + a.weight * expectedReturns[i], 0);

  const excessReturn = expectedReturn - riskFreeRate;
  const sharpeRatio = portfolioVolatility > 0 ? excessReturn / portfolioVolatility : 0;

  const leveragedVolatility = portfolioVolatility * leverage;
  const leveragedReturn = riskFreeRate + excessReturn * leverage;

  return {
    portfolioVariance,
    portfolioVolatility,
    riskContributions,
    sharpeRatio,
    expectedReturn,
    leveragedVolatility,
    leveragedReturn,
  };
}

// Helper: Create portfolio inputs from simple parameters
export function createPortfolioInputs(
  weights: number[],
  volatilities: number[],
  correlationMatrix: number[][],
  leverage: number = 1,
  sharpes?: number[]
): PortfolioInputs {
  const names = ['Global Equity', 'Global Bonds', 'Commodities', 'Cash'];
  const colors = [ASSET_COLORS.equity, ASSET_COLORS.bonds, ASSET_COLORS.commodities, ASSET_COLORS.cash];
  const defaultSharpes = [0.40, 0.40, 0.30, 0.00];

  const assets: AssetClass[] = weights.map((w, i) => ({
    name: names[i] || `Asset ${i + 1}`,
    volatility: volatilities[i] || 0.10,
    weight: w,
    sharpe: sharpes?.[i] ?? defaultSharpes[i],
    color: colors[i] || '#888',
  }));

  return {
    assets,
    correlationMatrix,
    leverage,
  };
}

// Generate efficient frontier points (simplified for 4 assets - varies equity weight)
export function generateEfficientFrontier(
  volatilities: number[],
  correlationMatrix: number[][],
  points: number = 50
): Array<{ risk: number; return: number; equityWeight: number }> {
  const frontier: Array<{ risk: number; return: number; equityWeight: number }> = [];

  for (let i = 0; i <= points; i++) {
    const equityWeight = i / points;
    // Distribute remaining weight: 60% bonds, 30% commodities, 10% cash of the non-equity portion
    const remaining = 1 - equityWeight;
    const weights = [
      equityWeight,
      remaining * 0.6,
      remaining * 0.3,
      remaining * 0.1,
    ];

    const inputs = createPortfolioInputs(weights, volatilities, correlationMatrix);
    const metrics = calculatePortfolioMetrics(inputs);

    frontier.push({
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      equityWeight: equityWeight * 100,
    });
  }

  return frontier;
}

// Calculate leveraged frontier (risk parity with varying leverage)
export function generateLeveragedFrontier(
  volatilities: number[],
  correlationMatrix: number[][],
  maxLeverage: number = 4,
  points: number = 50
): Array<{ risk: number; return: number; leverage: number }> {
  const tempAssets = DEFAULT_ASSETS.map((a, i) => ({ ...a, volatility: volatilities[i] }));
  const riskParityWeights = calculateRiskParityWeights(tempAssets);
  const frontier: Array<{ risk: number; return: number; leverage: number }> = [];

  for (let i = 0; i <= points; i++) {
    const leverage = 1 + (maxLeverage - 1) * (i / points);
    const inputs = createPortfolioInputs(riskParityWeights.weights, volatilities, correlationMatrix, leverage);
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

// Legacy compatibility - 2 asset calculations
export interface LegacyPortfolioInputs {
  stockVolatility: number;
  bondVolatility: number;
  correlation: number;
  stockWeight: number;
  bondWeight: number;
  leverage: number;
  riskFreeRate?: number;
  stockExpectedReturn?: number;
  bondExpectedReturn?: number;
}

export interface LegacyPortfolioMetrics {
  portfolioVariance: number;
  portfolioVolatility: number;
  stockRiskContribution: number;
  bondRiskContribution: number;
  sharpeRatio: number;
  expectedReturn: number;
  leveragedVolatility: number;
  leveragedReturn: number;
}

export function calculateLegacyPortfolioMetrics(inputs: LegacyPortfolioInputs): LegacyPortfolioMetrics {
  const weights = [inputs.stockWeight, inputs.bondWeight, 0, 0];
  const volatilities = [inputs.stockVolatility, inputs.bondVolatility, 0.20, 0.01];
  const correlationMatrix = [
    [1, inputs.correlation, 0.3, 0],
    [inputs.correlation, 1, 0, 0],
    [0.3, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  const portfolioInputs = createPortfolioInputs(weights, volatilities, correlationMatrix, inputs.leverage);
  const metrics = calculatePortfolioMetrics(portfolioInputs);

  return {
    portfolioVariance: metrics.portfolioVariance,
    portfolioVolatility: metrics.portfolioVolatility,
    stockRiskContribution: metrics.riskContributions[0],
    bondRiskContribution: metrics.riskContributions[1],
    sharpeRatio: metrics.sharpeRatio,
    expectedReturn: metrics.expectedReturn,
    leveragedVolatility: metrics.leveragedVolatility,
    leveragedReturn: metrics.leveragedReturn,
  };
}

export function calculateLegacyRiskParityWeights(
  stockVol: number,
  bondVol: number,
  _correlation: number
): { stockWeight: number; bondWeight: number } {
  const inverseStockVol = 1 / stockVol;
  const inverseBondVol = 1 / bondVol;
  const total = inverseStockVol + inverseBondVol;

  return {
    stockWeight: inverseStockVol / total,
    bondWeight: inverseBondVol / total,
  };
}
