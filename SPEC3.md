# SPEC3.md — RE Travel Admin Dashboard: Phase 3
> Spec-Driven Development Document — Phase 3
> Target Executor: Claude Code (Opus)
> Prerequisites: Phase 1 (SPEC.md) and Phase 2 (SPEC2.md) must be fully complete
> Method: Follow this spec exactly. No improvisation. No added libraries. No skipped steps.

---

## 0. PRIME DIRECTIVE

You are adding two features to the existing RE Travel Admin Dashboard:

**Feature 1 — Full Data Reactivity**
Every chart, KPI card, and stat on every page must update
automatically whenever any data changes (add/edit/delete booking,
customer, or destination). No stale numbers anywhere.

**Feature 2 — Floating Month/Year Picker (Calendar Filter)**
A floating button fixed on screen in every page. Clicking it opens
a custom month+year picker. All KPI cards and charts on the Overview
and Revenue pages filter their data based on the selected month/year.
This feature can be fully undone by running "undo calendar" — see
Section 10 for exact undo instructions.

Read this entire spec before writing a single line of code.
Follow Section 11 build order exactly, step by step.
Do not add any npm package not listed in Section 3.
Do not add any feature not described in this spec.
Do not use `any` TypeScript type anywhere.
If something is unclear, re-read the spec. This spec wins over
any existing code pattern that conflicts with it.

---

## 1. WHAT PHASE 3 ADDS

### 1.1 Feature 1 — Full Data Reactivity
Currently when a booking is added/edited/deleted, some derived
stats (used in charts and KPI cards on Overview) may not update
because TanStack Query cache is not fully invalidated.

Phase 3 fixes this by:
- Standardizing a complete cache invalidation list that runs after
  every single CRUD action anywhere in the app
- Making all chart data computed from live Zustand store state
- Making all KPI derived stats recomputed on every relevant mutation

### 1.2 Feature 2 — Floating Month/Year Picker
A floating circular button fixed at bottom-right of the screen,
visible on every page. It shows the currently selected month+year
as a short label (e.g. "Jan 24"). Clicking it opens a custom
month/year picker popup. Selecting a month+year updates a global
Zustand state value. All Overview and Revenue page stats and charts
re-filter based on that selection.

### 1.3 What is NOT changing
- No new pages
- No new npm packages (except one — see Section 3)
- No changes to Bookings, Customers, or Destinations pages
- No changes to any design, colors, fonts, or layout
- No changes to TypeScript types
- No changes to CRUD logic in Phase 2

---

## 2. ARCHITECTURE

### 2.1 Current data flow (Phase 1 + 2)
```
Mock JSON → seeded into Zustand store on app load
Zustand store → TanStack Query hooks (queryFn reads getState())
TanStack Query → page components → charts + KPI cards
CRUD actions → update Zustand → invalidate some query keys → UI updates
```

### 2.2 Problem with current flow
When a booking is added on the Bookings page, the code calls:
  queryClient.invalidateQueries({ queryKey: ['bookings'] })

But the Overview page uses ['bookings', 'stats'] and ['revenue']
query keys for its KPI cards and charts. These are NOT invalidated,
so Overview shows stale numbers until page refresh.

### 2.3 Fixed data flow after Phase 3
```
Any CRUD action anywhere
  → calls globalInvalidateAll(queryClient)
  → invalidates EVERY query key in the app
  → TanStack Query refetches all hooks from Zustand getState()
  → Every chart and KPI card updates immediately
```

### 2.4 Month filter data flow
```
User opens floating picker → selects month + year
→ Zustand store updates: selectedMonth (1-12), selectedYear (number)
→ Overview and Revenue page hooks receive selectedMonth + selectedYear
→ hooks filter booking/revenue data before returning
→ Charts and KPI cards show filtered data for that month only
```

---

## 3. NEW DEPENDENCIES

Only one new package is needed:

```bash
npm install date-fns
```

date-fns is already installed from Phase 1. No new packages needed.
Do not install anything new. All filtering logic uses plain
JavaScript array methods and the already-installed date-fns.

---

## 4. NEW AND MODIFIED FILES

### 4.1 New files to create
```
lib/utils/invalidateAll.ts       ← shared cache invalidation helper
components/calendar/
  MonthYearPicker.tsx             ← the custom month+year picker UI
  FloatingCalendarButton.tsx      ← the fixed floating button
```

