export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: () => [...queryKeys.transactions.all, 'list'] as const,
  },
  chat: {
    all: ['chat'] as const,
    sessions: () => [...queryKeys.chat.all, 'sessions'] as const,
    history: (sessionId: string) => [...queryKeys.chat.all, 'history', sessionId] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: () => [...queryKeys.inventory.all, 'list'] as const,
  },
} as const;
