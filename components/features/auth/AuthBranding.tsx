import { Mic, Globe, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthBrandingProps {
  className?: string;
}

const features = [
  {
    icon: Mic,
    title: 'Voice or Chat',
    description: 'Record transactions naturally',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'English, Pidgin, Hausa, Yoruba, Igbo',
  },
  {
    icon: TrendingUp,
    title: 'Smart Insights',
    description: 'AI-powered business advice',
  },
];

export function AuthBranding({ className }: AuthBrandingProps) {
  return (
    <div className={cn('relative z-10 flex flex-col items-center gap-8 text-center max-w-sm', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-3xl">K</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Kuditraka.Ai</h1>
      </div>

      <p className="text-lg text-foreground/80 leading-relaxed">
        AI Bookkeeping for African Businesses.{' '}
        <span className="text-primary font-semibold">Just Talk.</span>
      </p>

      <div className="w-full border-t border-border pt-6 space-y-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Backed by Microsoft for Startups
      </p>
    </div>
  );
}