### 4.2 Files to modify
```
lib/store/useDashboardStore.ts    ← add selectedMonth, selectedYear state
lib/hooks/useBookings.ts          ← add useFilteredBookingStats() hook
lib/hooks/useRevenue.ts           ← add useFilteredRevenue() hook
app/dashboard/layout.tsx          ← add FloatingCalendarButton here
app/dashboard/overview/page.tsx   ← use filtered hooks
app/dashboard/revenue/page.tsx    ← use filtered hooks

All form components that call CRUD actions:
  components/forms/BookingForm.tsx
  components/forms/CustomerForm.tsx
  components/forms/DestinationForm.tsx

All page files that call deleteBooking/deleteCustomer/deleteDestination:
  app/dashboard/bookings/page.tsx
  app/dashboard/customers/page.tsx
  app/dashboard/destinations/page.tsx
```

---

## 5. SHARED CACHE INVALIDATION HELPER

### File: `lib/utils/invalidateAll.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export function invalidateAll(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
  queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['bookings', 'filtered'] });
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['destinations'] });
  queryClient.invalidateQueries({ queryKey: ['destinations', 'top'] });
  queryClient.invalidateQueries({ queryKey: ['revenue'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'filtered'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'byDestination'] });
}
```

This function must be imported and called after every single CRUD
action in every component that performs add, update, or delete.

Replace ALL existing individual queryClient.invalidateQueries calls
in every form and page component with a single call to invalidateAll(queryClient).

Do not leave any individual invalidateQueries calls in any component.
They must all be replaced with invalidateAll(queryClient).

---

## 6. ZUSTAND STORE ADDITIONS

### File: `lib/store/useDashboardStore.ts`

Add these fields to the existing store interface. Do not remove
or change any existing field. Only add:

```typescript
// ─── CALENDAR FILTER STATE ──────────────────────────────────────
selectedMonth: number;        // 1 = January, 12 = December, 0 = ALL (no filter)
selectedYear: number;         // e.g. 2024
setSelectedMonth: (month: number) => void;
setSelectedYear: (year: number) => void;
resetCalendarFilter: () => void;  // sets selectedMonth to 0, year to 2024
```

Initial values in the store:
```typescript
selectedMonth: 0,          // 0 means "all months" — no filter active by default
selectedYear: 2024,        // default year matches mock data year
```

Implement the actions:
```typescript
setSelectedMonth: (month) => set({ selectedMonth: month }),
setSelectedYear: (year) => set({ selectedYear: year }),
resetCalendarFilter: () => set({ selectedMonth: 0, selectedYear: 2024 }),
```

---

## 7. UPDATED HOOKS

### 7.1 `lib/hooks/useBookings.ts` — add two new hooks

Keep all existing hooks exactly as they are (useBookings, useBooking,
useBookingStats). Add these two new hooks below the existing ones:

```typescript
// Returns bookings filtered by selectedMonth and selectedYear from store
// If selectedMonth is 0, returns ALL bookings for the selectedYear
export function useFilteredBookings() {
  return useQuery({
    queryKey: ['bookings', 'filtered'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      const { bookings, selectedMonth, selectedYear } = useDashboardStore.getState();
      return bookings.filter(b => {
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && (date.getMonth() + 1) === selectedMonth;
      });
    },
  });
}

