# SPEC2.md — RE Travel Admin Dashboard: Phase 2 (Control Layer)
> Spec-Driven Development Document — Phase 2  
> Target Executor: Claude Code (Opus)  
> Prerequisites: Phase 1 (SPEC.md) must be fully implemented before starting this spec  
> Method: Follow this spec exactly. No improvisation. No added libraries. No skipped steps.

---

## 0. PRIME DIRECTIVE

You are extending the existing RE Travel Admin Dashboard with a full **Control Layer** — the ability to Add, Edit, and Delete all business data directly from the dashboard UI.

This is a **frontend-only** project. There is no backend. All data mutations happen in the **Zustand store**. The Zustand store is the single source of truth for all data in Phase 2.

Read this entire spec before writing a single line of code. Follow the build order in Section 12 exactly. Do not reorder steps. Do not add libraries not listed in Section 3. Do not skip sections. Do not improvise any UI pattern not described here.

---

## 1. WHAT PHASE 2 ADDS

Phase 1 built an **analytics dashboard** — data is displayed but cannot be changed.

Phase 2 transforms it into a **full admin dashboard** — the admin can:
- **Add** new bookings, customers, and destinations
- **Edit** any existing booking, customer, or destination
- **Delete** any booking, customer, or destination
- **Quick-change** a booking status directly from the table without opening a form
- Receive **toast notifications** for every action confirming success or failure

Pages affected: Bookings, Customers, Destinations.
Pages NOT affected: Overview, Revenue (analytics-only, no changes needed).

---

## 2. ARCHITECTURE CHANGE: DATA LAYER

This is the most critical architectural change in Phase 2. Read this section carefully.

### 2.1 Phase 1 Data Flow (Read-Only)
```
/lib/data/bookings.ts (JSON)
         ↓
useBookings() hook (TanStack Query)
         ↓
BookingsTable (display only)
```

### 2.2 Phase 2 Data Flow (Read + Write)
```
/lib/data/bookings.ts (JSON) ← seed data only, never modified
         ↓ (initial load once)
Zustand Store (useDashboardStore)  ← single source of truth
         ↑↓
CRUD actions (add/update/delete)
         ↓
useBookings() hook (reads from Zustand, not JSON)
         ↓
TanStack Query cache (invalidated after every mutation)
         ↓
BookingsTable (re-renders with updated data)
```

### 2.3 Why this architecture

The mock JSON files are static — they cannot be mutated at runtime. Zustand is an in-memory reactive store that can be mutated and triggers re-renders across the entire app. By seeding Zustand from the JSON files on app load and then reading everything from Zustand, we get a fully functional CRUD system with zero backend.

TanStack Query sits between Zustand and the UI to preserve the loading state, error handling, and caching patterns already built in Phase 1. After every mutation, we call `queryClient.invalidateQueries()` to force TanStack Query to re-fetch from Zustand, which gives us instant UI updates.

### 2.4 Zustand store initialization

The Zustand store must be initialized with data from the mock JSON files **once** when the app loads. This is done by seeding the store's initial state directly from the imported JSON data arrays.

```typescript
// Inside useDashboardStore initial state
bookings: bookingsData,      // imported from /lib/data/bookings.ts
customers: customersData,    // imported from /lib/data/customers.ts
destinations: destinationsData, // imported from /lib/data/destinations.ts
```

This means the JSON files are imported at the store level only. No other file should import directly from the JSON data files after Phase 2. All data access goes through Zustand.

---

## 3. LIBRARIES

### 3.1 New shadcn components to install (ONLY these two)
```bash
npx shadcn@latest add sonner
npx shadcn@latest add toast
```

Use **Sonner** for all toast notifications. It is simpler, more modern, and better looking than shadcn's default toast. After installing, use only Sonner — do not use shadcn's toast component.

### 3.2 No other new libraries

