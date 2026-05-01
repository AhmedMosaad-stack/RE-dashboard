import type { MonthlyRevenue, RevenueByDestination } from '@/types/revenue';

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 52000, bookings: 18, year: 2024 },
  { month: 'Feb', revenue: 48000, bookings: 16, year: 2024 },
  { month: 'Mar', revenue: 71000, bookings: 24, year: 2024 },
  { month: 'Apr', revenue: 92000, bookings: 31, year: 2024 },
  { month: 'May', revenue: 118000, bookings: 38, year: 2024 },
  { month: 'Jun', revenue: 162000, bookings: 51, year: 2024 },
  { month: 'Jul', revenue: 178000, bookings: 56, year: 2024 },
  { month: 'Aug', revenue: 169000, bookings: 53, year: 2024 },
  { month: 'Sep', revenue: 104000, bookings: 33, year: 2024 },
  { month: 'Oct', revenue: 86000, bookings: 28, year: 2024 },
  { month: 'Nov', revenue: 95000, bookings: 31, year: 2024 },
  { month: 'Dec', revenue: 154000, bookings: 48, year: 2024 },
];

export const revenueByDestination: RevenueByDestination[] = [
  { destination: 'Paris', revenue: 198400 },
  { destination: 'Maldives', revenue: 187600 },
  { destination: 'Dubai', revenue: 174800 },
  { destination: 'Tokyo', revenue: 165200 },
  { destination: 'Bali', revenue: 142300 },
  { destination: 'New York', revenue: 138700 },
  { destination: 'Rome', revenue: 121400 },
  { destination: 'Barcelona', revenue: 94500 },
  { destination: 'Sydney', revenue: 89200 },
  { destination: 'Cairo', revenue: 78900 },
];