// Returns derived stats from filtered bookings
export function useFilteredBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats', 'filtered'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      const { bookings, selectedMonth, selectedYear } = useDashboardStore.getState();
      const filtered = bookings.filter(b => {
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && (date.getMonth() + 1) === selectedMonth;
      });
      return {
        total: filtered.length,
        confirmed: filtered.filter(b => b.status === 'confirmed').length,
        pending: filtered.filter(b => b.status === 'pending').length,
        cancelled: filtered.filter(b => b.status === 'cancelled').length,
        totalRevenue: filtered
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + b.amount, 0),
        avgOrderValue: filtered.length > 0
          ? filtered.reduce((sum, b) => sum + b.amount, 0) / filtered.length
          : 0,
        // bookings grouped by month for trend chart (always full year)
        byMonth: Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthBookings = bookings.filter(b => {
            const d = new Date(b.departureDate);
            return d.getFullYear() === selectedYear && (d.getMonth() + 1) === month;
          });
          return {
            month: new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' }),
            bookings: monthBookings.length,
            confirmed: monthBookings.filter(b => b.status === 'confirmed').length,
            pending: monthBookings.filter(b => b.status === 'pending').length,
            cancelled: monthBookings.filter(b => b.status === 'cancelled').length,
          };
        }),
      };
    },
  });
}
```

Add ['bookings', 'stats', 'filtered'] to the invalidateAll function
in lib/utils/invalidateAll.ts.

### 7.2 `lib/hooks/useRevenue.ts` — add one new hook

Keep all existing hooks. Add below:

```typescript
// Returns revenue stats filtered by selectedMonth and selectedYear
export function useFilteredRevenueStats() {
  return useQuery({
    queryKey: ['revenue', 'filtered'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      const { bookings, selectedMonth, selectedYear } = useDashboardStore.getState();

      // Filter confirmed bookings only for revenue calculations
      const filtered = bookings.filter(b => {
        if (b.status !== 'confirmed') return false;
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && (date.getMonth() + 1) === selectedMonth;
      });

      // Revenue by destination from filtered bookings
      const byDestination = filtered.reduce<Record<string, number>>((acc, b) => {
        acc[b.destination] = (acc[b.destination] || 0) + b.amount;
        return acc;
      }, {});

      // Revenue by month for the selected year (always full year for chart)
      const byMonth = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthRevenue = bookings
          .filter(b => {
            const d = new Date(b.departureDate);
            return b.status === 'confirmed' &&
              d.getFullYear() === selectedYear &&
              (d.getMonth() + 1) === month;
          })
          .reduce((sum, b) => sum + b.amount, 0);
        return {
          month: new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' }),
          revenue: monthRevenue,
          bookings: bookings.filter(b => {
            const d = new Date(b.departureDate);
            return d.getFullYear() === selectedYear && (d.getMonth() + 1) === month;
          }).length,
        };
      });

      return {
        totalRevenue: filtered.reduce((sum, b) => sum + b.amount, 0),
        totalBookings: filtered.length,
        avgPerBooking: filtered.length > 0
          ? filtered.reduce((sum, b) => sum + b.amount, 0) / filtered.length
          : 0,
        byDestination: Object.entries(byDestination).map(([destination, revenue]) => ({
          destination,
          revenue,
        })),
        byMonth,
        // Cancelled revenue = lost revenue
        cancelledRevenue: bookings
          .filter(b => {
            if (b.status !== 'cancelled') return false;
            const date = new Date(b.departureDate);
            const yearMatch = date.getFullYear() === selectedYear;
            if (selectedMonth === 0) return yearMatch;
            return yearMatch && (date.getMonth() + 1) === selectedMonth;
          })
          .reduce((sum, b) => sum + b.amount, 0),
      };
    },
  });
}
```

---

## 8. FLOATING CALENDAR BUTTON AND PICKER

### 8.1 Design rules for the picker UI

The picker must match the existing Pop-Art Memphis design system:
- Background: var(--surface)
- Border: 2.5px solid var(--ink) — solid border, NOT hand-border
- Border-radius: 14px
- Font: Cabin for all text, Permanent Marker for the selected display
- Colors: use pop palette variables from globals.css
- Box shadow on popup: 6px 6px 0px var(--ink)
- No glassmorphism, no gradients, no blur

### 8.2 `components/calendar/FloatingCalendarButton.tsx`

This is a 'use client' component.

**The floating button:**
- position: fixed, bottom: 24px, right: 24px
- z-index: 50
- Shape: pill button (border-radius: 999px)
- Width: auto, padding: 10px 18px
- Background: var(--pop-yellow)
- Border: 2.5px solid var(--ink)
- cursor: pointer
- box-shadow: 3px 3px 0px var(--ink) (default state)
- On hover: transform translate(-2px, -2px), box-shadow 5px 5px 0px var(--ink)
- transition: transform 150ms ease, box-shadow 150ms ease

**Button content:**
- Left: a small calendar emoji or Lucide Calendar icon (size 16px)
- Right: the selected month+year as short text
  - If selectedMonth is 0: show just the year e.g. "2024"
  - If selectedMonth is 1-12: show "Jan 2024" format
  - Font: Cabin, font-weight 700, font-size 13px, color var(--ink)
- Gap between icon and text: 6px

**Popup behavior:**
- Clicking the button toggles a popup open/closed
- Popup appears ABOVE the button (bottom: 100%, margin-bottom: 12px)
- Clicking outside the popup closes it
- Use a useEffect with document click listener for outside click detection

### 8.3 `components/calendar/MonthYearPicker.tsx`

This is the popup content component. It receives no props —
it reads and writes directly to Zustand store.

**Popup layout:**
```
┌─────────────────────────────────┐
│  ◀  2024  ▶                     │  ← year navigation row
│                                 │
│  Jan  Feb  Mar  Apr             │
│  May  Jun  Jul  Aug             │
│  Sep  Oct  Nov  Dec             │  ← month grid (3 per row, 4 rows)
│                                 │
│  [Show All Year]                │  ← reset button
└─────────────────────────────────┘
```

**Year navigation row:**
- Left arrow: Lucide ChevronLeft icon, onClick decrements selectedYear by 1
- Year number: .font-marker class, font-size 1.2rem, color var(--ink)
- Right arrow: Lucide ChevronRight icon, onClick increments selectedYear by 1
- Min year: 2020, Max year: 2026 (clamp, disable arrow if at limit)
- Disabled arrow: opacity 0.3, cursor not-allowed

**Month grid:**
- 12 month buttons arranged in 4 columns × 3 rows
- Each month button:
  - Text: 3-letter month abbreviation (Jan, Feb, Mar...)
  - Font: Cabin, font-weight 600, font-size 12px
  - Padding: 8px 4px
  - Border-radius: 10px
  - Border: 1.5px solid transparent (default)
  - Background: transparent (default)
  - Color: var(--ink-muted)
  - cursor: pointer
  - transition: all 120ms ease
  - On hover:
      background: var(--surface-hover)
      border-color: var(--ink-faint)
      color: var(--ink)
  - SELECTED state (when month === selectedMonth AND year === selectedYear):
      background: var(--pop-red)
      border-color: var(--ink)
      color: #FFFFFF
      font-weight: 700

- Clicking a month button:
    calls setSelectedMonth(monthNumber) and setSelectedYear(currentYear)
    closes the popup (calls onClose prop or internal toggle)

**"Show All Year" button:**
- At the bottom of the popup, full width
- Text: "Show All Year"
- Style: outline button style from existing design system
  (background transparent, border 2.5px solid var(--ink),
   border-radius: 14px, font Cabin, font-weight 700,
   font-size 12px, text-transform uppercase)
- On click: calls resetCalendarFilter() from Zustand store
  This sets selectedMonth to 0, which means no month filter

**Popup dimensions:**
- width: 260px
- padding: 16px

### 8.4 Add FloatingCalendarButton to layout

In `app/dashboard/layout.tsx`:
Import FloatingCalendarButton and render it inside the main
layout JSX, after the sidebar and header, at the same level
as the main content area but outside of it so it floats freely:

```tsx
// Inside the layout return, at the very end before closing tag:
<FloatingCalendarButton />
```

This makes it appear on every dashboard page automatically.

---

## 9. PAGE UPDATES — OVERVIEW AND REVENUE

### 9.1 Overview page (`app/dashboard/overview/page.tsx`)

**Replace ALL data hook calls on this page:**

Current hooks used → Replace with:
  useBookingStats()     → useFilteredBookingStats()
  useMonthlyRevenue()   → useFilteredRevenueStats()
  useBookings() (for recent bookings table) → keep useBookings() unchanged
  useTopDestinations()  → keep as-is, not filtered by month

**KPI cards — update data sources:**

Card 1 - Total Bookings:
  value: filteredStats.data?.total
  Show subtitle text that reflects filter:
    If selectedMonth === 0: "All of {selectedYear}"
    If selectedMonth > 0: "{MonthName} {selectedYear}"
  Get selectedMonth and selectedYear from useDashboardStore()

Card 2 - Total Revenue:
  value: filteredRevenueStats.data?.totalRevenue formatted as currency

Card 3 - Total Customers:
  This does NOT filter by month — customers are not time-filtered
  Keep using useCustomerStats() unchanged

Card 4 - Top Destination:
  Keep using useTopDestinations(1) unchanged

**Charts — update data sources:**

BookingsTrendChart:
  Currently uses monthly bookings data.
  Pass filteredStats.data?.byMonth as the chart data.
  The byMonth array always contains all 12 months for the selected year.
  The selected month's bar/point must be visually highlighted:
    Pass selectedMonth as a prop to the chart component.
    In the chart, if a data point's index+1 === selectedMonth,
    render it with a different fill color: var(--pop-red).
    All other points use the default chart color.
    If selectedMonth === 0, all points use default color (no highlight).

BookingStatusChart (donut):
  Pass filteredStats.data confirmed/pending/cancelled counts as data.
  These update based on the filtered month.

RevenueByDestChart:
  Pass filteredRevenueStats.data?.byDestination as data.

MonthlyRevenueChart:
  Pass filteredRevenueStats.data?.byMonth as data.
  Same highlight logic as BookingsTrendChart:
    selected month's bar highlighted with var(--pop-green).

### 9.2 Revenue page (`app/dashboard/revenue/page.tsx`)

**Replace ALL data hook calls:**
  useMonthlyRevenue()    → useFilteredRevenueStats()
  useRevenueStats()      → derive from useFilteredRevenueStats()
  useRevenueByDestination() → use filteredRevenueStats.data?.byDestination

**KPI cards — update:**
  Total Revenue 2024 card title → change to "Total Revenue {selectedYear}"
  All values derive from filteredRevenueStats

**Charts — update:**
  All charts on Revenue page use filteredRevenueStats data
  Same month highlight logic as Overview page

**Monthly breakdown table:**
  This table shows all 12 months.
  The currently selected month's row must be highlighted:
    background: var(--pop-yellow) with color: #1C1C1E
    (same as table header yellow treatment from existing design)
  If selectedMonth === 0, no row is highlighted.

---

## 10. UNDO CALENDAR — EXACT REMOVAL INSTRUCTIONS

If the user types "undo calendar" at any point, execute these steps
and ONLY these steps. Do not touch anything else.

**Files to delete entirely:**
  components/calendar/MonthYearPicker.tsx
  components/calendar/FloatingCalendarButton.tsx
  components/calendar/ (the whole folder if empty after deletion)

**Files to modify:**

`lib/store/useDashboardStore.ts`:
  Remove: selectedMonth field and initial value
  Remove: selectedYear field and initial value (keep the existing
    selectedYear used for UI filters if it existed before Phase 3,
    otherwise remove entirely)
  Remove: setSelectedMonth action
  Remove: setSelectedYear action (if added in Phase 3 — check if
    it existed before Phase 3 first)
  Remove: resetCalendarFilter action

`lib/hooks/useBookings.ts`:
  Remove: useFilteredBookings() function entirely
  Remove: useFilteredBookingStats() function entirely
  Keep: all original hooks unchanged

`lib/hooks/useRevenue.ts`:
  Remove: useFilteredRevenueStats() function entirely
  Keep: all original hooks unchanged

`lib/utils/invalidateAll.ts`:
  Remove: ['bookings', 'filtered'] line
  Remove: ['bookings', 'stats', 'filtered'] line
  Remove: ['revenue', 'filtered'] line
  Keep: all other invalidation lines

`app/dashboard/layout.tsx`:
  Remove: FloatingCalendarButton import
  Remove: <FloatingCalendarButton /> from JSX

`app/dashboard/overview/page.tsx`:
  Replace: useFilteredBookingStats() → useBookingStats()
  Replace: useFilteredRevenueStats() → useMonthlyRevenue() + useRevenueStats()
  Remove: selectedMonth highlight logic from all charts
  Remove: dynamic subtitle text from KPI cards (revert to static text)

`app/dashboard/revenue/page.tsx`:
  Replace: useFilteredRevenueStats() → original revenue hooks
  Remove: selectedMonth row highlight from monthly breakdown table
  Remove: dynamic year in KPI card titles (revert to static "2024")

After undo, run full TypeScript check to confirm zero errors.

---

## 11. BUILD ORDER (follow exactly, no reordering)

```
Step 1:  Create lib/utils/invalidateAll.ts with all query keys (Section 5)