Every library needed for Phase 2 is already installed from Phase 1:
- `react-hook-form` → form state management
- `zod` → validation schemas
- `@hookform/resolvers` → connects zod to react-hook-form
- `zustand` → data store and mutations
- `@tanstack/react-query` → cache invalidation after mutations
- `lucide-react` → all icons (Plus, Pencil, Trash2, MoreHorizontal, Loader2)
- All shadcn components (Dialog, Form, Input, Select, Button, etc.)

Do not install anything else.

---

## 4. NEW FILES TO CREATE

Create these files. Do not modify the folder structure from Phase 1.

```
components/
├── forms/
│   ├── BookingForm.tsx          ← Add/Edit booking form
│   ├── CustomerForm.tsx         ← Add/Edit customer form
│   └── DestinationForm.tsx      ← Add/Edit destination form
└── shared/
    ├── ConfirmDialog.tsx        ← Reusable delete confirmation dialog
    └── ActionMenu.tsx           ← Reusable table row action dropdown
```

---

## 5. FILES TO MODIFY FROM PHASE 1

These existing files must be updated:

```
lib/store/useDashboardStore.ts   ← Add data arrays + all CRUD actions
lib/hooks/useBookings.ts         ← Read from Zustand instead of JSON
lib/hooks/useCustomers.ts        ← Read from Zustand instead of JSON
lib/hooks/useDestinations.ts     ← Read from Zustand instead of JSON
app/layout.tsx                   ← Add Sonner <Toaster /> component
components/tables/BookingsTable.tsx      ← Add Actions column
components/tables/CustomersTable.tsx     ← Add Actions column
components/tables/columns/bookingColumns.tsx  ← Add actions column definition
components/tables/columns/customerColumns.tsx ← Add actions column definition
components/cards/DestinationCard.tsx     ← Add Edit/Delete buttons
components/shared/StatusBadge.tsx        ← Make clickable for quick status change
app/dashboard/bookings/page.tsx          ← Add "Add Booking" button + dialogs
app/dashboard/customers/page.tsx         ← Add "Add Customer" button + dialogs
app/dashboard/destinations/page.tsx      ← Add "Add Destination" button + dialogs
```

---

## 6. ZUSTAND STORE — FULL SPECIFICATION

### File: `/lib/store/useDashboardStore.ts`

Replace the entire existing store with this complete interface. Keep all existing UI state from Phase 1 and add everything below.

```typescript
import { create } from 'zustand';
import { bookings as bookingsData } from '@/lib/data/bookings';
import { customers as customersData } from '@/lib/data/customers';
import { destinations as destinationsData } from '@/lib/data/destinations';
import type { Booking } from '@/types/booking';
import type { Customer } from '@/types/customer';
import type { Destination } from '@/types/destination';

interface DashboardStore {
  // ─── EXISTING UI STATE FROM PHASE 1 (keep as-is) ───────────────────────
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  bookingStatusFilter: 'all' | 'confirmed' | 'pending' | 'cancelled';
  setBookingStatusFilter: (status: 'all' | 'confirmed' | 'pending' | 'cancelled') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // ─── DATA COLLECTIONS ───────────────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];
  destinations: Destination[];

  // ─── BOOKING ACTIONS ────────────────────────────────────────────────────
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, updates: Partial<Omit<Booking, 'id' | 'createdAt'>>) => void;
  deleteBooking: (id: string) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;

  // ─── CUSTOMER ACTIONS ───────────────────────────────────────────────────
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedAt' | 'avatarUrl'>) => void;
  updateCustomer: (id: string, updates: Partial<Omit<Customer, 'id' | 'joinedAt' | 'avatarUrl'>>) => void;
  deleteCustomer: (id: string) => void;

  // ─── DESTINATION ACTIONS ─────────────────────────────────────────────────
  addDestination: (destination: Omit<Destination, 'id'>) => void;
  updateDestination: (id: string, updates: Partial<Omit<Destination, 'id'>>) => void;
  deleteDestination: (id: string) => void;
}
```

### ID Generation Rules (implement exactly as shown)

