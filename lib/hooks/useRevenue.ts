'use client';

import { useQuery } from '@tanstack/react-query';
import {
  monthlyRevenue as monthlyRevenueData,
  revenueByDestination as revenueByDestinationData,
} from '@/lib/data/revenue';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { MonthlyRevenue, RevenueByDestination } from '@/types/revenue';

const SIMULATED_DELAY = 500;

async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
  return monthlyRevenueData;
}

async function fetchRevenueByDestination(): Promise<RevenueByDestination[]> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
  return revenueByDestinationData;
}

export function useMonthlyRevenue() {
  return useQuery({ queryKey: ['monthly-revenue'], queryFn: fetchMonthlyRevenue });
}

export function useRevenueByDestination() {
  return useQuery({
    queryKey: ['revenue-by-destination'],
    queryFn: fetchRevenueByDestination,
  });
}

export interface RevenueStats {
  totalRevenue: number;
  avgMonthly: number;
  bestMonth: { month: string; revenue: number };
  growth: number;
}

export function useRevenueStats() {
  const query = useMonthlyRevenue();

  const stats: RevenueStats | undefined = query.data
    ? (() => {
        const items = query.data;
        const totalRevenue = items.reduce((sum, m) => sum + m.revenue, 0);
        const avgMonthly = Math.round(totalRevenue / items.length);
        const bestEntry = items.reduce((best, m) =>
          m.revenue > best.revenue ? m : best
        );
        return {
          totalRevenue,
          avgMonthly,
          bestMonth: { month: bestEntry.month, revenue: bestEntry.revenue },
          growth: 18.4,
        };
      })()
    : undefined;

  return { ...query, stats };
}

export interface FilteredRevenueStats {
  totalRevenue: number;
  totalBookings: number;
  avgPerBooking: number;
  byDestination: { destination: string; revenue: number }[];
  byMonth: { month: string; revenue: number; bookings: number }[];
  cancelledRevenue: number;
}

export function useFilteredRevenueStats() {
  return useQuery({
    queryKey: ['revenue', 'filtered'],
    queryFn: async (): Promise<FilteredRevenueStats> => {
      await new Promise((r) => setTimeout(r, 300));
      const { bookings, selectedMonth, selectedYear } =
        useDashboardStore.getState();

      const filtered = bookings.filter((b) => {
        if (b.status !== 'confirmed') return false;
        const date = new Date(b.departureDate);
        const yearMatch = date.getFullYear() === selectedYear;
        if (selectedMonth === 0) return yearMatch;
        return yearMatch && date.getMonth() + 1 === selectedMonth;
      });

      const byDestination = filtered.reduce<Record<string, number>>(
        (acc, b) => {
          acc[b.destination] = (acc[b.destination] || 0) + b.amount;
          return acc;
        },
        {},
      );

      const byMonth = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthRevenue = bookings
          .filter((b) => {
            const d = new Date(b.departureDate);
            return (
              b.status === 'confirmed' &&
              d.getFullYear() === selectedYear &&
              d.getMonth() + 1 === month
            );
          })
          .reduce((sum, b) => sum + b.amount, 0);
        return {
          month: new Date(selectedYear, i, 1).toLocaleString('default', {
            month: 'short',
          }),
          revenue: monthRevenue,
          bookings: bookings.filter((b) => {
            const d = new Date(b.departureDate);
            return (
              d.getFullYear() === selectedYear &&
              d.getMonth() + 1 === month
            );
          }).length,
        };
      });

      return {
        totalRevenue: filtered.reduce((sum, b) => sum + b.amount, 0),
        totalBookings: filtered.length,
        avgPerBooking:
          filtered.length > 0
            ? filtered.reduce((sum, b) => sum + b.amount, 0) / filtered.length
            : 0,
        byDestination: Object.entries(byDestination).map(
          ([destination, revenue]) => ({
            destination,
            revenue,
          }),
        ),
        byMonth,
        cancelledRevenue: bookings
          .filter((b) => {
            if (b.status !== 'cancelled') return false;
            const date = new Date(b.departureDate);
            const yearMatch = date.getFullYear() === selectedYear;
            if (selectedMonth === 0) return yearMatch;
            return yearMatch && date.getMonth() + 1 === selectedMonth;
          })
          .reduce((sum, b) => sum + b.amount, 0),
      };
    },
  });
}
