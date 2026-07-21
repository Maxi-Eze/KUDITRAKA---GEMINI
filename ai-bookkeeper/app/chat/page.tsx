'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';

function ChatContent() {
  return (
    <div className="p-6">
      <PageHeader
        title="Ask Misa"
        description="Describe your transaction or ask for history in plain English"
      />
      <div className="text-muted-foreground">Chat interface coming in Phase 2.</div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="text-muted-foreground">Loading...</div></div>}>
      <ChatContent />
    </Suspense>
  );
}
