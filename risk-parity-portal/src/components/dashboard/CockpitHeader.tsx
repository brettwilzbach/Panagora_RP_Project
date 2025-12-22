import { Plane, Activity, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CockpitHeader() {
  return (
    <header className="relative border-b border-white/10 bg-card/50 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-gradient">PanAgora</span>
                </h1>
                <p className="text-xs text-muted-foreground">Risk Parity Discovery Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <StatusIndicator icon={Activity} label="Live Calculations" status="active" />
              <StatusIndicator icon={Shield} label="Smart Data" status="active" />
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary">
              Interactive Demo
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

interface StatusIndicatorProps {
  icon: React.ElementType;
  label: string;
  status: 'active' | 'inactive';
}

function StatusIndicator({ icon: Icon, label, status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-accent animate-pulse' : 'bg-muted'}`} />
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
