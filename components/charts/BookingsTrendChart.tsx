'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Dot,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useMonthlyRevenue } from '@/lib/hooks/useRevenue';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

const config = {
  bookings: {
    label: 'Bookings',
    color: '#4D96FF',
  },
} satisfies ChartConfig;

const DEFAULT_COLOR = '#4D96FF';
const HIGHLIGHT_COLOR = 'var(--pop-red)';

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
const ACTIVE_DOT = { r: 5 };

interface BookingsTrendChartProps {
  data?: { month: string; bookings: number }[];
  selectedMonth?: number;
}

interface DotPayload {
  cx?: number;
  cy?: number;
  index?: number;
}

export function BookingsTrendChart({
  data: dataProp,
  selectedMonth = 0,
}: BookingsTrendChartProps) {
  const fallback = useMonthlyRevenue();
  const data = dataProp ?? fallback.data;
  const isLoading = dataProp ? false : fallback.isLoading;

  if (isLoading || !data) {
    return <CardSkeleton />;
  }

  const renderDot = (props: DotPayload) => {
    const { cx, cy, index } = props;
    const isHighlight =
      selectedMonth > 0 && typeof index === 'number' && index + 1 === selectedMonth;
    return (
      <Dot
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={isHighlight ? 5 : 3}
        fill={isHighlight ? HIGHLIGHT_COLOR : DEFAULT_COLOR}
        stroke={isHighlight ? HIGHLIGHT_COLOR : DEFAULT_COLOR}
      />
    );
  };

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <LineChart data={data} margin={CHART_MARGIN}>
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
          className="dark:[&_.recharts-cartesian-axis-tick_text]:fill-[#606060]"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={AXIS_TICK}
          className="dark:[&_.recharts-cartesian-axis-tick_text]:fill-[#606060]"
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          contentStyle={TOOLTIP_CONTENT_STYLE}
        />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke={DEFAULT_COLOR}
          strokeWidth={2}
          dot={renderDot}
          activeDot={ACTIVE_DOT}
        />
      </LineChart>
    </ChartContainer>
  );
}
