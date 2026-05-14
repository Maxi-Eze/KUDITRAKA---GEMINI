'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatAmount, formatDate } from '@/lib/aiParser';
import { Transaction } from '@/lib/types';
import { Search, Trash2, ArrowLeftRight, Filter, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';
import styles from './page.module.css';

type FilterType = 'all' | 'income' | 'expense';
type FilterPayment = 'all' | 'cash' | 'transfer' | 'pos' | 'card';

export default function TransactionsPage() {
  const { state, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [paymentFilter, setPaymentFilter] = useState<FilterPayment>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  const filtered = state.transactions.filter(t => {
    const matchSearch =
      t.item.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.rawInput.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchPayment = paymentFilter === 'all' || t.payment_method === paymentFilter;
    return matchSearch && matchType && matchPayment;
  });

  const totalFiltered = filtered.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteTransaction(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Browse, search, and manage all recorded transactions</p>
      </div>

      {/* Filters */}
      <div className={`glass-card ${styles.filterBar}`}>
        <div className={styles.searchBox}>
          <Search size={16} color="var(--text-muted)" />
          <input
            className={styles.searchInput}
            placeholder="Search by item, customer, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-transactions"
          />
        </div>
        <div className={styles.filterRow}>
          <Filter size={14} color="var(--text-muted)" />
          <div className={styles.segmented}>
            {(['all', 'income', 'expense'] as FilterType[]).map(v => (
              <button
                key={v}
                className={`${styles.segBtn} ${typeFilter === v ? styles.segActive : ''}`}
                onClick={() => setTypeFilter(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <select
            className="input-field"
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value as FilterPayment)}
            id="payment-filter"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="pos">POS</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className={styles.summaryBar}>
        <span className={styles.summaryCount}>{filtered.length} transactions</span>
        <span className={totalFiltered >= 0 ? styles.summaryPositive : styles.summaryNegative}>
          Net: {formatAmount(Math.abs(totalFiltered))} {totalFiltered >= 0 ? '▲' : '▼'}
        </span>
      </div>

      {/* Table */}
      <div className={`glass-card ${styles.tableWrap}`}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ArrowLeftRight size={36} />
            <p>No transactions match your filters</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item / Description</th>
                <th>Qty</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Type</th>
                <th className={styles.amtCol}>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: Transaction) => (
                <tr key={t.id} className={styles.tableRow}>
                  <td className={styles.dateCell}>{formatDate(t.date)}</td>
                  <td>
                    <div className={styles.itemCell}>
                      <div className={`${styles.typeIcon} ${t.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
                        {t.type === 'income' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      </div>
                      <div>
                        <p className={styles.itemName}>{t.item}</p>
                        <p className={styles.rawInput}>{t.rawInput.substring(0, 50)}{t.rawInput.length > 50 ? '…' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td>{t.quantity || 1}</td>
                  <td className={styles.customerCell}>{t.customer || <span className={styles.dash}>—</span>}</td>
                  <td><span className="badge badge-payment">{t.payment_method}</span></td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`${styles.amtCol} ${t.type === 'income' ? styles.incomeAmt : styles.expenseAmt}`}>
                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                  </td>
                   <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedInvoice(t)}
                      title="View Receipt"
                    >
                      <FileText size={13} />
                    </button>
                    <button
                      className={`btn btn-danger btn-sm ${confirmDelete === t.id ? styles.confirmDelete : ''}`}
                      onClick={() => handleDelete(t.id)}
                      title={confirmDelete === t.id ? 'Click again to confirm' : 'Delete transaction'}
                    >
                      <Trash2 size={13} />
                      {confirmDelete === t.id ? 'Confirm?' : ''}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceModal 
          transaction={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}
