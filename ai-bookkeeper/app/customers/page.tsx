'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatAmount, formatDate } from '@/lib/aiParser';
import { Customer, Transaction } from '@/lib/types';
import { Users, Search, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`glass-card ${styles.customerCard}`}>
      <div className={styles.cardTop} onClick={() => setExpanded(e => !e)}>
        <div className={styles.avatar}>
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.customerInfo}>
          <h3 className={styles.customerName}>{customer.name}</h3>
          <p className={styles.customerMeta}>{customer.totalTransactions} transactions</p>
        </div>
        <div className={styles.customerStats}>
          <span className={styles.totalAmount}>{formatAmount(customer.totalAmount)}</span>
          <span className={styles.toggleIcon}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className={styles.txList}>
          <hr className="divider" style={{ margin: '0.75rem 0' }} />
          <p className={styles.txListTitle}>Transaction History</p>
          {customer.transactions.map((t: Transaction) => (
            <div key={t.id} className={styles.txRow}>
              <div className={`${styles.txDot} ${t.type === 'income' ? styles.incDot : styles.expDot}`} />
              <div className={styles.txInfo}>
                <p className={styles.txItem}>{t.item}</p>
                <p className={styles.txDate}>{formatDate(t.date)} · {t.payment_method}</p>
              </div>
              <span className={t.type === 'income' ? styles.txIncome : styles.txExpense}>
                {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  const { state } = useApp();
  const { customers, transactions } = state;
  const [search, setSearch] = useState('');

  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Customers</h1>
        <p>Track your customers and their transaction history</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-purple)' }}>
            <Users size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Customers</p>
            <p className={styles.statValue}>{customers.length}</p>
          </div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Revenue</p>
            <p className={styles.statValue}>{formatAmount(totalRevenue)}</p>
          </div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.statLabel}>Avg. per Customer</p>
            <p className={styles.statValue}>
              {customers.length > 0 ? formatAmount(Math.round(totalRevenue / customers.length)) : '₦0'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} color="var(--text-muted)" />
        <input
          className={styles.searchInput}
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-customers"
        />
      </div>

      {/* Customer Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ marginTop: '1rem' }}>
          <Users size={40} />
          <p>No customers found</p>
          <p style={{ fontSize: '0.8rem' }}>Add transactions with customer names to see them here</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map(c => (
            <CustomerCard key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
