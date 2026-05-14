'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatAmount, formatDate } from '@/lib/aiParser';
import { Transaction } from '@/lib/types';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  ArrowUpRight, ArrowRight, Users, ShoppingCart,
} from 'lucide-react';
import styles from './page.module.css';
import RevenueChart from '@/components/Charts/RevenueChart';
import CategoryPieChart from '@/components/Charts/CategoryPieChart';

export default function DashboardPage() {
  const { state } = useApp();
  const { transactions, customers } = state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const recent = transactions.slice(0, 6);

  const kpis = [
    {
      label: 'Total Income',
      value: mounted ? formatAmount(totalIncome) : '₦0',
      icon: TrendingUp,
      gradient: 'var(--gradient-income)',
      glow: 'rgba(16,185,129,0.2)',
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Total Expenses',
      value: mounted ? formatAmount(totalExpense) : '₦0',
      icon: TrendingDown,
      gradient: 'var(--gradient-expense)',
      glow: 'rgba(244,63,94,0.2)',
      change: '-3.2%',
      positive: false,
    },
    {
      label: 'Net Profit',
      value: mounted ? formatAmount(netProfit) : '₦0',
      icon: DollarSign,
      gradient: 'var(--gradient-primary)',
      glow: 'rgba(174,255,0,0.2)',
      change: `${profitMargin}% margin`,
      positive: netProfit >= 0,
    },
    {
      label: 'Transactions',
      value: mounted ? transactions.length.toString() : '0',
      icon: Activity,
      gradient: 'var(--gradient-gold)',
      glow: 'rgba(255,255,255,0.15)',
      change: `${customers.length} customers`,
      positive: true,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Business Dashboard</h1>
        <p>Real-time overview of your business finances</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: kpi.gradient, boxShadow: `0 8px 24px ${kpi.glow}` }}>
              <kpi.icon size={22} color="#fff" />
            </div>
            <div className={styles.kpiBody}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={`${styles.kpiChange} ${kpi.positive ? styles.positive : styles.negative}`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className={`glass-card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h3>Revenue Trend</h3>
            <span className={styles.chartSub}>Last 7 days</span>
          </div>
          <RevenueChart transactions={transactions} />
        </div>
        <div className={`glass-card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h3>Income vs Expense</h3>
            <span className={styles.chartSub}>Breakdown</span>
          </div>
          <CategoryPieChart income={totalIncome} expense={totalExpense} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Transactions */}
        <div className={`glass-card ${styles.tableCard}`}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3>Recent Transactions</h3>
              <p>Latest activity</p>
            </div>
            <Link href="/transactions" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.recentList}>
            {recent.map((t: Transaction) => (
              <div key={t.id} className={styles.recentItem}>
                <div className={styles.recentItemLeft}>
                  <div className={`${styles.recentDot} ${t.type === 'income' ? styles.incomeD : styles.expenseD}`} />
                  <div>
                    <p className={styles.recentItem_title}>{t.item}</p>
                    <p className={styles.recentItem_meta}>{t.customer || '—'} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <div className={styles.recentItemRight}>
                  <span className={t.type === 'income' ? styles.amtIncome : styles.amtExpense}>
                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                  </span>
                  <span className="badge badge-payment">{t.payment_method}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className={`glass-card ${styles.tableCard}`}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3>Top Customers</h3>
              <p>By revenue generated</p>
            </div>
            <Link href="/customers" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.customerList}>
            {customers.slice(0, 5).map((c, i) => (
              <div key={c.id} className={styles.customerItem}>
                <div className={styles.customerRank}>{i + 1}</div>
                <div className={styles.customerAvatar}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.customerInfo}>
                  <p className={styles.customerName}>{c.name}</p>
                  <p className={styles.customerSub}>{c.totalTransactions} transactions</p>
                </div>
                <div className={styles.customerAmount}>{formatAmount(c.totalAmount)}</div>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="empty-state">
                <Users size={32} />
                <p>No customers yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className={styles.quickAction}>
        <div className={styles.quickActionLeft}>
          <ShoppingCart size={20} />
          <div>
            <p className={styles.qaTitle}>Record a new transaction</p>
            <p className={styles.qaSub}>Just type it in plain English — Misa will handle the rest</p>
          </div>
        </div>
        <Link href="/chat" className="btn btn-primary">
          Open Misa Input <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
