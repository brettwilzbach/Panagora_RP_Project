import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
  className?: string;
}

export function MetricCard({ label, value, subValue, trend, highlight, className }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "instrument-panel p-4",
        highlight && "glow-cyan",
        className
      )}
    >
      <div className="relative z-10">
        <p className="metric-label mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={cn(
            "metric-display numeric",
            highlight ? "text-primary" : "text-foreground"
          )}>
            {value}
          </p>
          {trend && (
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              trend === 'up' && "text-accent",
              trend === 'down' && "text-destructive",
              trend === 'neutral' && "text-muted-foreground"
            )}>
              {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Flat'}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function MetricsGrid({ children, columns = 4 }: MetricsGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-3",
      columns === 4 && "grid-cols-2 lg:grid-cols-4"
    )}>
      {children}
    </div>
  );
}

interface ComparisonMetricProps {
  label: string;
  traditional: { value: string; label: string };
  riskParity: { value: string; label: string };
  improvement?: string;
}

export function ComparisonMetric({ label, traditional, riskParity, improvement }: ComparisonMetricProps) {
  return (
    <div className="instrument-panel p-4">
      <div className="relative z-10">
        <p className="metric-label mb-3">{label}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{traditional.label}</p>
            <p className="text-lg text-muted-foreground numeric">{traditional.value}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{riskParity.label}</p>
            <p className="text-lg text-primary numeric">{riskParity.value}</p>
          </div>
        </div>
        {improvement && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-accent font-medium">{improvement}</span>
          </div>
        )}
      </div>
    </div>
  );
}
