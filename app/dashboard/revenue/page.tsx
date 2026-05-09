'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { LazyOnVisible } from '@/components/shared/LazyOnVisible';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const RevenueCharts = dynamic(
  () => import('@/components/charts/RevenueCharts'),
  {
    ssr: false,
    loading: () => (
      <>
        <CardSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    ),
  },
);
import { useFilteredRevenueStats } from '@/lib/hooks/useRevenue';
import { useFilteredBookingStats } from '@/lib/hooks/useBookings';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatPercentChange,
} from '@/lib/utils/formatters';

export default function RevenuePage() {
  const filteredRevenueStats = useFilteredRevenueStats();
  const filteredBookingStats = useFilteredBookingStats();
  const selectedMonth = useDashboardStore((s) => s.selectedMonth);
  const selectedYear = useDashboardStore((s) => s.selectedYear);

  const isError =
    filteredRevenueStats.isError || filteredBookingStats.isError;
  const isLoading = filteredRevenueStats.isLoading;

  const data = filteredRevenueStats.data;
  const byMonth = data?.byMonth;

  const { monthly, avgMonthly, bestMonth } = useMemo(() => {
    const m = byMonth ?? [];
    const total = m.reduce((sum, x) => sum + x.revenue, 0);
    const monthsWithRevenue = m.filter((x) => x.revenue > 0).length;
    return {
      monthly: m,
      avgMonthly:
        monthsWithRevenue > 0 ? Math.round(total / monthsWithRevenue) : 0,
      bestMonth:
        m.length > 0
          ? m.reduce((best, x) => (x.revenue > best.revenue ? x : best), m[0])
          : { month: '—', revenue: 0 },
    };
  }, [byMonth]);

  if (isError) {
    return (
      <div className="page-fade-in space-y-6">
        <PageHeader
          title="Revenue"
          subtitle={`${selectedYear} revenue and growth metrics.`}
        />
        <EmptyState
          title="Something went wrong"
          description="We couldn't load revenue data. Please refresh the page."
          icon={AlertCircle}
        />
      </div>
    );
  }

  const bookingStatusData =
    filteredBookingStats.data && data
      ? {
          confirmed: data.totalRevenue,
          pending: 0,
          cancelled: data.cancelledRevenue,
        }
      : undefined;

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader
        title="Revenue"
        subtitle={`${selectedYear} revenue and growth metrics.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`Total Revenue ${selectedYear}`}
          value={isLoading ? '' : formatCurrency(data?.totalRevenue ?? 0)}
          change={18.4}
          icon={DollarSign}
          description="full year"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          title="Avg Monthly Revenue"
          value={isLoading ? '' : formatCurrency(avgMonthly)}
          change={6.2}
          icon={TrendingUp}
          description="per month"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          title="Best Month"
          value={
            isLoading
              ? ''
              : `${bestMonth.month} · ${formatCurrency(bestMonth.revenue)}`
          }
          change={NaN}
          icon={Calendar}
          description="peak"
          isLoading={isLoading}
          index={2}
        />
        <StatCard
          title="YoY Growth"
          value={isLoading ? '' : formatPercentChange(18.4)}
          change={18.4}
          icon={ArrowUpRight}
          description={`vs ${selectedYear - 1}`}
          isLoading={isLoading}
          index={3}
        />
      </div>

      <LazyOnVisible fallback={<div className="h-[400px] w-full" />}>
        <RevenueCharts
          selectedMonth={selectedMonth}
          monthlyData={data?.byMonth}
          byDestination={data?.byDestination}
          bookingStatus={bookingStatusData}
        />
      </LazyOnVisible>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <TableSkeleton rows={12} columns={5} />
          ) : (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg per Booking</TableHead>
                    <TableHead>vs Prev Month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.map((row, index) => {
                    const prev = index > 0 ? monthly[index - 1] : null;
                    const change =
                      prev && prev.revenue > 0
                        ? ((row.revenue - prev.revenue) / prev.revenue) * 100
                        : null;
                    const avg =
                      row.bookings > 0
                        ? Math.round(row.revenue / row.bookings)
                        : 0;
                    const isUp = change !== null && change >= 0;
                    const isHighlight = index + 1 === selectedMonth;
                    return (
                      <TableRow
                        key={`${selectedYear}-${row.month}`}
                        style={
                          isHighlight
                            ? {
                                background: 'var(--pop-yellow)',
                                color: '#1C1C1E',
                              }
                            : undefined
                        }
                      >
                        <TableCell className="font-medium">
                          {row.month} {selectedYear}
                        </TableCell>
                        <TableCell>{row.bookings}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(row.revenue)}
                        </TableCell>
                        <TableCell>{formatCurrency(avg)}</TableCell>
                        <TableCell>
                          {change === null ? (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          ) : (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 text-xs font-medium',
                              )}
                              style={{
                                color: isHighlight
                                  ? '#1C1C1E'
                                  : isUp
                                    ? 'var(--success)'
                                    : 'var(--danger)',
                              }}
                            >
                              {isUp ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {formatPercentChange(change)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
