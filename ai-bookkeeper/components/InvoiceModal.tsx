'use client';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { formatAmount, formatDate } from '@/lib/aiParser';
import { X, Printer, Share2, Download } from 'lucide-react';
import styles from './InvoiceModal.module.css';

export default function InvoiceModal({ 
  transaction, 
  onClose 
}: { 
  transaction: Transaction; 
  onClose: () => void 
}) {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.actions}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}><Printer size={16} /> Print</button>
          <button className="btn btn-secondary btn-sm" disabled><Download size={16} /> PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.invoiceContent} id="printable-invoice">
          <div className={styles.invoiceHeader}>
            <div className={styles.companyInfo}>
              <h2>{user?.businessName || 'Kuditraka.Ai User'}</h2>
              <p>{user?.address || 'No Address Provided'}</p>
              <p>{user?.phone || ''}</p>
            </div>
            <div className={styles.invoiceMeta}>
              <h1>RECEIPT</h1>
              <p>No: #{transaction.id.slice(-6).toUpperCase()}</p>
              <p>Date: {formatDate(transaction.date)}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.billTo}>
            <p className={styles.label}>Bill To:</p>
            <h3>{transaction.customer || 'Valued Customer'}</h3>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{transaction.item}</td>
                <td style={{ textAlign: 'center' }}>{transaction.quantity || 1}</td>
                <td style={{ textAlign: 'right' }}>{formatAmount(transaction.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatAmount(transaction.amount)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total</span>
              <span>{formatAmount(transaction.amount)}</span>
            </div>
          </div>

          <div className={styles.footer}>
            <p>Payment Method: <strong>{transaction.payment_method.toUpperCase()}</strong></p>
            <p className={styles.thanks}>Thank you for your business!</p>
            <div className={styles.watermark}>Powered by Kuditraka.Ai</div>
          </div>
        </div>
      </div>
    </div>
  );
}
