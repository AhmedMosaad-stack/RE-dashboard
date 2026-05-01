export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
  year: number;
}

export interface RevenueByDestination {
  destination: string;
  revenue: number;
}
