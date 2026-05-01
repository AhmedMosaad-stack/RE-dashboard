'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { useDestinations } from '@/lib/hooks/useDestinations';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Booking } from '@/types/booking';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const bookingSchema = z
  .object({
    customerName: z.string().min(2, 'Name must be at least 2 characters'),
    customerId: z.string().min(1, 'Customer ID is required'),
    destination: z.string().min(1, 'Please select a destination'),
    packageName: z
      .string()
      .min(2, 'Package name must be at least 2 characters'),
    departureDate: z.string().min(1, 'Departure date is required'),
    returnDate: z.string().min(1, 'Return date is required'),
    travelers: z.coerce
      .number()
      .min(1, 'At least 1 traveler required')
      .max(20, 'Maximum 20 travelers'),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    status: z.enum(['confirmed', 'pending', 'cancelled']),
  })
  .refine(
    (data) => new Date(data.returnDate) > new Date(data.departureDate),
    {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    },
  );

type BookingFormInput = z.input<typeof bookingSchema>;
type BookingFormOutput = z.output<typeof bookingSchema>;

interface BookingFormProps {
  booking?: Booking;
  onSuccess: () => void;
}

export function BookingForm({ booking, onSuccess }: BookingFormProps) {
  const isEditMode = Boolean(booking);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addBooking = useDashboardStore((s) => s.addBooking);
  const updateBooking = useDashboardStore((s) => s.updateBooking);
  const queryClient = useQueryClient();
  const destinationsQuery = useDestinations();

  const form = useForm<BookingFormInput, unknown, BookingFormOutput>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    defaultValues: booking
      ? {
          customerName: booking.customerName,
          customerId: booking.customerId,
          destination: booking.destination,
          packageName: booking.packageName,
          departureDate: booking.departureDate,
          returnDate: booking.returnDate,
          travelers: booking.travelers,
          amount: booking.amount,
          status: booking.status,
        }
      : {
          customerName: '',
          customerId: '',
          destination: '',
          packageName: '',
          departureDate: '',
          returnDate: '',
          travelers: 1,
          amount: 0,
          status: 'pending',
        },
  });

  async function onSubmit(values: BookingFormOutput) {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (isEditMode && booking) {
        updateBooking(booking.id, values);
        toast.success('Booking updated successfully');
      } else {
        addBooking(values);
        toast.success('Booking added successfully');
      }
      invalidateAll(queryClient);
      onSuccess();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer ID</FormLabel>
                <FormControl>
                  <Input placeholder="CU-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinationsQuery.data?.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="packageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Name</FormLabel>
              <FormControl>
                <Input placeholder="Romantic Paris Getaway" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="travelers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travelers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    value={(field.value ?? '') as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step="0.01"
                    {...field}
                    value={(field.value ?? '') as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {isEditMode ? 'Save Changes' : 'Add Booking'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
