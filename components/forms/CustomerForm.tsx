'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Customer } from '@/types/customer';

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

const COUNTRIES = [
  'Egypt',
  'UAE',
  'Saudi Arabia',
  'USA',
  'UK',
  'Germany',
  'France',
  'Italy',
  'Japan',
  'Australia',
  'Canada',
  'Spain',
  'Netherlands',
  'Sweden',
  'Norway',
  'Brazil',
  'India',
  'China',
  'South Korea',
  'Singapore',
] as const;

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(1, 'Please select a country'),
  totalBookings: z.coerce.number().min(0, 'Cannot be negative'),
  totalSpent: z.coerce.number().min(0, 'Cannot be negative'),
});

type CustomerFormInput = z.input<typeof customerSchema>;
type CustomerFormOutput = z.output<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const isEditMode = Boolean(customer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addCustomer = useDashboardStore((s) => s.addCustomer);
  const updateCustomer = useDashboardStore((s) => s.updateCustomer);
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email,
          country: customer.country,
          totalBookings: customer.totalBookings,
          totalSpent: customer.totalSpent,
        }
      : {
          name: '',
          email: '',
          country: '',
          totalBookings: 0,
          totalSpent: 0,
        },
  });

  async function onSubmit(values: CustomerFormOutput) {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (isEditMode && customer) {
        updateCustomer(customer.id, values);
        toast.success('Customer updated successfully');
      } else {
        addCustomer(values);
        toast.success('Customer added successfully');
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="totalBookings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Bookings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
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
            name="totalSpent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Spent ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
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

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {isEditMode ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
