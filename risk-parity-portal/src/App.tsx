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
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
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
                className="space-y-5 max-w-2xl mx-auto"
              >
                {/* Interactive Quiz Hook */}
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    A 60/40 portfolio is 60% stocks, 40% bonds.
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    What percent of your <strong className="text-foreground">risk</strong> comes from stocks?
                  </p>

                  {quizAnswer === null ? (
                    <div className="flex justify-center gap-2">
                      {[60, 75, 85, 93].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setQuizAnswer(pct)}
                          className="w-16 h-16 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-lg font-semibold"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg font-medium">
                        {quizAnswer === 93 ? (
                          <span className="text-primary">Correct! It's 93%.</span>
                        ) : (
                          <>
                            You guessed {quizAnswer}%. It's actually <span className="text-primary font-bold">93%</span>.
                          </>
                        )}
                      </p>

                      {/* Capital vs Risk visual preview */}
                      <div className="flex justify-center gap-8">
                        {/* Capital bar */}
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-36 flex flex-col justify-end rounded-t overflow-hidden bg-muted/30 border border-border">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: '40%' }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="w-full bg-gray-400"
                            />
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: '60%' }}
                              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                              className="w-full bg-primary"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground mt-2">Capital</span>
                        </div>

                        {/* Risk bar */}
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-36 flex flex-col justify-end rounded-t overflow-hidden bg-muted/30 border border-border">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: '7%' }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                              className="w-full bg-gray-400"
                            />
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: '93%' }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                              className="w-full bg-primary"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground mt-2">Risk</span>
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Stocks are ~3x more volatile than bonds, so 60% of capital = 93% of risk.
                      </p>
                    </div>
                  )}
                </div>

                {/* Define terms once */}
                <div className="text-center text-xs text-muted-foreground">
                  <span className="inline-block mx-2"><strong className="text-foreground">Capital</strong> = dollars invested</span>
                  <span className="inline-block mx-2"><strong className="text-foreground">Risk</strong> = portfolio volatility</span>
                  <span className="inline-block mx-2"><strong className="text-foreground">Sharpe</strong> = return per unit of risk</span>
                </div>

                {/* The 5-step narrative */}
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3 items-baseline">
                    <span className="text-primary font-bold text-base">1</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground text-base">Stocks are ~3× more volatile</strong> → 60% capital ≈ 93% risk.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 items-baseline">
                    <span className="text-primary font-bold text-base">2</span>
                    <p className="text-muted-foreground">
                      <strong className="text-primary text-base">Risk parity targets 50/50 risk</strong> → ~25/75 capital.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3 items-baseline">
                    <span className="text-primary font-bold text-base">3</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground text-base">When correlation is low,</strong> the balance pays off (higher Sharpe).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3 items-baseline">
                    <span className="text-primary font-bold text-base">4</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground text-base">In high correlation,</strong> results converge.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex gap-3 items-baseline">
                    <span className="text-primary font-bold text-base">5</span>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground text-base">Designed for long-run diversification</strong> across market cycles.
                    </p>
                  </div>
                </div>

                {/* Result stat - updated with S&P data */}
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xl font-semibold">
                    <span className="text-muted-foreground">0.65 Sharpe (60/40)</span>
                    {' → '}
                    <span className="text-primary">0.87 Sharpe (Risk Parity)</span>
                    {' '}
                    <span className="text-primary font-bold">+34%</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    S&P Risk Parity Index (10% vol target) vs 60/40, 2000-2025
                  </p>
                </div>

                {/* So what - investor outcomes */}
                <div className="text-center text-sm text-muted-foreground">
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
            <span>For Consideration by Brett Wilzbach</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
