'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useTopDestinations } from '@/lib/hooks/useDestinations';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

const config = {
  totalBookings: {
    label: 'Bookings',
    color: '#2EC4B6',
  },
} satisfies ChartConfig;

const AXIS_TICK = { fill: '#999999', fontSize: 11, fontFamily: 'Cabin, sans-serif' };
const CHART_MARGIN = { top: 10, right: 16, left: 0, bottom: 0 };
const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface-2)',
  border: '2.5px solid var(--ink)',
  borderRadius: '6px',
  fontFamily: "'Cabin', sans-serif",
  fontSize: '12px',
  color: 'var(--ink)',
  boxShadow: '3px 3px 0px var(--ink)',
};

interface TopDestinationsChartProps {
  limit?: number;
}

export function TopDestinationsChart({ limit = 5 }: TopDestinationsChartProps) {
  const { top, isLoading } = useTopDestinations(limit);

  if (isLoading || !top) {
    return <CardSkeleton />;
  }

  const chartData = top.map((d) => ({
    name: d.name,
    totalBookings: d.totalBookings,
  }));

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={CHART_MARGIN}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          horizontal={false}
          stroke="rgba(0,0,0,0.07)"
          className="dark:stroke-[rgba(255,255,255,0.07)]"
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
        />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={80}
          tick={AXIS_TICK}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        <Bar dataKey="totalBookings" fill="#2EC4B6" radius={2} />
      </BarChart>
    </ChartContainer>
  );
}
