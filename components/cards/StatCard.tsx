'use client';

import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPercentChange } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  index?: number;
}

const ACCENT_COLORS = [
  'var(--pop-blue)',
  'var(--pop-green)',
  'var(--pop-orange)',
  'var(--pop-teal)',
];

const ICON_COLORS = [
  '#FFFFFF',  // pop-blue → white
  '#1C1C1E',  // pop-green → dark
  '#1C1C1E',  // pop-orange → dark
  '#1C1C1E',  // pop-teal → dark
];

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  isLoading,
  index = 0,
}: StatCardProps) {
  const isPositive = change >= 0;
  const hasChange = !Number.isNaN(change);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  if (isLoading) {
    return (
      <div
        className="stat-card hand-border"
        style={{ '--card-accent': accent } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-11 rounded" />
        </div>
        <Skeleton className="mt-4 h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }

  const changeClass = !hasChange
    ? 'stat-card-change-neutral'
    : isPositive
      ? 'stat-card-change-positive'
      : 'stat-card-change-negative';

  return (
    <div
      className="stat-card-enter"
      style={{ '--enter-delay': `${index * 100}ms` } as React.CSSProperties}
    >
      <div
        className="stat-card hand-border card-pop"
        style={{ '--card-accent': accent } as React.CSSProperties}
      >
        <div className="stat-card-corner-dot" />
        <div className="stat-card-icon" style={{ color: iconColor }}>
          <Icon style={{ width: 20, height: 20 }} />
        </div>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value">{value}</p>
        <div className="mt-2 flex items-center gap-1.5">
          {hasChange ? (
            <span className={cn(changeClass)}>
              {isPositive ? '↑ ' : '↓ '}
              {formatPercentChange(change)}
            </span>
          ) : (
            <span className="stat-card-change-neutral">—</span>
          )}
          {description && (
            <span style={{ color: 'var(--ink-faint)', fontSize: '12px', fontFamily: "'Cabin', sans-serif" }}>
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
