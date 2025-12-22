import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateEfficientFrontier, generateLeveragedFrontier } from '@/lib/calculations';

interface EfficientFrontierProps {
  stockVol: number;
  bondVol: number;
  correlation: number;
  highlightTraditional?: boolean;
  highlightRiskParity?: boolean;
  showLeveragedFrontier?: boolean;
}

export function EfficientFrontier({
  stockVol,
  bondVol,
  correlation,
  highlightTraditional = true,
  highlightRiskParity = true,
  showLeveragedFrontier = true,
}: EfficientFrontierProps) {
  const frontier = useMemo(
    () => generateEfficientFrontier(stockVol, bondVol, correlation),
    [stockVol, bondVol, correlation]
  );

  const leveragedFrontier = useMemo(
    () => showLeveragedFrontier ? generateLeveragedFrontier(stockVol, bondVol, correlation) : [],
    [stockVol, bondVol, correlation, showLeveragedFrontier]
  );

  // Find specific portfolio points
  const traditional60_40 = frontier.find(p => Math.abs(p.stockWeight - 60) < 2);
  const riskParityPoint = frontier.reduce((closest, point) => {
    const riskParityWeight = (bondVol / (stockVol + bondVol)) * 100;
    return Math.abs(point.stockWeight - riskParityWeight) < Math.abs(closest.stockWeight - riskParityWeight)
      ? point
      : closest;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Efficient Frontier</CardTitle>
        <CardDescription>
          Risk-return tradeoff showing how Risk Parity achieves higher efficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" />
              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                domain={[0, 'auto']}
                tick={{ fill: 'hsl(215, 20%, 65%)' }}
                label={{ value: 'Risk (Volatility %)', position: 'bottom', fill: 'hsl(215, 20%, 65%)' }}
              />
              <YAxis
                type="number"
                dataKey="return"
                name="Return"
                domain={[0, 'auto']}
                tick={{ fill: 'hsl(215, 20%, 65%)' }}
                label={{ value: 'Return %', angle: -90, position: 'left', fill: 'hsl(215, 20%, 65%)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(217, 33%, 17%)',
                  border: '1px solid hsl(217, 33%, 25%)',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}%`,
                  name === 'risk' ? 'Risk' : 'Return',
                ]}
              />

              {/* Standard Efficient Frontier */}
              <Scatter
                name="Efficient Frontier"
                data={frontier}
                fill="hsl(199, 89%, 48%)"
                opacity={0.6}
                line={{ stroke: 'hsl(199, 89%, 48%)', strokeWidth: 2 }}
              />

              {/* Leveraged Risk Parity Frontier */}
              {showLeveragedFrontier && (
                <Scatter
                  name="Leveraged Risk Parity"
                  data={leveragedFrontier}
                  fill="hsl(142, 71%, 45%)"
                  opacity={0.6}
                  line={{ stroke: 'hsl(142, 71%, 45%)', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
              )}

              {/* Highlight 60/40 */}
              {highlightTraditional && traditional60_40 && (
                <Scatter
                  name="60/40 Portfolio"
                  data={[traditional60_40]}
                  fill="hsl(0, 84%, 60%)"
                >
                  <Label value="60/40" position="top" fill="hsl(0, 84%, 60%)" />
                </Scatter>
              )}

              {/* Highlight Risk Parity */}
              {highlightRiskParity && riskParityPoint && (
                <Scatter
                  name="Risk Parity"
                  data={[riskParityPoint]}
                  fill="hsl(142, 71%, 45%)"
                >
                  <Label value="Risk Parity" position="top" fill="hsl(142, 71%, 45%)" />
                </Scatter>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Efficient Frontier</span>
          </div>
          {showLeveragedFrontier && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Leveraged Risk Parity</span>
            </div>
          )}
          {highlightTraditional && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">60/40 Portfolio</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
