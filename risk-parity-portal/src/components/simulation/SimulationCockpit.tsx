import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MetricCard, MetricsGrid } from '@/components/dashboard/MetricsDisplay';
import { RiskBar } from '@/components/visualizers/RiskContributionChart';
import {
  calculatePortfolioMetrics,
  calculateRiskParityWeights,
  calculateRiskContribution,
  PANAGORA_DEFAULTS,
  formatPercent,
  formatRatio,
  type PortfolioInputs,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

export function SimulationCockpit() {
  const [stockVol, setStockVol] = useState(PANAGORA_DEFAULTS.stockVolatility * 100);
  const [bondVol, setBondVol] = useState(PANAGORA_DEFAULTS.bondVolatility * 100);
  const [correlation, setCorrelation] = useState(PANAGORA_DEFAULTS.correlation);
  const [leverage, setLeverage] = useState(1);

  // Calculate Risk Parity weights
  const riskParityWeights = useMemo(
    () => calculateRiskParityWeights(stockVol / 100, bondVol / 100, correlation),
    [stockVol, bondVol, correlation]
  );

  // Calculate metrics for traditional 60/40
  const traditionalInputs: PortfolioInputs = useMemo(() => ({
    stockVolatility: stockVol / 100,
    bondVolatility: bondVol / 100,
    correlation,
    stockWeight: 0.6,
    bondWeight: 0.4,
    leverage: 1,
  }), [stockVol, bondVol, correlation]);

  const traditionalMetrics = useMemo(
    () => calculatePortfolioMetrics(traditionalInputs),
    [traditionalInputs]
  );

  // Calculate metrics for Risk Parity
  const riskParityInputs: PortfolioInputs = useMemo(() => ({
    stockVolatility: stockVol / 100,
    bondVolatility: bondVol / 100,
    correlation,
    stockWeight: riskParityWeights.stockWeight,
    bondWeight: riskParityWeights.bondWeight,
    leverage,
  }), [stockVol, bondVol, correlation, riskParityWeights, leverage]);

  const riskParityMetrics = useMemo(
    () => calculatePortfolioMetrics(riskParityInputs),
    [riskParityInputs]
  );

  const riskParityRiskContribution = useMemo(
    () => calculateRiskContribution({
      ...riskParityInputs,
      leverage: 1,
    }),
    [riskParityInputs]
  );

  const sharpeImprovement = ((riskParityMetrics.sharpeRatio / traditionalMetrics.sharpeRatio) - 1) * 100;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Simulation Cockpit</CardTitle>
          </div>
          <CardDescription>
            Adjust parameters to see how Risk Parity responds to market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stock Volatility */}
            <SliderControl
              label="Stock Volatility"
              value={stockVol}
              onChange={setStockVol}
              min={5}
              max={30}
              step={0.1}
              unit="%"
              defaultValue={PANAGORA_DEFAULTS.stockVolatility * 100}
            />

            {/* Bond Volatility */}
            <SliderControl
              label="Bond Volatility"
              value={bondVol}
              onChange={setBondVol}
              min={2}
              max={15}
              step={0.1}
              unit="%"
              defaultValue={PANAGORA_DEFAULTS.bondVolatility * 100}
            />

            {/* Correlation */}
            <SliderControl
              label="Correlation"
              value={correlation}
              onChange={setCorrelation}
              min={-0.5}
              max={1}
              step={0.05}
              defaultValue={PANAGORA_DEFAULTS.correlation}
            />

            {/* Leverage */}
            <SliderControl
              label="Risk Parity Leverage"
              value={leverage}
              onChange={setLeverage}
              min={1}
              max={4}
              step={0.1}
              unit="x"
              defaultValue={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Dashboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Traditional 60/40 */}
        <Card className="opacity-75">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-muted-foreground">Traditional 60/40</CardTitle>
              <Badge variant="secondary">Baseline</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricsGrid columns={2}>
              <MetricCard
                label="Sharpe Ratio"
                value={formatRatio(traditionalMetrics.sharpeRatio)}
              />
              <MetricCard
                label="Portfolio Vol"
                value={formatPercent(traditionalMetrics.portfolioVolatility * 100)}
              />
            </MetricsGrid>
            <RiskBar
              label="Risk Contribution"
              stockPercent={Math.round(traditionalMetrics.stockRiskContribution)}
              bondPercent={Math.round(traditionalMetrics.bondRiskContribution)}
            />
          </CardContent>
        </Card>

        {/* Risk Parity */}
        <Card className="border-primary/50 glow-cyan">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-primary">Risk Parity Portfolio</CardTitle>
              <Badge variant="success">
                +{sharpeImprovement.toFixed(0)}% Sharpe
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricsGrid columns={2}>
              <MetricCard
                label="Sharpe Ratio"
                value={formatRatio(riskParityMetrics.sharpeRatio)}
                highlight
              />
              <MetricCard
                label="Portfolio Vol"
                value={formatPercent(riskParityMetrics.leveragedVolatility * 100)}
                subValue={leverage > 1 ? `${leverage.toFixed(1)}x leveraged` : 'Unleveraged'}
              />
            </MetricsGrid>
            <RiskBar
              label="Risk Contribution"
              stockPercent={Math.round(riskParityRiskContribution.stock)}
              bondPercent={Math.round(riskParityRiskContribution.bond)}
              highlighted
            />
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                Allocation: {formatPercent(riskParityWeights.stockWeight * 100)} stocks / {formatPercent(riskParityWeights.bondWeight * 100)} bonds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <InsightCard
          icon={TrendingUp}
          title="Efficiency Gain"
          value={`${sharpeImprovement.toFixed(1)}%`}
          description="Higher return per unit of risk"
          positive={sharpeImprovement > 0}
        />
        <InsightCard
          icon={Activity}
          title="True Diversification"
          value={`${Math.round(riskParityRiskContribution.stock)}/${Math.round(riskParityRiskContribution.bond)}`}
          description="Near-equal risk contribution"
          positive={Math.abs(riskParityRiskContribution.stock - 50) < 10}
        />
        <InsightCard
          icon={Shield}
          title="Expected Return"
          value={formatPercent(riskParityMetrics.leveragedReturn * 100)}
          description={leverage > 1 ? `With ${leverage.toFixed(1)}x leverage` : 'Unleveraged'}
          positive
        />
      </div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  defaultValue: number;
}

function SliderControl({ label, value, onChange, min, max, step, unit = '', defaultValue }: SliderControlProps) {
  const isDefault = Math.abs(value - defaultValue) < step * 2;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className={cn(
          "font-mono text-sm",
          isDefault ? "text-muted-foreground" : "text-primary"
        )}>
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <button
          onClick={() => onChange(defaultValue)}
          className="text-primary hover:underline"
        >
          Reset
        </button>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  positive?: boolean;
}

function InsightCard({ icon: Icon, title, value, description, positive }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="instrument-panel p-4"
    >
      <div className="relative z-10 flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          positive ? "bg-accent/20" : "bg-secondary"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            positive ? "text-accent" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={cn(
            "font-mono text-xl font-semibold",
            positive ? "text-accent" : "text-foreground"
          )}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
