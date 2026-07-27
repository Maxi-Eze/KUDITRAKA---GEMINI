import { AuthBranding } from '@/components/features/auth/AuthBranding';
import { CobwebCanvas } from '@/components/features/auth/CobwebCanvas';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: [
                'radial-gradient(circle at 25% 15%, oklch(0.85 0.18 130 / 0.2), transparent 55%)',
                'radial-gradient(circle at 75% 85%, oklch(0.85 0.18 130 / 0.1), transparent 55%)',
                'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 100%)',
              ].join(', '),
            }}
          />
          <AuthBranding />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 relative z-10">
          {children}
        </div>
      </div>
      <div className="absolute inset-0 z-20 pointer-events-none">
        <CobwebCanvas />
      </div>
    </div>
  );
}
