# Mobile ERP App — Project Plan

## 1. Overview

A simple, mobile-first ERP (Enterprise Resource Planning) application built with
React (React Native). The goal is to start small and modular: ship one
business module at a time, fully usable end-to-end, before adding the next.

**First module: Sales.**

For this phase, the app will run entirely on **mock/static data** — no backend
or API integration. The data layer will be built behind a simple interface so
a real API can be swapped in later without reworking the UI.

This document is a planning artifact only. No application code or project
scaffold is created yet — that comes after this plan is reviewed/approved.

---

## 2. Goals & Non-Goals

### Goals
- Stand up a clean, scalable React Native project structure.
- Deliver a working **Sales** module: list, view, create/edit, and manage
  status of sales orders, using mock data.
- Keep the architecture modular so future ERP modules (Inventory, Purchases,
  Customers/CRM, Invoicing, Reports, etc.) can be added without restructuring.
- Keep state and data-access patterns API-ready (swap mock repository for a
  real HTTP client later with minimal changes).

### Non-Goals (for this phase)
- No backend/API integration.
- No authentication/authorization backend (a mock/local login screen may be
  stubbed later, not now).
- No persistence beyond in-memory / local mock data (AsyncStorage optional,
  not required for v1).
- No multi-tenant, multi-currency, or multi-language support yet.

---

## 3. Tech Stack (proposed)

| Concern              | Choice                                              |
|----------------------|------------------------------------------------------|
| Framework            | React Native (via Expo) for fast setup & cross-platform (iOS/Android) |
| Language             | TypeScript                                          |
| Navigation           | React Navigation (native-stack + bottom-tabs)       |
| State management     | React Context + hooks for v1 (upgrade path: Zustand/Redux Toolkit if complexity grows) |
| UI components        | React Native Paper (Material Design) or NativeBase — pick one for consistent look |
| Forms                | React Hook Form (+ basic yup/zod validation)        |
| Mock data layer      | Local TS modules simulating a repository/service API (with artificial delay to mimic network) |
| Lists/perf           | FlatList / FlashList for large sales lists           |
| Icons                | @expo/vector-icons                                  |
| Testing (later)      | Jest + React Native Testing Library                 |
| Linting/formatting   | ESLint + Prettier                                   |

Expo is recommended over bare React Native CLI to keep setup, builds, and
device testing simple for a small ERP app; can eject later if native modules
are needed.

---

## 4. High-Level Architecture

```
app/
├── docs/                      # Planning & architecture docs (this file lives here)
├── src/
│   ├── navigation/            # Navigators (root, tabs, per-module stacks)
│   ├── modules/
│   │   └── sales/             # Sales module (self-contained)
│   │       ├── screens/       # SalesListScreen, SalesDetailScreen, SalesFormScreen, DashboardScreen
│   │       ├── components/    # SalesCard, StatusBadge, SalesSummary, etc.
│   │       ├── data/           # mockSalesData.ts, salesRepository.ts (interface)
│   │       ├── hooks/          # useSales, useSalesFilters
│   │       ├── types.ts        # SaleOrder, SaleItem, Customer, SalesStatus
│   │       └── index.ts
│   ├── shared/
│   │   ├── components/        # Buttons, Inputs, EmptyState, LoadingSpinner, Header
│   │   ├── theme/              # Colors, typography, spacing
│   │   ├── utils/               # formatCurrency, formatDate, id generators
│   │   └── constants/
│   ├── store/                  # App-level context/providers (if needed beyond module-local state)
│   └── App.tsx
├── assets/
├── app.json / package.json / tsconfig.json
```

**Module pattern:** every ERP module (Sales, Inventory, Purchases, …) follows
the same internal shape (`screens/`, `components/`, `data/`, `hooks/`,
`types.ts`). This keeps future modules predictable to add and easy to remove
or isolate.

**Data layer pattern:** each module exposes a `*Repository` with an
API-shaped interface (e.g. `getAll()`, `getById()`, `create()`, `update()`,
`remove()`) that currently reads/writes an in-memory mock array. Swapping to
real HTTP calls later means only replacing the repository implementation —
screens/hooks stay unchanged.

---

## 5. Sales Module — Scope for v1

### 5.1 Core entities (mock data models)