```typescript
// Booking ID: BK-031, BK-032, etc.
const newId = `BK-${String(get().bookings.length + 1).padStart(3, '0')}`;

// Customer ID: CU-026, CU-027, etc.
const newId = `CU-${String(get().customers.length + 1).padStart(3, '0')}`;

// Destination ID: DS-011, DS-012, etc.
const newId = `DS-${String(get().destinations.length + 1).padStart(3, '0')}`;
```

### createdAt and joinedAt for new records

```typescript
// For new bookings
createdAt: new Date().toISOString().split('T')[0],

// For new customers
joinedAt: new Date().toISOString().split('T')[0],
avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
```

### Initial state

```typescript
const useDashboardStore = create<DashboardStore>((set, get) => ({
  // seed data from JSON files
  bookings: bookingsData,
  customers: customersData,
  destinations: destinationsData,

  // all actions implemented with set()
}));
```

---

## 7. TANSTACK QUERY HOOKS — UPDATED

### Pattern for all hooks after Phase 2

All hooks must read from Zustand store using `getState()`, not from the JSON files directly.

### `/lib/hooks/useBookings.ts` — Full rewrite

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/lib/store/useDashboardStore';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return useDashboardStore.getState().bookings;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const booking = useDashboardStore.getState().bookings.find(b => b.id === id);
      if (!booking) throw new Error(`Booking ${id} not found`);
      return booking;
    },
    enabled: !!id,
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const bookings = useDashboardStore.getState().bookings;
      return {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + b.amount, 0),
        avgOrderValue: bookings.length > 0
          ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length
          : 0,
      };
    },
  });
}
```

Apply the exact same pattern to `useCustomers.ts` and `useDestinations.ts` — read from `useDashboardStore.getState().customers` and `useDashboardStore.getState().destinations` respectively.

### Cache invalidation helper

Create this helper inside each hook file or in a shared utils file:

```typescript
// After every CRUD action in a component, call:
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['bookings'] });
// This forces TanStack Query to re-fetch from Zustand, updating all UI instantly.
```

---

## 8. NEW SHARED COMPONENTS

### 8.1 `components/shared/ConfirmDialog.tsx`

This component is used for all delete confirmations across the entire dashboard. Build it once, use it everywhere.

**Props interface:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;      // default: "Delete"
  isLoading?: boolean;        // shows spinner on confirm button when true
}
```

**Visual structure:**
```
┌─────────────────────────────────────────┐
│  [AlertTriangle icon]  Delete Booking   │
│                                         │
│  Are you sure you want to delete        │
│  booking BK-001? This action cannot     │
│  be undone.                             │
│                                         │
│           [Cancel]  [Delete ●]          │
└─────────────────────────────────────────┘
```

**Behavior rules:**
- Uses shadcn Dialog component as base
- AlertTriangle icon (lucide-react) in amber/warning color in the title area
- Cancel button: shadcn Button variant="outline" — calls `onClose()`
- Delete/Confirm button: shadcn Button variant="destructive" (red) — calls `onConfirm()`
- When `isLoading` is true: confirm button shows Loader2 spinning icon and is disabled
- When `isLoading` is true: cancel button is also disabled
- Clicking outside the dialog (overlay) calls `onClose()` only if `isLoading` is false
- The `title` and `description` props are fully dynamic so this component works for bookings, customers, and destinations

---

### 8.2 `components/shared/ActionMenu.tsx`

This component renders a three-dot dropdown menu for each table row.

**Props interface:**
```typescript
interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;    // default: "Edit"
  deleteLabel?: string;  // default: "Delete"
}
```

**Visual structure:**
```
[⋮] ← MoreHorizontal icon button (ghost variant)
  ↓ dropdown opens
┌──────────────┐
│ ✏ Edit       │
│ ─────────    │
│ 🗑 Delete    │  ← red text color
└──────────────┘
```

**Behavior rules:**
- Uses shadcn DropdownMenu as base
- Trigger: shadcn Button variant="ghost" size="icon" with MoreHorizontal lucide icon
- Edit item: Pencil icon + editLabel text, calls `onEdit()`
- Separator between Edit and Delete
- Delete item: Trash2 icon + deleteLabel text, text color red (`text-destructive`), calls `onDelete()`
- Dropdown closes automatically after either item is clicked

