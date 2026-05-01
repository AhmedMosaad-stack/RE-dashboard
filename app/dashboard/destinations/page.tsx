'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import { AlertCircle, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DestinationCard } from '@/components/cards/DestinationCard';

const DestinationForm = dynamic(
  () =>
    import('@/components/forms/DestinationForm').then((m) => m.DestinationForm),
  { ssr: false },
);
const DestinationsMap = dynamic(
  () =>
    import('@/components/charts/DestinationsMap').then((m) => m.DestinationsMap),
  { ssr: false, loading: () => <CardSkeleton /> },
);
import { useDestinations } from '@/lib/hooks/useDestinations';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Destination } from '@/types/destination';

export default function DestinationsPage() {
  const { data, isLoading, isError } = useDestinations();
  const deleteDestination = useDashboardStore((s) => s.deleteDestination);
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [deletingDestination, setDeletingDestination] =
    useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteDestination() {
    if (!deletingDestination) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    deleteDestination(deletingDestination.id);
    invalidateAll(queryClient);
    toast.success('Destination deleted successfully');
    setIsDeleting(false);
    setDeletingDestination(null);
  }

  return (
    <div className="page-fade-in space-y-6">
      <PageHeader
        title="Destinations"
        subtitle="Top travel destinations across the globe."
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </PageHeader>

      {isError ? (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load destinations. Please refresh the page."
          icon={AlertCircle}
        />
      ) : (
        <>
          <Card
            className="chart-container hand-border card-pop"
            style={{ '--chart-accent': 'var(--pop-teal)' } as React.CSSProperties}
          >
            <CardHeader>
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <DestinationsMap />
            </CardContent>
          </Card>

          {isLoading || !data ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              title="No destinations"
              description="Destinations will appear here once added."
            />
          ) : (
            <div className="destinations-grid grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onEdit={setEditingDestination}
                  onDelete={setDeletingDestination}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Destination</DialogTitle>
            <DialogDescription>
              Enter destination details to add it to the catalog.
            </DialogDescription>
          </DialogHeader>
          <DestinationForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingDestination)}
        onOpenChange={(open) => !open && setEditingDestination(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription>
              Update the destination details below.
            </DialogDescription>
          </DialogHeader>
          {editingDestination && (
            <DestinationForm
              destination={editingDestination}
              onSuccess={() => setEditingDestination(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deletingDestination)}
        onClose={() => setDeletingDestination(null)}
        onConfirm={handleDeleteDestination}
        title="Delete Destination"
        description={`Are you sure you want to delete ${deletingDestination?.name ?? ''}? This will remove it from the map and all statistics.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
