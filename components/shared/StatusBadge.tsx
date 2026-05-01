import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types/booking';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusClass: Record<BookingStatus, string> = {
  confirmed: 'badge-confirmed',
  pending:   'badge-pending',
  cancelled: 'badge-cancelled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={cn(statusClass[status], className)}>
      {label}
    </span>
  );
}
