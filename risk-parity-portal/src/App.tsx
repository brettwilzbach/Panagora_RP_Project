import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CockpitHeader } from '@/components/dashboard/CockpitHeader';
import { MetricCard, MetricsGrid, ComparisonMetric } from '@/components/dashboard/MetricsDisplay';
import { EggBasketVisualizer } from '@/components/visualizers/EggBasketVisualizer';
import { RiskContributionChart } from '@/components/visualizers/RiskContributionChart';
import { EfficientFrontier } from '@/components/visualizers/EfficientFrontier';
import { SimulationCockpit } from '@/components/simulation/SimulationCockpit';
import { PhilosophySection, TwinEngineAnalogy, ValueProposition } from '@/components/education/PhilosophyCards';
import { StrategySelector } from '@/components/strategy/StrategySelector';
import { PANAGORA_DEFAULTS } from '@/lib/calculations';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background cockpit-grid">
        <CockpitHeader />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="simulator">Simulator</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Hero Section */}
                <div className="text-center space-y-4 py-6">
                  <h1 className="text-4xl font-bold tracking-tight">
                    <span className="text-gradient">Risk Parity</span> Discovery Portal
                  </h1>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                    Discover why traditional 60/40 portfolios aren't as diversified as they appear,
                    and how Risk Parity achieves true diversification through equal risk contribution.
                  </p>
                </div>

                {/* Key Metrics */}
                <MetricsGrid columns={4}>
                  <MetricCard
                    label="Traditional 60/40 Sharpe"
                    value="0.67"
                    subValue="Lower efficiency"
                  />
                  <MetricCard
                    label="Risk Parity Sharpe"
                    value="0.87"
                    subValue="+30% improvement"
                    highlight
                    trend="up"
                  />
                  <MetricCard
                    label="Stock Risk in 60/40"
                    value="93%"
                    subValue="Concentrated risk"
                    trend="down"
                  />
                  <MetricCard
                    label="Stock Risk in Parity"
                    value="50%"
                    subValue="True diversification"
                    highlight
                    trend="up"
                  />
                </MetricsGrid>

                {/* Egg Basket Visualizer */}
                <EggBasketVisualizer />

                {/* Risk Comparison */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <RiskContributionChart
                    traditionalStock={93}
                    traditionalBond={7}
                    riskParityStock={50}
                    riskParityBond={50}
                  />
                  <EfficientFrontier
                    stockVol={PANAGORA_DEFAULTS.stockVolatility}
                    bondVol={PANAGORA_DEFAULTS.bondVolatility}
                    correlation={PANAGORA_DEFAULTS.correlation}
                    showLeveragedFrontier={false}
                  />
                </div>

                {/* Twin Engine Analogy */}
                <TwinEngineAnalogy />
              </motion.div>
            </TabsContent>

            {/* Simulator Tab */}
            <TabsContent value="simulator" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SimulationCockpit />

                {/* Efficient Frontier with Leverage */}
                <div className="mt-6">
                  <EfficientFrontier
                    stockVol={PANAGORA_DEFAULTS.stockVolatility}
                    bondVol={PANAGORA_DEFAULTS.bondVolatility}
                    correlation={PANAGORA_DEFAULTS.correlation}
                    showLeveragedFrontier
                  />
                </div>
              </motion.div>
            </TabsContent>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <StrategySelector />

                {/* Value Proposition */}
                <div className="mt-8">
                  <ValueProposition />
                </div>
              </motion.div>
            </TabsContent>

            {/* Learn Tab */}
            <TabsContent value="learn" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Philosophy Cards */}
                <PhilosophySection />

                {/* Twin Engine Analogy */}
                <TwinEngineAnalogy />

                {/* Educational Content */}
                <div className="grid md:grid-cols-2 gap-6">
                  <ComparisonMetric
                    label="Sharpe Ratio Comparison"
                    traditional={{ value: '0.67', label: '60/40 Portfolio' }}
                    riskParity={{ value: '0.87', label: 'Risk Parity' }}
                    improvement="+30% more return per unit of risk"
                  />
                  <ComparisonMetric
                    label="Risk Concentration"
                    traditional={{ value: '93%', label: 'Stock Risk in 60/40' }}
                    riskParity={{ value: '50%', label: 'Stock Risk in Parity' }}
                    improvement="True 50/50 risk diversification"
                  />
                </div>

                {/* Data Sources */}
                <div className="p-6 rounded-xl border border-white/10 bg-card/50">
                  <h3 className="font-semibold mb-3">Research Data Sources</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground mb-1">Historical Analysis Period</p>
                      <p>1983 - 2004 (Russell 1000 & Lehman Aggregate Bond Index)</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Key Parameters</p>
                      <p>Stock Vol: 15.1% | Bond Vol: 4.6% | Correlation: 0.2</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Asset Classes</p>
                      <p>US Large-cap, Small-cap, International, EM Equity, Govt & Corp Bonds, TIPS, Commodities</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Source</p>
                      <p>PanAgora Asset Management - "Risk Parity Portfolios: Efficient Portfolios Through True Diversification"</p>
                    </div>
                  </div>
                </div>

                {/* Value Proposition */}
                <ValueProposition />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">PanAgora Asset Management</span>
                {' '}| Risk Parity Discovery Portal
              </p>
              <p className="text-xs">
                For educational purposes only. Past performance is not a guarantee of future results.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
