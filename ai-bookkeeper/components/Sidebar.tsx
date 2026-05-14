'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, ArrowLeftRight,
  BarChart3, Users, Zap, TrendingUp, LogOut, User, Package
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Input', icon: MessageSquare },
  { href: '/inventory', label: 'Inventory', icon: Package, inventory: true },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/profile', label: 'Business Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const filteredNavItems = navItems.filter(item => {
    if (item.inventory && !user?.inventoryEnabled) return false;
    return true;
  });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src="/logo-icon.png" alt="K" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <span className={styles.logoName} style={{ fontFamily: 'var(--font-chakra)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kuditraka.Ai
          </span>
          <span className={styles.logoTag}>Business Finance</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navLabel}>Main Menu</span>
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {active && <span className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.aiStatus}>
          <span className="pulse-dot" />
          <div>
            <p className={styles.aiStatusTitle}>Misa Engine Active</p>
            <p className={styles.aiStatusSub}>Advanced Ledger Logic</p>
          </div>
        </div>
        <div className={styles.businessTag}>
          <TrendingUp size={14} />
          <span>SME Edition</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
