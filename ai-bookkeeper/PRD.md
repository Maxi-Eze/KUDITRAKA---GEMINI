# Product Requirements Document

**Kuditraka.Ai — Smart Business Finance**

Version: 1.0
Date: July 2026
Status: Draft

---

## 1. Executive Summary

Kuditraka.Ai is an AI-powered bookkeeping web application designed for small and medium-sized businesses in Nigeria. The product enables business owners to record financial transactions using natural language (e.g., "Sold rice for 30000 to Mr Olu via transfer"), with an AI assistant named Misa that parses, categorizes, and records these transactions automatically.

The core value proposition is eliminating the friction of traditional bookkeeping by allowing users to describe their business activity in plain English. Misa handles the structured data entry, categorization, and record-keeping, while the user focuses on running their business.

The MVP delivers a complete transaction recording and management system with AI-powered natural language input, multi-session chat, transaction dashboards with visual analytics, customer tracking, and optional inventory management — all built on a modern, maintainable frontend architecture with a clean separation between UI, state management, and API communication.

---

## 2. Mission

**Mission Statement:** Make bookkeeping effortless for Nigerian small businesses by replacing manual data entry with intelligent, natural language transaction recording.

**Core Principles:**

1. **Simplicity First** — Users should never feel like they're using accounting software. If it requires training, it's too complex.
2. **Mobile-First** — The primary device for our users is a phone. Every screen must work beautifully on small touchscreens.
3. **Trustworthy** — Financial data is sensitive. The product must feel secure, reliable, and professional.
4. **Language-Native** — The AI must understand Nigerian English, local business terminology, and common transaction patterns.
5. **Progressive Disclosure** — Start simple (record a transaction), reveal complexity only when needed (reports, inventory, reconciliation).

---

## 3. Target Users

### Primary Persona: Small Business Owner ("Chidi")

- **Age:** 28–45
- **Location:** Lagos, Abuja, Port Harcourt, or secondary cities in Nigeria
- **Business Type:** Retail shop, wholesale distributor, food vendor, or service provider
- **Revenue:** ₦100K–₦5M monthly
- **Team Size:** Solo operator or 1–5 employees
- **Technical Comfort:** Moderate. Uses WhatsApp, Instagram, and mobile banking daily. Comfortable with web apps but not technical tools.
- **Pain Points:**
  - Tracks transactions in their head, on paper, or in scattered WhatsApp messages
  - Loses track of who owes them money
  - Can't easily see if they're making a profit
  - Spends hours doing manual bookkeeping at month-end
  - Doesn't know how to start using accounting software

### Secondary Persona: Business Partner / Accountant

- Reviews transaction history and reports
- Needs clear, exportable records for tax and auditing
- More comfortable with structured data views

---

## 4. MVP Scope

### Core Functionality

✅ **Natural Language Transaction Input**
- User types or speaks a transaction in plain English
- AI (Misa) parses the input and extracts: type (income/expense), amount, item, customer, payment method, quantity
- User confirms, edits, or discards the parsed result before saving
- Transactions are saved to the backend API

✅ **AI Chat Interface**
- Multi-session chat with Misa
- Each session has a title and persisted history
- Users can create, rename, delete, and switch between sessions
- Today's session is auto-created on first message
- Support for queries (e.g., "How much did I spend this week?")

✅ **Dashboard**
- KPI cards: Total Income, Total Expenses, Net Profit, Transaction Count
- Revenue trend chart (last 7 days)
- Income vs Expense pie chart
- Recent transactions list (last 6)
- Top customers by revenue

✅ **Transaction Management**
- Full transaction list with filtering/sorting
- Delete transactions
- Undo last transaction (from chat)
- Payment method tracking (cash, transfer, POS, card, cheque)

✅ **Customer Tracking**
- Auto-derive customers from transactions
- Customer list with total transactions and total amount
- No manual customer creation required