Step 2:  Update lib/store/useDashboardStore.ts
         Add selectedMonth (default 0), selectedYear (default 2024),
         setSelectedMonth, setSelectedYear, resetCalendarFilter (Section 6)

Step 3:  Update lib/hooks/useBookings.ts
         Add useFilteredBookings() and useFilteredBookingStats() (Section 7.1)

Step 4:  Update lib/hooks/useRevenue.ts
         Add useFilteredRevenueStats() (Section 7.2)

Step 5:  Replace ALL individual queryClient.invalidateQueries calls
         in every form and page component with invalidateAll(queryClient)
         Files: BookingForm.tsx, CustomerForm.tsx, DestinationForm.tsx,
         bookings/page.tsx, customers/page.tsx, destinations/page.tsx
         (Section 5)

Step 6:  Create components/calendar/MonthYearPicker.tsx (Section 8.3)

Step 7:  Create components/calendar/FloatingCalendarButton.tsx (Section 8.2)

Step 8:  Add FloatingCalendarButton to app/dashboard/layout.tsx (Section 8.4)

Step 9:  Update app/dashboard/overview/page.tsx
         Switch to filtered hooks, update KPI cards, update chart data,
         add month highlight logic to charts (Section 9.1)

Step 10: Update app/dashboard/revenue/page.tsx
         Switch to filtered hooks, update KPI cards, update charts,
         add month row highlight to table (Section 9.2)

