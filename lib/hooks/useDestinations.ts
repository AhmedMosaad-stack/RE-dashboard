'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { Destination } from '@/types/destination';

const SIMULATED_DELAY =
  process.env.NODE_ENV === 'development' ? 300 : 0;

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async (): Promise<Destination[]> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      return useDashboardStore.getState().destinations;
    },
  });
}

export function useTopDestinations(limit: number = 5) {
  const query = useDestinations();
  const top = useMemo(
    () =>
      query.data
        ? [...query.data]
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, limit)
        : undefined,
    [query.data, limit],
  );

  return { ...query, top };
}
