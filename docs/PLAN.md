# Mobile ERP App — Project Plan

## 1. Overview

A simple, mobile-first ERP (Enterprise Resource Planning) application built with
React (React Native). The goal is to start small and modular: ship one
business module at a time, fully usable end-to-end, before adding the next.

**First module: Sales.**

For this phase, the app will run entirely on **mock/static data** — no backend
or API integration. The data layer will be built behind a simple interface so
a real API can be swapped in later without reworking the UI.

Phases 1–4 are complete — project scaffold, the Sales mock data layer, the
Sales List + Sale Order Detail screens, and creating/editing sale orders —
see [Milestones](#8-milestones--delivery-plan). Next is Phase 5: status
transitions and the Sales Dashboard.

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
| Forms                | Plain React state + a pure draft/validation module (Phase 4) — React Hook Form not needed for one form; revisit if forms multiply |
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
│       ├── sales/
│       │   ├── _layout.tsx         # Stack, list kept underneath deep links
│       │   ├── index.tsx           # -> SalesListScreen            (/sales)
│       │   ├── new.tsx             # -> SaleOrderFormScreen        (/sales/new)
│       │   └── [id]/
│       │       ├── index.tsx       # -> SaleOrderDetailScreen      (/sales/<id>)
│       │       └── edit.tsx        # -> SaleOrderFormScreen        (/sales/<id>/edit)
│       ├── customers.tsx           # -> renders src/modules/customers
│       └── more.tsx                # -> renders src/modules/more
├── modules/
│   └── sales/                    # Sales module (self-contained)
│       ├── screens/               # SalesListScreen, SaleOrderDetailScreen, SaleOrderFormScreen
│       ├── components/            # StatusBadge, SaleOrderListItem, OrderTotals, LineItemEditor
│       ├── hooks/                 # useSaleOrders, useSaleOrder(id), useOrderFormData(id?)
│       ├── data/                   # mockCustomers.ts, mockProducts.ts, mockSalesOrders.ts,
│       │                           #   salesRepository.ts (interface + mock implementation)
│       ├── utils/                  # orderMath.ts (line items + totals), orderRules.ts (what's
│       │                           #   editable), orderDraft.ts (form draft + validation)
│       ├── types.ts                # SaleOrder, SaleOrderItem, Customer, Product, SalesStatus
│       └── index.ts                # public module API (types + mockSalesRepository)
├── shared/
│   ├── components/                # Screen, ScreenHeader (+ HeaderIconButton), Avatar, Button,
│   │                              #   PlaceholderCard, LoadingState, ErrorState, FormSection,
│   │                              #   SelectField, PickerModal (bottom-sheet list picker)
│   ├── hooks/                     # useAsyncData (loading / error / success + reload)
│   ├── theme/                       # colors, spacing, typography, navigationTheme
│   └── utils/                        # delay.ts, id.ts, format.ts (currency, date, initials),
│                                      #   date.ts (today, strict YYYY-MM-DD validation)
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

**Create/edit rules (Phase 4):**
- Only **Draft** and **Pending** orders can be edited. The detail screen only
  shows the edit button for them, the edit URL shows a "can't be edited"
  state for anything else, and `updateOrder` in the repository rejects it
  too, so the rule holds even once a real API replaces the UI checks.
- New orders start as **Draft**.
- Adding a product that's already on the order bumps its quantity instead of
  adding a duplicate line. Quantities are whole numbers from 1 to 9999.
- The form doesn't edit tax or discount. Edits keep the order's existing
  tax rate and discount, and a discount is capped so a shrunken order's
  total never goes negative.
- The list and detail screens re-fetch when you return to them, so saved
  changes show up right away.

**Known limitations (to revisit in Phase 7 polish):**
- The order date is a `YYYY-MM-DD` text field (validated, with a
  "24 Sep 2026" preview) rather than a native date picker, because it has to
  work the same on iOS, Android, and web.
- Leaving the form with unsaved changes doesn't ask for confirmation.

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
    ├── Sales       (sales/)         — Stack (Phase 3):
    │   ├── index.tsx                  list of sale orders  (/sales)       "+" button → new
    │   ├── new.tsx                    create form          (/sales/new)
    │   ├── [id]/index.tsx             order detail         (/sales/<id>)  edit button → edit
    │   └── [id]/edit.tsx              edit form            (/sales/<id>/edit)
    ├── Customers   (customers.tsx)  — placeholder, becomes list → detail
    └── More        (more.tsx)       — placeholder for settings/future modules
```

Sales was converted from a single `sales.tsx` route into a `sales/` folder
with its own stack in Phase 3 — the standard Expo Router pattern, with no
change to the tab group itself. Customers will follow the same pattern in
Phase 6. The sales stack sets `initialRouteName: 'index'` so a deep link
straight to an order still has the list underneath for "back". Known
cosmetic quirk: on web, going back from a deep-linked order leaves the
order id as a harmless query param on the list URL (`/sales?id=…`).

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
| 3 | Sales List + Sale Order Detail screens (read-only, wired to mock data) | ✅ Done |
| 4 | Sale Order Create/Edit form with line items & totals | ✅ Done |
| 5 | Status transitions + basic Sales Dashboard stats | **Current phase** |
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
3. ~~Read-only Sales List + Sale Order Detail screens (Phase 3).~~ ✅ Done.
4. ~~Sale Order create/edit form with line items and live totals (Phase 4).~~ ✅ Done.
5. Status transitions (Draft → Pending → Confirmed → Shipped → Completed,
   Cancel from most states) and Sales Dashboard stats (Phase 5) — next up.
   `updateOrderStatus` already exists in the repository; the detail screen
   needs the action buttons, and the rules belong in `utils/orderRules.ts`.

---

## 11. Running the App

```bash
npm install
npx expo start        # then press i / a / w, or scan the QR code in Expo Go
npx expo start --web  # web preview via react-native-web (fastest way to check UI without a device/simulator)
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
```

The app has four themed tabs (Dashboard, Sales, Customers, More). Sales
shows the list of 16 mock orders (`/sales`); tapping one opens its detail
(`/sales/<id>`) with customer, line items, totals, and notes. The "+"
button creates an order (`/sales/new`) and the pencil on a draft/pending
order edits it (`/sales/<id>/edit`). New and edited orders live in memory
only, so they reset when the app reloads. Every screen handles loading,
error (with retry), and not-found/empty states. Dashboard, Customers, and
More are still static placeholders.
