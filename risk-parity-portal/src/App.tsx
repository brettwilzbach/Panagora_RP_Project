import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CockpitHeader } from '@/components/dashboard/CockpitHeader';
import { EggBasketVisualizer } from '@/components/visualizers/EggBasketVisualizer';
import { EfficientFrontier } from '@/components/visualizers/EfficientFrontier';
import { SimulationCockpit } from '@/components/simulation/SimulationCockpit';
import { PANAGORA_DEFAULTS } from '@/lib/calculations';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [simParams, setSimParams] = useState({
    stockVol: PANAGORA_DEFAULTS.stockVolatility,
    bondVol: PANAGORA_DEFAULTS.bondVolatility,
    correlation: PANAGORA_DEFAULTS.correlation,
    leverage: 1,
  });

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <CockpitHeader />

        <main className="max-w-6xl mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="simulator">Simulator</TabsTrigger>
            </TabsList>

            {/* Overview Tab - Educational narrative */}
            <TabsContent value="overview" className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Lead with risk - the hook */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    60/40 looks balanced by dollars,<br />
                    but it's <span className="text-primary">93% equity risk</span>.
                  </h1>
                </div>

                {/* Define terms once */}
                <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">Capital</strong> = dollars invested</span>
                  <span><strong className="text-foreground">Risk</strong> = where drawdowns come from</span>
                  <span><strong className="text-foreground">Sharpe</strong> = return per unit of risk</span>
                </div>

                {/* The 5-step narrative */}
                <div className="max-w-xl mx-auto space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3">
                    <span className="text-primary font-bold">1</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Risk is not the same as dollars.</strong> Stocks are 3x more volatile than bonds, so 60% in stocks = 93% of your risk.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
                    <span className="text-primary font-bold">2</span>
                    <p className="text-muted-foreground">
                      <strong className="text-primary">Risk parity balances risk at 50/50.</strong> Hold 3x more bonds than stocks by capital (~25/75) to equalize risk contribution.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3">
                    <span className="text-primary font-bold">3</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">When correlation is low, that balance pays off.</strong> You get more return per unit of risk (higher Sharpe).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3">
                    <span className="text-primary font-bold">4</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">When correlation spikes, the advantage fades.</strong> If stocks and bonds move together, risk parity can't diversify.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3">
                    <span className="text-primary font-bold">5</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">That's why the approach is resilient, not omnipotent.</strong> It works best when diversification works.
                    </p>
                  </div>
                </div>

                {/* Result stat - updated with S&P data */}
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-lg font-medium">
                    <span className="text-muted-foreground">0.65 Sharpe (60/40)</span>
                    {' → '}
                    <span className="text-primary">0.87 Sharpe (Risk Parity)</span>
                    {' '}
                    <span className="text-primary font-bold">+34%</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    S&P Risk Parity Index (10% vol target) vs 60/40, 2004-2020
                  </p>
                </div>

                {/* So what - investor outcomes */}
                <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
                  <strong className="text-foreground">The result:</strong> Drawdown control and a smoother ride, without sacrificing long-term returns.
                </div>

                {/* Main visual - Egg basket toggle */}
                <EggBasketVisualizer />

                {/* PanAgora advantage + CTA */}
                <div className="text-center space-y-3">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">PanAgora edge:</strong> Smart data with economic intuition—attribution-aware optimization reduces quant-PM disconnect.
                  </p>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                  >
                    Explore the Simulator
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Simulator Tab */}
            <TabsContent value="simulator" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SimulationCockpit onParamsChange={setSimParams} />
                <EfficientFrontier
                  stockVol={simParams.stockVol}
                  bondVol={simParams.bondVol}
                  correlation={simParams.correlation}
                  leverage={simParams.leverage}
                  showLeveragedFrontier
                  showCapitalMarketLine
                  interactive
                  height={400}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-border mt-8">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
            <span><strong className="text-foreground">PanAgora</strong> | Risk Parity Research</span>
            <span>For educational purposes only</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
