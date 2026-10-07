'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { CHAT_MESSAGE_MAX } from '@/lib/validations/chat';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type your message...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = message.trim();
  const tooLong = trimmed.length > CHAT_MESSAGE_MAX;
  const canSend = trimmed.length > 0 && !tooLong && !disabled;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (canSend) {
      onSend(trimmed);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-invalid={tooLong}
          className={cn(
            "flex-1 resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] max-h-[150px]",
            tooLong && "border-destructive"
          )}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!canSend}
          className="h-11 w-11 rounded-xl flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {message.length > 0 && (
        <p
          className={cn(
            'mt-1 text-right text-xs',
            tooLong ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {trimmed.length}/{CHAT_MESSAGE_MAX}
        </p>
      )}
    </div>
  );
}
