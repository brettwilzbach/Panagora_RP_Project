import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Zap, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Strategy {
  id: string;
  name: string;
  icon: React.ElementType;
  riskTarget: string;
  leverage: string;
  description: string;
  comparable: string;
  expectedReturn: string;
  features: string[];
  recommended?: boolean;
}

const strategies: Strategy[] = [
  {
    id: 'unleveraged',
    name: 'Unleveraged',
    icon: Shield,
    riskTarget: '4-5%',
    leverage: '1:1',
    description: 'Conservative approach with bond-like volatility',
    comparable: 'Similar to Bond Index risk',
    expectedReturn: '4.5%',
    features: [
      'No leverage required',
      'Lowest volatility option',
      'Ideal for risk-averse investors',
      'True diversification benefits',
    ],
  },
  {
    id: 'balanced',
    name: 'Leveraged Balanced',
    icon: TrendingUp,
    riskTarget: '8-10%',
    leverage: '2:1',
    description: 'Balanced approach matching traditional portfolio risk',
    comparable: 'Similar to 60/40 risk, higher Sharpe',
    expectedReturn: '11.3%',
    features: [
      'Moderate leverage',
      'Comparable to traditional balanced',
      'Higher returns, same risk',
      'Most popular implementation',
    ],
    recommended: true,
  },
  {
    id: 'macro',
    name: 'Global Macro',
    icon: Zap,
    riskTarget: '16-20%',
    leverage: '4:1',
    description: 'Aggressive approach for return maximization',
    comparable: 'Similar to hedge fund risk',
    expectedReturn: '22.6%',
    features: [
      'Higher leverage deployment',
      'Maximum return potential',
      'For sophisticated investors',
      'Requires active management',
    ],
  },
];

export function StrategySelector() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Implementation Strategies</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Risk Parity can be implemented at various risk levels through leverage.
          Select the strategy that matches your risk tolerance and return objectives.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {strategies.map((strategy, index) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isSelected={selectedStrategy === strategy.id}
            onSelect={() => setSelectedStrategy(strategy.id)}
            index={index}
          />
        ))}
      </div>

      {/* Selected Strategy Details */}
      <motion.div
        key={selectedStrategy}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StrategyDetails strategy={strategies.find(s => s.id === selectedStrategy)!} />
      </motion.div>
    </div>
  );
}

interface StrategyCardProps {
  strategy: Strategy;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function StrategyCard({ strategy, isSelected, onSelect, index }: StrategyCardProps) {
  const Icon = strategy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 hover:-translate-y-1",
          isSelected
            ? "border-primary glow-cyan"
            : "border-white/10 hover:border-white/20"
        )}
        onClick={onSelect}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isSelected ? "bg-primary/20" : "bg-secondary"
              )}>
                <Icon className={cn(
                  "w-6 h-6",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              {strategy.recommended && (
                <Badge variant="success" className="text-xs">
                  Recommended
                </Badge>
              )}
            </div>

            <div>
              <h3 className={cn(
                "font-semibold text-lg",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {strategy.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {strategy.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <p className="text-xs text-muted-foreground">Risk Target</p>
                <p className="font-mono font-semibold">{strategy.riskTarget}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leverage</p>
                <p className="font-mono font-semibold">{strategy.leverage}</p>
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-1 text-primary text-sm font-medium pt-2"
              >
                <span>Selected</span>
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StrategyDetailsProps {
  strategy: Strategy;
}

function StrategyDetails({ strategy }: StrategyDetailsProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{strategy.name} Strategy Details</CardTitle>
            <CardDescription>{strategy.comparable}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Expected Return</p>
            <p className="text-2xl font-mono font-bold text-accent">{strategy.expectedReturn}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Key Features
            </h4>
            <ul className="space-y-2">
              {strategy.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Implementation Notes
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Leverage:</strong> {strategy.leverage} ratio
                applied primarily to bonds to equalize risk contribution.
              </p>
              <p>
                <strong className="text-foreground">Risk Target:</strong> {strategy.riskTarget} annual
                volatility, maintained through dynamic rebalancing.
              </p>
              <p>
                <strong className="text-foreground">Rebalancing:</strong> Systematic monthly rebalancing
                to maintain target risk contributions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