✅ **Authentication & Onboarding**
- Email/password registration and login
- JWT-based session management
- Onboarding flow: select business sector, enable/disable inventory
- Protected routes (redirect to login if unauthenticated)

✅ **Responsive Layout**
- Sidebar navigation on desktop
- Bottom navigation on mobile
- Consistent page structure across all screens

### Out of Scope (Future Phases)

❌ **Inventory Management** — Full stock tracking, low-stock alerts, restock workflows (backend not ready)
❌ **Financial Reports** — P&L statements, tax summaries, exportable PDFs
❌ **Multi-User / Roles** — Team accounts, permission levels, audit logs
❌ **Offline Support** — Service worker, offline-first data sync
❌ **Voice Input** — Speech-to-text for hands-free transaction recording
❌ **Bank Integration** — Automatic transaction import from bank statements
❌ **Mobile App** — Native iOS/Android (PWA is a future consideration)
❌ **Reconciliation** — Physical stock vs system stock comparison workflows
❌ **Expense Categorization** — Automatic category assignment for expenses
❌ **Recurring Transactions** — Auto-detecting and recording repeated transactions

---

## 5. User Stories

### US-1: Record a Transaction via Chat
**As a** business owner,
**I want to** describe a transaction in plain English (e.g., "Sold 2 bags of rice for 60000 to Mrs Adaeze via transfer"),
**so that** I can record it instantly without filling out forms.

**Acceptance Criteria:**
- Misa extracts: type, item, quantity, amount, customer, payment method
- User sees a parsed result card with all extracted fields
- User can confirm, edit, or discard
- On confirm, transaction appears in dashboard and transaction list
- Transaction is persisted to backend

### US-2: View Business Performance
**As a** business owner,
**I want to** see my income, expenses, and profit at a glance on the dashboard,
**so that** I know how my business is performing without doing calculations.

**Acceptance Criteria:**
- Dashboard loads with 4 KPI cards
- Charts show revenue trend and income/expense breakdown
- Recent transactions are listed with amounts and dates
- Top customers are ranked by revenue generated
- Data updates after new transaction is recorded

### US-3: Manage Chat Sessions
**As a** business owner,
**I want to** organize my conversations with Misa into separate sessions (e.g., "Weekly Sales", "May Auditing"),
**so that** I can keep my business records organized by time period or purpose.

**Acceptance Criteria:**
- User can create a new chat session with a title
- User can switch between sessions
- User can rename and delete sessions
- Chat history is loaded per session (not globally)
- Today's session is auto-created when user sends first message of the day

### US-4: Review Transaction History
**As a** business owner,
**I want to** see a complete list of all my transactions,
**so that** I can review, verify, and manage my financial records.

**Acceptance Criteria:**
- Transaction list shows all transactions sorted by date (newest first)
- Each transaction shows: type, item, amount, customer, payment method, date
- User can delete a transaction
- Transaction list updates after deletion

### US-5: Track Customers
**As a** business owner,
**I want to** see which customers generate the most revenue,
**so that** I can focus on my best relationships and follow up on outstanding balances.

**Acceptance Criteria:**
- Customers are auto-derived from transactions (no manual entry)
- Customer list shows name, transaction count, and total amount
- Customers are ranked by total revenue
- No duplicate customers for same name

### US-6: Authenticate and Onboard
**As a** new user,
**I want to** sign up, log in, and set up my business profile,
**so that** my data is secure and personalized to my business type.

**Acceptance Criteria:**
- User can register with email, password, and business name
- User can log in and receive a JWT token
- On first login, onboarding flow collects business sector and inventory preference
- Protected pages redirect to login if not authenticated
- Token is stored in localStorage and sent with API requests

### US-7: Use on Mobile
**As a** business owner,
**I want to** use the app on my phone,
**so that** I can record transactions on the go without needing a computer.

**Acceptance Criteria:**
- All screens are usable on 375px+ viewport width
- Navigation switches to bottom bar on mobile
- Touch targets are minimum 44px
- Tables convert to card layouts on mobile
- Chat input is easy to use on mobile keyboards

