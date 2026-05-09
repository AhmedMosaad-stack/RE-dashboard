'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyRevenueChart } from '@/components/charts/MonthlyRevenueChart';
import { RevenueByDestChart } from '@/components/charts/RevenueByDestChart';
import { BookingStatusChart } from '@/components/charts/BookingStatusChart';

interface RevenueChartsProps {
  selectedMonth: number;
  monthlyData?: { month: string; revenue: number; bookings: number }[];
  byDestination?: { destination: string; revenue: number }[];
  bookingStatus?: { confirmed: number; pending: number; cancelled: number };
}

export default function RevenueCharts({
  selectedMonth,
  monthlyData,
  byDestination,
  bookingStatus,
}: RevenueChartsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Card
        className="chart-container hand-border card-pop"
        style={{ '--chart-accent': 'var(--pop-green)' } as React.CSSProperties}
      >
        <CardHeader>
          <CardTitle>Monthly Revenue & Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart
            showBookings
            height={350}
            data={monthlyData}
            selectedMonth={selectedMonth}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          className="chart-container hand-border card-pop"
          style={{ '--chart-accent': 'var(--pop-teal)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Revenue by Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByDestChart layout="horizontal" data={byDestination} />
          </CardContent>
        </Card>
        <Card
          className="chart-container hand-border card-pop"
          style={{ '--chart-accent': 'var(--pop-red)' } as React.CSSProperties}
        >
          <CardHeader>
            <CardTitle>Revenue by Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusChart mode="revenue" data={bookingStatus} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
