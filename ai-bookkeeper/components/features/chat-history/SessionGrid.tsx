'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SessionCard } from './SessionCard';
import { Search, MessageSquare } from 'lucide-react';
import type { ChatSession } from '@/lib/types';

interface SessionGridProps {
  sessions: ChatSession[];
  isLoading: boolean;
}

function SessionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SessionGrid({ sessions, isLoading }: SessionGridProps) {
  const [search, setSearch] = useState('');

  const filteredSessions = useMemo(() => {
    if (!search) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.last_message && s.last_message.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [filteredSessions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Input
          placeholder="Search sessions..."
          disabled
          className="max-w-sm"
        />
        <SessionSkeleton />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No chat sessions"
        description="Start a conversation with Misa to create your first session"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {sortedSessions.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No sessions found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}