### US-8: Undo a Transaction
**As a** business owner,
**I want to** discard a transaction I just recorded via chat,
**so that** I can correct mistakes without manually finding and deleting the transaction.

**Acceptance Criteria:**
- After confirming a parsed transaction, user can tap "Discard"
- The most recently added transaction is deleted
- User sees confirmation that the transaction was discarded

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App (Frontend)                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Pages    │  │ Components│  │     Hooks (React Q)  │  │
│  │  (app/)   │──│ (ui/,     │──│  useUser, useTxns,   │  │
│  │           │  │  layout/, │  │  useChat, etc.       │  │
│  │           │  │  features/)│ │                      │  │
│  └──────────┘  └──────────┘  └──────────┬───────────┘  │
│                                          │              │
│                                  ┌───────▼──────────┐   │
│                                  │  Service Layer    │   │
│                                  │  (lib/api/)       │   │
│                                  └───────┬──────────┘   │
└──────────────────────────────────────────┼──────────────┘
                                           │
                                   ┌───────▼──────────┐
                                   │  Remote API       │
                                   │  kudi-v2-xah5     │
                                   │  .onrender.com    │
                                   └──────────────────┘
```

### Directory Structure

```
ai-bookkeeper/
├── app/                          # Next.js App Router pages
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── layout/                   # AppShell, Sidebar, MobileNav, PageHeader
│   └── features/                 # Domain-specific components per feature
│       ├── dashboard/
│       ├── chat/
│       ├── transactions/
│       ├── customers/
│       ├── inventory/
│       └── auth/
├── lib/
│   ├── api/                      # Service layer (client, auth, transactions, chat, inventory)
│   ├── types.ts                  # TypeScript interfaces
│   ├── aiParser.ts               # Local NLP transaction parser
│   └── utils.ts                  # cn(), formatAmount, formatDate, generateId
├── hooks/
│   ├── keys.ts                   # React Query key constants
│   ├── useAuth.ts                # useUser, useLogin, useSignup, useLogout
│   ├── useTransactions.ts        # useTransactions, useCreateTransaction, useDeleteTransaction
│   ├── useChat.ts                # useChatSessions, useChatHistory, useSendMessage
│   └── useInventory.ts           # useInventoryItems, useCreateItem, etc.
├── providers/
│   ├── QueryProvider.tsx          # React Query client provider
│   └── ThemeProvider.tsx          # next-themes dark/light toggle
├── tailwind.config.ts
├── components.json                # shadcn/ui configuration
├── globals.css                    # Tailwind directives + design tokens
└── package.json
```

### Key Design Patterns

1. **Service Layer Pattern** — All API calls are centralized in `lib/api/`. No component or hook calls `fetch()` directly.
2. **React Query for Server State** — All remote data (transactions, chat, user) is managed via React Query. No more Context for data fetching.
3. **Minimal Global State** — React Context is used only for truly global UI concerns (theme). Everything else is React Query cache or local component state.
4. **Feature-Based Component Organization** — Components are grouped by feature (`dashboard/`, `chat/`, etc.), not by type.
5. **Design Tokens via CSS Variables** — Tailwind reads from CSS custom properties defined in `globals.css`, enabling dark/light theme switching.
6. **Mobile-First Responsive Design** — All layouts start with mobile breakpoints and scale up.

---

## 7. Tools/Features

### 7.1 AI Chat System (Misa)

**Purpose:** Natural language interface for recording transactions and querying business data.

**Core Features:**
- Parse natural language into structured transaction data
- Support common Nigerian English patterns ("Sold rice for 30000 to Mr Olu via transfer")
- Extract: transaction type, amount, item name, customer name, payment method, quantity
- Display parsed result in an editable confirmation card
- Support conversational queries ("How much did I spend this month?")
- Multi-session management with titles and history

**Parsing Logic (Local):**
- Keyword-based type detection (income vs expense)
- Regex-based amount extraction (supports ₦ symbol)
- Pattern-based customer extraction (Mr/Mrs/Miss + name)
- Payment method detection from keywords
- Quantity extraction from natural language

### 7.2 Dashboard

**Purpose:** At-a-glance business performance overview.

**Design Direction:**
- Dark minimalist finance aesthetic
- Dark base (#0a0a0a) with neon green accent (#aeff00)
- Bento Grid layout for dashboard cards (modular, strong visual grouping)
- Solid card backgrounds with subtle borders (not heavy glassmorphism)
- Light theme available via next-themes toggle

**Components:**
- KPI Cards: Total Income, Total Expenses, Net Profit, Transaction Count
- Revenue Trend Chart: Line chart of daily income (last 7 days)
- Income vs Expense Chart: Pie/donut chart
- Recent Transactions: List of last 6 transactions
- Top Customers: Ranked list by total revenue

### 7.3 Transaction Management

**Purpose:** Complete record of all financial activity.

**Features:**
- List view sorted by date (newest first)
- Each entry shows: type badge, item, amount, customer, payment method, date
- Delete capability with confirmation
- Undo last transaction (from chat context)

### 7.4 Customer Management

**Purpose:** Automatic customer tracking derived from transactions.

**Features:**
- Auto-derive customers from transaction records
- Customer profile: name, transaction count, total amount
- Ranked by total revenue
- No manual customer creation required

### 7.5 Authentication System

**Purpose:** Secure access to business data.

**Features:**
- Email + password registration
- JWT-based login
- Onboarding flow (business sector, inventory preference)
- Protected route middleware
- Token storage in localStorage
- Auto-redirect on auth state changes

---

## 8. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.5 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| shadcn/ui | latest | Component library |
| React Query (TanStack) | ^5 | Server state management |
| Chart.js | ^4.5.1 | Data visualization |
| react-chartjs-2 | ^5.3.1 | Chart.js React wrapper |
| Lucide React | ^1.14.0 | Icon library |
| next-themes | latest | Dark/light theme switching |

### Backend (External)

| Technology | Purpose |
|-----------|---------|
| REST API | `https://kudi-v2-xah5.onrender.com/api` |
| JWT | Authentication tokens |
| PostgreSQL (assumed) | Database (managed by backend) |

