# AGENTS.md — Kuditraka.Ai

## Project Overview

**Kuditraka.Ai** is an AI-powered bookkeeping web application for Nigerian small and medium businesses. Users record financial transactions using natural language (e.g., "Sold rice for 30000 to Mr Olu via transfer"), and an AI assistant named **Misa** parses, categorizes, and records them automatically.

**Core value:** Eliminate manual bookkeeping by replacing data entry with plain English transaction recording.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.5 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Components | shadcn/ui | latest |
| State (server) | React Query (TanStack) | ^5 |
| State (global) | React Context | minimal |
| Icons | Lucide React | ^1.14.0 |
| Charts | Chart.js + react-chartjs-2 | ^4.5 / ^5.3 |
| Theme | next-themes | latest |
| Package Manager | npm | — |

**Backend:** External REST API at `https://kudi-v2-xah5.onrender.com/api` (not part of this repo).

---

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No test framework or linter is currently configured.

---

## Directory Structure

```
ai-bookkeeper/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (providers)
│   ├── page.tsx                  # Dashboard
│   ├── globals.css               # Tailwind + design tokens
│   ├── chat/page.tsx
│   ├── transactions/page.tsx
│   ├── customers/page.tsx
│   ├── inventory/page.tsx
│   ├── reports/page.tsx
│   ├── chat-history/page.tsx
│   ├── onboarding/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── profile/page.tsx
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── layout/                   # AppShell, Sidebar, MobileNav, PageHeader
│   └── features/                 # Domain components
│       ├── dashboard/
│       ├── chat/
│       ├── transactions/
│       ├── customers/
│       ├── inventory/
│       └── auth/
│
├── lib/
│   ├── api/                      # Service layer
│   │   ├── client.ts             # Base API client (fetch wrapper, token, errors)
│   │   ├── auth.ts               # authApi.register, .login, .getProfile, .onboarding
│   │   ├── transactions.ts       # transactionsApi.list, .create, .remove
│   │   ├── chat.ts               # chatApi.parse, .chat, .sessions, .history
│   │   ├── inventory.ts          # inventoryApi.list, .create, .update, .remove
│   │   └── index.ts              # Re-export all
│   ├── types.ts                  # TypeScript interfaces
│   ├── aiParser.ts               # Local NLP transaction parser
│   └── utils.ts                  # cn(), formatAmount, formatDate, generateId
│
├── hooks/                        # React Query hooks
│   ├── keys.ts                   # Query key constants
│   ├── useAuth.ts                # useUser, useLogin, useSignup, useLogout
│   ├── useTransactions.ts        # useTransactions, useCreateTransaction, useDeleteTransaction
│   ├── useChat.ts                # useChatSessions, useChatHistory, useSendMessage
│   ├── useInventory.ts           # useInventoryItems, useCreateItem, etc.
│   └── index.ts                  # Re-export all
│
├── providers/
│   ├── QueryProvider.tsx         # React Query client provider
│   └── ThemeProvider.tsx         # next-themes provider
│
├── components.json               # shadcn/ui config
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

---

## Architecture Principles

### 1. Service Layer Pattern

All API calls go through `lib/api/`. No component or hook calls `fetch()` directly.

```ts
// lib/api/transactions.ts
import { client } from './client';

export const transactionsApi = {
  list: () => client.get<Transaction[]>('/transactions'),
  create: (data) => client.post<Transaction>('/transactions', data),
  remove: (id) => client.delete(`/transactions/${id}`),
};
```

**Rules:**
- Each domain has its own file in `lib/api/`
- The `client` handles auth headers, error handling, JSON parsing
- Return typed responses
- Never import `apiClient` or `fetch` in components or hooks

### 2. React Query for Server State

All remote data is managed via React Query. No more Context for data fetching.

```ts
// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: transactionsApi.list,
  });
}
```

**Rules:**
- Query keys are defined in `hooks/keys.ts` as TypeScript constants
- Use `queryKeys.<domain>.list()` or `queryKeys.<domain>.detail(id)` patterns
- Mutations always invalidate related queries on success
- Never store server state in React Context or local state

### 3. Minimal Global State

React Context is used only for truly global UI concerns (theme). Everything else is React Query cache or local component state (`useState`).

**Rules:**
- No `AppContext`, `AuthContext`, or `InventoryContext` for data fetching
- Auth state comes from `useUser()` (React Query)
- Local UI state (modals, form inputs, toggles) stays in `useState`
- If you need global UI state, use a single minimal Context or Zustand (not both)

### 4. Feature-Based Component Organization

Components are grouped by feature, not by type.

```
components/
  features/
    dashboard/
      KpiCards.tsx
      RevenueChart.tsx
    chat/
      ChatWindow.tsx
      ParsedCard.tsx
