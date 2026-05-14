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
}

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
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
};

interface AppContextType {
  state: AppState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
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
          if (res.data) dispatch({ type: 'SET_CHAT_HISTORY', payload: res.data });
        })
        .catch(console.error);
    } else {
       dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
       dispatch({ type: 'SET_CHAT_HISTORY', payload: [] });
    }
  }, [isLoggedIn]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      const res = await apiClient('/transactions', { data: t });
      if (res.data) {
        // Assume API returns array, we'll refetch or just add if it returns single. 
        // Docs say Create returns the saved entity but let's be safe and refetch for sync, or just add what we sent.
        // Wait, "save=true" from /ai/parse returns the entity. POST /transactions is similar.
        // Let's refetch all to be safe and accurate with IDs.
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
  
  const clearChat = async () => {
    try {
      await apiClient('/ai/chat/history', { method: 'DELETE' });
      dispatch({ type: 'CLEAR_CHAT' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ state, addTransaction, deleteTransaction, addChatMessage, clearChat }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