### Build & Development

| Tool | Purpose |
|------|---------|
| npm | Package manager |
| ESLint | Code linting |
| TypeScript Compiler | Type checking |

---

## 9. Security & Configuration

### Authentication

- **Method:** JWT (JSON Web Tokens)
- **Storage:** localStorage (`ai-bk-token`)
- **Transport:** `Authorization: Bearer <token>` header
- **Token Expiry:** Handled by backend (401 response triggers logout)
- **Registration:** Email + password + business name
- **Login:** Email + password → returns token + user object

### Configuration Management

**Environment Variables:**
- No `.env` file required for frontend (API URL is hardcoded in `lib/api/client.ts`)
- Future: `NEXT_PUBLIC_API_URL` for environment-specific deployment

**localStorage Keys:**
- `ai-bk-token` — JWT authentication token
- `ai-bk-user` — Cached user object (for offline rendering)
- `ai-bk-is-logged` — Auth state flag
- `ai-bk-device-remembered` — Device remember flag
- `ai-bk-onboarded` — Onboarding completion flag

### Security Scope

**In Scope:**
- ✅ JWT-based authentication
- ✅ Protected API routes (backend)
- ✅ Token-based authorization headers
- ✅ Input validation on parsed transactions
- ✅ No secrets in frontend code

**Out of Scope:**
- ❌ HTTPS enforcement (handled by hosting platform)
- ❌ CSRF protection (stateless API with JWT)
- ❌ Rate limiting (handled by backend)
- ❌ Data encryption at rest (handled by backend)
- ❌ GDPR compliance (Nigerian market focus)

---

## 10. API Specification

