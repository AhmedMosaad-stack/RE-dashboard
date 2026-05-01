'use client';

import { useEffect, useState } from 'react';

import {
  AlertCircle,
  DollarSign,
  Plus,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/cards/StatCard';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomersTable } from '@/components/tables/CustomersTable';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { useCustomers, useCustomerStats } from '@/lib/hooks/useCustomers';
import { useBookings } from '@/lib/hooks/useBookings';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Customer } from '@/types/customer';

export default function CustomersPage() {
  const customersQuery = useCustomers();
  const customerStats = useCustomerStats();
  const bookingsQuery = useBookings();

  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const deleteCustomer = useDashboardStore((s) => s.deleteCustomer);
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    return () => setSearchQuery('');
  }, [setSearchQuery]);

  const isError = customersQuery.isError || bookingsQuery.isError;
  const isLoading = customersQuery.isLoading || bookingsQuery.isLoading;

  async function handleDeleteCustomer() {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    deleteCustomer(deletingCustomer.id);
    invalidateAll(queryClient);
    toast.success('Customer deleted successfully');
    setIsDeleting(false);
    setDeletingCustomer(null);
  }

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Customer roster, demographics, and spend."
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Customers"
          value={
            customerStats.isLoading
              ? ''
              : formatNumber(customerStats.stats?.total ?? 0)
          }
          change={9.4}
          icon={Users}
          description="vs last month"
          isLoading={customerStats.isLoading}
          index={0}
        />
        <StatCard
          title="New This Month"
          value={
            customerStats.isLoading
              ? ''
              : formatNumber(customerStats.stats?.newThisMonth ?? 0)
          }
          change={4.1}
          icon={UserPlus}
          description="last 30 days"
          isLoading={customerStats.isLoading}
          index={1}
        />
        <StatCard
          title="Average Spend"
          value={
            customerStats.isLoading
              ? ''
              : formatCurrency(customerStats.stats?.avgSpend ?? 0)
          }
          change={6.8}
          icon={DollarSign}
          description="per customer"
          isLoading={customerStats.isLoading}
          index={2}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        {!isLoading && customersQuery.data && (
          <span className="text-muted-foreground text-sm">
            {customersQuery.data.length} customers
          </span>
        )}
      </div>

      {isError ? (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load customers. Please refresh the page."
          icon={AlertCircle}
        />
      ) : isLoading || !customersQuery.data || !bookingsQuery.data ? (
        <TableSkeleton rows={10} columns={7} />
      ) : customersQuery.data.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="When you onboard customers, they'll appear here."
        />
      ) : (
        <CustomersTable
          data={customersQuery.data}
          bookings={bookingsQuery.data}
          onEdit={setEditingCustomer}
          onDelete={setDeletingCustomer}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details to add them to your roster.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingCustomer)}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer details below.
            </DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              customer={editingCustomer}
              onSuccess={() => setEditingCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deletingCustomer?.name ?? ''}? All their data will be removed.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
