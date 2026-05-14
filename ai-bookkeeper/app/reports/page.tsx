'use client';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatAmount } from '@/lib/aiParser';
import { BarChart3, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import styles from './page.module.css';
import MonthlyChart from '@/components/Charts/MonthlyChart';
import CategoryPieChart from '@/components/Charts/CategoryPieChart';

function generateAISummary(income: number, expense: number, txCount: number, topItem: string): string {
  const net = income - expense;
  const margin = income > 0 ? ((net / income) * 100).toFixed(1) : '0';
  const status = net > 0 ? 'profitable' : 'at a loss';
  return `Your business is currently ${status} with a net ${net >= 0 ? 'profit' : 'loss'} of ₦${Math.abs(net).toLocaleString()} across ${txCount} transactions. Income stands at ₦${income.toLocaleString()} and total expenses at ₦${expense.toLocaleString()}, giving a profit margin of ${margin}%. Your best-selling item this period is "${topItem}". ${net > 0 ? 'Keep up the great momentum!' : 'Consider reviewing your expense categories to improve margins.'}`;
}

export default function ReportsPage() {
  const { state } = useApp();
  const { user } = useAuth();
  const { transactions } = state;

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const itemCounts: Record<string, number> = {};
  transactions.filter(t => t.type === 'income').forEach(t => {
    itemCounts[t.item] = (itemCounts[t.item] || 0) + t.amount;
  });
  const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const paymentBreakdown: Record<string, number> = {};
  transactions.forEach(t => {
    paymentBreakdown[t.payment_method] = (paymentBreakdown[t.payment_method] || 0) + t.amount;
  });

  const aiSummary = generateAISummary(income, expense, transactions.length, topItem);

  const stats = [
    { label: 'Gross Income', value: formatAmount(income), icon: TrendingUp, color: 'var(--accent-green)' },
    { label: 'Total Expenses', value: formatAmount(expense), icon: TrendingDown, color: 'var(--accent-red)' },
    { label: 'Net Profit/Loss', value: formatAmount(Math.abs(net)), icon: DollarSign, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
    { label: 'Profit Margin', value: income > 0 ? `${((net / income) * 100).toFixed(1)}%` : '—', icon: BarChart3, color: 'var(--accent-purple)' },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="page-container">
      <div className={styles.headerRow}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Financial Reports</h1>
          <p>AI-generated summaries and analytics for your business</p>
        </div>
        <button className="btn btn-ghost" onClick={handlePrint} id="print-report">
          <FileText size={15} /> Export Report
        </button>
      </div>

      {/* AI Summary */}
      <div className={styles.aiSummaryCard}>
        <div className={styles.aiSummaryHeader}>
          <div className={styles.aiDot} />
          <span>AI Daily Summary</span>
        </div>
        <p className={styles.aiSummaryText}>{aiSummary}</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {stats.map(s => (
          <div key={s.label} className={`glass-card ${styles.statCard}`}>
            <div className={styles.statIconWrapper}>
              <s.icon size={24} color={s.color} />
            </div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className={`glass-card ${styles.chartCard}`}>
          <h3>Monthly Income vs Expense</h3>
          <MonthlyChart transactions={transactions} />
        </div>
        <div className={`glass-card ${styles.chartCard}`}>
          <h3>Income vs Expense Split</h3>
          <CategoryPieChart income={income} expense={expense} />
        </div>
      </div>



      {/* Top Items */}
      <div className={`glass-card ${styles.breakdownCard}`} style={{ marginTop: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Top Revenue Items</h3>
        <div className={styles.itemsTable}>
          {Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([item, total], i) => (
            <div key={item} className={styles.itemRow}>
              <span className={styles.itemRank}>#{i + 1}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>{item}</span>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${(total / (Math.max(...Object.values(itemCounts)) || 1)) * 100}%` }} />
                </div>
              </div>
              <span className={styles.itemAmount}>{formatAmount(total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
