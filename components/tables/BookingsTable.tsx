'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Row,
  type FilterFn,
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
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { createBookingColumns } from '@/components/tables/columns/bookingColumns';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/lib/utils/formatters';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';

interface BookingsTableProps {
  data: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

const filterByQuery: FilterFn<Booking> = (row, _columnId, value) => {
  const query = String(value).trim().toLowerCase();
  if (!query) return true;
  const b = row.original;
  return (
    b.customerName.toLowerCase().includes(query) ||
    b.destination.toLowerCase().includes(query) ||
    b.id.toLowerCase().includes(query) ||
    b.packageName.toLowerCase().includes(query)
  );
};

export function BookingsTable({ data, onEdit, onDelete }: BookingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const statusFilter = useDashboardStore((s) => s.bookingStatusFilter);
  const searchQuery = useDashboardStore((s) => s.searchQuery);

  const columns = useMemo(
    () => createBookingColumns(onEdit, onDelete),
    [onEdit, onDelete],
  );

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((b) => b.status === statusFilter);
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
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

  return (
    <>
      <div
        className="table-container"
        style={{ background: 'var(--surface)', borderRadius: '14px', overflow: 'hidden' }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
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
              rows.map((row: Row<Booking>) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedBooking(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isInteractive =
                      cell.column.id === 'actions' ||
                      cell.column.id === 'status';
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
                  No bookings match the current filters.
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
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{selectedBooking.id}</span>
                  <StatusBadge status={selectedBooking.status} />
                </DialogTitle>
                <DialogDescription>
                  Booking details for {selectedBooking.customerName}.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <DetailRow label="Customer" value={selectedBooking.customerName} />
                <DetailRow label="Customer ID" value={selectedBooking.customerId} />
                <DetailRow label="Destination" value={selectedBooking.destination} />
                <DetailRow label="Package" value={selectedBooking.packageName} />
                <DetailRow
                  label="Departure"
                  value={formatDate(selectedBooking.departureDate)}
                />
                <DetailRow
                  label="Return"
                  value={formatDate(selectedBooking.returnDate)}
                />
                <DetailRow
                  label="Travelers"
                  value={String(selectedBooking.travelers)}
                />
                <DetailRow
                  label="Amount"
                  value={formatCurrency(selectedBooking.amount)}
                />
                <DetailRow
                  label="Created"
                  value={formatRelativeTime(selectedBooking.createdAt)}
                />
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
