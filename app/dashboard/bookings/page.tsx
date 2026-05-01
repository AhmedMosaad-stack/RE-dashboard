'use client';

import { useMemo, useState } from 'react';

import { AlertCircle, Plus, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingsTable } from '@/components/tables/BookingsTable';
import { BookingForm } from '@/components/forms/BookingForm';
import { useBookings } from '@/lib/hooks/useBookings';
import {
  useDashboardStore,
  type BookingStatusFilter,
} from '@/lib/store/useDashboardStore';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Booking } from '@/types/booking';

export default function BookingsPage() {
  const { data, isLoading, isError } = useBookings();
  const statusFilter = useDashboardStore((s) => s.bookingStatusFilter);
  const setStatusFilter = useDashboardStore((s) => s.setBookingStatusFilter);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const deleteBooking = useDashboardStore((s) => s.deleteBooking);
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const total = data?.length ?? 0;
  const visibleCount = useMemo(() => {
    if (!data) return 0;
    const query = searchQuery.trim().toLowerCase();
    return data.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesQuery =
        !query ||
        b.customerName.toLowerCase().includes(query) ||
        b.destination.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.packageName.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    }).length;
  }, [data, searchQuery, statusFilter]);

  async function handleDeleteBooking() {
    if (!deletingBooking) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    deleteBooking(deletingBooking.id);
    invalidateAll(queryClient);
    toast.success('Booking deleted successfully');
    setIsDeleting(false);
    setDeletingBooking(null);
  }

  return (
    <div className="page-fade-in space-y-4">
      <PageHeader
        title="Bookings"
        subtitle="Manage and review all customer bookings."
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as BookingStatusFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <span className="text-muted-foreground text-sm">
          Showing {visibleCount} of {total} bookings
        </span>
      </div>

      {isError ? (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load bookings. Please refresh the page."
          icon={AlertCircle}
        />
      ) : isLoading || !data ? (
        <TableSkeleton rows={10} columns={10} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When new bookings are created, they'll show up here."
        />
      ) : (
        <BookingsTable
          data={data}
          onEdit={setEditingBooking}
          onDelete={setDeletingBooking}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new booking.
            </DialogDescription>
          </DialogHeader>
          <BookingForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingBooking)}
        onOpenChange={(open) => !open && setEditingBooking(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details below.
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <BookingForm
              booking={editingBooking}
              onSuccess={() => setEditingBooking(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deletingBooking)}
        onClose={() => setDeletingBooking(null)}
        onConfirm={handleDeleteBooking}
        title="Delete Booking"
        description={`Are you sure you want to delete booking ${deletingBooking?.id ?? ''}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
