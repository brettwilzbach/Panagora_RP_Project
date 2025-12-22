import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface EggBasketVisualizerProps {
  stockCapitalAllocation?: number;
  bondCapitalAllocation?: number;
  stockRiskContribution?: number;
  bondRiskContribution?: number;
}

const COLORS = {
  stock: 'hsl(199, 89%, 48%)',
  bond: 'hsl(142, 71%, 45%)',
};

export function EggBasketVisualizer({
  stockCapitalAllocation = 60,
  bondCapitalAllocation = 40,
  stockRiskContribution = 93,
  bondRiskContribution = 7,
}: EggBasketVisualizerProps) {
  const [showRiskView, setShowRiskView] = useState(false);

  const capitalData = [
    { name: 'Stocks', value: stockCapitalAllocation, color: COLORS.stock },
    { name: 'Bonds', value: bondCapitalAllocation, color: COLORS.bond },
  ];

  const riskData = [
    { name: 'Stocks', value: stockRiskContribution, color: COLORS.stock },
    { name: 'Bonds', value: bondRiskContribution, color: COLORS.bond },
  ];

  const currentData = showRiskView ? riskData : capitalData;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">The "Eggs in One Basket" Problem</CardTitle>
            <CardDescription>
              Traditional 60/40 appears balanced, but risk tells a different story
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !showRiskView ? "text-primary" : "text-muted-foreground"
            )}>
              Capital
            </span>
            <Switch
              checked={showRiskView}
              onCheckedChange={setShowRiskView}
            />
            <span className={cn(
              "text-sm font-medium transition-colors",
              showRiskView ? "text-primary" : "text-muted-foreground"
            )}>
              Risk
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={500}
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value, entry) => (
                    <span className="text-sm text-foreground">
                      {value}: {entry.payload?.value}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Egg Basket Visualization */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={showRiskView ? 'risk' : 'capital'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {showRiskView ? 'Risk Contribution View' : 'Capital Allocation View'}
                  </h4>
                </div>

                {/* Stock Eggs */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">Stocks</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    <EggGroup
                      count={6}
                      size={showRiskView ? 'large' : 'medium'}
                      color="primary"
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {showRiskView ? `${stockRiskContribution}%` : `${stockCapitalAllocation}%`}
                  </span>
                </div>

                {/* Bond Eggs */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">Bonds</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    <EggGroup
                      count={4}
                      size={showRiskView ? 'small' : 'medium'}
                      color="accent"
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {showRiskView ? `${bondRiskContribution}%` : `${bondCapitalAllocation}%`}
                  </span>
                </div>

                {/* Insight */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "mt-4 p-3 rounded-lg border text-sm",
                    showRiskView
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  {showRiskView ? (
                    <p>
                      <strong>The Hidden Truth:</strong> Stocks contribute{' '}
                      <span className="font-mono">{stockRiskContribution}%</span> of portfolio risk,
                      meaning a stock market crash will drive almost all losses.
                    </p>
                  ) : (
                    <p>
                      <strong>Surface Appearance:</strong> A 60/40 split looks diversified
                      by capital, but this masks the true risk concentration.
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EggGroupProps {
  count: number;
  size: 'small' | 'medium' | 'large';
  color: 'primary' | 'accent';
}

function EggGroup({ count, size, color }: EggGroupProps) {
  const sizeClasses = {
    small: 'w-4 h-5',
    medium: 'w-6 h-7',
    large: 'w-8 h-10',
  };

  const colorClasses = {
    primary: 'bg-primary/80 border-primary',
    accent: 'bg-accent/80 border-accent',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          className={cn(
            "rounded-full border-2 transition-all duration-300",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
        />
      ))}
    </>
  );
}
