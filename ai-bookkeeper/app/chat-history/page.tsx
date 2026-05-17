'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Edit2, Search } from 'lucide-react';
import styles from './page.module.css';

export default function ChatHistoryPage() {
  const { state, renameChatSession, switchSession, refreshSessions } = useApp();
  const router = useRouter();
  const [renamingSession, setRenamingSession] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshSessions();
  }, []);

  const handleOpenChat = (sessionId: string) => {
    switchSession(sessionId);
    router.push(`/chat?sessionId=${sessionId}`);
  };

  const filteredSessions = state.chatSessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Chat History</h1>
        <p>Review and manage your previous conversations with Misa.</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
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
          {filteredSessions.map(session => (
            <div key={session.id} className={styles.sessionCard} onClick={() => handleOpenChat(session.id)}>
              <div className={styles.sessionTitleRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <MessageSquare size={18} color="var(--primary)" />
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
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
