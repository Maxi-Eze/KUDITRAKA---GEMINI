import { client } from './client';
import type { ChatSession, ChatHistoryMessage, ParsedTransaction, ChatReplyResponse } from '../types';

export interface ChatParseResponse {
  data: ParsedTransaction;
}

export type ChatSendResponse = ChatParseResponse | ChatReplyResponse;

export const chatApi = {
  parse: (text: string, sessionId?: string) =>
    client.post<ChatParseResponse>('/ai/parse', { text, save: false, session_id: sessionId }),

  chat: (message: string, sessionId?: string) =>
    client.post<ChatReplyResponse>('/ai/chat', { message, session_id: sessionId }),

  getSessions: () =>
    client.get<ChatSession[]>('/ai/chat/sessions'),

  createSession: (title: string) =>
    client.post<ChatSession>('/ai/chat/sessions', { title }),

  renameSession: ( id: string, title: string) =>
    client.patch<void>(`/ai/chat/sessions/${id}`, { title }),

  deleteSession: (id: string) =>
    client.delete(`/ai/chat/sessions/${id}`),

  getHistory: (sessionId: string) =>
    client.get<ChatHistoryMessage[]>(`/ai/chat/history?session_id=${sessionId}`),

  clearHistory: (sessionId: string) =>
    client.delete(`/ai/chat/history?session_id=${sessionId}`),
};