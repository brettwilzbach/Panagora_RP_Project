import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  calculateLegacyRiskParityWeights,
  calculateLegacyPortfolioMetrics,
  PANAGORA_DEFAULTS,
  type LegacyPortfolioInputs,
} from '@/lib/calculations';

// Custom square marker for 60/40 portfolio
const SquareMarker = (props: { cx?: number; cy?: number; fill?: string }) => {
  const { cx = 0, cy = 0, fill } = props;
  const size = 12;
  return (
    <rect
      x={cx - size}
      y={cy - size}
      width={size * 2}
      height={size * 2}
      fill={fill || '#4b5563'}
      stroke="#ffffff"
      strokeWidth={3}
    />
  );
};

// Custom diamond marker for leveraged RP
const DiamondMarker = (props: { cx?: number; cy?: number; fill?: string }) => {
  const { cx = 0, cy = 0, fill } = props;
  const size = 10;
  return (
    <polygon
      points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
      fill={fill || 'hsl(var(--primary))'}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
};

// Custom circle marker for Risk Parity
const CircleMarker = (props: { cx?: number; cy?: number; fill?: string }) => {
  const { cx = 0, cy = 0, fill } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={12}
      fill={fill || 'hsl(var(--primary))'}
      stroke="#ffffff"
      strokeWidth={3}
    />
  );
};

// Generate 2-asset efficient frontier (stocks/bonds only)
function generate2AssetFrontier(
  stockVol: number,
  bondVol: number,
  correlation: number,
  points: number = 50
): Array<{ risk: number; return: number; equityWeight: number }> {
  const frontier: Array<{ risk: number; return: number; equityWeight: number }> = [];

  for (let i = 0; i <= points; i++) {
    const stockWeight = i / points;
    const bondWeight = 1 - stockWeight;

    const inputs: LegacyPortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight,
      bondWeight,
      leverage: 1,
    };
    const metrics = calculateLegacyPortfolioMetrics(inputs);

    frontier.push({
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      equityWeight: stockWeight * 100,
    });
  }

  return frontier;
}

// Generate leveraged risk parity frontier (2-asset)
function generate2AssetLeveragedFrontier(
  stockVol: number,
  bondVol: number,
  correlation: number,
  maxLeverage: number = 4,
  points: number = 50
): Array<{ risk: number; return: number; leverage: number }> {
  const rpWeights = calculateLegacyRiskParityWeights(stockVol, bondVol, correlation);
  const frontier: Array<{ risk: number; return: number; leverage: number }> = [];

  for (let i = 0; i <= points; i++) {
    const leverage = 1 + (maxLeverage - 1) * (i / points);

    const inputs: LegacyPortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: rpWeights.stockWeight,
      bondWeight: rpWeights.bondWeight,
      leverage,
    };
    const metrics = calculateLegacyPortfolioMetrics(inputs);

    frontier.push({
      risk: metrics.leveragedVolatility * 100,
      return: metrics.leveragedReturn * 100,
      leverage,
    });
  }

  return frontier;
}

interface KeyPortfolio {
  name: string;
  risk: number;
  return: number;
  equityWeight: number;
  bondWeight: number;
  sharpeRatio: number;
  stockRiskContribution: number;
  bondRiskContribution: number;
  type: 'traditional' | 'riskParity' | 'leveraged';
}

interface EfficientFrontierProps {
  stockVol?: number;
  bondVol?: number;
  correlation?: number;
  leverage?: number;
  showLeveragedFrontier?: boolean;
  showCapitalMarketLine?: boolean;
  interactive?: boolean;
  height?: number;
}

