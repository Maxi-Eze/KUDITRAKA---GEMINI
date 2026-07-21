import { client } from './client';

export const chatApi = {
  parse: (text: string, sessionId?: string) =>
    client.post('/ai/parse', { text, save: false, session_id: sessionId }),

  chat: (message: string, sessionId?: string) =>
    client.post('/ai/chat', { message, session_id: sessionId }),

  getSessions: () =>
    client.get('/ai/chat/sessions'),

  createSession: (title: string) =>
    client.post('/ai/chat/sessions', { title }),

  renameSession: (id: string, title: string) =>
    client.patch(`/ai/chat/sessions/${id}`, { title }),

  deleteSession: (id: string) =>
    client.delete(`/ai/chat/sessions/${id}`),

  getHistory: (sessionId: string) =>
    client.get(`/ai/chat/history?session_id=${sessionId}`),

  clearHistory: (sessionId: string) =>
    client.delete(`/ai/chat/history?session_id=${sessionId}`),
};
