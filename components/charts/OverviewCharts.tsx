'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingsTrendChart } from '@/components/charts/BookingsTrendChart';
import { BookingStatusChart } from '@/components/charts/BookingStatusChart';
import { RevenueByDestChart } from '@/components/charts/RevenueByDestChart';
import { MonthlyRevenueChart } from '@/components/charts/MonthlyRevenueChart';

type ByMonth = { month: string; bookings: number }[] | undefined;
type RevenueByMonth =
  | { month: string; revenue: number; bookings: number }[]
  | undefined;
type RevenueByDest = { destination: string; revenue: number }[] | undefined;

interface OverviewChartsProps {
  selectedMonth: number;
  bookingsByMonth: ByMonth;
  bookingStatus?: { confirmed: number; pending: number; cancelled: number };
  revenueByDest: RevenueByDest;
  revenueByMonth: RevenueByMonth;
}

export default function OverviewCharts({
  selectedMonth,
  bookingsByMonth,
  bookingStatus,
  revenueByDest,
  revenueByMonth,
}: OverviewChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card
          className="chart-container hand-border card-pop lg:col-span-3"
          style={{ '--chart-accent': 'var(--pop-blue)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsTrendChart
              data={bookingsByMonth}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
        <Card
          className="chart-container hand-border card-pop lg:col-span-2"
          style={{ '--chart-accent': 'var(--pop-red)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusChart mode="count" data={bookingStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          className="chart-container hand-border card-pop"
          style={{ '--chart-accent': 'var(--pop-teal)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Revenue by Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByDestChart
              limit={5}
              layout="horizontal"
              data={revenueByDest}
            />
          </CardContent>
        </Card>
        <Card
          className="chart-container hand-border card-pop"
          style={{ '--chart-accent': 'var(--pop-green)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueChart
              data={revenueByMonth}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
