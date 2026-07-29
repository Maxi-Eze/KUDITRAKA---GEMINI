import { client } from './client';
import type { ChatSession, ChatHistoryMessage, ParsedTransaction, ChatReplyResponse } from '../types';

export interface ChatParseResponse {
  data: ParsedTransaction;
}

export type ChatSendResponse = ChatParseResponse | ChatReplyResponse;

export interface ChatEnvelope<T> {
  message: string;
  data: T;
}

export const chatApi = {
  parse: (text: string, sessionId?: string) =>
    client.post<ChatParseResponse>('/ai/parse', { text, save: false, session_id: sessionId }),

  chat: (message: string, sessionId?: string) =>
    client.post<ChatReplyResponse>('/ai/chat', { message, session_id: sessionId }),

  getSessions: async () => {
    const res = await client.get<ChatEnvelope<ChatSession[]>>('/ai/chat/sessions');
    return res.data;
  },

  createSession: async (title: string) => {
    const res = await client.post<ChatEnvelope<ChatSession>>('/ai/chat/sessions', { title });
    return res.data;
  },

  renameSession: (id: string, title: string) =>
    client.patch<void>(`/ai/chat/sessions/${id}`, { title }),

  deleteSession: (id: string) =>
    client.delete(`/ai/chat/sessions/${id}`),

  getHistory: async (sessionId: string) => {
    const res = await client.get<ChatEnvelope<ChatHistoryMessage[]>>(`/ai/chat/history?session_id=${sessionId}`);
    return res.data;
  },

  clearHistory: (sessionId: string) =>
    client.delete(`/ai/chat/history?session_id=${sessionId}`),
};
