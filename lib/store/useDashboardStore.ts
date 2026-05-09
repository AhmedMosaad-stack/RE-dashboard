import { create } from 'zustand';
import { bookings as bookingsData } from '@/lib/data/bookings';
import { customers as customersData } from '@/lib/data/customers';
import type { Booking } from '@/types/booking';
import type { Customer } from '@/types/customer';

export type BookingStatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

interface DashboardStore {
  // ─── EXISTING UI STATE FROM PHASE 1 ───────────────────────────────────────
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // ─── CALENDAR FILTER STATE ──────────────────────────────────────
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  resetCalendarFilter: () => void;

  bookingStatusFilter: BookingStatusFilter;
  setBookingStatusFilter: (status: BookingStatusFilter) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // ─── DATA COLLECTIONS ─────────────────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];

  // ─── BOOKING ACTIONS ──────────────────────────────────────────────────────
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (
    id: string,
    updates: Partial<Omit<Booking, 'id' | 'createdAt'>>,
  ) => void;
  deleteBooking: (id: string) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;

  // ─── CUSTOMER ACTIONS ─────────────────────────────────────────────────────
  addCustomer: (
    customer: Omit<Customer, 'id' | 'joinedAt' | 'avatarUrl'>,
  ) => void;
  updateCustomer: (
    id: string,
    updates: Partial<Omit<Customer, 'id' | 'joinedAt' | 'avatarUrl'>>,
  ) => void;
  deleteCustomer: (id: string) => void;
}

function todayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // ─── UI STATE ─────────────────────────────────────────────────────────────
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  selectedYear: 2024,
  setSelectedYear: (year) => set({ selectedYear: year }),

  selectedMonth: 0,
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  resetCalendarFilter: () => set({ selectedMonth: 0, selectedYear: 2024 }),

  bookingStatusFilter: 'all',
  setBookingStatusFilter: (status) => set({ bookingStatusFilter: status }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ─── DATA SEED ────────────────────────────────────────────────────────────
  bookings: bookingsData,
  customers: customersData,

  // ─── BOOKING ACTIONS ──────────────────────────────────────────────────────
  addBooking: (booking) => {
    const newId = `BK-${String(get().bookings.length + 1).padStart(3, '0')}`;
    const newBooking: Booking = {
      ...booking,
      id: newId,
      createdAt: todayISODate(),
    };
    set((state) => ({ bookings: [...state.bookings, newBooking] }));
  },
  updateBooking: (id, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    }));
  },
  deleteBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    }));
  },
  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status } : b,
      ),
    }));
  },

  // ─── CUSTOMER ACTIONS ─────────────────────────────────────────────────────
  addCustomer: (customer) => {
    const newId = `CU-${String(get().customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...customer,
      id: newId,
      joinedAt: todayISODate(),
      avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
    };
    set((state) => ({ customers: [...state.customers, newCustomer] }));
  },
  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  },
  deleteCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },
}));