### Base URL

```
https://kudi-v2-xah5.onrender.com/api
```

### Authentication Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

### Endpoints

#### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{ name, email, password, business_name }` | `{ userId }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| PUT | `/auth/onboarding` | `{ business_sector, inventory_enabled }` | `{ success }` |

#### Transactions

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/transactions` | — | `Transaction[]` |
| POST | `/transactions` | `{ type, amount, item, customer, payment_method, date, raw_input, quantity }` | `Transaction` |
| DELETE | `/transactions/:id` | — | `{ success }` |

#### Chat & AI

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/ai/parse` | `{ text, save, session_id }` | `{ data: ParsedTransaction }` |
| POST | `/ai/chat` | `{ message, session_id }` | `{ data: { reply } }` |
| GET | `/ai/chat/sessions` | — | `{ data: Session[] }` |
| POST | `/ai/chat/sessions` | `{ title }` | `{ data: Session }` |
| PATCH | `/ai/chat/sessions/:id` | `{ title }` | `{ success }` |
| DELETE | `/ai/chat/sessions/:id` | — | `{ success }` |
| GET | `/ai/chat/history?session_id=X` | — | `{ data: Message[] }` |
| DELETE | `/ai/chat/history?session_id=X` | — | `{ success }` |

#### Inventory (Future)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/inventory` | — | `InventoryItem[]` |
| POST | `/inventory` | `{ name, stock, minStock, costPrice, sellingPrice, category }` | `InventoryItem` |
| PATCH | `/inventory/:id` | `{ stock }` | `InventoryItem` |
| DELETE | `/inventory/:id` | — | `{ success }` |

### Data Models

**Transaction:**
```typescript
{
  id: string;
  type: 'income' | 'expense';
  amount: number;
  item: string;
  customer: string;
  payment_method: string;
  date: string;
  raw_input: string;
  quantity: number;
}
```

**User:**
```typescript
{
  id: string;
  businessName: string;
  ownerName: string;
  businessSector: string;
  inventoryEnabled: boolean;
  onboarded: boolean;
  email: string;
}
```

---

## 11. Success Criteria

### MVP Success Definition

The MVP is successful when a small business owner can:
1. Sign up and complete onboarding in under 2 minutes
2. Record a transaction by typing one sentence in under 15 seconds
3. View their income, expenses, and profit on the dashboard
4. Switch between chat sessions to organize different time periods
5. Use the app on their phone without frustration

### Functional Requirements

✅ User can register with email, password, and business name
✅ User can log in and receive a JWT token
✅ User completes onboarding (business sector, inventory preference)
✅ User records a transaction via natural language chat
✅ AI parses transaction and displays structured result
✅ User confirms, edits, or discards parsed transaction
✅ Transaction appears in dashboard and transaction list
✅ Dashboard shows KPIs, charts, recent transactions, top customers
✅ User can create, rename, switch, and delete chat sessions
✅ Chat history is persisted per session
✅ User can delete transactions
✅ User can undo last transaction from chat
✅ All screens are responsive (mobile, tablet, desktop)
✅ Protected routes redirect to login when unauthenticated

### Quality Indicators

- **Performance:** Dashboard loads in < 2 seconds on 3G
- **Accuracy:** AI parsing correctly extracts fields for 80%+ of common transaction descriptions
- **Responsiveness:** All touch targets ≥ 44px, no horizontal scrolling on mobile
- **Accessibility:** Semantic HTML, keyboard navigation, proper focus states
- **Reliability:** No data loss on network errors (optimistic UI with rollback)

### User Experience Goals

- First-time user can record a transaction without reading any documentation
- The app feels fast and responsive, not sluggish
- The dark theme feels professional and trustworthy (finance product)
- Mobile experience feels native, not like a desktop site shrunk down

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Establish the new architecture foundation.

