'use client';

import { useState, useCallback } from 'react';
import {
  useChatSessions,
  useChatHistory,
  useSendMessage,
  useCreateSession,
  useRenameSession,
  useDeleteSession,
} from '@/hooks/useChat';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { SessionList } from '@/components/features/chat/SessionList';
import { ChatWindow } from '@/components/features/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { Menu, Plus } from 'lucide-react';
import type { ChatHistoryMessage, ParsedTransaction } from '@/lib/types';
import { customersApi } from '@/lib/api';
import type { ChatParseResponse } from '@/lib/api/chat';

const TRANSACTION_KEYWORDS = ['sold', 'bought', 'spent', 'earned', 'paid', 'received', 'purchased', 'cost', 'expense', 'income'];
const QUESTION_KEYWORDS = ['how much', 'what', 'when', 'where', 'why', 'how many', 'total', 'balance', 'summary'];

function detectIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const hasTransactionKeyword = TRANSACTION_KEYWORDS.some((kw) => lower.includes(kw));
  const hasQuestionKeyword = QUESTION_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasQuestionKeyword && !hasTransactionKeyword) return false;
  return hasTransactionKeyword || !hasQuestionKeyword;
}

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatHistoryMessage[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: sessions, isLoading: sessionsLoading } = useChatSessions();
  const { data: historyMessages, isLoading: historyLoading } = useChatHistory(activeSessionId || '');
  const sendMessage = useSendMessage();
  const createSession = useCreateSession();
  const renameSession = useRenameSession();
  const deleteSession = useDeleteSession();
  const createTransaction = useCreateTransaction();

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const historyList: ChatHistoryMessage[] = Array.isArray(historyMessages)
    ? historyMessages.map((m, i) => {
        const role = m.role === 'model' ? ('assistant' as const) : m.role;
        const id = m.id || `hist-${i}-${m.created_at}`;
        let content = m.content;
        let parsed = m.parsed;

        if (m.role === 'model') {
          try {
            const json = JSON.parse(m.content);
            if (json && typeof json === 'object' && !Array.isArray(json) && 'type' in json) {
              parsed = json as ParsedTransaction;
              const amount = typeof json.amount === 'number' && json.amount > 0 ? ` (₦${json.amount.toLocaleString()})` : '';
              content = `Transaction recorded: ${json.type} — ${json.item || 'Item'}${amount}`;
            } else if (Array.isArray(json)) {
              content = '';
            }
          } catch {
            // not JSON, use as-is
          }
        }

        return { ...m, id, role, content, parsed };
      })
    : [];

  const allMessages = historyList.length > 0 ? historyList : localMessages;

  const handleNewSession = useCallback(() => {
    const title = `Chat ${new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}`;
    createSession.mutate(title, {
      onSuccess: (data) => {
        setActiveSessionId(data.id);
        setLocalMessages([]);
      },
    });
  }, [createSession]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setLocalMessages([]);
    setMobileMenuOpen(false);
  }, []);

  const handleRenameSession = useCallback(
    (id: string, title: string) => {
      renameSession.mutate({ id, title });
    },
    [renameSession]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession.mutate(id, {
        onSuccess: () => {
          if (activeSessionId === id) {
            setActiveSessionId(null);
            setLocalMessages([]);
          }
        },
      });
    },
    [deleteSession, activeSessionId]
  );

  const handleSend = useCallback(
    async (message: string) => {
      let sessionId = activeSessionId;

      if (!sessionId) {
        const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
        const newSession = await createSession.mutateAsync(title);
        sessionId = newSession.id;
        setActiveSessionId(sessionId);
      }

      const isQuery = !detectIntent(message);

      const userMessage: ChatHistoryMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, userMessage]);

      sendMessage.mutate(
        { message, sessionId, isQuery },
        {
          onSuccess: (data) => {
            let content = 'Transaction parsed successfully!';
            let parsed: ParsedTransaction | undefined;

            if (isQuery) {
              const chatData = data as { data?: { reply?: string } };
              content = chatData?.data?.reply || content;
            } else {
              const parseData = data as { data?: ParsedTransaction };
              parsed = parseData?.data;
              if (parsed) {
                content = `Transaction parsed: ${parsed.type} - ${parsed.item}`;
              }
            }

            const assistantMessage: ChatHistoryMessage = {
              id: `temp-${Date.now()}-assistant`,
              session_id: sessionId!,
              role: 'assistant',
              content,
              parsed,
              created_at: new Date().toISOString(),
            };
            setLocalMessages((prev) => [...prev, assistantMessage]);
          },
          onError: () => {
            const errorMessage: ChatHistoryMessage = {
              id: `temp-${Date.now()}-error`,
              session_id: sessionId!,
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
              created_at: new Date().toISOString(),
            };
            setLocalMessages((prev) => [...prev, errorMessage]);
          },
        }
      );
    },
    [activeSessionId, createSession, sendMessage]
  );

  const handleConfirmParsed = useCallback(
    async (parsed: ParsedTransaction) => {
      let customerId: string | null = null;
      if (parsed.customer) {
        try {
          const customer = await customersApi.findOrCreate(parsed.customer);
          customerId = customer.id;
        } catch {
          // proceed without customer ID on error
        }
      }
      createTransaction.mutate({
        type: parsed.type,
        amount: parsed.amount,
        item: parsed.item,
        customer_id: customerId,
        payment_method: parsed.payment_method,
        date: new Date().toISOString().split('T')[0],
        raw_input: '',
        quantity: parsed.quantity,
      });
    },
    [createTransaction]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="hidden lg:block w-64 border-r border-border bg-background">
        <SessionList
          sessions={sessionList}
          activeSessionId={activeSessionId}
          isLoading={sessionsLoading}
          onSelect={handleSelectSession}
          onCreate={handleNewSession}
          onRename={handleRenameSession}
          onDelete={handleDeleteSession}
        />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border">
            <SessionList
              sessions={sessionList}
              activeSessionId={activeSessionId}
              isLoading={sessionsLoading}
              onSelect={handleSelectSession}
              onCreate={handleNewSession}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 p-3 border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSession}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium truncate">
            {sessionList.find((s) => s.id === activeSessionId)?.title || 'New Chat'}
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <ChatWindow
            messages={allMessages}
            isLoading={historyLoading && !!activeSessionId}
            onSend={handleSend}
            onConfirmParsed={handleConfirmParsed}
            isSending={sendMessage.isPending}
          />
        </div>
      </div>
    </div>
  );
}