Step 11: Final verification — run through quality checklist (Section 12)
```

---

## 12. QUALITY CHECKLIST

Before considering Phase 3 complete, verify every item:

### Reactivity
- [ ] Add a booking → Overview Total Bookings KPI updates immediately
- [ ] Delete a booking → Overview Total Bookings KPI updates immediately
- [ ] Add a confirmed booking → Overview Total Revenue KPI updates immediately
- [ ] Edit a booking status confirmed→cancelled → revenue drops immediately
- [ ] Add a customer → Customers KPI card on Overview updates
- [ ] All chart data on Overview refreshes after any booking mutation

### Calendar Filter — Floating Button
- [ ] Floating button visible on every dashboard page
- [ ] Button shows "2024" when no month selected (selectedMonth === 0)
- [ ] Button shows "Jan 2024" format when month is selected
- [ ] Clicking button opens the picker popup above the button
- [ ] Clicking outside the popup closes it
- [ ] Popup matches Pop-Art design (yellow selected month, dark border,
      Cabin font, box-shadow offset, no blur, no glass)

### Calendar Filter — Year Navigation
- [ ] Left arrow decrements year, right arrow increments year
- [ ] Year cannot go below 2020
- [ ] Year cannot go above 2026
- [ ] Arrows are visually disabled (opacity 0.3) at the limits

### Calendar Filter — Month Selection
- [ ] Clicking a month highlights it in pop-red
- [ ] Previously selected month deselects when new one clicked
- [ ] "Show All Year" resets to selectedMonth === 0
- [ ] Selected month persists when navigating between pages

### Calendar Filter — Data Filtering
- [ ] Selecting January 2024 → Overview KPI cards show only Jan 2024 data
- [ ] Selecting January 2024 → BookingsTrendChart highlights January bar/point
- [ ] Selecting January 2024 → BookingStatusChart shows only Jan 2024 counts
- [ ] Selecting January 2024 → Revenue page shows only Jan 2024 revenue
- [ ] Selecting January 2024 → Monthly breakdown table highlights January row
- [ ] Clicking "Show All Year" → all data shows full year again
- [ ] Customers KPI card and Top Destination are NOT affected by month filter
- [ ] Bookings/Customers/Destinations pages are NOT affected by month filter

### Code Quality
- [ ] No `any` TypeScript types added
- [ ] No new npm packages installed
- [ ] invalidateAll() is called after every CRUD action
- [ ] No individual invalidateQueries calls remain in any component
- [ ] FloatingCalendarButton is in layout.tsx not in individual pages
- [ ] Zero TypeScript compilation errors

---

## 13. WHAT NOT TO DO

- Do NOT add any npm package not already installed
- Do NOT change any existing TypeScript interface or type
- Do NOT touch Bookings, Customers, or Destinations page data or logic
- Do NOT apply month filtering to useTopDestinations or useCustomerStats
- Do NOT change any design, color, font, layout, or styling
- Do NOT use `any` TypeScript type
- Do NOT leave any individual invalidateQueries call in any component
- Do NOT change the floating button position (bottom-right is fixed)
- Do NOT add animation to the calendar popup beyond simple opacity/transform
- Do NOT add day-level filtering — months and years only
- Do NOT add multiple month selection — one month at a time only

---

*End of SPEC3.md — RE Travel Admin Dashboard Phase 3*
*Version 1.0 | Generated for Claude Code execution*
*Prerequisites: SPEC.md Phase 1 + SPEC2.md Phase 2 must be fully complete*
