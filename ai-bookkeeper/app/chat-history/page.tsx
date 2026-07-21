'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function ChatHistoryPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Chat History"
        description="Browse your past conversations with Misa"
      />
      <div className="text-muted-foreground">Chat history coming in Phase 2.</div>
    </div>
  );
}
