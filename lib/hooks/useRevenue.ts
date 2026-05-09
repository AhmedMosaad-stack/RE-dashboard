'use client';

import { useQuery } from '@tanstack/react-query';
import {
  monthlyRevenue as monthlyRevenueData,
  revenueByDestination as revenueByDestinationData,
} from '@/lib/data/revenue';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { MonthlyRevenue, RevenueByDestination } from '@/types/revenue';

const SIMULATED_DELAY =
  process.env.NODE_ENV === 'development' ? 500 : 0;

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

const SHORT_MONTHS_REV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function useFilteredRevenueStats() {
  return useQuery({
    queryKey: ['revenue', 'filtered'],
    queryFn: async (): Promise<FilteredRevenueStats> => {
      await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
      const { bookings, selectedMonth, selectedYear } =
        useDashboardStore.getState();

      // Single pass over bookings
      const byMonthRevenue = new Array(12).fill(0);
      const byMonthBookings = new Array(12).fill(0);
      const byDestMap: Record<string, number> = {};

      let totalRevenue = 0, totalBookings = 0, cancelledRevenue = 0;

      for (const b of bookings) {
        const date = new Date(b.departureDate);
        if (date.getFullYear() !== selectedYear) continue;
        const m = date.getMonth(); // 0-indexed

        byMonthBookings[m]++;
        if (b.status === 'confirmed') {
          byMonthRevenue[m] += b.amount;
          byDestMap[b.destination] = (byDestMap[b.destination] || 0) + b.amount;
        }

        // Filtered totals (respect selectedMonth)
        if (selectedMonth !== 0 && m + 1 !== selectedMonth) continue;
        if (b.status === 'confirmed') { totalRevenue += b.amount; totalBookings++; }
        else if (b.status === 'cancelled') cancelledRevenue += b.amount;
      }

      return {
        totalRevenue,
        totalBookings,
        avgPerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        byDestination: Object.entries(byDestMap).map(([destination, revenue]) => ({
          destination,
          revenue,
        })),
        byMonth: SHORT_MONTHS_REV.map((month, i) => ({
          month,
          revenue: byMonthRevenue[i],
          bookings: byMonthBookings[i],
        })),
        cancelledRevenue,
      };
    },
  });
}

