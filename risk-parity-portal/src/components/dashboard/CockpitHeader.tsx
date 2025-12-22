import { BookOpen, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import panagoraLogo from '@/assets/logo_Panagora.jpg';

export function CockpitHeader() {
  return (
    <header className="relative border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 flex items-center justify-center">
                <img src={panagoraLogo} alt="PanAgora logo" className="h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-gradient">PanAgora</span>
                </h1>
                <p className="text-xs text-muted-foreground">Risk Parity Research & Education</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <StatusIndicator icon={Landmark} label="Institutional Research" status="active" />
              <StatusIndicator icon={BookOpen} label="Investor Education" status="active" />
            </div>
            <Badge variant="outline" className="border-accent/50 text-accent">
              Research Prototype
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
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-accent' : 'bg-muted'}`} />
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
