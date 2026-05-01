'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useRevenueByDestination } from '@/lib/hooks/useRevenue';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils/formatters';

const config = {
  revenue: {
    label: 'Revenue',
    color: '#00A896',
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

interface RevenueByDestChartProps {
  limit?: number;
  layout?: 'horizontal' | 'vertical';
  data?: { destination: string; revenue: number }[];
}

export function RevenueByDestChart({
  limit,
  layout = 'horizontal',
  data: dataProp,
}: RevenueByDestChartProps) {
  const fallback = useRevenueByDestination();
  const baseData = dataProp ?? fallback.data;
  const isLoading = dataProp ? false : fallback.isLoading;

  if (isLoading || !baseData) {
    return <CardSkeleton />;
  }

  const sorted = [...baseData].sort((a, b) => b.revenue - a.revenue);
  const chartData = limit ? sorted.slice(0, limit) : sorted;
  const isHorizontal = layout === 'horizontal';

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={CHART_MARGIN}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          horizontal={!isHorizontal}
          vertical={isHorizontal}
          stroke="rgba(0,0,0,0.07)"
          className="dark:stroke-[rgba(255,255,255,0.07)]"
        />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCurrency(v)}
              tick={AXIS_TICK}
            />
            <YAxis
              type="category"
              dataKey="destination"
              tickLine={false}
              axisLine={false}
              width={80}
              tick={AXIS_TICK}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="destination"
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v: number) => formatCurrency(v)}
              tick={AXIS_TICK}
            />
          </>
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        <Bar dataKey="revenue" fill="#00A896" radius={2} />
      </BarChart>
    </ChartContainer>
  );
}
