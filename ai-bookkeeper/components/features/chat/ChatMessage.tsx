'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ParsedCard } from './ParsedCard';
import { ParsedCardEdit } from './ParsedCardEdit';
import type { ChatHistoryMessage, ParsedTransaction } from '@/lib/types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatHistoryMessage;
  onConfirmParsed?: (parsed: ParsedTransaction) => void;
  onDiscardParsed?: () => void;
}

export function ChatMessage({ message, onConfirmParsed, onDiscardParsed }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === 'user';
  const timestamp = message.created_at;

  const handleSaveEdit = (updated: ParsedTransaction) => {
    setIsEditing(false);
    onConfirmParsed?.(updated);
  };

  return (
    <div className={cn(
      'flex gap-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.parsed && !isUser && (
          <div className="w-full max-w-sm">
            {isEditing ? (
              <ParsedCardEdit
                parsed={message.parsed}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ParsedCard
                parsed={message.parsed}
                onConfirm={() => onConfirmParsed?.(message.parsed!)}
                onEdit={() => setIsEditing(true)}
                onDiscard={() => onDiscardParsed?.()}
              />
            )}
          </div>
        )}

        {timestamp && (
          <p className={cn(
            'text-xs text-muted-foreground',
            isUser ? 'text-right' : 'text-left'
          )}>
            {new Date(timestamp).toLocaleTimeString('en-NG', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}