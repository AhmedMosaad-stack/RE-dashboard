'use client';

import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { Customer } from '@/types/customer';

const SIMULATED_DELAY =
  process.env.NODE_ENV === 'development' ? 300 : 0;

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      return useDashboardStore.getState().customers;
    },
  });
}

export interface CustomerStats {
  total: number;
  newThisMonth: number;
  topSpender: Customer | undefined;
  avgSpend: number;
}

export function useCustomerStats() {
  const query = useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: async (): Promise<CustomerStats> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      const items = useDashboardStore.getState().customers;
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newThisMonth = items.filter(
        (c) => new Date(c.joinedAt) >= thirtyDaysAgo,
      ).length;

      const topSpender =
        items.length > 0
          ? items.reduce((top, c) =>
              c.totalSpent > top.totalSpent ? c : top,
            )
          : undefined;
      const totalSpent = items.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgSpend =
        items.length > 0 ? Math.round(totalSpent / items.length) : 0;

      return {
        total: items.length,
        newThisMonth,
        topSpender,
        avgSpend,
      };
    },
  });

  return { ...query, stats: query.data };
}
