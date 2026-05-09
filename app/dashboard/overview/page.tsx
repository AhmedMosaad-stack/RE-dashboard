'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  DollarSign,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { CardSkeleton, TableSkeleton, OverviewChartsSkeleton } from '@/components/shared/LoadingSkeleton';
import { LazyOnVisible } from '@/components/shared/LazyOnVisible';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';

const OverviewCharts = dynamic(
  () => import('@/components/charts/OverviewCharts'),
  {
    ssr: false,
    loading: () => (
      <>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3"><CardSkeleton /></div>
          <div className="lg:col-span-2"><CardSkeleton /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    ),
  },
);
import {
  useBookings,
  useFilteredBookingStats,
} from '@/lib/hooks/useBookings';
import { useCustomerStats } from '@/lib/hooks/useCustomers';
import { useFilteredRevenueStats } from '@/lib/hooks/useRevenue';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatters';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function OverviewPage() {
  const bookingsQuery = useBookings();
  const filteredBookingStats = useFilteredBookingStats();
  const customerStats = useCustomerStats();
  const filteredRevenueStats = useFilteredRevenueStats();
  const selectedMonth = useDashboardStore((s) => s.selectedMonth);
  const selectedYear = useDashboardStore((s) => s.selectedYear);

  const isError =
    bookingsQuery.isError ||
    filteredBookingStats.isError ||
    customerStats.isError ||
    filteredRevenueStats.isError;

  const isLoading =
    filteredBookingStats.isLoading ||
    customerStats.isLoading ||
    filteredRevenueStats.isLoading;

  const recentBookings = useMemo(
    () =>
      bookingsQuery.data
        ? [...bookingsQuery.data]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5)
        : [],
    [bookingsQuery.data],
  );

  if (isError) {
    return (
      <div className="page-fade-in">
        <PageHeader title="Overview" subtitle="Business performance at a glance." />
        <EmptyState
          title="Something went wrong"
          description="We couldn't load the dashboard data. Please refresh the page."
          icon={AlertCircle}
        />
      </div>
    );
  }

  const filterLabel =
    selectedMonth === 0
      ? `All of ${selectedYear}`
      : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const bookingStatusData = filteredBookingStats.data
    ? {
        confirmed: filteredBookingStats.data.confirmed,
        pending: filteredBookingStats.data.pending,
        cancelled: filteredBookingStats.data.cancelled,
      }
    : undefined;

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader title="Overview" subtitle="Business performance at a glance." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Bookings"
          value={isLoading ? '' : formatNumber(filteredBookingStats.data?.total ?? 0)}
          change={12}
          icon={CalendarCheck}
          description={filterLabel}
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? '' : formatCurrency(filteredRevenueStats.data?.totalRevenue ?? 0)}
          change={8.3}
          icon={DollarSign}
          description={filterLabel}
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          title="Total Customers"
          value={isLoading ? '' : formatNumber(customerStats.stats?.total ?? 0)}
          change={15}
          icon={Users}
          description="vs last month"
          isLoading={isLoading}
          index={2}
        />
      </div>

      <LazyOnVisible fallback={<OverviewChartsSkeleton />}>
        <OverviewCharts
          selectedMonth={selectedMonth}
          bookingsByMonth={filteredBookingStats.data?.byMonth}
          bookingStatus={bookingStatusData}
          revenueByDest={filteredRevenueStats.data?.byDestination}
          revenueByMonth={filteredRevenueStats.data?.byMonth}
        />
      </LazyOnVisible>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsQuery.isLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="When new bookings come in, they'll appear here."
            />
          ) : (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id}
                      </TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.destination}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(booking.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/bookings" prefetch={false}>
                View all bookings
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
