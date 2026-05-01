'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  DollarSign,
  MapPin,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
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

const BookingsTrendChart = dynamic(
  () =>
    import('@/components/charts/BookingsTrendChart').then(
      (m) => m.BookingsTrendChart,
    ),
  { ssr: false, loading: () => <CardSkeleton /> },
);
const BookingStatusChart = dynamic(
  () =>
    import('@/components/charts/BookingStatusChart').then(
      (m) => m.BookingStatusChart,
    ),
  { ssr: false, loading: () => <CardSkeleton /> },
);
const RevenueByDestChart = dynamic(
  () =>
    import('@/components/charts/RevenueByDestChart').then(
      (m) => m.RevenueByDestChart,
    ),
  { ssr: false, loading: () => <CardSkeleton /> },
);
const MonthlyRevenueChart = dynamic(
  () =>
    import('@/components/charts/MonthlyRevenueChart').then(
      (m) => m.MonthlyRevenueChart,
    ),
  { ssr: false, loading: () => <CardSkeleton /> },
);
import {
  useBookings,
  useFilteredBookingStats,
} from '@/lib/hooks/useBookings';
import { useCustomerStats } from '@/lib/hooks/useCustomers';
import { useTopDestinations } from '@/lib/hooks/useDestinations';
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
  const topDestinations = useTopDestinations(1);
  const selectedMonth = useDashboardStore((s) => s.selectedMonth);
  const selectedYear = useDashboardStore((s) => s.selectedYear);

  const isError =
    bookingsQuery.isError ||
    filteredBookingStats.isError ||
    customerStats.isError ||
    filteredRevenueStats.isError ||
    topDestinations.isError;

  const isLoading =
    filteredBookingStats.isLoading ||
    customerStats.isLoading ||
    filteredRevenueStats.isLoading ||
    topDestinations.isLoading;

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

  const topDestName = topDestinations.top?.[0]?.name ?? '—';
  const filterLabel =
    selectedMonth === 0
      ? `All of ${selectedYear}`
      : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader title="Overview" subtitle="Business performance at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard
          title="Top Destination"
          value={isLoading ? '' : topDestName}
          change={NaN}
          icon={MapPin}
          description={isLoading ? '' : `${topDestinations.top?.[0]?.totalBookings ?? 0} bookings`}
          isLoading={isLoading}
          index={3}
        />
      </div>

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
              data={filteredBookingStats.data?.byMonth}
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
            <BookingStatusChart
              mode="count"
              data={
                filteredBookingStats.data
                  ? {
                      confirmed: filteredBookingStats.data.confirmed,
                      pending: filteredBookingStats.data.pending,
                      cancelled: filteredBookingStats.data.cancelled,
                    }
                  : undefined
              }
            />
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
              data={filteredRevenueStats.data?.byDestination}
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
              data={filteredRevenueStats.data?.byMonth}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
      </div>

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
              <Link href="/dashboard/bookings">
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
