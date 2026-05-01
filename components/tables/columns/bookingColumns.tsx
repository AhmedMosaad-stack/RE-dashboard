'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/lib/utils/formatters';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Booking, BookingStatus } from '@/types/booking';

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-7 -ml-2 px-2 font-medium"
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3 w-3" />
    </Button>
  );
}

function StatusCell({ booking }: { booking: Booking }) {
  const updateBookingStatus = useDashboardStore((s) => s.updateBookingStatus);
  const queryClient = useQueryClient();

  function cycleStatus() {
    const cycle: Record<BookingStatus, BookingStatus> = {
      confirmed: 'pending',
      pending: 'cancelled',
      cancelled: 'confirmed',
    };
    const newStatus = cycle[booking.status];
    updateBookingStatus(booking.id, newStatus);
    invalidateAll(queryClient);
    toast.success(`Status updated to ${newStatus}`);
  }

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className="cursor-pointer transition-opacity hover:opacity-80"
      title="Click to change status"
    >
      <StatusBadge status={booking.status} />
    </button>
  );
}

export function createBookingColumns(
  onEdit: (booking: Booking) => void,
  onDelete: (booking: Booking) => void,
): ColumnDef<Booking>[] {
  return [
    {
      accessorKey: 'id',
      header: 'Booking ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.id}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <SortHeader
          label="Customer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => <span>{row.original.customerName}</span>,
    },
    {
      accessorKey: 'destination',
      header: ({ column }) => (
        <SortHeader
          label="Destination"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
    },
    {
      accessorKey: 'packageName',
      header: 'Package',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.packageName}
        </span>
      ),
    },
    {
      accessorKey: 'departureDate',
      header: ({ column }) => (
        <SortHeader
          label="Departure"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => formatDate(row.original.departureDate),
    },
    {
      accessorKey: 'travelers',
      header: ({ column }) => (
        <SortHeader
          label="Travelers"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => row.original.travelers,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <SortHeader
          label="Amount"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => <StatusCell booking={row.original} />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortHeader
          label="Created"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatRelativeTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <ActionMenu
            onEdit={() => onEdit(booking)}
            onDelete={() => onDelete(booking)}
          />
        );
      },
      enableSorting: false,
      size: 48,
    },
  ];
}
