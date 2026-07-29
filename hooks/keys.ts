export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: () => [...queryKeys.transactions.all, 'list'] as const,
  },
  reports: {
    all: ['reports'] as const,
    dailySummary: (date: string) => [...queryKeys.reports.all, 'dailySummary', date] as const,
    analytics: () => [...queryKeys.reports.all, 'analytics'] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: () => [...queryKeys.customers.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },
  chat: {
    all: ['chat'] as const,
    sessions: () => [...queryKeys.chat.all, 'sessions'] as const,
    history: (sessionId: string) => [...queryKeys.chat.all, 'history', sessionId] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: () => [...queryKeys.inventory.all, 'list'] as const,
    logs: () => [...queryKeys.inventory.all, 'logs'] as const,
  },
  whatsapp: {
    all: ['whatsapp'] as const,
    status: () => [...queryKeys.whatsapp.all, 'status'] as const,
  },
} as const;
