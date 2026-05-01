'use client';

import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useBookings } from '@/lib/hooks/useBookings';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

const CONFIRMED_COLOR = '#6BCB77';
const PENDING_COLOR   = '#FFD93D';
const CANCELLED_COLOR = '#FF6B6B';

const config = {
  confirmed: { label: 'Confirmed', color: CONFIRMED_COLOR },
  pending:   { label: 'Pending',   color: PENDING_COLOR },
  cancelled: { label: 'Cancelled', color: CANCELLED_COLOR },
} satisfies ChartConfig;

const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface-2)',
  border: '2.5px solid var(--ink)',
  borderRadius: '6px',
  fontFamily: "'Cabin', sans-serif",
  fontSize: '12px',
  color: 'var(--ink)',
  boxShadow: '3px 3px 0px var(--ink)',
};
const LEGEND_WRAPPER_STYLE = { fontFamily: 'Cabin, sans-serif', fontSize: '12px' };

interface BookingStatusChartProps {
  mode?: 'count' | 'revenue';
  data?: { confirmed: number; pending: number; cancelled: number };
}

export function BookingStatusChart({
  mode = 'count',
  data: dataProp,
}: BookingStatusChartProps) {
  const fallback = useBookings();
  const isLoading = dataProp ? false : fallback.isLoading;

  if (isLoading) {
    return <CardSkeleton />;
  }
  if (!dataProp && !fallback.data) {
    return <CardSkeleton />;
  }

  const chartData = dataProp
    ? [
        { key: 'confirmed', name: mode === 'count' ? 'Confirmed' : 'Confirmed Revenue', value: dataProp.confirmed,                                                                          fill: CONFIRMED_COLOR },
        { key: 'pending',   name: mode === 'count' ? 'Pending'   : 'Pending Revenue',   value: dataProp.pending,                                                                            fill: PENDING_COLOR   },
        { key: 'cancelled', name: mode === 'count' ? 'Cancelled' : 'Lost Revenue',      value: dataProp.cancelled,                                                                          fill: CANCELLED_COLOR },
      ]
    : mode === 'count'
      ? [
          { key: 'confirmed', name: 'Confirmed',         value: (fallback.data ?? []).filter((b) => b.status === 'confirmed').length,                                fill: CONFIRMED_COLOR },
          { key: 'pending',   name: 'Pending',           value: (fallback.data ?? []).filter((b) => b.status === 'pending').length,                                  fill: PENDING_COLOR   },
          { key: 'cancelled', name: 'Cancelled',         value: (fallback.data ?? []).filter((b) => b.status === 'cancelled').length,                                fill: CANCELLED_COLOR },
        ]
      : [
          { key: 'confirmed', name: 'Confirmed Revenue', value: (fallback.data ?? []).filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.amount, 0), fill: CONFIRMED_COLOR },
          { key: 'pending',   name: 'Pending Revenue',   value: (fallback.data ?? []).filter((b) => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),   fill: PENDING_COLOR   },
          { key: 'cancelled', name: 'Lost Revenue',      value: (fallback.data ?? []).filter((b) => b.status === 'cancelled').reduce((sum, b) => sum + b.amount, 0), fill: CANCELLED_COLOR },
        ];

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          strokeWidth={2}
          stroke="var(--surface)"
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent />}
          wrapperStyle={LEGEND_WRAPPER_STYLE}
        />
      </PieChart>
    </ChartContainer>
  );
}
