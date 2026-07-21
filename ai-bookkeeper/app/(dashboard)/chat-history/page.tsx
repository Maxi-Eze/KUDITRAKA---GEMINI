'use client';

import { useChatSessions } from '@/hooks/useChat';
import { SessionGrid } from '@/components/features/chat-history/SessionGrid';

export default function ChatHistoryPage() {
  const { data: sessions, isLoading } = useChatSessions();
  const sessionList = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="space-y-4">
      <SessionGrid sessions={sessionList} isLoading={isLoading} />
    </div>
  );
}