---

## 9. FORM COMPONENTS — FULL SPECIFICATION

All three forms follow the exact same structural pattern. Build them consistently.

### 9.1 Form Pattern (applies to ALL three forms)

Every form component:
- Accepts `booking?: Booking` (or customer/destination) — if provided, form is in **edit mode** pre-filled with existing data; if undefined, form is in **add mode** with empty fields
- Accepts `onSuccess: () => void` — called after successful submit to close the parent dialog
- Uses `useForm` from react-hook-form with `zodResolver`
- Uses `mode: 'onChange'` so validation errors appear as user types
- Has a submit handler that: (1) simulates 600ms async delay, (2) calls the appropriate Zustand action, (3) invalidates TanStack Query cache, (4) shows Sonner toast, (5) calls `onSuccess()`
- Submit button text: **"Add [Entity]"** in add mode, **"Save Changes"** in edit mode
- Submit button shows Loader2 spinning icon and is disabled during the 600ms submit delay
- Cancel is handled by the parent dialog, not inside the form

### 9.2 `components/forms/BookingForm.tsx`

**Zod Schema:**
```typescript
const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerId: z.string().min(1, 'Customer ID is required'),
  destination: z.string().min(1, 'Please select a destination'),
  packageName: z.string().min(2, 'Package name must be at least 2 characters'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  travelers: z.coerce.number().min(1, 'At least 1 traveler required').max(20, 'Maximum 20 travelers'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
}).refine(
  data => new Date(data.returnDate) > new Date(data.departureDate),
  { message: 'Return date must be after departure date', path: ['returnDate'] }
);
```

**Form Fields Layout:**
```
Row 1: [Customer Name (full width)]
Row 2: [Customer ID] [Destination (Select)]
Row 3: [Package Name (full width)]
Row 4: [Departure Date] [Return Date]
Row 5: [Travelers] [Amount ($)]
Row 6: [Status (Select - full width)]
```

**Destination Select options:** Dynamically loaded from `useDestinations()` hook — show all destination names as options.

**Status Select options:** Confirmed | Pending | Cancelled

**Date inputs:** Use shadcn Input type="date" (not the Calendar datepicker — too complex for a form). Format: YYYY-MM-DD.

**Zustand action to call:**
- Add mode: `addBooking(formData)`
- Edit mode: `updateBooking(booking.id, formData)`

**TanStack Query keys to invalidate after submit:**
```typescript
queryClient.invalidateQueries({ queryKey: ['bookings'] });
```

**Sonner toast messages:**
- Add mode success: `toast.success('Booking added successfully')`
- Edit mode success: `toast.success('Booking updated successfully')`
- Error (if Zustand throws): `toast.error('Something went wrong. Please try again.')`

---

### 9.3 `components/forms/CustomerForm.tsx`

**Zod Schema:**
```typescript
const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(1, 'Please select a country'),
  totalBookings: z.coerce.number().min(0, 'Cannot be negative'),
  totalSpent: z.coerce.number().min(0, 'Cannot be negative'),
});
```

**Form Fields Layout:**
```
Row 1: [Full Name (full width)]
Row 2: [Email Address (full width)]
Row 3: [Country (Select - full width)]
Row 4: [Total Bookings] [Total Spent ($)]
```

**Country Select options (exact list):**
Egypt, UAE, Saudi Arabia, USA, UK, Germany, France, Italy, Japan, Australia, Canada, Spain, Netherlands, Sweden, Norway, Brazil, India, China, South Korea, Singapore

**Zustand action to call:**
- Add mode: `addCustomer(formData)`
- Edit mode: `updateCustomer(customer.id, formData)`

**TanStack Query keys to invalidate:**
```typescript
queryClient.invalidateQueries({ queryKey: ['customers'] });
```

**Sonner toast messages:**
- Add: `toast.success('Customer added successfully')`
- Edit: `toast.success('Customer updated successfully')`
- Error: `toast.error('Something went wrong. Please try again.')`

