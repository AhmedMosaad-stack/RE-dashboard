'use client';

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis, Dot } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useMonthlyRevenue } from '@/lib/hooks/useRevenue';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils/formatters';

const config = {
  revenue: {
    label: 'Revenue',
    color: '#6BCB77',
  },
  bookings: {
    label: 'Bookings',
    color: '#4D96FF',
  },
} satisfies ChartConfig;

const REVENUE_COLOR = '#6BCB77';
const BOOKINGS_COLOR = '#4D96FF';
const HIGHLIGHT_COLOR = 'var(--pop-green)';

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
const LEGEND_WRAPPER_STYLE = { fontFamily: 'Cabin, sans-serif', fontSize: '12px' };
const BOOKINGS_DOT = { r: 3, fill: BOOKINGS_COLOR };

interface MonthlyRevenueChartProps {
  showBookings?: boolean;
  height?: number;
  data?: { month: string; revenue: number; bookings: number }[];
  selectedMonth?: number;
}

interface DotPayload {
  cx?: number;
  cy?: number;
  index?: number;
}

export function MonthlyRevenueChart({
  showBookings = false,
  height = 300,
  data: dataProp,
  selectedMonth = 0,
}: MonthlyRevenueChartProps) {
  const fallback = useMonthlyRevenue();
  const data = dataProp ?? fallback.data;
  const isLoading = dataProp ? false : fallback.isLoading;

  if (isLoading || !data) {
    return <CardSkeleton />;
  }

  const renderRevenueDot = (props: DotPayload) => {
    const { cx, cy, index } = props;
    const isHighlight =
      selectedMonth > 0 && typeof index === 'number' && index + 1 === selectedMonth;
    if (!isHighlight) {
      return <Dot key={`r-${index}`} cx={cx} cy={cy} r={0} />;
    }
    return (
      <Dot
        key={`r-${index}`}
        cx={cx}
        cy={cy}
        r={6}
        fill={HIGHLIGHT_COLOR}
        stroke={HIGHLIGHT_COLOR}
      />
    );
  };

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: `${height}px` }}
    >
      <AreaChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="rgba(0,0,0,0.07)"
          className="dark:stroke-[rgba(255,255,255,0.07)]"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
        />
        <YAxis
          yAxisId="revenue"
          tickLine={false}
          axisLine={false}
          width={60}
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={AXIS_TICK}
        />
        {showBookings && (
          <YAxis
            yAxisId="bookings"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
            tick={AXIS_TICK}
          />
        )}
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                name === 'revenue'
                  ? formatCurrency(Number(value))
                  : `${value} bookings`
              }
            />
          }
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke={REVENUE_COLOR}
          fill={REVENUE_COLOR}
          fillOpacity={0.12}
          strokeWidth={2}
          dot={renderRevenueDot}
        />
        {showBookings && (
          <Line
            yAxisId="bookings"
            type="monotone"
            dataKey="bookings"
            stroke={BOOKINGS_COLOR}
            strokeWidth={2}
            dot={BOOKINGS_DOT}
          />
        )}
        {showBookings && (
          <ChartLegend
            content={<ChartLegendContent />}
            wrapperStyle={LEGEND_WRAPPER_STYLE}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}
