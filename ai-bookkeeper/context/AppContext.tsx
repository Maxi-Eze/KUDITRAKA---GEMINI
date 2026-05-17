'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, Customer, ChatMessage } from '@/lib/types';
import { buildCustomers } from '@/lib/mockData';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './AuthContext';

interface AppState {
  transactions: Transaction[];
  customers: Customer[];
  chatHistory: ChatMessage[];
  chatSessions: any[];
  activeSessionId: string | null;
  lastTransactionId: string | null;
}

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_SESSIONS'; payload: any[] }
  | { type: 'SET_ACTIVE_SESSION'; payload: string | null }
  | { type: 'SET_LAST_TRANSACTION_ID'; payload: string | null }
  | { type: 'CLEAR_CHAT' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, customers: buildCustomers(action.payload) };
    case 'ADD_TRANSACTION': {
      const transactions = [action.payload, ...state.transactions];
      return {
        ...state,
        transactions,
        customers: buildCustomers(transactions),
      };
    }
    case 'DELETE_TRANSACTION': {
      const transactions = state.transactions.filter((t) => t.id !== action.payload);
      return { ...state, transactions, customers: buildCustomers(transactions) };
    }
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_SESSIONS':
      return { ...state, chatSessions: action.payload };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload };
    case 'SET_LAST_TRANSACTION_ID':
      return { ...state, lastTransactionId: action.payload };
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };
    default:
      return state;
  }
}

const initialState: AppState = {
  transactions: [],
  customers: [],
  chatHistory: [],
  chatSessions: [],
  activeSessionId: null,
  lastTransactionId: null,
};

interface AppContextType {
  state: AppState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addChatMessage: (m: ChatMessage) => void;
  createNewChatSession: (title?: string) => Promise<string>;
  renameChatSession: (sessionId: string, newTitle: string) => Promise<void>;
  switchSession: (sessionId: string) => void;
  undoLastTransaction: () => Promise<void>;
  clearChat: () => void;
  refreshSessions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();

  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    if (isLoggedIn) {
      apiClient('/transactions')
        .then(res => {
          if (res.data) dispatch({ type: 'SET_TRANSACTIONS', payload: res.data });
        })
        .catch(console.error);

      apiClient('/ai/chat/history')
        .then(res => {
          if (res.data) {
            const mappedHistory = res.data.map((msg: any) => ({
              id: msg.id || Math.random().toString(36),
              role: msg.role === 'model' ? 'assistant' : msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
            }));
            dispatch({ type: 'SET_CHAT_HISTORY', payload: mappedHistory });
          }
        })
        .catch(console.error);
      apiClient('/ai/chat/sessions')
        .then(res => {
          if (res.data) {
            dispatch({ type: 'SET_SESSIONS', payload: res.data });
            if (res.data.length > 0) {
              const firstSession = res.data[0].id;
              dispatch({ type: 'SET_ACTIVE_SESSION', payload: firstSession });
            }
          }
        })
        .catch(console.error);
    } else {
       dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
       dispatch({ type: 'SET_CHAT_HISTORY', payload: [] });
       dispatch({ type: 'SET_SESSIONS', payload: [] });
       dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
    }
  }, [isLoggedIn]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      // Sanitize data: Ensure no nulls for required fields
      const cleanData = {
        ...t,
        item: t.item || 'Transaction',
        quantity: t.quantity || 1,
        payment_method: t.payment_method || 'cash'
      };

      const res = await apiClient('/transactions', { data: cleanData });
      if (res.data) {
        dispatch({ type: 'SET_LAST_TRANSACTION_ID', payload: res.data.id });
        const all = await apiClient('/transactions');
        if (all.data) dispatch({ type: 'SET_TRANSACTIONS', payload: all.data });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiClient(`/transactions/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    } catch (e) {
      console.error(e);
    }
  };

  const addChatMessage = (m: ChatMessage) => dispatch({ type: 'ADD_CHAT_MESSAGE', payload: m });

  const switchSession = async (sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: sessionId });
    apiClient(`/ai/chat/history?session_id=${sessionId}`)
      .then(res => {
        if (res.data) {
          const mappedHistory = res.data.map((msg: any) => ({
            id: msg.id || Math.random().toString(36),
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
          }));
          dispatch({ type: 'SET_CHAT_HISTORY', payload: mappedHistory });
        }
      })
      .catch(console.error);
  };

  const createNewChatSession = async (title?: string) => {
    const sessionTitle = title || 'New Chat';
    const res = await apiClient('/ai/chat/sessions', { method: 'POST', data: { title: sessionTitle } });
    if (res.data) {
      const newSession = res.data;
      dispatch({ type: 'SET_SESSIONS', payload: [newSession, ...state.chatSessions] });
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: newSession.id });
      dispatch({ type: 'SET_CHAT_HISTORY', payload: [] });
      return newSession.id;
    }
    return '';
  };
  
  const renameChatSession = async (sessionId: string, newTitle: string) => {
    await apiClient(`/ai/chat/sessions/${sessionId}`, { method: 'PATCH', data: { title: newTitle } });
    const updatedSessions = state.chatSessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s);
    dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
  };

  const undoLastTransaction = async () => {
    if (state.lastTransactionId) {
      await deleteTransaction(state.lastTransactionId);
      dispatch({ type: 'SET_LAST_TRANSACTION_ID', payload: null });
    }
  };

  const clearChat = async () => {
    try {
      if (state.activeSessionId) {
        await apiClient(`/ai/chat/history?session_id=${state.activeSessionId}`, { method: 'DELETE' });
        dispatch({ type: 'CLEAR_CHAT' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshSessions = async () => {
    try {
      const res = await apiClient('/ai/chat/sessions');
      if (res.data) {
        dispatch({ type: 'SET_SESSIONS', payload: res.data });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      addTransaction, 
      deleteTransaction, 
      addChatMessage, 
      createNewChatSession,
      renameChatSession,
      switchSession,
      undoLastTransaction,
      clearChat,
      refreshSessions
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
