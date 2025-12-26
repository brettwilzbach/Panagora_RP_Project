import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculatePortfolioMetrics,
  calculateRiskParityWeights,
  createPortfolioInputs,
  ASSET_COLORS,
  PANAGORA_DEFAULTS,
  formatPercent,
  formatRatio,
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

// Asset class definitions
const ASSET_NAMES = ['Global Equity', 'Global Bonds', 'Commodities', 'Cash'];
const ASSET_SHORT = ['Equity', 'Bonds', 'Commod.', 'Cash'];
const ASSET_COLORS_ARRAY = [ASSET_COLORS.equity, ASSET_COLORS.bonds, ASSET_COLORS.commodities, ASSET_COLORS.cash];

interface SimulationParams {
  stockVol: number;
  bondVol: number;
  correlation: number;
  leverage: number;
}

interface SimulationCockpitProps {
  onParamsChange?: (params: SimulationParams) => void;
}

type TargetVolMode = 'unlevered' | 'matchTrad' | 'target15';

// Maximum leverage cap for realistic scenarios
const MAX_LEVERAGE = 4.0;

export function SimulationCockpit({ onParamsChange }: SimulationCockpitProps) {
  // Volatilities for 4 asset classes
  const [equityVol, setEquityVol] = useState(PANAGORA_DEFAULTS.stockVolatility * 100);
  const [bondVol, setBondVol] = useState(PANAGORA_DEFAULTS.bondVolatility * 100);
  const [commodityVol, setCommodityVol] = useState(PANAGORA_DEFAULTS.commodityVolatility * 100);
  const cashVol = 1; // Cash vol is fixed at 1%

  // Stock-bond correlation (key driver of diversification benefit)
  const [correlation, setCorrelation] = useState(PANAGORA_DEFAULTS.correlation);

  const [targetVolMode, setTargetVolMode] = useState<TargetVolMode>('matchTrad');

  // Traditional allocation: 60% Equity, 40% Bonds (classic 60/40)
  const traditionalWeights = [0.60, 0.40, 0.00, 0.00];
  const volatilities = [equityVol / 100, bondVol / 100, commodityVol / 100, cashVol / 100];

  // Build dynamic correlation matrix based on stock-bond correlation
  const correlationMatrix = useMemo(() => [
    [1.00, correlation, 0.30, 0.00],  // Equity
    [correlation, 1.00, 0.00, 0.00],  // Bonds
    [0.30, 0.00, 1.00, 0.00],         // Commodities
    [0.00, 0.00, 0.00, 1.00],         // Cash
  ], [correlation]);

  // Calculate Risk Parity weights
  const riskParityWeights = useMemo(() => {
    const tempAssets = ASSET_NAMES.map((name, i) => ({
      name,
      volatility: volatilities[i],
      weight: 0,
      color: ASSET_COLORS_ARRAY[i],
    }));
    return calculateRiskParityWeights(tempAssets);
  }, [equityVol, bondVol, commodityVol]);

  // Calculate traditional portfolio metrics
  const traditionalMetrics = useMemo(() => {
    const inputs = createPortfolioInputs(traditionalWeights, volatilities, correlationMatrix, 1);
    return calculatePortfolioMetrics(inputs);
  }, [equityVol, bondVol, commodityVol, correlationMatrix]);

  // Calculate unlevered Risk Parity metrics
  const unleveredRPMetrics = useMemo(() => {
    const inputs = createPortfolioInputs(riskParityWeights.weights, volatilities, correlationMatrix, 1);
    return calculatePortfolioMetrics(inputs);
  }, [riskParityWeights, equityVol, bondVol, commodityVol, correlationMatrix]);

  // Calculate leverage based on target vol mode (with cap)
  const rawLeverage = useMemo(() => {
    switch (targetVolMode) {
      case 'unlevered':
        return 1;
      case 'matchTrad':
        return traditionalMetrics.portfolioVolatility / unleveredRPMetrics.portfolioVolatility;
      case 'target15':
        return 0.15 / unleveredRPMetrics.portfolioVolatility;
      default:
        return 1;
    }
  }, [targetVolMode, traditionalMetrics.portfolioVolatility, unleveredRPMetrics.portfolioVolatility]);

  // Apply leverage cap
  const leverage = Math.min(rawLeverage, MAX_LEVERAGE);
  const leverageCapped = rawLeverage > MAX_LEVERAGE;

  // Calculate leveraged Risk Parity metrics
  const riskParityMetrics = useMemo(() => {
    const inputs = createPortfolioInputs(riskParityWeights.weights, volatilities, correlationMatrix, leverage);
    return calculatePortfolioMetrics(inputs);
  }, [riskParityWeights, volatilities, correlationMatrix, leverage]);

  // Calculate risk contributions for traditional
  const traditionalRiskContribs = traditionalMetrics.riskContributions;
  const riskParityRiskContribs = unleveredRPMetrics.riskContributions;

  const sharpeImprovement = ((riskParityMetrics.sharpeRatio / traditionalMetrics.sharpeRatio) - 1) * 100;

  // Notify parent of parameter changes
  useEffect(() => {
    onParamsChange?.({
      stockVol: equityVol / 100,
      bondVol: bondVol / 100,
      correlation,
      leverage,
    });
  }, [equityVol, bondVol, correlation, leverage, onParamsChange]);

  // Target volatility presets
  const targetVolPresets: Array<{ mode: TargetVolMode; label: string; description: string }> = [
    { mode: 'unlevered', label: 'Unlevered', description: `${(unleveredRPMetrics.portfolioVolatility * 100).toFixed(1)}% vol` },
    { mode: 'matchTrad', label: '= 60/40 Vol', description: `${(traditionalMetrics.portfolioVolatility / unleveredRPMetrics.portfolioVolatility).toFixed(1)}x` },
    { mode: 'target15', label: '15% Target', description: `${(0.15 / unleveredRPMetrics.portfolioVolatility).toFixed(1)}x` },
  ];

  // Scenario presets
  const scenarioPresets = [
    { name: 'Normal', equityVol: 15, bondVol: 5, commodityVol: 20, lesson: 'Typical regime: risk parity equalizes risk contribution.' },
    { name: 'Vol Spike', equityVol: 25, bondVol: 10, commodityVol: 30, lesson: 'High volatility: risk parity dynamically rebalances.' },
    { name: 'Low Vol', equityVol: 10, bondVol: 3, commodityVol: 12, lesson: 'Calm markets: balanced risk still matters.' },
  ];

  const applyScenario = (scenario: typeof scenarioPresets[0]) => {
    setEquityVol(scenario.equityVol);
    setBondVol(scenario.bondVol);
    setCommodityVol(scenario.commodityVol);
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
                  const isActive = equityVol === scenario.equityVol && bondVol === scenario.bondVol && commodityVol === scenario.commodityVol;
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

            {/* Volatility Sliders */}
            <div className="space-y-4">
              <CompactSlider
                label="Equity Volatility"
                value={equityVol}
                onChange={setEquityVol}
                min={5}
                max={30}
                step={0.5}
                unit="%"
                color={ASSET_COLORS.equity}
              />
              <CompactSlider
                label="Bond Volatility"
                value={bondVol}
                onChange={setBondVol}
                min={2}
                max={15}
                step={0.5}
                unit="%"
                color={ASSET_COLORS.bonds}
              />
              <CompactSlider
                label="Commodity Volatility"
                value={commodityVol}
                onChange={setCommodityVol}
                min={10}
                max={40}
                step={0.5}
                unit="%"
                color={ASSET_COLORS.commodities}
              />
              <CompactSlider
                label="Stock-Bond Correlation"
                value={correlation}
                onChange={setCorrelation}
                min={-1}
                max={1}
                step={0.05}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                hint="low = more diversification"
              />
            </div>

            {/* Target Volatility */}
            <div className="pt-4 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Target Volatility</label>
              <div className="flex gap-2 mb-3">
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
              <div className="bg-muted/30 rounded-md p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leverage</span>
                  <span className="font-medium text-primary">
                    {leverage.toFixed(1)}x
                    {leverageCapped && <span className="text-amber-500 ml-1">(capped)</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="font-medium">{(riskParityMetrics.leveragedVolatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="font-medium">{(riskParityMetrics.leveragedReturn * 100).toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-2">
                  Leverage scales return and risk equally; Sharpe is unchanged.
                  {leverageCapped && <span className="text-amber-500"> Max {MAX_LEVERAGE}x for realistic scenarios.</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Capital Allocation vs Risk Allocation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Capital & Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Traditional */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Traditional (60/40)</span>
                <span className="text-sm">Sharpe: <span className="font-semibold">{formatRatio(traditionalMetrics.sharpeRatio)}</span></span>
              </div>
              <div className="flex gap-6 justify-center">
                <VerticalBar4
                  label="Capital"
                  percents={traditionalWeights.map(w => w * 100)}
                />
                <VerticalBar4
                  label="Risk"
                  percents={traditionalRiskContribs}
                />
              </div>
            </div>

            {/* Risk Parity */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-primary">Risk Parity</span>
                <span className="text-sm">Sharpe: <span className="font-semibold text-primary">{formatRatio(riskParityMetrics.sharpeRatio)}</span> <span className="text-primary text-xs">(+{sharpeImprovement.toFixed(0)}%)</span></span>
              </div>
              <div className="flex gap-6 justify-center">
                <VerticalBar4
                  label="Capital"
                  percents={riskParityWeights.weights.map(w => w * 100)}
                />
                <VerticalBar4
                  label="Risk"
                  percents={riskParityRiskContribs}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs pt-2">
              {ASSET_SHORT.slice(0, 3).map((name, i) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ASSET_COLORS_ARRAY[i] }} />
                  <span className="text-muted-foreground">{name}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ASSET_COLORS_ARRAY[3] }} />
                <span className="text-muted-foreground">Cash (0% in RP)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Lesson */}
      {scenarioPresets.map((scenario) => {
        const isActive = equityVol === scenario.equityVol && bondVol === scenario.bondVol && commodityVol === scenario.commodityVol;
        return isActive ? (
          <div key={scenario.name} className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-base text-foreground font-medium">
              → {scenario.lesson}
            </p>
          </div>
        ) : null;
      })}

      {/* Bottom summary */}
      {sharpeImprovement > 5 ? (
        <div className="text-center p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
          <p className="text-xl font-bold">
            <span className="text-primary">Risk Parity: +{sharpeImprovement.toFixed(0)}% efficiency</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">at {formatPercent(riskParityMetrics.leveragedVolatility * 100)} volatility</p>
        </div>
      ) : (
        <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm">
            <span className="font-medium text-amber-600">Diversification benefit reduced</span>
            <span className="text-muted-foreground/60 ml-2 text-xs">high correlation</span>
          </p>
        </div>
      )}

      {/* Trust layer */}
      <div className="text-center text-[10px] text-muted-foreground space-y-1">
        <p>Traditional = 60/40 (stocks/bonds). Risk Parity = 3 risky assets (equity/bonds/commodities) for diversification.</p>
        <p>Leverage financed via cash borrowing; cash weight can be negative when leveraged. For education only.</p>
        <p><strong className="text-foreground">PanAgora edge:</strong> Attribution-aware optimization bridges quant models and portfolio manager intuition.</p>
      </div>
    </div>
  );
}

// Compact slider
interface CompactSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  color?: string;
  formatValue?: (v: number) => string;
  hint?: string;
}

function CompactSlider({ label, value, onChange, min, max, step, unit = '', color, formatValue, hint }: CompactSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 1 : 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
          <label className="text-sm text-muted-foreground">{label}</label>
          {hint && <span className="text-[10px] text-muted-foreground/70 italic">({hint})</span>}
        </div>
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
    </div>
  );
}

// Vertical stacked bar for 4 asset classes
interface VerticalBar4Props {
  label: string;
  percents: number[]; // [equity, bonds, commodities, cash]
}

function VerticalBar4({ label, percents }: VerticalBar4Props) {
  // Normalize and filter out tiny values
  const total = percents.reduce((a, b) => a + b, 0);
  const normalized = percents.map(p => (p / total) * 100);

  return (
    <div className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-16 h-32 flex flex-col justify-end rounded-t overflow-hidden bg-muted/30 border border-border cursor-help">
            {/* Render from bottom to top: Cash, Commodities, Bonds, Equity */}
            {[...normalized].reverse().map((pct, i) => {
              const colorIndex = 3 - i; // Reverse index for colors
              if (pct < 0.5) return null; // Skip tiny segments
              return (
                <div
                  key={i}
                  className="w-full transition-all duration-300 ease-out"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: ASSET_COLORS_ARRAY[colorIndex],
                  }}
                />
              );
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-2">
          <div className="space-y-1 text-xs">
            <p className="font-semibold border-b border-border pb-1 mb-1">{label}</p>
            {percents.map((pct, i) => {
              if (pct < 0.5) return null;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: ASSET_COLORS_ARRAY[i] }}
                  />
                  <span className="text-muted-foreground">{ASSET_SHORT[i]}:</span>
                  <span className="font-medium ml-auto">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
      <span className="text-xs text-muted-foreground mt-2">{label}</span>
    </div>
  );
}
