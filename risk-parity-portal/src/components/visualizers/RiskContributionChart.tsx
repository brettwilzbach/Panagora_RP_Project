import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RiskContributionChartProps {
  traditionalStock: number;
  traditionalBond: number;
  riskParityStock: number;
  riskParityBond: number;
}

export function RiskContributionChart({
  traditionalStock = 93,
  traditionalBond = 7,
  riskParityStock = 50,
  riskParityBond = 50,
}: RiskContributionChartProps) {
  const data = [
    {
      name: '60/40 Portfolio',
      stocks: traditionalStock,
      bonds: traditionalBond,
    },
    {
      name: 'Risk Parity',
      stocks: riskParityStock,
      bonds: riskParityBond,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk Contribution Comparison</CardTitle>
        <CardDescription>
          How risk is distributed between asset classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--foreground))' }}
                width={100}
              />
              <Bar dataKey="stocks" stackId="a" fill="hsl(var(--chart-1))">
                <LabelList
                  dataKey="stocks"
                  position="center"
                  fill="hsl(var(--primary-foreground))"
                  formatter={(value) => `${value}%`}
                />
              </Bar>
              <Bar dataKey="bonds" stackId="a" fill="#9ca3af">
                <LabelList
                  dataKey="bonds"
                  position="center"
                  fill="hsl(var(--accent-foreground))"
                  formatter={(value) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-sm text-muted-foreground">Stocks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-400" />
            <span className="text-sm text-muted-foreground">Bonds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskBarProps {
  label: string;
  stockPercent: number;
  bondPercent: number;
  highlighted?: boolean;
}

export function RiskBar({ label, stockPercent, bondPercent, highlighted }: RiskBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">
          Stocks: {stockPercent}% | Bonds: {bondPercent}%
        </span>
      </div>
      <div className="h-8 rounded-lg overflow-hidden flex bg-secondary/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stockPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium ${
            highlighted ? 'glow-cyan' : ''
          }`}
        >
          {stockPercent > 15 && <span>{stockPercent}%</span>}
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bondPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="bg-gray-400 flex items-center justify-center text-xs font-medium text-white"
        >
          {bondPercent > 15 && <span>{bondPercent}%</span>}
        </motion.div>
      </div>
    </div>
  );
}
