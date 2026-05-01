'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Customer } from '@/types/customer';

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

export function createCustomerColumns(
  onEdit: (customer: Customer) => void,
  onDelete: (customer: Customer) => void,
): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortHeader
          label="Customer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const initials = customer.name
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={customer.avatarUrl} alt={customer.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">{customer.name}</span>
              <span className="text-muted-foreground text-xs">
                {customer.id}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'country',
      header: ({ column }) => (
        <SortHeader
          label="Country"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
    },
    {
      accessorKey: 'totalBookings',
      header: ({ column }) => (
        <SortHeader
          label="Total Bookings"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: ({ column }) => (
        <SortHeader
          label="Total Spent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalSpent)}
        </span>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => (
        <SortHeader
          label="Member Since"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => formatDate(row.original.joinedAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <ActionMenu
            onEdit={() => onEdit(customer)}
            onDelete={() => onDelete(customer)}
          />
        );
      },
      enableSorting: false,
      size: 48,
    },
  ];
}
