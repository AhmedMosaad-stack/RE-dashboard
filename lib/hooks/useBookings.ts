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

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function useFilteredBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats', 'filtered'],
    queryFn: async (): Promise<FilteredBookingStats> => {
      await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
      const { bookings, selectedMonth, selectedYear } =
        useDashboardStore.getState();

      // Single pass — group by month and accumulate stats simultaneously
      type MonthBucket = { bookings: number; confirmed: number; pending: number; cancelled: number };
      const byMonthMap: MonthBucket[] = Array.from({ length: 12 }, () => ({
        bookings: 0, confirmed: 0, pending: 0, cancelled: 0,
      }));

      let total = 0, confirmed = 0, pending = 0, cancelled = 0;
      let totalRevenue = 0, totalAmount = 0;

      for (const b of bookings) {
        const date = new Date(b.departureDate);
        if (date.getFullYear() !== selectedYear) continue;
        const m = date.getMonth(); // 0-indexed

        // Update monthly bucket (all months, for chart)
        byMonthMap[m].bookings++;
        if (b.status === 'confirmed') byMonthMap[m].confirmed++;
        else if (b.status === 'pending') byMonthMap[m].pending++;
        else if (b.status === 'cancelled') byMonthMap[m].cancelled++;

        // Update filtered stats (only for selected month filter)
        if (selectedMonth !== 0 && m + 1 !== selectedMonth) continue;
        total++;
        totalAmount += b.amount;
        if (b.status === 'confirmed') { confirmed++; totalRevenue += b.amount; }
        else if (b.status === 'pending') pending++;
        else if (b.status === 'cancelled') cancelled++;
      }

      return {
        total,
        confirmed,
        pending,
        cancelled,
        totalRevenue,
        avgOrderValue: total > 0 ? totalAmount / total : 0,
        byMonth: byMonthMap.map((bucket, i) => ({
          month: SHORT_MONTHS[i],
          ...bucket,
        })),
      };
    },
  });
}
