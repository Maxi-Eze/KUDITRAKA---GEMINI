'use client';
import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Plus, AlertTriangle, RefreshCw, Trash2, Check, X, History } from 'lucide-react';
import styles from './page.module.css';
import { formatAmount, formatDate } from '@/lib/aiParser';

export default function InventoryPage() {
  const { items, reconciliationLogs, addItem, reconcile, deleteItem } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    stock: 0,
    minStock: 5,
    costPrice: 0,
    sellingPrice: 0,
    category: 'General'
  });

  const [reconData, setReconData] = useState({
    actualStock: 0,
    reason: 'Routine Check'
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(newItem);
    setShowAddModal(false);
    setNewItem({ name: '', stock: 0, minStock: 5, costPrice: 0, sellingPrice: 0, category: 'General' });
  };

  const handleReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (showReconcileModal) {
      reconcile(showReconcileModal, reconData.actualStock, reconData.reason);
      setShowReconcileModal(null);
    }
  };

  return (
    <div className={styles.inventoryContainer}>
      <header className={styles.header}>
        <div>
          <h1>Stock & Inventory</h1>
          <p>Manage products and track reconciliation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div className={styles.inventoryGrid}>
        {items.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center' }}>
            <p style={{ opacity: 0.5 }}>No products in inventory. Add your first item to start tracking!</p>
          </div>
        )}
        
        {items.map(item => (
          <div key={item.id} className={`glass-card ${styles.itemCard}`}>
            <div className={styles.itemHeader}>
              <div className={styles.itemTitle}>
                <h3>{item.name}</h3>
                <p>{item.category}</p>
              </div>
              <div className={`${styles.stockBadge} ${item.stock <= item.minStock ? styles.stockLow : styles.stockOk}`}>
                {item.stock} in stock
              </div>
            </div>

            <div className={styles.priceGrid}>
              <div>
                <span className={styles.priceLabel}>Cost</span>
                <span className={styles.priceValue}>{formatAmount(item.costPrice)}</span>
              </div>
              <div>
                <span className={styles.priceLabel}>Selling</span>
                <span className={styles.priceValue}>{formatAmount(item.sellingPrice)}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ flex: 1 }}
                onClick={() => {
                  setShowReconcileModal(item.id);
                  setReconData({ actualStock: item.stock, reason: 'Routine Check' });
                }}
              >
                <RefreshCw size={14} /> Reconcile
              </button>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ color: '#ff5f56' }}
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {item.stock <= item.minStock && (
              <div className={styles.alert} style={{ color: '#ffbd2e', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', marginTop: '5px' }}>
                <AlertTriangle size={14} /> Low stock alert!
              </div>
            )}
          </div>
        ))}
      </div>

      <section className={styles.reconcileSection}>
        <div className={styles.sectionHeader}>
          <History size={20} />
          <h2>Reconciliation History</h2>
        </div>
        
        <div className={`glass-card ${styles.logTableWrapper}`}>
          <table className={styles.logTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>System</th>
                <th>Actual</th>
                <th>Diff</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {reconciliationLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                    No reconciliation logs found.
                  </td>
                </tr>
              )}
              {reconciliationLogs.map(log => (
                <tr key={log.id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>{log.itemName}</td>
                  <td>{log.systemStock}</td>
                  <td>{log.actualStock}</td>
                  <td className={log.difference >= 0 ? styles.diffPos : styles.diffNeg}>
                    {log.difference > 0 ? `+${log.difference}` : log.difference}
                  </td>
                  <td>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Add New Product</h2>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Product Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Rice 50kg" 
                  required 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Initial Stock</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div className="input-group">
                  <label>Low Stock Alert At</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={newItem.minStock}
                    onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Cost Price (₦)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={newItem.costPrice}
                    onChange={e => setNewItem({...newItem, costPrice: parseInt(e.target.value)})}
                  />
                </div>
                <div className="input-group">
                  <label>Selling Price (₦)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={newItem.sellingPrice}
                    onChange={e => setNewItem({...newItem, sellingPrice: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="modal-overlay" onClick={() => setShowReconcileModal(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Stock Reconciliation</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Updating stock for: <strong>{items.find(i => i.id === showReconcileModal)?.name}</strong>
            </p>
            <form onSubmit={handleReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Actual Physical Count</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={reconData.actualStock}
                  onChange={e => setReconData({...reconData, actualStock: parseInt(e.target.value)})}
                />
              </div>
              <div className="input-group">
                <label>Reason for Adjustment</label>
                <select 
                  className="input-field"
                  value={reconData.reason}
                  onChange={e => setReconData({...reconData, reason: e.target.value})}
                >
                  <option>Routine Check</option>
                  <option>Damaged Goods</option>
                  <option>Expiring Item</option>
                  <option>Theft/Loss</option>
                  <option>Manual Correction</option>
                </select>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowReconcileModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
