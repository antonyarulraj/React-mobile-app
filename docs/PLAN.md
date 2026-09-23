# Mobile ERP App — Project Plan

## 1. Overview

A simple, mobile-first ERP (Enterprise Resource Planning) application built with
React (React Native). The goal is to start small and modular: ship one
business module at a time, fully usable end-to-end, before adding the next.

**First module: Sales.**

For this phase, the app will run entirely on **mock/static data** — no backend
or API integration. The data layer will be built behind a simple interface so
a real API can be swapped in later without reworking the UI.

Phase 1 (project scaffold, navigation shell, theme) and Phase 2 (Sales
module mock data layer) are complete — see
[Milestones](#8-milestones--delivery-plan). Sales screens are still visual
placeholders; Phase 3 replaces them with real list/detail UI wired to the
mock repository built in Phase 2.

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
| Framework            | React Native (via Expo, SDK 57) for fast setup & cross-platform (iOS/Android/web) |
| Language             | TypeScript                                          |
| Navigation           | Expo Router (file-based routing, built on React Navigation) |
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

**Update (Phase 1):** navigation uses **Expo Router** rather than a
hand-wired React Navigation tree. It's the current Expo-recommended standard
(file-based routes under `app/`), gives bottom tabs + stacks with less
boilerplate, and still sits on top of React Navigation under the hood.

---

## 4. High-Level Architecture

```
docs/                            # Planning & architecture docs (this file lives here)
src/
├── app/                          # Expo Router routes only — file = screen, _layout.tsx = navigator
│   ├── _layout.tsx                # Root Stack + theme provider
│   ├── +not-found.tsx
│   └── (tabs)/
│       ├── _layout.tsx             # Bottom tab navigator (Dashboard, Sales, Customers, More)
│       ├── index.tsx               # -> renders src/modules/dashboard
│       ├── sales.tsx               # -> renders src/modules/sales (becomes a folder + stack once
│       │                             #    order detail/create screens are added in Phase 3+)
│       ├── customers.tsx           # -> renders src/modules/customers
│       └── more.tsx                # -> renders src/modules/more
├── modules/
│   └── sales/                    # Sales module (self-contained)
│       ├── screens/               # SalesListScreen, SalesDetailScreen, SalesFormScreen
│       ├── components/            # SalesCard, StatusBadge, SalesSummary, etc. (Phase 3+)
│       ├── data/                   # mockCustomers.ts, mockProducts.ts, mockSalesOrders.ts,
│       │                           #   salesRepository.ts (interface + mock implementation)
│       ├── utils/                  # calculateTotals.ts
│       ├── types.ts                # SaleOrder, SaleOrderItem, Customer, Product, SalesStatus
│       └── index.ts                # public module API (types + mockSalesRepository)
├── shared/
│   ├── components/                # Screen, PlaceholderCard, Buttons, Inputs, EmptyState, etc.
│   ├── theme/                       # colors, spacing, typography, navigationTheme
│   └── utils/                        # delay.ts, id.ts (formatCurrency/formatDate added in Phase 3
│                                      #   once screens actually render them)
assets/
app.json / package.json / tsconfig.json
```

Route files in `src/app/` are kept thin (`export { default } from '@/modules/.../screens/...'`)
— all real screen UI and logic lives in `src/modules/`, imported via the `@/*`
path alias (which maps to `src/*`). This keeps the module pattern from the
original plan intact while satisfying Expo Router's requirement that routable
files live under an `app/` directory — `src/app/` rather than a root-level
`app/`, per this project's `AGENTS.md` convention (Expo Router supports
either; it looks for `src/app/` first).

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

### 5.4 Mockups

Visual mockups of the screens above are available in
[`docs/mockups/`](mockups/README.md): Sales Dashboard, Sales List, Sale
Order Detail, Sale Order Form, and Customers List.

### 5.5 Out of scope for v1
- Payments/invoicing integration.
- Tax rule engines (flat/simple tax % only).
- Multi-warehouse inventory checks.
- Reporting/exports (PDF, CSV).

---

## 6. Navigation Structure

Implemented in Phase 1 as an Expo Router bottom-tab group at `src/app/(tabs)/`:

