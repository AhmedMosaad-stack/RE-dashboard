'use client';

import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { Booking } from '@/types/booking';

const SIMULATED_DELAY =
  process.env.NODE_ENV === 'development' ? 300 : 0;

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async (): Promise<Booking[]> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      return useDashboardStore.getState().bookings;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async (): Promise<Booking> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      const booking = useDashboardStore
        .getState()
        .bookings.find((b) => b.id === id);
      if (!booking) throw new Error(`Booking ${id} not found`);
      return booking;
    },
    enabled: Boolean(id),
  });
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export function useBookingStats() {
  const query = useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: async (): Promise<BookingStats> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      const bookings = useDashboardStore.getState().bookings;
      const confirmed = bookings.filter((b) => b.status === 'confirmed');
      const pending = bookings.filter((b) => b.status === 'pending');
      const cancelled = bookings.filter((b) => b.status === 'cancelled');
      const totalRevenue = confirmed.reduce((sum, b) => sum + b.amount, 0);
      const avgOrderValue =
        bookings.length > 0
          ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length
          : 0;
      return {
        total: bookings.length,
        confirmed: confirmed.length,
        pending: pending.length,
        cancelled: cancelled.length,
        totalRevenue,
        avgOrderValue,
      };
    },
  });

  return { ...query, stats: query.data };
}

export interface FilteredBookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  avgOrderValue: number;
  byMonth: {
    month: string;
    bookings: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  }[];
}

export function useFilteredBookings() {
  return useQuery({
    queryKey: ['bookings', 'filtered'],
    queryFn: async (): Promise<Booking[]> => {
      await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
      const { bookings, selectedMonth, selectedYear } =
        useDashboardStore.getState();
      return bookings.filter((b) => {
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && date.getMonth() + 1 === selectedMonth;
      });
    },
  });
}

export function useFilteredBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats', 'filtered'],
    queryFn: async (): Promise<FilteredBookingStats> => {
      await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
      const { bookings, selectedMonth, selectedYear } =
        useDashboardStore.getState();
      const filtered = bookings.filter((b) => {
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && date.getMonth() + 1 === selectedMonth;
      });
      return {
        total: filtered.length,
        confirmed: filtered.filter((b) => b.status === 'confirmed').length,
        pending: filtered.filter((b) => b.status === 'pending').length,
        cancelled: filtered.filter((b) => b.status === 'cancelled').length,
        totalRevenue: filtered
          .filter((b) => b.status === 'confirmed')
          .reduce((sum, b) => sum + b.amount, 0),
        avgOrderValue:
          filtered.length > 0
            ? filtered.reduce((sum, b) => sum + b.amount, 0) / filtered.length
            : 0,
        byMonth: Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthBookings = bookings.filter((b) => {
            const d = new Date(b.departureDate);
            return (
              d.getFullYear() === selectedYear &&
              d.getMonth() + 1 === month
            );
          });
          return {
            month: new Date(selectedYear, i, 1).toLocaleString('default', {
              month: 'short',
            }),
            bookings: monthBookings.length,
            confirmed: monthBookings.filter((b) => b.status === 'confirmed')
              .length,
            pending: monthBookings.filter((b) => b.status === 'pending').length,
            cancelled: monthBookings.filter((b) => b.status === 'cancelled')
              .length,
          };
        }),
      };
    },
  });
}
