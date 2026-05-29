'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { apiClient } from '@/lib/apiClient';
import { parseTransaction, formatAmount, generateId, getTodayDate } from '@/lib/aiParser';
import { ChatMessage, ParsedTransaction } from '@/lib/types';
import { Send, Bot, User, CheckCircle, XCircle, Sparkles, RotateCcw, Plus, Edit2 } from 'lucide-react';
import styles from './page.module.css';

const EXAMPLES = [
  'Sold rice for 30000 to Mr Olu via transfer',
  'Bought generator fuel for 8000 cash',
  'Received 45000 from Eze Stores for beans via transfer',
  'Paid shop rent 20000 via bank transfer',
  'Sold cooking oil 15000 to Mrs Adaeze POS',
];

function TypingIndicator() {
  return (
    <div className={styles.typingBubble}>
      <Bot size={14} />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function ParsedCard({ parsed, onConfirm, onDiscard }: {
  parsed: ParsedTransaction;
  onConfirm: (edited: ParsedTransaction) => void;
  onDiscard: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ParsedTransaction>({ ...parsed });

  const qty = isEditing ? (draft.quantity || 1) : (parsed.quantity || 1);
  const unitPrice = !isEditing && qty > 1 ? parsed.amount / qty : null;

  const set = (field: keyof ParsedTransaction, value: any) =>
    setDraft(prev => ({ ...prev, [field]: value }));

  if (isEditing) {
    return (
      <div className={styles.parsedCard}>
        <div className={styles.parsedHeader}>
          <Edit2 size={14} />
          <span>Edit Details</span>
        </div>
        <div className={styles.parsedGrid}>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Type</span>
            <select
              className={styles.parsedInput}
              value={draft.type}
              onChange={e => set('type', e.target.value)}
            >
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </div>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Item</span>
            <input
              className={styles.parsedInput}
              value={draft.item}
              onChange={e => set('item', e.target.value)}
            />
          </div>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Quantity</span>
            <input
              type="number"
              min={1}
              className={styles.parsedInput}
              value={draft.quantity || 1}
              onChange={e => set('quantity', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Total Amount (₦)</span>
            <input
              type="number"
              min={0}
              className={styles.parsedInput}
              value={draft.amount}
              onChange={e => set('amount', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Payment</span>
            <input
              className={styles.parsedInput}
              value={draft.payment_method}
              onChange={e => set('payment_method', e.target.value)}
            />
          </div>
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Customer</span>
            <input
              className={styles.parsedInput}
              value={draft.customer || ''}
              onChange={e => set('customer', e.target.value)}
            />
          </div>
        </div>
        <div className={styles.parsedActions}>
          <button className="btn btn-primary btn-sm" onClick={() => { setIsEditing(false); onConfirm(draft); }}>
            <CheckCircle size={14} /> Save & Confirm
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setDraft({ ...parsed }); setIsEditing(false); }}>
            <XCircle size={14} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.parsedCard}>
      <div className={styles.parsedHeader}>
        <Sparkles size={14} />
        <span>AI Parsed Result</span>
      </div>
      <div className={styles.parsedGrid}>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Type</span>
          <span className={`badge ${parsed.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
            {parsed.type}
          </span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Item</span>
          <span className={styles.parsedValue}>{parsed.item}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Quantity</span>
          <span className={styles.parsedValue}>{qty}</span>
        </div>
        {unitPrice !== null && (
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Unit Price</span>
            <span className={styles.parsedValue}>{formatAmount(unitPrice)}</span>
          </div>
        )}
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Total Amount</span>
          <span className={styles.parsedValue}>{formatAmount(parsed.amount)}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Payment</span>
          <span className={styles.parsedValue}>{parsed.payment_method}</span>
        </div>
        {parsed.customer && (
          <div className={styles.parsedField}>
            <span className={styles.parsedLabel}>Customer</span>
            <span className={styles.parsedValue}>{parsed.customer}</span>
          </div>
        )}
      </div>
      <div className={styles.parsedActions}>
        <button className="btn btn-primary btn-sm" onClick={() => onConfirm(parsed)}>
          <CheckCircle size={14} /> Confirm & Save
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
          <Edit2 size={14} /> Edit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDiscard}>
          <XCircle size={14} /> Discard
        </button>
      </div>
    </div>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get('sessionId') : '';

  const {
    state,
    addTransaction,
    addChatMessage,
    createNewChatSession,
    renameChatSession,
    switchSession,
    undoLastTransaction,
    clearChat,
    confirmParsed
  } = useApp();
  const { user } = useAuth();
  const { items, updateStock } = useInventory();
  const { chatHistory, chatSessions, activeSessionId } = state;
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingParsed, setPendingParsed] = useState<{ msgId: string; parsed: ParsedTransaction } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

  const getTodayTitle = () => {
    const d = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Returns the session ID to use for today — creates one if needed
  const ensureTodaySession = async (): Promise<string | null> => {
    const todayTitle = getTodayTitle();
    const activeSession = chatSessions.find(s => s.id === activeSessionId);
    if (activeSession?.title === todayTitle && activeSessionId) return activeSessionId;

    const todaySession = chatSessions.find(s => s.title === todayTitle);
    if (todaySession) {
      await switchSession(todaySession.id);
      return todaySession.id;
    }

    const newId = await createNewChatSession(todayTitle);
    return newId || null;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Load history whenever this component mounts with a sessionId in the URL,
  // or when the sessionId URL param changes. We intentionally do NOT guard on
  // activeSessionId: that value lives in context and persists across page
  // navigations, so the guard would prevent the reload when the user returns
  // to the same session URL after navigating away and back.
  useEffect(() => {
    if (sessionId) {
      switchSession(sessionId);
    }
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewChatClick = () => {
    setNewChatTitle('');
    setShowNewChatModal(true);
  };

  const handleNewChat = async () => {
    const title = newChatTitle.trim() || 'New Chat';
    const newId = await createNewChatSession(title);
    setShowNewChatModal(false);
    setNewChatTitle('');
    if (newId) {
      router.push(`/chat?sessionId=${newId}`);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput('');
    setIsThinking(true);

    // Auto-route to today's session if the user hasn't picked one manually
    const currentSessionId = sessionId ? activeSessionId : await ensureTodaySession();

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(userMsg);

    const localParsed = parseTransaction(text);

    let content = '';
    let apiParsedData = null;

    try {
      if (localParsed.isQuery) {
        const response = await apiClient('/ai/chat', {
          data: { message: text, session_id: currentSessionId }
        });
        content = response.data?.reply || "I'm sorry, I couldn't process that query.";
      } else {
        const response = await apiClient('/ai/parse', {
          data: { text, save: false, session_id: currentSessionId }
        });

        if (response.data && response.data.amount) {
          apiParsedData = response.data;
          content = `Misa has analysed your input. Here's what I extracted — please confirm if it looks right:`;
        } else {
          content = `Misa couldn't detect a valid amount in your input. Please try again, e.g. "Sold rice for 30000 to Mr Olu via transfer".`;
        }
      }
    } catch (e) {
      console.error(e);
      content = "I'm having trouble connecting to my brain right now. Please try again later.";
    }

    const assistantMsgId = Date.now().toString();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content,
      parsed: apiParsedData ? apiParsedData : undefined,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(assistantMsg);
    setIsThinking(false);

    if (apiParsedData) {
      setPendingParsed({ msgId: assistantMsgId, parsed: apiParsedData });
    }
  };

  const handleConfirm = (edited: ParsedTransaction) => {
    if (!pendingParsed) return;

    const parsed = edited;

    addTransaction({
      ...parsed,
      date: getTodayDate(),
      rawInput: chatHistory.find(m => m.id !== pendingParsed.msgId && m.role === 'user')?.content || '',
    });

    if (parsed.type === 'income' && user?.inventoryEnabled) {
      const match = items.find(i =>
        i.name.toLowerCase().includes(parsed.item.toLowerCase()) ||
        parsed.item.toLowerCase().includes(i.name.toLowerCase())
      );

      if (match) {
        const qty = parsed.quantity || 1;
        updateStock(match.id, -qty);
      }
    }

    confirmParsed(pendingParsed.msgId);
    setPendingParsed(null);
  };

  const handleDiscard = async () => {
    await undoLastTransaction();

    const discardMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `No problem! I've discarded those details and ensured nothing was recorded.`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(discardMsg);
    setPendingParsed(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '1rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Ask Misa</h1>
          <p>Describe your transaction or ask for history in plain English</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleNewChatClick}>
            <Plus size={14} /> New Chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        <div className={styles.mainChatArea}>
          {/* Examples */}
          {chatHistory.length === 0 && (
            <div className={styles.examplesBox}>
              <p className={styles.examplesTitle}><Sparkles size={14} /> Try an example:</p>
              <div className={styles.exampleChips}>
                {EXAMPLES.map(ex => (
                  <button key={ex} className={styles.exampleChip} onClick={() => setInput(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className={styles.chatWindow}>
            {chatHistory.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Sparkles size={40} /></div>
                <h2>Chat with Misa</h2>
              </div>
            )}
            {chatHistory.map(msg => (
              <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.aiRow}`}>
                <div className={styles.msgAvatar}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
                  <p className={styles.bubbleText} style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  {msg.parsed && pendingParsed?.msgId === msg.id ? (
                    <ParsedCard
                      parsed={msg.parsed}
                      onConfirm={(edited) => handleConfirm(edited)}
                      onDiscard={handleDiscard}
                    />
                  ) : msg.parsed ? (
                    <div className={styles.confirmedCard}>
                      <div className={styles.confirmedGrid}>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Type</span>
                          <span className={`badge ${msg.parsed.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                            {msg.parsed.type.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Item</span>
                          <span className={styles.confirmedValue}>{msg.parsed.item}</span>
                        </div>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Quantity</span>
                          <span className={styles.confirmedValue}>{msg.parsed.quantity || 1}</span>
                        </div>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Total Amount</span>
                          <span className={styles.confirmedValue}>{formatAmount(msg.parsed.amount || 0)}</span>
                        </div>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Payment</span>
                          <span className={styles.confirmedValue}>{msg.parsed.payment_method || '—'}</span>
                        </div>
                        <div className={styles.confirmedField}>
                          <span className={styles.confirmedLabel}>Customer</span>
                          <span className={styles.confirmedValue}>{msg.parsed.customer || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <span className={styles.msgTime}>{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isThinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                className={styles.chatInput}
                placeholder='e.g. "Sold 2 bags of flour for 12000 to Mrs Adaeze via transfer"'
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={isThinking}
              />
              <div className={styles.inputActions}>
                <button className="btn btn-ghost btn-sm" onClick={() => { clearChat(); setPendingParsed(null); }} title="Clear chat">
                  <RotateCcw size={14} />
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  id="send-btn"
                >
                  <Send size={15} /> Send
                </button>
              </div>
            </div>
            <p className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* New Chat Title Modal */}
      {showNewChatModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>New Conversation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Give this chat session a title to keep your workspace organized.
            </p>
            <input
              type="text"
              placeholder="e.g., Weekly Sales, Auditing May..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              className={styles.modalInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNewChat();
                if (e.key === 'Escape') setShowNewChatModal(false);
              }}
            />
            <div className={styles.modalActions}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewChatModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleNewChat}>Start Chat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="page-container"><h1>Loading Chat...</h1></div>}>
      <ChatContent />
    </Suspense>
  );
}
