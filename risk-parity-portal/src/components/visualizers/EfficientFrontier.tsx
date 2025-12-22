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
  generateEfficientFrontier,
  generateLeveragedFrontier,
  calculateRiskParityWeights,
  calculatePortfolioMetrics,
  PANAGORA_DEFAULTS,
  type PortfolioInputs,
} from '@/lib/calculations';

interface KeyPortfolio {
  name: string;
  risk: number;
  return: number;
  stockWeight: number;
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
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: KeyPortfolio | { risk: number; return: number; stockWeight?: number; leverage?: number } }> }) {
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
            <span className="numeric text-foreground">{(data as KeyPortfolio).stockWeight.toFixed(0)}/{(data as KeyPortfolio).bondWeight.toFixed(0)}</span>
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
          {'stockWeight' in data && data.stockWeight !== undefined && (
            <>
              <span className="text-muted-foreground">Stocks:</span>
              <span className="numeric text-foreground">{data.stockWeight.toFixed(0)}%</span>
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

  // Generate efficient frontier
  const frontier = useMemo(
    () => generateEfficientFrontier(stockVol, bondVol, correlation),
    [stockVol, bondVol, correlation]
  );

  // Generate leveraged frontier when needed
  const leveragedFrontier = useMemo(
    () => showLeveragedFrontier ? generateLeveragedFrontier(stockVol, bondVol, correlation, 4) : [],
    [stockVol, bondVol, correlation, showLeveragedFrontier]
  );

  // Calculate 60/40 portfolio directly (robust - no array matching)
  const portfolio60_40 = useMemo((): KeyPortfolio => {
    const inputs: PortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: 0.6,
      bondWeight: 0.4,
      leverage: 1,
    };
    const metrics = calculatePortfolioMetrics(inputs);
    return {
      name: '60/40 Traditional',
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      stockWeight: 60,
      bondWeight: 40,
      sharpeRatio: metrics.sharpeRatio,
      stockRiskContribution: metrics.stockRiskContribution,
      bondRiskContribution: metrics.bondRiskContribution,
      type: 'traditional',
    };
  }, [stockVol, bondVol, correlation]);

  // Calculate Risk Parity portfolio directly (robust - uses actual risk parity weights)
  const portfolioRiskParity = useMemo((): KeyPortfolio => {
    const weights = calculateRiskParityWeights(stockVol, bondVol, correlation);
    const inputs: PortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: weights.stockWeight,
      bondWeight: weights.bondWeight,
      leverage: 1,
    };
    const metrics = calculatePortfolioMetrics(inputs);
    return {
      name: 'Risk Parity',
      risk: metrics.portfolioVolatility * 100,
      return: metrics.expectedReturn * 100,
      stockWeight: weights.stockWeight * 100,
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
    const weights = calculateRiskParityWeights(stockVol, bondVol, correlation);
    const inputs: PortfolioInputs = {
      stockVolatility: stockVol,
      bondVolatility: bondVol,
      correlation,
      stockWeight: weights.stockWeight,
      bondWeight: weights.bondWeight,
      leverage,
    };
    const metrics = calculatePortfolioMetrics(inputs);
    return {
      name: `Risk Parity ${leverage}x`,
      risk: metrics.leveragedVolatility * 100,
      return: metrics.leveragedReturn * 100,
      stockWeight: weights.stockWeight * 100,
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
      stockWeight: number;
      sharpe: number;
    }
    const tangencyPoint = frontier.reduce<TangencyPoint>((best, point) => {
      const inputs: PortfolioInputs = {
        stockVolatility: stockVol,
        bondVolatility: bondVol,
        correlation,
        stockWeight: point.stockWeight / 100,
        bondWeight: 1 - point.stockWeight / 100,
        leverage: 1,
      };
      const metrics = calculatePortfolioMetrics(inputs);
      return metrics.sharpeRatio > best.sharpe ? { ...point, sharpe: metrics.sharpeRatio } : best;
    }, { risk: 0, return: 0, stockWeight: 0, sharpe: 0 });

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
        <CardTitle className="text-lg">Efficient Frontier</CardTitle>
        <CardDescription>
          Risk-return tradeoff comparing traditional 60/40 allocation versus Risk Parity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />

              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                domain={[0, maxRisk]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              >
              </XAxis>

              <YAxis
                type="number"
                dataKey="return"
                name="Return"
                domain={[0, maxReturn]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              >
              </YAxis>

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

              {/* Standard Efficient Frontier - Line with small dots */}
              <Scatter
                name="Efficient Frontier"
                data={frontier}
                line={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                fill="hsl(var(--chart-1))"
              >
                {frontier.map((_, index) => (
                  <Cell key={`frontier-${index}`} opacity={0.3} r={2} />
                ))}
              </Scatter>

              {/* Leveraged Risk Parity Frontier */}
              {showLeveragedFrontier && leveragedFrontier.length > 0 && (
                <Scatter
                  name="Leveraged Risk Parity"
                  data={leveragedFrontier}
                  line={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 2, strokeDasharray: '6 3' }}
                  fill="hsl(var(--chart-1))"
                >
                  {leveragedFrontier.map((_, index) => (
                    <Cell key={`leveraged-${index}`} opacity={0.2} r={2} />
                  ))}
                </Scatter>
              )}

              {/* 60/40 Portfolio - Prominent marker */}
              <Scatter
                name="60/40 Traditional"
                data={[portfolio60_40]}
                fill="#9ca3af"
              >
                <Cell r={8} strokeWidth={2} stroke="hsl(var(--card))" />
              </Scatter>

              {/* Risk Parity Portfolio - Prominent marker */}
              <Scatter
                name="Risk Parity"
                data={[portfolioRiskParity]}
                fill="hsl(var(--chart-1))"
              >
                <Cell r={8} strokeWidth={2} stroke="hsl(var(--card))" />
              </Scatter>

              {/* Leveraged Risk Parity marker (when leverage > 1) */}
              {portfolioLeveragedRP && (
                <Scatter
                  name={`Risk Parity ${leverage}x`}
                  data={[portfolioLeveragedRP]}
                  fill="hsl(var(--chart-1))"
                >
                  <Cell r={8} strokeWidth={2} stroke="hsl(var(--card))" />
                </Scatter>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span className="text-sm text-muted-foreground">Efficient Frontier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm text-muted-foreground">60/40 Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span className="text-sm text-muted-foreground">Risk Parity</span>
          </div>
          {showLeveragedFrontier && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--chart-1))' }} />
              <span className="text-sm text-muted-foreground">Leveraged RP</span>
            </div>
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
            <p className="text-xl font-semibold numeric" style={{ color: 'hsl(var(--chart-1))' }}>
              {portfolioRiskParity.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolioRiskParity.stockRiskContribution.toFixed(0)}% stock risk
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
