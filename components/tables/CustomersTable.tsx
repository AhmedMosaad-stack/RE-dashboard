'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { createCustomerColumns } from '@/components/tables/columns/customerColumns';
import {
  formatCurrency,
  formatDate,
} from '@/lib/utils/formatters';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import type { Customer } from '@/types/customer';
import type { Booking } from '@/types/booking';

interface CustomersTableProps {
  data: Customer[];
  bookings: Booking[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const filterByQuery: FilterFn<Customer> = (row, _columnId, value) => {
  const query = String(value).trim().toLowerCase();
  if (!query) return true;
  const c = row.original;
  return (
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query)
  );
};

export function CustomersTable({
  data,
  bookings,
  onEdit,
  onDelete,
}: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<Customer | null>(null);

  const searchQuery = useDashboardStore((s) => s.searchQuery);

  const columns = useMemo(
    () => createCustomerColumns(onEdit, onDelete),
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    globalFilterFn: filterByQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;
  const customerBookings = selected
    ? bookings.filter((b) => b.customerId === selected.id)
    : [];

  const initials = (name: string) =>
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <>
      <div
        className="table-container"
        style={{ background: 'var(--surface)', borderRadius: '14px', overflow: 'hidden' }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row: Row<Customer>) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelected(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isInteractive = cell.column.id === 'actions';
                    return (
                      <TableCell
                        key={cell.id}
                        className="text-sm"
                        style={{ color: 'var(--ink-muted)' }}
                        onClick={
                          isInteractive
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  No customers match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="pagination-controls flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selected.avatarUrl} alt={selected.name} />
                    <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <DialogDescription>{selected.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <div className="grid grid-cols-3 gap-4 text-sm">
                <Stat label="Country" value={selected.country} />
                <Stat label="Total Bookings" value={String(selected.totalBookings)} />
                <Stat
                  label="Total Spent"
                  value={formatCurrency(selected.totalSpent)}
                />
                <Stat
                  label="Member Since"
                  value={formatDate(selected.joinedAt)}
                />
                <Stat label="Customer ID" value={selected.id} />
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-semibold">Bookings</h4>
                {customerBookings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No bookings on file.
                  </p>
                ) : (
                  <ScrollArea className="h-56 pr-3">
                    <div className="space-y-2">
                      {customerBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border-border flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {booking.destination} — {booking.packageName}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {booking.id} · {formatDate(booking.departureDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {formatCurrency(booking.amount)}
                            </span>
                            <StatusBadge status={booking.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