---

### 9.4 `components/forms/DestinationForm.tsx`

**Zod Schema:**
```typescript
const destinationSchema = z.object({
  name: z.string().min(2, 'Destination name must be at least 2 characters'),
  country: z.string().min(2, 'Country name must be at least 2 characters'),
  continent: z.enum(['Africa', 'Asia', 'Europe', 'Americas', 'Oceania', 'Middle East']),
  imageUrl: z.string().url('Please enter a valid image URL'),
  totalBookings: z.coerce.number().min(0, 'Cannot be negative'),
  totalRevenue: z.coerce.number().min(0, 'Cannot be negative'),
  averageRating: z.coerce.number().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  coordinates: z.object({
    lat: z.coerce.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
    lng: z.coerce.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  }),
  popularMonths: z.string().min(1, 'Enter at least one month'),
});
```

**Form Fields Layout:**
```
Row 1: [Destination Name] [Country]
Row 2: [Continent (Select)] [Image URL]
Row 3: [Total Bookings] [Total Revenue ($)]
Row 4: [Average Rating (1-5)] [Latitude] [Longitude]
Row 5: [Popular Months (full width — comma separated text input)]
```

**Popular Months field note:**
Input is a plain text Input where admin types months separated by commas: `"June, July, August"`. On submit, split by comma and trim whitespace to produce `string[]` before passing to Zustand.

**Continent Select options:** Africa | Asia | Europe | Americas | Oceania | Middle East

**Image URL field note:** Show a small preview of the image below the input if the URL is valid (use Next.js `<Image>` with error handling — if image fails to load, show a gray placeholder box).

**Zustand action to call:**
- Add mode: `addDestination(formData)`
- Edit mode: `updateDestination(destination.id, formData)`

**TanStack Query keys to invalidate:**
```typescript
queryClient.invalidateQueries({ queryKey: ['destinations'] });
```

**Sonner toast messages:**
- Add: `toast.success('Destination added successfully')`
- Edit: `toast.success('Destination updated successfully')`
- Error: `toast.error('Something went wrong. Please try again.')`

---

## 10. PAGE CHANGES — DETAILED

### 10.1 Bookings Page (`app/dashboard/bookings/page.tsx`)

#### State to add inside the page component:
```typescript
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
const { deleteBooking } = useDashboardStore();
const queryClient = useQueryClient();
```

#### PageHeader change:
Add "Add Booking" button to the right side of PageHeader:
```tsx
<Button onClick={() => setIsAddDialogOpen(true)}>
  <Plus className="mr-2 h-4 w-4" />
  Add Booking
</Button>
```

#### Three dialogs to add below the table:

**Dialog 1 — Add Booking:**
```tsx
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Add New Booking</DialogTitle>
      <DialogDescription>
        Fill in the details below to create a new booking.
      </DialogDescription>
    </DialogHeader>
    <BookingForm onSuccess={() => setIsAddDialogOpen(false)} />
  </DialogContent>
</Dialog>
```

**Dialog 2 — Edit Booking:**
```tsx
<Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Booking</DialogTitle>
      <DialogDescription>
        Update the booking details below.
      </DialogDescription>
    </DialogHeader>
    {editingBooking && (
      <BookingForm
        booking={editingBooking}
        onSuccess={() => setEditingBooking(null)}
      />
    )}
  </DialogContent>
</Dialog>
```

**Dialog 3 — Delete Confirmation:**
```tsx
<ConfirmDialog
  isOpen={!!deletingBooking}
  onClose={() => setDeletingBooking(null)}
  onConfirm={handleDeleteBooking}
  title="Delete Booking"
  description={`Are you sure you want to delete booking ${deletingBooking?.id}? This action cannot be undone.`}
  isLoading={isDeleting}
/>
```

