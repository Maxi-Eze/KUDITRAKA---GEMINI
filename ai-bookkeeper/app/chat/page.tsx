'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { apiClient } from '@/lib/apiClient';
import { parseTransaction, formatAmount, generateId, getTodayDate } from '@/lib/aiParser';
import { ChatMessage, ParsedTransaction } from '@/lib/types';
import { Send, Bot, User, CheckCircle, XCircle, Sparkles, RotateCcw } from 'lucide-react';
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
  onConfirm: () => void;
  onDiscard: () => void;
}) {
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
          <span className={styles.parsedLabel}>Amount</span>
          <span className={styles.parsedValue}>{formatAmount(parsed.amount)}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Item</span>
          <span className={styles.parsedValue}>{parsed.item}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Qty</span>
          <span className={styles.parsedValue}>{parsed.quantity || 1}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Customer</span>
          <span className={styles.parsedValue}>{parsed.customer || '—'}</span>
        </div>
        <div className={styles.parsedField}>
          <span className={styles.parsedLabel}>Payment</span>
          <span className="badge badge-payment">{parsed.payment_method}</span>
        </div>
      </div>
      <div className={styles.parsedActions}>
        <button className="btn btn-primary btn-sm" onClick={onConfirm}>
          <CheckCircle size={14} /> Save Transaction
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDiscard}>
          <XCircle size={14} /> Discard
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { state, addTransaction, addChatMessage, clearChat } = useApp();
  const { user } = useAuth();
  const { items, updateStock } = useInventory();
  const { chatHistory } = state;
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingParsed, setPendingParsed] = useState<{ msgId: string; parsed: ParsedTransaction } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(userMsg);
    setIsThinking(true);

    const localParsed = parseTransaction(text);
    
    let content = '';
    let apiParsedData = null;

    try {
      if (localParsed.isQuery) {
        const response = await apiClient('/ai/chat', { data: { message: text } });
        content = response.data?.reply || "I'm sorry, I couldn't process that query.";
      } else {
        const response = await apiClient('/ai/parse', { data: { text, save: false } });
        
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

    const assistantMsgId = Date.now().toString(); // Use timestamp as simple ID if needed
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

  const handleConfirm = () => {
    if (!pendingParsed) return;
    
    const parsed = pendingParsed.parsed;
    
    // Add transaction
    addTransaction({
      ...parsed,
      date: getTodayDate(),
      rawInput: chatHistory.find(m => m.id !== pendingParsed.msgId && m.role === 'user')?.content || '',
    });

    // Inventory Deduction Logic
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

    const confirmMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `✅ Transaction saved successfully! ${formatAmount(parsed.amount)} ${parsed.type} has been recorded.`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(confirmMsg);
    setPendingParsed(null);
  };

  const handleDiscard = () => {
    const discardMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `No problem! The transaction was discarded. Try describing it differently.`,
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
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Ask Misa</h1>
        <p>Describe your transaction or ask for history in plain English</p>
      </div>

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
              <p className={styles.bubbleText}>{msg.content}</p>
              {msg.parsed && pendingParsed?.msgId === msg.id && (
                <ParsedCard
                  parsed={msg.parsed}
                  onConfirm={handleConfirm}
                  onDiscard={handleDiscard}
                />
              )}
              {msg.parsed && pendingParsed?.msgId !== msg.id && (
                <div className={styles.parsedMini}>
                  <span className={`badge ${msg.parsed.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{msg.parsed.type}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatAmount(msg.parsed.amount)} · {msg.parsed.item}</span>
                </div>
              )}
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
  );
}
