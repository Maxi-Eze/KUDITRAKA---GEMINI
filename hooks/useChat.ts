'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi } from '@/lib/api';
import { queryKeys } from './keys';
import type { ChatSendResponse } from '@/lib/api/chat';

export function useChatSessions() {
  return useQuery({
    queryKey: queryKeys.chat.sessions(),
    queryFn: chatApi.getSessions,
  });
}

export function useChatHistory(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.chat.history(sessionId),
    queryFn: () => chatApi.getHistory(sessionId),
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, sessionId, isQuery }: { message: string; sessionId?: string; isQuery: boolean }): Promise<ChatSendResponse> =>
      isQuery ? chatApi.chat(message, sessionId) : chatApi.parse(message, sessionId),
    onSuccess: (_data, variables) => {
      if (variables.sessionId) {
        qc.invalidateQueries({ queryKey: queryKeys.chat.history(variables.sessionId) });
      }
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() }),
    onError: (error: Error) => toast.error(error.message || 'Failed to create session'),
  });
}

export function useRenameSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => chatApi.renameSession(id, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() }),
    onError: (error: Error) => toast.error(error.message || 'Failed to rename session'),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() }),
    onError: (error: Error) => toast.error(error.message || 'Failed to delete session'),
  });
}

export function useClearHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.clearHistory,
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.history(sessionId) });
    },
  });
}