#### Delete handler:
```typescript
async function handleDeleteBooking() {
  if (!deletingBooking) return;
  setIsDeleting(true);
  await new Promise(resolve => setTimeout(resolve, 600));
  deleteBooking(deletingBooking.id);
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
  toast.success('Booking deleted successfully');
  setIsDeleting(false);
  setDeletingBooking(null);
}
```

#### Passing handlers to BookingsTable:
Pass these as props to BookingsTable:
```typescript
onEdit={(booking) => setEditingBooking(booking)}
onDelete={(booking) => setDeletingBooking(booking)}
```

---

### 10.2 BookingsTable and Column Changes

#### `components/tables/columns/bookingColumns.tsx`

Add an Actions column as the **last column** in the columns array:

```typescript
{
  id: 'actions',
  header: '',            // empty header
  cell: ({ row }) => {
    const booking = row.original;
    return (
      <ActionMenu
        onEdit={() => onEdit(booking)}
        onDelete={() => onDelete(booking)}
      />
    );
  },
  enableSorting: false,
  size: 48,              // narrow column, just fits the icon button
}
```

Because column definitions need access to `onEdit` and `onDelete` callbacks, the columns must be defined inside a function that accepts these callbacks:

```typescript
export function createBookingColumns(
  onEdit: (booking: Booking) => void,
  onDelete: (booking: Booking) => void,
): ColumnDef<Booking>[]
```

#### `components/tables/BookingsTable.tsx`

Add props:
```typescript
interface BookingsTableProps {
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}
```

Replace `bookingColumns` with `createBookingColumns(onEdit, onDelete)`.

#### Status Quick-Edit in BookingsTable

In the status column cell renderer, wrap StatusBadge in a button:

```tsx
cell: ({ row }) => {
  const booking = row.original;
  const { updateBookingStatus } = useDashboardStore();
  const queryClient = useQueryClient();

  function cycleStatus() {
    const cycle: Record<BookingStatus, BookingStatus> = {
      confirmed: 'pending',
      pending: 'cancelled',
      cancelled: 'confirmed',
    };
    const newStatus = cycle[booking.status];
    updateBookingStatus(booking.id, newStatus);
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    toast.success(`Status updated to ${newStatus}`);
  }

  return (
    <button
      onClick={cycleStatus}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      title="Click to change status"
    >
      <StatusBadge status={booking.status} />
    </button>
  );
}
```

---

### 10.3 Customers Page (`app/dashboard/customers/page.tsx`)

Apply the exact same pattern as the Bookings page:

#### State:
```typescript
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

#### PageHeader change:
```tsx
<Button onClick={() => setIsAddDialogOpen(true)}>
  <Plus className="mr-2 h-4 w-4" />
  Add Customer
</Button>
```

#### Three dialogs (same pattern as Bookings, using CustomerForm):
- Add Customer Dialog
- Edit Customer Dialog
- Delete ConfirmDialog with description: `"Are you sure you want to delete ${deletingCustomer?.name}? All their data will be removed."`

#### Delete handler (same pattern as bookings, calls `deleteCustomer()` and invalidates `['customers']`)

#### Column changes (`customerColumns.tsx`):
Same pattern — create `createCustomerColumns(onEdit, onDelete)` function, add Actions as last column.

#### CustomersTable props:
```typescript
interface CustomersTableProps {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}
```

---

### 10.4 Destinations Page (`app/dashboard/destinations/page.tsx`)

#### State:
```typescript
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
const [deletingDestination, setDeletingDestination] = useState<Destination | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

#### PageHeader change:
```tsx
<Button onClick={() => setIsAddDialogOpen(true)}>
  <Plus className="mr-2 h-4 w-4" />
  Add Destination
</Button>
```

#### Three dialogs (same pattern, using DestinationForm)

#### Delete ConfirmDialog description:
`"Are you sure you want to delete ${deletingDestination?.name}? This will remove it from the map and all statistics."`

#### DestinationCard changes (`components/cards/DestinationCard.tsx`)

Add `onEdit` and `onDelete` props:
```typescript
interface DestinationCardProps {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
}
```

