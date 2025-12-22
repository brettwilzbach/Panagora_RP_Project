import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Scenario {
  name: string;
  stockVol: number;
  bondVol: number;
  traditional60_40: { vol: number; stockRisk: number };
  riskParity: { vol: number; stockRisk: number };
}

const scenarios: Scenario[] = [
  {
    name: 'Normal',
    stockVol: 15,
    bondVol: 5,
    traditional60_40: { vol: 9.5, stockRisk: 93 },
    riskParity: { vol: 4.8, stockRisk: 50 },
  },
  {
    name: 'Stress',
    stockVol: 30,
    bondVol: 8,
    traditional60_40: { vol: 18.5, stockRisk: 95 },
    riskParity: { vol: 7.5, stockRisk: 50 },
  },
  {
    name: 'Low Vol',
    stockVol: 10,
    bondVol: 3,
    traditional60_40: { vol: 6.2, stockRisk: 94 },
    riskParity: { vol: 3.0, stockRisk: 50 },
  },
];

export function ScenarioComparison() {
  const [activeScenario, setActiveScenario] = useState(0);
  const scenario = scenarios[activeScenario];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Market Scenarios</h3>
          <div className="flex gap-1">
            {scenarios.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setActiveScenario(i)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-all",
                  activeScenario === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Volatility bars comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* 60/40 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">60/40 Portfolio</span>
                  <span className="font-medium text-muted-foreground">
                    {scenario.traditional60_40.vol.toFixed(1)}% vol
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-md"
                    style={{ backgroundColor: '#9ca3af' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(scenario.traditional60_40.vol / 25) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs font-medium text-white drop-shadow">
                      {scenario.traditional60_40.stockRisk}% stock risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Parity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Risk Parity</span>
                  <span className="font-medium text-primary">
                    {scenario.riskParity.vol.toFixed(1)}% vol
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-md bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(scenario.riskParity.vol / 25) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs font-medium text-white drop-shadow">
                      {scenario.riskParity.stockRisk}% stock risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key insight */}
            <div className="text-center pt-2 border-t border-border space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Risk Parity stays balanced at 50/50</span>
                {' '}across these regimes
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Illustrative: Stock vol {scenario.stockVol}%, Bond vol {scenario.bondVol}%
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