```

**Rules:**
- Shared UI primitives go in `components/ui/` (shadcn/ui)
- Layout components go in `components/layout/`
- Feature-specific components go in `components/features/<feature>/`
- Keep components small and focused on one responsibility
- Business logic lives in hooks, not in components

### 5. Design Tokens via CSS Variables

Tailwind reads from CSS custom properties defined in `globals.css`, enabling dark/light theme switching via `next-themes`.

**Rules:**
- Use Tailwind utility classes for styling
- Reference design tokens (e.g., `bg-background`, `text-foreground`, `border-border`)
- Never hardcode colors in components — use semantic tokens
- Dark/light theme is handled by `next-themes` + CSS variables

### 6. Design Direction

- **Style:** Dark Minimalist Finance with brand accent
- **Colors:** Dark base (#0a0a0a) + neon green accent (#aeff00)
- **Cards:** Solid card backgrounds with subtle borders (reduced glassmorphism)
- **Layout:** Bento Grid for dashboard (modular cards, strong visual grouping)
- **Typography:** Inter font, clear hierarchy (page title → section title → card title → body → muted)
- **Spacing:** 4px base scale
- **Theme:** Dark/light via `next-themes` (light theme uses same green on light bg)
- **Mobile:** Bottom nav, stacked cards, 44px touch targets

---

## Coding Conventions

### File Naming

- **Components:** `PascalCase.tsx` (e.g., `KpiCards.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useTransactions.ts`)
- **API services:** `camelCase.ts` (e.g., `transactions.ts`)
- **Utils:** `camelCase.ts` (e.g., `utils.ts`)
- **Types:** `types.ts` (single file for all interfaces)
- **Pages:** `page.tsx` (Next.js convention)

### TypeScript

- All files use TypeScript
- Interfaces defined in `lib/types.ts`
- Props types defined inline or at top of component file
- No `any` types — use proper typing
- Use `interface` for object shapes, `type` for unions/intersections

### Component Patterns

```tsx
'use client';  // Only if component uses hooks

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

**Rules:**
- Use `'use client'` only when component uses hooks (useState, useEffect, etc.)
- Import from `@/` path alias
- Use `cn()` utility for conditional classes
- Destructure props in function signature
- Export named exports (not default) for components

### CSS / Tailwind

- Use Tailwind utility classes
- Use `cn()` for conditional or merged classes
- No CSS Modules (migrating away from them)
- No inline styles except for dynamic values

```tsx
<div className={cn(
  "flex items-center gap-2 p-4",
  isActive && "bg-primary/10",
  className
)}>
```

### Error Handling

- Service layer throws `ApiError` with status code
- React Query handles errors via `onError` callbacks
- Show user-facing error states in UI (not console.log)
- Use toast notifications for action feedback

### Auth Pattern

```tsx
// In any component that needs user data:
const { data: user, isLoading } = useUser();

if (isLoading) return <Skeleton />;
if (!user) return null; // or redirect
```

**Rules:**
- Auth state is driven by `useUser()` hook
- Token stored in localStorage (`ai-bk-token`)
- 401 responses trigger automatic redirect to `/login`
- No `AuthContext` or `AuthProvider`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/types.ts` | All TypeScript interfaces (Transaction, User, ChatMessage, etc.) |
| `lib/api/client.ts` | Base API client with auth headers and error handling |
| `lib/api/index.ts` | Re-export all API services |
| `hooks/keys.ts` | React Query key constants |
| `hooks/useAuth.ts` | Auth queries and mutations |
| `hooks/useTransactions.ts` | Transaction queries and mutations |
| `hooks/useChat.ts` | Chat session and history queries |
| `lib/aiParser.ts` | Local NLP parser (keep as-is, do not modify) |
| `lib/utils.ts` | `cn()` utility and formatting helpers |
| `globals.css` | Tailwind directives + design tokens |
| `components.json` | shadcn/ui configuration |

---

## Data Models

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  item: string;
  customer: string;
  payment_method: string;
  date: string;
  raw_input: string;
  quantity?: number;
}
```

### User
```typescript
interface User {
  id: string;
  businessName: string;
  ownerName: string;
  businessSector?: string;
  inventoryEnabled: boolean;
  onboarded: boolean;
  email: string;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parsed?: ParsedTransaction;
  confirmed?: boolean;
  timestamp: string;
}
```

---

## Important Constraints

1. **No test framework** — Verify changes manually or ask user to confirm
2. **No linter configured** — Follow the conventions in this document
3. **External backend** — All API changes must be compatible with `https://kudi-v2-xah5.onrender.com/api`
4. **Mobile-first** — All UI must work on 375px+ viewports
5. **No comments** — Do not add code comments unless explicitly asked
6. **Nigerian English** — The AI parser must handle local transaction patterns

---

## On-Demand Context

For frontend UI/UX decisions, refer to: `.agents/skills/frontend.md`

For full product requirements, refer to: `PRD.md`
