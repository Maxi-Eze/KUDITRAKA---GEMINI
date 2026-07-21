'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { formatTxDate } from '@/lib/utils';
import { MessageSquare, Calendar } from 'lucide-react';
import type { ChatSession } from '@/lib/types';

interface SessionCardProps {
  session: ChatSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat?session=${session.id}`);
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{session.title}</h3>
          {session.last_message && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {session.last_message}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {session.message_count !== undefined && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {session.message_count} messages
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatTxDate(session.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}