**Deliverables:**
- ✅ Install and configure Tailwind CSS + shadcn/ui
- ✅ Set up design tokens in `globals.css` (dark/light theme)
- ✅ Create service layer (`lib/api/client.ts`, `lib/api/auth.ts`, `lib/api/transactions.ts`, `lib/api/chat.ts`)
- ✅ Create React Query hooks (`hooks/keys.ts`, `hooks/useAuth.ts`, `hooks/useTransactions.ts`, `hooks/useChat.ts`)
- ✅ Create providers (`providers/QueryProvider.tsx`, `providers/ThemeProvider.tsx`)
- ✅ Create base UI components (`components/ui/*` via shadcn)
- ✅ Create layout components (`components/layout/AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `PageHeader.tsx`)

**Validation:**
- App boots with new Tailwind setup
- Service layer can hit API endpoints
- React Query hooks return data correctly
- Layout renders with sidebar (desktop) and bottom nav (mobile)

### Phase 2: Auth & Core Features (Week 3-4)

**Goal:** Refactor auth and core data flows to React Query.

**Deliverables:**
- ✅ Refactor auth: Context → React Query (`useUser`, `useLogin`, `useSignup`, `useLogout`)
- ✅ Refactor transactions: Context → React Query (`useTransactions`, `useCreateTransaction`, `useDeleteTransaction`)
- ✅ Refactor chat: Context → React Query (`useChatSessions`, `useChatHistory`, `useSendMessage`)
- ✅ Build feature components (`components/features/dashboard/*`, `chat/*`, `auth/*`)
- ✅ Migrate all pages to new architecture
- ✅ Delete old Context providers (`AppContext`, `AuthContext`, `InventoryContext`)
- ✅ Delete old CSS modules, migrate to Tailwind classes

**Validation:**
- User can register, login, and complete onboarding
- User can record a transaction via chat and see it on dashboard
- Chat sessions work correctly (create, switch, history)
- All pages render with consistent styling

### Phase 3: Polish & Responsive (Week 5-6)

**Goal:** Ensure production-quality UI across all devices.

**Deliverables:**
- ✅ Mobile responsiveness audit and fixes
- ✅ Loading states (skeletons) for all data-fetching screens
- ✅ Empty states for all list views
- ✅ Error states with retry actions
- ✅ Form validation feedback
- ✅ Chart components migrated and styled
- ✅ Dashboard layout optimized
- ✅ Dark/light theme toggle working correctly

**Validation:**
- All screens look correct on iPhone SE (375px), iPad (768px), and desktop (1440px)
- Loading skeletons appear before data loads
- Empty states show helpful messages and CTAs
- Error states show retry buttons
- Theme toggle switches between dark and light

### Phase 4: Testing & Deployment (Week 7-8)

**Goal:** Ensure reliability and ship to production.

**Deliverables:**
- ✅ Manual testing of all user flows
- ✅ Fix any bugs discovered during testing
- ✅ Performance optimization (bundle size, lazy loading)
- ✅ Remove unused dependencies
- ✅ Clean up git history
- ✅ Deploy to Vercel (or current hosting platform)
- ✅ Smoke test production deployment

**Validation:**
- All user stories pass manual testing
- No console errors in production
- Lighthouse score > 80 on mobile
- Production deployment works end-to-end

---

## 13. Future Considerations

### Post-MVP Enhancements

- **Voice Input:** Speech-to-text for hands-free transaction recording
- **Recurring Transactions:** Auto-detecting and recording repeated transactions
- **Expense Categorization:** Automatic category assignment using AI
- **Multi-Currency:** Support for USD, GBP, GHS in addition to NGN
- **Export:** PDF and CSV export of transaction reports
- **Bank Integration:** Automatic transaction import from bank statements
- **Notifications:** Low stock alerts, daily summary push notifications

### Integration Opportunities

- **WhatsApp Business API:** Record transactions via WhatsApp messages
- **Paystack/Flutterwave:** Payment verification and automatic recording
- **Google Sheets:** Two-way sync for users who prefer spreadsheets
- **Telegram Bot:** Alternative chat interface for transaction recording

### Advanced Features (Later Phases)

- **Multi-User / Roles:** Team accounts with permission levels
- **Audit Logs:** Track who made changes and when
- **Financial Reports:** P&L statements, tax summaries, cash flow analysis
- **Inventory Management:** Full stock tracking with low-stock alerts
- **Reconciliation:** Physical stock vs system stock comparison
- **Offline Support:** Service worker for offline transaction recording with sync

---

## 14. Risks & Mitigations

### Risk 1: Backend API Unreliability

**Impact:** High — Frontend cannot function without backend
**Likelihood:** Medium — Render free tier has cold starts

**Mitigation:**
- Implement proper error handling with retry mechanisms
- Show clear error states to users
- Consider caching strategies for read-heavy endpoints
- Monitor backend health and set up alerts

### Risk 2: AI Parsing Accuracy

**Impact:** Medium — Poor parsing frustrates users
**Likelihood:** Medium — Nigerian English patterns are diverse

**Mitigation:**
- Keep local parser as fallback (already exists in `aiParser.ts`)
- User can always edit parsed results before confirming
- Log parsing failures to improve accuracy over time
- Consider fine-tuning or adding more patterns based on usage

### Risk 3: Mobile UX Compromises

**Impact:** High — Primary users are on mobile
**Likelihood:** Low — If mobile-first approach is maintained

**Mitigation:**
- Test on real devices (not just browser dev tools)
- Prioritize mobile in all design decisions
- Use touch-friendly component sizes (≥ 44px targets)
- Convert tables to cards on mobile breakpoints

### Risk 4: Scope Creep

**Impact:** High — Delays MVP delivery
**Likelihood:** Medium — Many features are tempting to add

**Mitigation:**
- Strictly enforce MVP scope boundaries
- Track "nice to have" ideas in a backlog, not in the codebase
- Complete Phase 1-4 before adding any new features
- Regular check-ins against PRD scope

### Risk 5: Authentication Security

**Impact:** High — Business data exposure
**Likelihood:** Low — Standard JWT implementation

**Mitigation:**
- Use short-lived tokens with refresh mechanism (backend responsibility)
- Store tokens in localStorage (acceptable for this use case)
- Implement proper logout (clear all localStorage)
- Never expose secrets in frontend code
- Redirect to login on 401 responses

---

## 15. Appendix

### Related Documents

- **Frontend Skill Guide:** `.agents/skills/frontend.md` — UI/UX principles and design direction
- **Architecture Plan:** Documented in conversation history

### Key Dependencies

| Package | Purpose | Link |
|---------|---------|------|
| Next.js | React framework | https://nextjs.org |
| shadcn/ui | Component library | https://ui.shadcn.com |
| TanStack Query | Server state | https://tanstack.com/query |
| Tailwind CSS | Styling | https://tailwindcss.com |
| Chart.js | Visualization | https://www.chartjs.org |
| Lucide | Icons | https://lucide.dev |

### Repository Structure

```
GitHub: Maxi-Eze/KUDITRAKA---GEMINI
Local: /Users/jayjay/Documents/github/KUDITRAKA---GEMINI/ai-bookkeeper
Branch: main
```

### Design Direction

**Selected Style:** Dark Minimalist Finance

**Characteristics:**
- Dark background (#0a0a0a) with neon green accent (#aeff00)
- Solid card backgrounds with subtle borders (reduced glassmorphism)
- Bento Grid layout for dashboard
- Clean typography (Inter font, clear hierarchy)
- 4px base spacing scale
- Mobile-first responsive design (bottom nav, stacked cards, 44px touch targets)
- Professional, trustworthy feel for finance product
- Light theme available via next-themes (same green accent on light background)

**Design Principles (from frontend skill):**
- Clarity over decoration
- Consistency over random creativity
- Mobile-first responsiveness
- Accessibility by default
- Fast perceived performance
- Visual hierarchy
