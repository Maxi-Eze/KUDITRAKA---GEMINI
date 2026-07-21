import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
