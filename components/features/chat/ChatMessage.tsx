'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ParsedCard } from './ParsedCard';
import { ParsedCardEdit } from './ParsedCardEdit';
import type { ChatHistoryMessage, ParsedTransaction, StockResult } from '@/lib/types';
import { Bot, User } from 'lucide-react';

export interface CardState {
  status: 'confirming' | 'confirmed' | 'discarded';
  parsed?: ParsedTransaction;
  /** What saving this card did to stock (from the server). */
  stock?: StockResult;
}

interface ChatMessageProps {
  message: ChatHistoryMessage;
  cardState?: CardState;
  onConfirmParsed?: (parsed: ParsedTransaction, messageId?: string) => void;
  onDiscardParsed?: (messageId?: string) => void;
}

export function ChatMessage({ message, cardState, onConfirmParsed, onDiscardParsed }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === 'user';
  const timestamp = message.created_at;
  const isConfirming = cardState?.status === 'confirming';
  const isConfirmed = cardState?.status === 'confirmed';
  const isDiscarded = cardState?.status === 'discarded';
  // After a save, show the values that were actually saved (they may differ from
  // the original parse if the user edited them).
  const shownParsed = cardState?.parsed ?? message.parsed;

  const handleSaveEdit = (updated: ParsedTransaction) => {
    setIsEditing(false);
    onConfirmParsed?.(updated, message.id);
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
        {message.content && (
          <div className={cn(
            'rounded-2xl px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {shownParsed && !isUser && !isDiscarded && (
          <div className="w-full max-w-sm">
            {isEditing && !isConfirmed ? (
              <ParsedCardEdit
                parsed={shownParsed}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ParsedCard
                parsed={shownParsed}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
                stock={cardState?.stock}
                onConfirm={() => onConfirmParsed?.(shownParsed, message.id)}
                onEdit={() => setIsEditing(true)}
                onDiscard={() => onDiscardParsed?.(message.id)}
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