Add action buttons in top-right corner of the card, **visible only on hover**:
```tsx
<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <Button
    size="icon"
    variant="secondary"
    className="h-7 w-7"
    onClick={(e) => { e.stopPropagation(); onEdit(destination); }}
  >
    <Pencil className="h-3 w-3" />
  </Button>
  <Button
    size="icon"
    variant="destructive"
    className="h-7 w-7"
    onClick={(e) => { e.stopPropagation(); onDelete(destination); }}
  >
    <Trash2 className="h-3 w-3" />
  </Button>
</div>
```

Add `group` class to the card's outer div to enable the `group-hover:opacity-100` effect.
Add `relative` class to the card's outer div to position the buttons absolutely.

---

## 11. SONNER TOAST SETUP

### `app/layout.tsx` change

Add Sonner's `<Toaster />` component inside the root layout, just before the closing `</body>` tag:

```tsx
import { Toaster } from 'sonner';

// Inside the layout JSX, after all providers:
<Toaster
  position="bottom-right"
  richColors
  closeButton
  duration={3000}
/>
```

### Toast usage throughout the app

Import toast from sonner everywhere:
```typescript
import { toast } from 'sonner';
```

Do not import toast from any other source.

### Toast types used:
- `toast.success('message')` → green, for all successful add/edit/delete operations
- `toast.error('message')` → red, for any error during submit
- `toast.info('message')` → blue, for status quick-change updates (optional, can use success)

---

## 12. BUILD ORDER (Follow exactly, do not reorder)

```
Step 1:  Install Sonner → npx shadcn@latest add sonner
Step 2:  Add <Toaster /> to app/layout.tsx (Section 11)
Step 3:  Rewrite useDashboardStore.ts — add data arrays seeded from JSON + all CRUD actions (Section 6)
Step 4:  Rewrite useBookings.ts — read from Zustand store (Section 7)
Step 5:  Rewrite useCustomers.ts — read from Zustand store (Section 7)
Step 6:  Rewrite useDestinations.ts — read from Zustand store (Section 7)
Step 7:  Create ConfirmDialog.tsx (Section 8.1)
Step 8:  Create ActionMenu.tsx (Section 8.2)
Step 9:  Create BookingForm.tsx with full Zod schema and submit logic (Section 9.2)
Step 10: Create CustomerForm.tsx with full Zod schema and submit logic (Section 9.3)
Step 11: Create DestinationForm.tsx with full Zod schema and submit logic (Section 9.4)
Step 12: Update bookingColumns.tsx — refactor to createBookingColumns() + add Actions column + Status quick-edit (Section 10.2)
Step 13: Update BookingsTable.tsx — add onEdit/onDelete props, use createBookingColumns() (Section 10.2)
Step 14: Update Bookings page — add state, PageHeader button, three dialogs, delete handler (Section 10.1)
Step 15: Update customerColumns.tsx — refactor to createCustomerColumns() + add Actions column (Section 10.3)
Step 16: Update CustomersTable.tsx — add onEdit/onDelete props (Section 10.3)
Step 17: Update Customers page — add state, PageHeader button, three dialogs, delete handler (Section 10.3)
Step 18: Update DestinationCard.tsx — add onEdit/onDelete props, hover action buttons (Section 10.4)
Step 19: Update Destinations page — add state, PageHeader button, three dialogs, delete handler (Section 10.4)
Step 20: Final verification — run through entire quality checklist (Section 13)
```

---

## 13. QUALITY CHECKLIST

Before considering Phase 2 complete, verify every item:

### Data Layer
- [ ] Zustand store contains bookings, customers, destinations arrays seeded from JSON files
- [ ] JSON files are no longer imported directly in any hook (only in the store)
- [ ] All three hooks (useBookings, useCustomers, useDestinations) read from `useDashboardStore.getState()`
- [ ] TanStack Query cache is invalidated after every add, update, and delete action
- [ ] Overview and Revenue pages still show correct stats reflecting any data changes made

