'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Edit2, Search, Trash2, CheckSquare, Square, X } from 'lucide-react';
import styles from './page.module.css';

export default function ChatHistoryPage() {
  const { state, renameChatSession, refreshSessions, deleteSession, deleteSessions } = useApp();
  const router = useRouter();
  const [renamingSession, setRenamingSession] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Select / bulk-delete state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; label: string } | null>(null);

  useEffect(() => {
    refreshSessions();
  }, []);

  const handleOpenChat = (sessionId: string) => {
    // Do NOT call switchSession here — that would trigger a fetch immediately,
    // and then ChatContent's useEffect would trigger a second fetch on mount.
    // Two fetches to the same endpoint can cause the second (empty) response
    // to overwrite the first (populated) one. Let ChatContent own the single fetch.
    router.push(`/chat?sessionId=${sessionId}`);
  };

  const filteredSessions = state.chatSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Select mode helpers ───────────────────────────────────────────
  const toggleSelectMode = () => {
    setSelectMode(v => !v);
    setSelectedIds(new Set());
  };

  const toggleCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredSessions.map(s => s.id)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  // ── Delete helpers ────────────────────────────────────────────────
  const confirmDelete = (ids: string[], label: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteConfirm({ ids, label });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { ids } = deleteConfirm;
    if (ids.length === 1) {
      await deleteSession(ids[0]);
    } else {
      await deleteSessions(ids);
    }
    setDeleteConfirm(null);
    setSelectedIds(new Set());
    if (selectMode && ids.length === filteredSessions.length) setSelectMode(false);
  };

  const allSelected = filteredSessions.length > 0 && selectedIds.size === filteredSessions.length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Chat History</h1>
        <p>Review and manage your previous conversations with Misa.</p>
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>

        {/* Select / bulk actions */}
        {filteredSessions.length > 0 && (
          <>
            <button className={`btn btn-ghost btn-sm ${styles.selectBtn}`} onClick={toggleSelectMode}>
              {selectMode ? <><X size={14} /> Cancel</> : <><CheckSquare size={14} /> Select</>}
            </button>

            {selectMode && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={allSelected ? deselectAll : selectAll}>
                  {allSelected ? <><Square size={14} /> Deselect All</> : <><CheckSquare size={14} /> Select All</>}
                </button>
                {selectedIds.size > 0 && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => confirmDelete([...selectedIds], `${selectedIds.size} conversation${selectedIds.size > 1 ? 's' : ''}`)}
                  >
                    <Trash2 size={14} /> Delete {selectedIds.size} selected
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {filteredSessions.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No conversations found</h3>
          <p>You haven't started any chats yet, or none match your search.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => router.push('/chat')}>
            Start a New Chat
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSessions.map(session => {
            const isSelected = selectedIds.has(session.id);
            return (
              <div
                key={session.id}
                className={`${styles.sessionCard} ${isSelected ? styles.selectedCard : ''}`}
                onClick={(e) => selectMode ? toggleCard(session.id, e) : handleOpenChat(session.id)}
              >
                <div className={styles.sessionTitleRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    {/* Checkbox in select mode */}
                    {selectMode && (
                      <div
                        className={`${styles.checkbox} ${isSelected ? styles.checkboxActive : ''}`}
                        onClick={(e) => toggleCard(session.id, e)}
                      >
                        {isSelected && <span style={{ fontSize: '0.7rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                      </div>
                    )}
                    <MessageSquare size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span className={styles.sessionTitle}>{session.title}</span>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingSession({ id: session.id, title: session.title });
                        setNewTitle(session.title);
                      }}
                      title="Rename"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                      onClick={(e) => confirmDelete([session.id], `"${session.title}"`, e)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rename Modal ── */}
      {renamingSession && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Rename Chat</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter a new name for this conversation.</p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.modalInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameChatSession(renamingSession.id, newTitle);
                  setRenamingSession(null);
                }
                if (e.key === 'Escape') setRenamingSession(null);
              }}
            />
            <div className={styles.modalActions}>
              <button className="btn btn-ghost btn-sm" onClick={() => setRenamingSession(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => {
                renameChatSession(renamingSession.id, newTitle);
                setRenamingSession(null);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ color: 'var(--accent-red)' }}>Delete Conversation{deleteConfirm.ids.length > 1 ? 's' : ''}?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              This will permanently delete {deleteConfirm.label}. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={executeDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