```
Root Stack (src/app/_layout.tsx)
└── (tabs) — bottom tabs (src/app/(tabs)/_layout.tsx)
    ├── Dashboard   (index.tsx)      — placeholder, becomes Sales Dashboard
    ├── Sales       (sales.tsx)      — wired to the mock data layer (Phase 2), still a
    │                                   placeholder UI; becomes a stack in Phase 3:
    │                                   list → order detail → create/edit form
    ├── Customers   (customers.tsx)  — placeholder, becomes list → detail
    └── More        (more.tsx)       — placeholder for settings/future modules
```

When Sales/Customers grow beyond a single screen (Phase 3+), the leaf route
file converts into a folder with its own `_layout.tsx` stack (e.g.
`src/app/(tabs)/sales/_layout.tsx`, `index.tsx`, `[id].tsx`, `new.tsx`) — a
standard Expo Router pattern, no restructuring of the tab group itself.

Future modules (Inventory, Purchases, Reports) get added as additional tabs
or nested inside the "More" menu as the app grows, avoiding tab-bar overcrowding.

---

## 7. Mock Data Strategy — ✅ Implemented (Phase 2)

- Static seed data split across `src/modules/sales/data/`: `mockCustomers.ts`
  (6 customers), `mockProducts.ts` (8 products), `mockSalesOrders.ts` (16
  sale orders spanning all 6 statuses and a range of dates). Order line
  totals and order-level subtotal/tax/discount/total are derived via the
  shared `calculateOrderTotals()` helper (`src/modules/sales/utils/`) rather
  than hand-computed, so seed data can't drift out of sync with the math.
- `salesRepository.ts` wraps this data behind a `SalesRepository` interface
  (`getOrders`, `getOrderById`, `getCustomers`, `getCustomerById`,
  `getProducts`, `createOrder`, `updateOrderStatus`) with a 400ms simulated
  delay (`src/shared/utils/delay.ts`) on every call, so screens already
  handle loading states correctly — this minimizes rework when a real API is
  introduced (swap `mockSalesRepository` for an HTTP-backed implementation of
  the same interface).
- `createOrder`/`updateOrderStatus` mutate an in-memory array for the
  session (no persistence across app restarts in v1, as planned). Verified
  directly (seed count, sequential order-number generation, total
  calculation, status mutation, re-fetch) and indirectly by wiring
  `SalesListScreen` to load and display live counts from the repository.
- Optional stretch, still open: persist to AsyncStorage so data survives app
  reloads during dev/demo.

---

## 8. Milestones / Delivery Plan

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | This plan (docs only) | ✅ Done |
| 1 | Project scaffold: Expo + TypeScript + navigation shell + theme, no business logic | ✅ Done |
| 2 | Sales module data layer: types, mock data, mock repository with async simulation | ✅ Done |
| 3 | Sales List + Sale Order Detail screens (read-only, wired to mock data) | **Current phase** |
| 4 | Sale Order Create/Edit form with line items & totals | Pending |
| 5 | Status transitions + basic Sales Dashboard stats | Pending |
| 6 | Lightweight Customers screens to support Sales flow | Pending |
| 7 | Polish: search/filter, empty/loading/error states, basic tests | Pending |
| 8 (future) | Replace mock repository with real API integration | Pending |
| 9 (future) | Additional ERP modules: Inventory, Purchases, Invoicing, Reports | Pending |

---

## 9. Open Questions

- Preferred UI library: React Native Paper vs. NativeBase vs. custom design
  system? (Phase 1 uses plain React Native `StyleSheet` + a small hand-rolled
  theme — no component library pulled in yet.)
- ~~Should the app target Expo managed workflow, or is bare React Native CLI
  required?~~ **Resolved:** Expo managed workflow (SDK 57), confirmed in Phase 1.
- Any branding/design guidelines (colors, logo) to align the theme with?
- Should currency/locale be configurable, or fixed for now (e.g. USD)?

---

## 10. Next Steps

1. ~~Scaffold the Expo + TypeScript project (Phase 1).~~ ✅ Done.
2. ~~Implement the Sales module data layer and mock data (Phase 2).~~ ✅ Done.
3. Build out Sales screens incrementally, starting with the read-only list
   and detail views (Phase 3) — next up.

---

## 11. Running the App

```bash
npm install
npx expo start        # then press i / a / w, or scan the QR code in Expo Go
npx expo start --web  # web preview via react-native-web (fastest way to check UI without a device/simulator)
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
```

The app currently renders four themed tabs (Dashboard, Sales, Customers,
More). Sales is wired to the Phase 2 mock data layer and shows live counts
loaded from `mockSalesRepository`; the other three are still static
placeholders. No real list/detail/form UI yet — that's Phase 3.
