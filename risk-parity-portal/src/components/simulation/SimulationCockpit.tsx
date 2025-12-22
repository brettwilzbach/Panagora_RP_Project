import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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

interface SimulationParams {
  stockVol: number;
  bondVol: number;
  correlation: number;
  leverage: number;
}

interface SimulationCockpitProps {
  onParamsChange?: (params: SimulationParams) => void;
}

type TargetVolMode = 'unlevered' | 'match60_40' | 'target15';

export function SimulationCockpit({ onParamsChange }: SimulationCockpitProps) {
  const [stockVol, setStockVol] = useState(PANAGORA_DEFAULTS.stockVolatility * 100);
  const [bondVol, setBondVol] = useState(PANAGORA_DEFAULTS.bondVolatility * 100);
  const [correlation, setCorrelation] = useState(PANAGORA_DEFAULTS.correlation);
  const [targetVolMode, setTargetVolMode] = useState<TargetVolMode>('match60_40');

  // Calculate Risk Parity weights first (needed for leverage calc)
  const riskParityWeights = useMemo(
    () => calculateRiskParityWeights(stockVol / 100, bondVol / 100, correlation),
    [stockVol, bondVol, correlation]
  );

  // Calculate unlevered Risk Parity volatility
  const unleveredRPInputs: PortfolioInputs = useMemo(() => ({
    stockVolatility: stockVol / 100,
    bondVolatility: bondVol / 100,
    correlation,
    stockWeight: riskParityWeights.stockWeight,
    bondWeight: riskParityWeights.bondWeight,
    leverage: 1,
  }), [stockVol, bondVol, correlation, riskParityWeights]);

  const unleveredRPVol = useMemo(
    () => calculatePortfolioMetrics(unleveredRPInputs).portfolioVolatility,
    [unleveredRPInputs]
  );

  // Calculate 60/40 volatility for "match" mode
  const trad60_40Vol = useMemo(() => {
    const inputs: PortfolioInputs = {
      stockVolatility: stockVol / 100,
      bondVolatility: bondVol / 100,
      correlation,
      stockWeight: 0.6,
      bondWeight: 0.4,
      leverage: 1,
    };
    return calculatePortfolioMetrics(inputs).portfolioVolatility;
  }, [stockVol, bondVol, correlation]);

  // Calculate leverage based on target vol mode
  const leverage = useMemo(() => {
    switch (targetVolMode) {
      case 'unlevered':
        return 1;
      case 'match60_40':
        return trad60_40Vol / unleveredRPVol;
      case 'target15':
        return 0.15 / unleveredRPVol;
      default:
        return 1;
    }
  }, [targetVolMode, trad60_40Vol, unleveredRPVol]);

  // Notify parent of parameter changes
  useEffect(() => {
    onParamsChange?.({
      stockVol: stockVol / 100,
      bondVol: bondVol / 100,
      correlation,
      leverage,
    });
  }, [stockVol, bondVol, correlation, leverage, onParamsChange]);

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

  // Target volatility presets - leverage is calculated, not chosen
  // Using 15% (equity-like vol) as the aggressive option to create clear separation
  const targetVolPresets: Array<{ mode: TargetVolMode; label: string; description: string }> = [
    { mode: 'unlevered', label: 'Unlevered', description: `${(unleveredRPVol * 100).toFixed(1)}% vol` },
    { mode: 'match60_40', label: 'Match 60/40', description: `${(trad60_40Vol / unleveredRPVol).toFixed(1)}x leverage` },
    { mode: 'target15', label: '15% Target', description: `${(0.15 / unleveredRPVol).toFixed(1)}x leverage` },
  ];

  // Market scenario presets - each teaches a lesson, anchored to real regimes
  const scenarioPresets = [
    {
      name: 'Normal',
      stockVol: 15,
      bondVol: 5,
      correlation: 0.1,
      lesson: 'Typical regime: risk parity equalizes risk contribution.',
    },
    {
      name: '2022 Crisis',
      stockVol: 25,
      bondVol: 10,
      correlation: 0.6,
      lesson: 'Rate-shock regime: stocks and bonds fall together, diversification fails.',
    },
    {
      name: 'Flight to Quality',
      stockVol: 30,
      bondVol: 5,
      correlation: -0.2,
      lesson: '2008-style crisis: bonds rally as equities fall, max diversification benefit.',
    },
  ];

  const applyScenario = (scenario: typeof scenarioPresets[0]) => {
    setStockVol(scenario.stockVol);
    setBondVol(scenario.bondVol);
    setCorrelation(scenario.correlation);
  };

  return (
    <div className="space-y-6">
      {/* Main Panel - Side by Side Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Simulation Parameters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Simulation Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">Scenario</label>
              <div className="flex gap-2">
                {scenarioPresets.map((scenario) => {
                  const isActive = stockVol === scenario.stockVol && bondVol === scenario.bondVol && correlation === scenario.correlation;
                  return (
                    <button
                      key={scenario.name}
                      onClick={() => applyScenario(scenario)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {scenario.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders - Compact */}
            <div className="space-y-5">
              <CompactSlider
                label="Stock Volatility"
                value={stockVol}
                onChange={setStockVol}
                min={5}
                max={30}
                step={0.5}
                unit="%"
              />
              <CompactSlider
                label="Bond Volatility"
                value={bondVol}
                onChange={setBondVol}
                min={2}
                max={15}
                step={0.5}
                unit="%"
              />
              <CompactSlider
                label="Correlation"
                value={correlation}
                onChange={setCorrelation}
                min={-0.5}
                max={1}
                step={0.05}
                unit=""
                formatValue={(v) => v.toFixed(2)}
              />
            </div>

            {/* Target Volatility */}
            <div className="pt-4 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Target Volatility</label>
              <p className="text-sm text-foreground mb-3">
                {(riskParityMetrics.leveragedVolatility * 100).toFixed(1)}% vol → <span className="text-primary font-medium">{leverage.toFixed(1)}x leverage</span>
              </p>
              <div className="flex gap-2">
                {targetVolPresets.map((preset) => (
                  <button
                    key={preset.mode}
                    onClick={() => setTargetVolMode(preset.mode)}
                    className={cn(
                      "flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all",
                      targetVolMode === preset.mode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Capital Allocation vs Risk Allocation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Capital Allocation vs. Risk Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 60/40 Traditional */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">60/40 Traditional</span>
                <span className="text-sm">Sharpe: <span className="font-semibold">{formatRatio(traditionalMetrics.sharpeRatio)}</span></span>
              </div>
              <div className="flex gap-8 justify-center">
                <VerticalBar
                  label="Capital"
                  stockPercent={60}
                  bondPercent={40}
                />
                <VerticalBar
                  label="Risk"
                  stockPercent={traditionalMetrics.stockRiskContribution}
                  bondPercent={traditionalMetrics.bondRiskContribution}
                />
              </div>
            </div>

            {/* Risk Parity */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-primary">Risk Parity</span>
                <span className="text-sm">Sharpe: <span className="font-semibold text-primary">{formatRatio(riskParityMetrics.sharpeRatio)}</span> <span className="text-primary text-xs">(+{sharpeImprovement.toFixed(0)}%)</span></span>
              </div>
              <div className="flex gap-8 justify-center">
                <VerticalBar
                  label="Capital"
                  stockPercent={riskParityWeights.stockWeight * 100}
                  bondPercent={riskParityWeights.bondWeight * 100}
                />
                <VerticalBar
                  label="Risk"
                  stockPercent={riskParityRiskContribution.stock}
                  bondPercent={riskParityRiskContribution.bond}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                <span className="text-muted-foreground">Stocks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gray-400" />
                <span className="text-muted-foreground">Bonds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Lesson */}
      {scenarioPresets.map((scenario) => {
        const isActive = stockVol === scenario.stockVol && bondVol === scenario.bondVol && correlation === scenario.correlation;
        return isActive ? (
          <div key={scenario.name} className="text-center text-sm text-primary font-medium">
            → {scenario.lesson}
          </div>
        ) : null;
      })}

      {/* Bottom line - dynamic based on scenario */}
      {sharpeImprovement > 5 ? (
        <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm">
            <span className="font-medium text-primary">Risk Parity is {sharpeImprovement.toFixed(0)}% more efficient</span>
            <span className="text-muted-foreground"> in this scenario</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Same risk exposure ({formatPercent(riskParityMetrics.leveragedVolatility * 100)} vol), better diversification
          </p>
        </div>
      ) : (
        <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm">
            <span className="font-medium text-amber-600">When risk parity doesn't help</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            High correlation ({(correlation * 100).toFixed(0)}%) means stocks and bonds move together—diversification can't work.
          </p>
        </div>
      )}

      {/* Trust layer */}
      <div className="text-center text-[10px] text-muted-foreground space-y-1">
        <p>Assumptions: {stockVol}% stock vol, {bondVol}% bond vol, {(correlation * 100).toFixed(0)}% correlation  •  For education only</p>
        <p><strong className="text-foreground">PanAgora edge:</strong> Attribution-aware optimization bridges quant models and portfolio manager intuition.</p>
      </div>
    </div>
  );
}

// Compact slider with inline label and value
interface CompactSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (v: number) => string;
}

function CompactSlider({ label, value, onChange, min, max, step, unit = '', formatValue }: CompactSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 1 : 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="text-sm font-medium text-foreground tabular-nums">
          {displayValue}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// Vertical stacked bar for Capital/Risk visualization
interface VerticalBarProps {
  label: string;
  stockPercent: number;
  bondPercent: number;
}

function VerticalBar({ label, stockPercent, bondPercent }: VerticalBarProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-28 flex flex-col justify-end rounded-t overflow-hidden bg-muted/50">
        <div
          className="w-full transition-all duration-300 ease-out"
          style={{ height: `${bondPercent}%`, backgroundColor: '#9ca3af' }}
        />
        <div
          className="w-full transition-all duration-300 ease-out"
          style={{ height: `${stockPercent}%`, backgroundColor: 'hsl(var(--primary))' }}
        />
      </div>
      <span className="text-xs text-muted-foreground mt-2">{label}</span>
    </div>
  );
}