- **Customer**: id, name, email, phone, company
- **Product** (minimal, just enough for a sale line item): id, name, sku, unit price, unit
- **SaleOrder**: id, orderNumber, customer, date, items[], subtotal, tax, discount, total, status, notes
- **SaleOrderItem**: productId, productName, quantity, unitPrice, lineTotal
- **SalesStatus**: `Draft | Pending | Confirmed | Shipped | Completed | Cancelled`

### 5.2 Screens

1. **Sales Dashboard** — quick stats (total sales this month, order count by
   status, top customers) using mock aggregates. Simple cards + a basic chart
   (optional, e.g. victory-native or a simple bar list).
2. **Sales List** — searchable/filterable list of sale orders (filter by
   status, date range, customer). Pull-to-refresh (simulated).
3. **Sale Order Detail** — view full order: customer info, line items, totals,
   status, notes; actions to change status or edit.
4. **Create / Edit Sale Order** — form to select customer, add line items
   (from mock product list), auto-calculate totals, set status.
5. **Customers (lightweight)** — simple list/detail of mock customers, enough
   to support the sales flow (not a full CRM module yet).

### 5.3 Key interactions
- Add/remove line items dynamically in the order form.
- Auto-calculated subtotal/tax/total.
- Status transitions (e.g. Draft → Pending → Confirmed → Shipped → Completed),
  with Cancel available from most states.
- Search + filter on the sales list.
- Empty/loading/error states (simulated, since data is mocked) so the UI is
  ready for real async API behavior later.

### 5.4 Out of scope for v1
- Payments/invoicing integration.
- Tax rule engines (flat/simple tax % only).
- Multi-warehouse inventory checks.
- Reporting/exports (PDF, CSV).

---

## 6. Navigation Structure (proposed)

```
Root
└── Bottom Tabs
    ├── Sales (stack)
    │   ├── Sales Dashboard
    │   ├── Sales List
    │   ├── Sale Order Detail
    │   └── Sale Order Form (create/edit)
    ├── Customers (stack)
    │   ├── Customer List
    │   └── Customer Detail
    └── More / Settings (placeholder for future modules)
```

Future modules (Inventory, Purchases, Reports) get added as additional tabs
or nested inside a "More" menu as the app grows, avoiding tab-bar overcrowding.

---

## 7. Mock Data Strategy

- Static seed data in `src/modules/sales/data/mockSalesData.ts` (a handful of
  customers, products, and ~10–20 sample sale orders covering various
  statuses and dates).
- A `salesRepository.ts` wraps this data with async-looking functions
  (`Promise` + `setTimeout`) so components already handle loading/error
  states correctly — this minimizes rework when a real API is introduced.
- CRUD operations mutate an in-memory array for the session (no persistence
  across app restarts in v1). Optional stretch: persist to AsyncStorage so
  data survives app reloads during dev/demo.

---

## 8. Milestones / Delivery Plan

| Phase | Deliverable |
|-------|-------------|
| 0 | This plan (docs only) — **current phase** |
| 1 | Project scaffold: Expo + TypeScript + navigation shell + theme, no business logic |
| 2 | Sales module data layer: types, mock data, mock repository with async simulation |
| 3 | Sales List + Sale Order Detail screens (read-only, wired to mock data) |
| 4 | Sale Order Create/Edit form with line items & totals |
| 5 | Status transitions + basic Sales Dashboard stats |
| 6 | Lightweight Customers screens to support Sales flow |
| 7 | Polish: search/filter, empty/loading/error states, basic tests |
| 8 (future) | Replace mock repository with real API integration |
| 9 (future) | Additional ERP modules: Inventory, Purchases, Invoicing, Reports |

---

## 9. Open Questions

- Preferred UI library: React Native Paper vs. NativeBase vs. custom design
  system?
- Should the app target Expo managed workflow, or is bare React Native CLI
  required (e.g. for specific native modules)?
- Any branding/design guidelines (colors, logo) to align the theme with?
- Should currency/locale be configurable, or fixed for now (e.g. USD)?

---

## 10. Next Steps

Once this plan is approved:
1. Scaffold the Expo + TypeScript project (Phase 1).
2. Implement the Sales module data layer and mock data (Phase 2).
3. Build out Sales screens incrementally (Phases 3–6).

No code or project files will be created until this plan is confirmed.