// Custom tooltip component with rich details
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: KeyPortfolio | { risk: number; return: number; equityWeight?: number; leverage?: number } }> }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const isKeyPortfolio = 'name' in data && 'sharpeRatio' in data;

  return (
    <div className="p-3 bg-card border border-border rounded-lg shadow-lg min-w-[180px]">
      {isKeyPortfolio ? (
        <>
          <p className="font-semibold text-foreground mb-2">{(data as KeyPortfolio).name}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Risk:</span>
            <span className="numeric text-foreground">{(data as KeyPortfolio).risk.toFixed(1)}%</span>
            <span className="text-muted-foreground">Return:</span>
            <span className="numeric text-foreground">{(data as KeyPortfolio).return.toFixed(1)}%</span>
            <span className="text-muted-foreground">Sharpe:</span>
            <span className="numeric text-foreground font-medium">{(data as KeyPortfolio).sharpeRatio.toFixed(2)}</span>
            <span className="text-muted-foreground">Allocation:</span>
            <span className="numeric text-foreground">{(data as KeyPortfolio).equityWeight.toFixed(0)}/{(data as KeyPortfolio).bondWeight.toFixed(0)}</span>
            <span className="text-muted-foreground">Risk Split:</span>
            <span className="numeric text-foreground">{(data as KeyPortfolio).stockRiskContribution.toFixed(0)}/{(data as KeyPortfolio).bondRiskContribution.toFixed(0)}</span>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Risk:</span>
          <span className="numeric text-foreground">{data.risk.toFixed(1)}%</span>
          <span className="text-muted-foreground">Return:</span>
          <span className="numeric text-foreground">{data.return.toFixed(1)}%</span>
          {'equityWeight' in data && data.equityWeight !== undefined && (
            <>
              <span className="text-muted-foreground">Stocks:</span>
              <span className="numeric text-foreground">{data.equityWeight.toFixed(0)}%</span>
            </>
          )}
          {'leverage' in data && data.leverage !== undefined && (
            <>
              <span className="text-muted-foreground">Leverage:</span>
              <span className="numeric text-foreground">{data.leverage.toFixed(1)}x</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function EfficientFrontier({
  stockVol = PANAGORA_DEFAULTS.stockVolatility,
  bondVol = PANAGORA_DEFAULTS.bondVolatility,
  correlation = PANAGORA_DEFAULTS.correlation,
  leverage = 1,
  showLeveragedFrontier = false,
  showCapitalMarketLine = false,
  interactive = true,
  height = 400,
}: EfficientFrontierProps) {

  // Generate 2-asset efficient frontier (stocks/bonds only - consistent model)
  const frontier = useMemo(
    () => generate2AssetFrontier(stockVol, bondVol, correlation),
    [stockVol, bondVol, correlation]
  );

  // Generate leveraged frontier when needed (2-asset model)
  const leveragedFrontier = useMemo(
    () => showLeveragedFrontier ? generate2AssetLeveragedFrontier(stockVol, bondVol, correlation, 4) : [],
    [stockVol, bondVol, correlation, showLeveragedFrontier]
  );

  // Calculate 60/40 portfolio directly (robust - no array matching)
  const portfolio60_40 = useMemo((): KeyPortfolio => {
    const inputs: LegacyPortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: 0.6,
      bondWeight: 0.4,
      leverage: 1,
    };
    const metrics = calculateLegacyPortfolioMetrics(inputs);
    return {
      name: '60/40 Traditional',
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      equityWeight: 60,
      bondWeight: 40,
      sharpeRatio: metrics.sharpeRatio,
      stockRiskContribution: metrics.stockRiskContribution,
      bondRiskContribution: metrics.bondRiskContribution,
      type: 'traditional',
    };
  }, [stockVol, bondVol, correlation]);

  // Calculate Risk Parity portfolio directly (robust - uses actual risk parity weights)
  const portfolioRiskParity = useMemo((): KeyPortfolio => {
    const weights = calculateLegacyRiskParityWeights(stockVol, bondVol, correlation);
    const inputs: LegacyPortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: weights.stockWeight,
      bondWeight: weights.bondWeight,
      leverage: 1,
    };
    const metrics = calculateLegacyPortfolioMetrics(inputs);
    return {
      name: 'Risk Parity',
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      equityWeight: weights.stockWeight * 100,
      bondWeight: weights.bondWeight * 100,
      sharpeRatio: metrics.sharpeRatio,
      stockRiskContribution: metrics.stockRiskContribution,
      bondRiskContribution: metrics.bondRiskContribution,
      type: 'riskParity',
    };
  }, [stockVol, bondVol, correlation]);

  // Calculate leveraged Risk Parity portfolio at current leverage
  const portfolioLeveragedRP = useMemo((): KeyPortfolio | null => {
    if (leverage <= 1) return null;
    const weights = calculateLegacyRiskParityWeights(stockVol, bondVol, correlation);
    const inputs: LegacyPortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: weights.stockWeight,
      bondWeight: weights.bondWeight,
      leverage,
    };
    const metrics = calculateLegacyPortfolioMetrics(inputs);
    return {
      name: `Risk Parity ${leverage}x`,
      risk: metrics.leveragedVolatility * 100,
      return: metrics.leveragedReturn * 100,
      equityWeight: weights.stockWeight * 100,
      bondWeight: weights.bondWeight * 100,
      sharpeRatio: metrics.sharpeRatio,
      stockRiskContribution: metrics.stockRiskContribution,
      bondRiskContribution: metrics.bondRiskContribution,
      type: 'leveraged',
    };
  }, [stockVol, bondVol, correlation, leverage]);

  // Capital Market Line calculation
  const capitalMarketLine = useMemo(() => {
    if (!showCapitalMarketLine) return [];
    const riskFreeRate = PANAGORA_DEFAULTS.riskFreeRate * 100;
    // Use the tangency portfolio (highest Sharpe on frontier)
    interface TangencyPoint {
      risk: number;
      return: number;
      equityWeight: number;
      sharpe: number;
    }
    const tangencyPoint = frontier.reduce<TangencyPoint>((best, point) => {
      const inputs: LegacyPortfolioInputs = {
        stockVolatility: stockVol,
        bondVolatility: bondVol,
        correlation,
        stockWeight: point.equityWeight / 100,
        bondWeight: 1 - point.equityWeight / 100,
        leverage: 1,
      };
      const metrics = calculateLegacyPortfolioMetrics(inputs);
      return metrics.sharpeRatio > best.sharpe ? { ...point, sharpe: metrics.sharpeRatio } : best;
    }, { risk: 0, return: 0, equityWeight: 0, sharpe: 0 });

    const slope = tangencyPoint.risk > 0 ? (tangencyPoint.return - riskFreeRate) / tangencyPoint.risk : 0;
    const maxRisk = Math.max(...frontier.map(p => p.risk)) * 1.2;

    return [
      { risk: 0, return: riskFreeRate },
      { risk: maxRisk, return: riskFreeRate + slope * maxRisk },
    ];
  }, [frontier, stockVol, bondVol, correlation, showCapitalMarketLine]);

  // Determine axis domains
  const maxRisk = Math.max(
    ...frontier.map(p => p.risk),
    ...(showLeveragedFrontier ? leveragedFrontier.map(p => p.risk) : []),
    portfolioLeveragedRP?.risk ?? 0
  ) * 1.1;

  const maxReturn = Math.max(
    ...frontier.map(p => p.return),
    ...(showLeveragedFrontier ? leveragedFrontier.map(p => p.return) : []),
    portfolioLeveragedRP?.return ?? 0
  ) * 1.1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Efficient Frontier (Stocks/Bonds)</CardTitle>
        <CardDescription>
          Classic 2-asset frontier showing risk-return tradeoff for varying stock/bond allocations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />

              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                domain={[0, maxRisk]}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                label={{ value: 'Risk (Volatility)', position: 'bottom', offset: 20, fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />

              <YAxis
                type="number"
                dataKey="return"
                name="Return"
                domain={[0, maxReturn]}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                label={{ value: 'Expected Return', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />

              {interactive && <Tooltip content={<CustomTooltip />} />}

              {/* Capital Market Line */}
              {showCapitalMarketLine && capitalMarketLine.length > 0 && (
                <ReferenceLine
                  segment={[
                    { x: capitalMarketLine[0].risk, y: capitalMarketLine[0].return },
                    { x: capitalMarketLine[1].risk, y: capitalMarketLine[1].return },
                  ]}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  opacity={0.5}
                />
              )}

              {/* Standard Efficient Frontier - Darker gray, thicker stroke */}
              <Scatter
                name="Efficient Frontier"
                data={frontier}
                line={{ stroke: '#475569', strokeWidth: 3 }}
                fill="#475569"
              >
                {frontier.map((_, index) => (
                  <Cell key={`frontier-${index}`} opacity={0.5} r={2} />
                ))}
              </Scatter>

              {/* Leveraged Risk Parity Frontier - Higher opacity, longer dash */}
              {showLeveragedFrontier && leveragedFrontier.length > 0 && (
                <Scatter
                  name="Leveraged Risk Parity"
                  data={leveragedFrontier}
                  line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2.5, strokeDasharray: '8 4' }}
                  fill="hsl(var(--primary))"
                >
                  {leveragedFrontier.map((_, index) => (
                    <Cell key={`leveraged-${index}`} opacity={0.6} r={2} />
                  ))}
                </Scatter>
              )}

              {/* 60/40 Portfolio - Dark charcoal SQUARE marker */}
              <Scatter
                name="60/40 Traditional"
                data={[portfolio60_40]}
                fill="#1e293b"
                shape={(props: { cx?: number; cy?: number }) => <SquareMarker {...props} fill="#1e293b" />}
              />

              {/* Risk Parity Portfolio - Teal CIRCLE with white stroke */}
              <Scatter
                name="Risk Parity"
                data={[portfolioRiskParity]}
                fill="#14b8a6"
                shape={(props: { cx?: number; cy?: number }) => <CircleMarker {...props} fill="#14b8a6" />}
              />

              {/* Leveraged Risk Parity marker - DIAMOND shape */}
              {portfolioLeveragedRP && (
                <Scatter
                  name={`Risk Parity ${leverage.toFixed(1)}x`}
                  data={[portfolioLeveragedRP]}
                  fill="#14b8a6"
                  shape={(props: { cx?: number; cy?: number }) => <DiamondMarker {...props} fill="#14b8a6" />}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-slate-600" style={{ height: '3px' }} />
            <span className="text-sm text-muted-foreground">Efficient Frontier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-800 border-2 border-white shadow-sm" />
            <span className="text-sm text-muted-foreground">60/40 Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="text-sm text-muted-foreground">Risk Parity</span>
          </div>
          {showLeveragedFrontier && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-primary" />
                <span className="text-sm text-muted-foreground">Leveraged Frontier</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
                  <polygon points="8,2 14,8 8,14 2,8" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />
                </svg>
                <span className="text-sm text-muted-foreground">Leveraged RP</span>
              </div>
            </>
          )}
        </div>

        {/* Quick stats below chart */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">60/40 Sharpe</p>
            <p className="text-xl font-semibold numeric text-muted-foreground">
              {portfolio60_40.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolio60_40.stockRiskContribution.toFixed(0)}% stock risk
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Risk Parity Sharpe</p>
            <p className="text-xl font-semibold numeric text-primary">
              {portfolioRiskParity.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolioRiskParity.stockRiskContribution.toFixed(0)}% stock risk
            </p>
          </div>
        </div>

        {/* Asset class footnote */}
        <div className="text-center text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border">
          <p>2-Asset Model: Equity ({(stockVol * 100).toFixed(0)}% vol), Bonds ({(bondVol * 100).toFixed(0)}% vol) • For education only</p>
        </div>
      </CardContent>
    </Card>
  );
}