### Bookings Page
- [ ] "Add Booking" button appears in page header
- [ ] Clicking "Add Booking" opens an empty BookingForm dialog
- [ ] All form fields validate correctly on change
- [ ] Return date cannot be before departure date (cross-field validation works)
- [ ] Destination dropdown shows all destinations from Zustand store
- [ ] Submit in add mode: creates new booking, closes dialog, shows success toast, table updates
- [ ] Clicking Edit in ActionMenu opens BookingForm pre-filled with that booking's data
- [ ] Submit in edit mode: updates booking, closes dialog, shows success toast, table updates
- [ ] Clicking Delete in ActionMenu opens ConfirmDialog with correct booking ID in description
- [ ] Confirming delete: shows spinner, deletes after 600ms, closes dialog, shows toast, row disappears
- [ ] Canceling delete: closes dialog, booking remains
- [ ] Clicking StatusBadge cycles status: confirmed→pending→cancelled→confirmed
- [ ] Status quick-change shows toast and table updates immediately

### Customers Page
- [ ] "Add Customer" button appears in page header
- [ ] Clicking "Add Customer" opens empty CustomerForm dialog
- [ ] Email field validates correct email format
- [ ] Country dropdown shows all 20 countries from the fixed list
- [ ] Submit in add mode: creates new customer, closes dialog, shows toast, table updates
- [ ] Clicking Edit opens CustomerForm pre-filled with customer data
- [ ] Submit in edit mode: updates customer, closes dialog, shows toast, table updates
- [ ] Clicking Delete opens ConfirmDialog with customer name in description
- [ ] Confirming delete: spinner → delete → toast → customer row disappears
- [ ] Customer stats KPI cards update after add/delete (total count changes)

### Destinations Page
- [ ] "Add Destination" button appears in page header
- [ ] Clicking "Add Destination" opens empty DestinationForm dialog
- [ ] Image URL field shows image preview when URL is valid
- [ ] Latitude must be between -90 and 90
- [ ] Longitude must be between -180 and 180
- [ ] Popular months: comma-separated input correctly splits into string array
- [ ] Submit in add mode: new destination card appears in grid, world map gets new marker
- [ ] Edit buttons appear on card hover (top-right corner)
- [ ] Clicking Edit (pencil icon) opens DestinationForm pre-filled with destination data
- [ ] Submit in edit mode: card updates, closes dialog, shows toast
- [ ] Clicking Delete (trash icon) opens ConfirmDialog with destination name
- [ ] Confirming delete: card disappears from grid, marker removed from map

### Forms (all three)
- [ ] Validation errors appear inline below each field as user types
- [ ] Submit button is disabled and shows spinner during 600ms submit delay
- [ ] Cancel/close closes dialog without saving anything
- [ ] No `any` TypeScript types in any form component
- [ ] Zod schema matches the field definitions exactly

### General
- [ ] Dark mode works correctly on all new components (no hardcoded colors)
- [ ] All new components are fully responsive (work on mobile and tablet)
- [ ] ConfirmDialog cannot be closed by clicking overlay while delete is in progress
- [ ] ActionMenu closes after clicking Edit or Delete
- [ ] No console errors on any page
- [ ] No TypeScript compilation errors

---

## 14. WHAT NOT TO DO

- Do NOT add any new npm library not listed in Section 3
- Do NOT add authentication, login, or user management
- Do NOT persist data to localStorage, sessionStorage, or any browser storage — Zustand in-memory only
- Do NOT add any pages not in the original spec
- Do NOT modify the Overview or Revenue pages
- Do NOT use `any` TypeScript type anywhere
- Do NOT hardcode colors — use Tailwind semantic tokens and shadcn CSS variables only
- Do NOT import from JSON data files anywhere except inside `useDashboardStore.ts`
- Do NOT add features not described in this spec
- Do NOT change the existing folder structure
- Do NOT use shadcn's default Toast — use Sonner exclusively

---

*End of SPEC2.md — RE Travel Admin Dashboard Phase 2*  
*Version 1.0 | Generated for Claude Code execution*  
*Prerequisite: SPEC.md Phase 1 must be fully complete before executing this spec*
