import { motion } from 'framer-motion';
import { BookOpen, Library, Scale, Shield, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PhilosophyCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
  color: 'primary' | 'accent' | 'warning';
}

const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    glow: 'hover:shadow-[0_12px_28px_rgba(17,24,39,0.1)]',
  },
  accent: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    text: 'text-accent',
    glow: 'hover:shadow-[0_12px_28px_rgba(17,24,39,0.1)]',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600',
    glow: 'hover:shadow-[0_12px_28px_rgba(17,24,39,0.1)]',
  },
};

function PhilosophyCard({ icon: Icon, title, description, detail, color }: PhilosophyCardProps) {
  const colors = colorMap[color];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
          >
            <Card className={cn(
              "transition-all duration-300 border",
              colors.border,
              colors.glow
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    colors.bg
                  )}>
                    <Icon className={cn("w-5 h-5", colors.text)} />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-sm", colors.text)}>{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PhilosophySection() {
  const cards: PhilosophyCardProps[] = [
    {
      icon: BookOpen,
      title: 'Prudent Judgment',
      description: 'Evidence-led investment decisions',
      detail: 'Quantitative models provide breadth and consistency, but judgment and economic intuition guide how signals are interpreted and applied. This discipline keeps the process grounded in real-world drivers.',
      color: 'primary',
    },
    {
      icon: Library,
      title: 'Research Discipline',
      description: 'Transparent inputs with economic intuition',
      detail: 'Signals are evaluated for durability, economic rationale, and robustness before entering any model. The emphasis is on clarity and explainability over complexity for its own sake.',
      color: 'accent',
    },
    {
      icon: Scale,
      title: 'True Diversification',
      description: 'Risk allocation, not just capital allocation',
      detail: 'Diversification matters most in stressed markets. Risk parity balances contributions across asset classes rather than merely spreading capital.',
      color: 'warning',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">PanAgora Philosophy</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PhilosophyCard {...card} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function TwinEngineAnalogy() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-border">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">The Balanced Mandate Analogy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Consider a traditional 60/40 allocation as a two-pillar mandate where one pillar (stocks)
              carries <span className="text-primary font-semibold">93% of portfolio risk</span> while the other
              (bonds) accounts for only <span className="text-accent font-semibold">7%</span>.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Traditional 60/40</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A single dominant risk factor can drive outcomes during equity drawdowns.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Risk Parity</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Risk contribution is balanced across asset classes, improving resilience across cycles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ValueProposition() {
  return (
    <Card className="border-accent/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Scale className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-semibold">PanAgora Research Perspective</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-primary">Portfolio Construction</h4>
              <p className="text-xs text-muted-foreground">
                Our proprietary algorithm ensures the actual portfolio closely blends with model
                performance by integrating performance attribution directly into the optimization
                process, a system designed to reduce the quant-PM disconnect.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-accent">Risk Balance</h4>
              <p className="text-xs text-muted-foreground">
                By allocating risk equally rather than just capital, we achieve superior Sharpe
                Ratios (<span className="numeric">0.87 vs 0.67</span>) and more resilient wealth
                creation across economic cycles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
