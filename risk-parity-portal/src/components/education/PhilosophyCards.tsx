import { motion } from 'framer-motion';
import { Plane, Database, Target, Zap, Shield } from 'lucide-react';
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
    glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]',
  },
  accent: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    text: 'text-accent',
    glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
    glow: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]',
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
      icon: Plane,
      title: "The Pilot's Instinct",
      description: "Human-machine synthesis for optimal decisions",
      detail: "Like a pilot flying a high-performance jet, quantitative models provide the engine power, but human intelligence provides the intuitive causality to avoid overextending the machine. This 'Discovery & Dollars' philosophy ensures the model doesn't fly blind.",
      color: 'primary',
    },
    {
      icon: Database,
      title: "Smart Data vs Big Data",
      description: "Quality over quantity in signal generation",
      detail: "Our models aren't black boxes. Every input must 'make sense' fundamentally. We focus on smart data with demonstrable alpha rather than drowning in noise. Each signal is tested for economic intuition before deployment.",
      color: 'accent',
    },
    {
      icon: Target,
      title: "True Diversification",
      description: "Risk allocation, not just capital allocation",
      detail: "Alternative investments often correlate with stocks during crises—the exact time diversification matters most. Risk Parity achieves true diversification by equalizing risk contribution, not just spreading capital across assets.",
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
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Plane className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">The Twin-Engine Analogy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Think of a traditional 60/40 portfolio as a twin-engine plane where one engine (stocks)
              provides <span className="text-primary font-semibold">93% of the power</span> while the other
              (bonds) provides only <span className="text-accent font-semibold">7%</span>.
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Traditional 60/40</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  If the stock engine fails, the plane loses nearly all its thrust. A market crash
                  devastates the entire portfolio.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Risk Parity</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Both engines provide equal thrust. Even if one hits turbulence, the other is
                  powerful enough to keep the flight stable.
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
              <Target className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-semibold">PanAgora's Unique Value Proposition</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-primary">Competitive Advantage</h4>
              <p className="text-xs text-muted-foreground">
                Our proprietary algorithm ensures the actual portfolio closely blends with model
                performance by integrating performance attribution directly into the optimization
                process—a system developed to solve the "Quant-PM disconnect".
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-accent">True Diversification</h4>
              <p className="text-xs text-muted-foreground">
                By allocating risk equally rather than just capital, we achieve superior Sharpe
                Ratios (<span className="font-mono">0.87 vs 0.67</span>) and more resilient wealth
                creation across economic cycles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
