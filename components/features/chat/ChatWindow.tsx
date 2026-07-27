'use client';

import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { MessageSquare } from 'lucide-react';
import type { ChatHistoryMessage, ParsedTransaction } from '@/lib/types';

interface ChatWindowProps {
  messages: ChatHistoryMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onConfirmParsed?: (parsed: ParsedTransaction) => void;
  onDiscardParsed?: () => void;
  isSending?: boolean;
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className={`space-y-2 ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
            <Skeleton className={`h-10 ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
          </div>
          {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
        </div>
      ))}
    </div>
  );
}

export function ChatWindow({
  messages,
  isLoading,
  onSend,
  onConfirmParsed,
  onDiscardParsed,
  isSending,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <ChatInput onSend={onSend} disabled />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageSquare}
            title="Start a conversation"
            description="Describe a transaction or ask Misa a question"
          />
        </div>
        <ChatInput onSend={onSend} disabled={isSending} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onConfirmParsed={onConfirmParsed}
            onDiscardParsed={onDiscardParsed}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSend} disabled={isSending} />
    </div>
  );
}