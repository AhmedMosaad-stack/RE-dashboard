import { QueryClient } from '@tanstack/react-query';

export function invalidateAll(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
  queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['bookings', 'stats', 'filtered'] });
  queryClient.invalidateQueries({ queryKey: ['bookings', 'filtered'] });
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['revenue'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'stats'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'filtered'] });
  queryClient.invalidateQueries({ queryKey: ['revenue', 'byDestination'] });
}
