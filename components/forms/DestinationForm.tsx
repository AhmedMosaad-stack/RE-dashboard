'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ImageOff } from 'lucide-react';
import Image from 'next/image';

import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { invalidateAll } from '@/lib/utils/invalidateAll';
import type { Destination } from '@/types/destination';

import {
  Form,
  FormControl,
  FormDescription,
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

const CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'Americas',
  'Oceania',
  'Middle East',
] as const;

const destinationSchema = z.object({
  name: z.string().min(2, 'Destination name must be at least 2 characters'),
  country: z.string().min(2, 'Country name must be at least 2 characters'),
  continent: z.enum(CONTINENTS),
  imageUrl: z.string().url('Please enter a valid image URL'),
  totalBookings: z.coerce.number().min(0, 'Cannot be negative'),
  totalRevenue: z.coerce.number().min(0, 'Cannot be negative'),
  averageRating: z.coerce
    .number()
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  coordinates: z.object({
    lat: z.coerce
      .number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude'),
    lng: z.coerce
      .number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude'),
  }),
  popularMonths: z.string().min(1, 'Enter at least one month'),
});

type DestinationFormInput = z.input<typeof destinationSchema>;
type DestinationFormOutput = z.output<typeof destinationSchema>;

interface DestinationFormProps {
  destination?: Destination;
  onSuccess: () => void;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function DestinationForm({
  destination,
  onSuccess,
}: DestinationFormProps) {
  const isEditMode = Boolean(destination);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addDestination = useDashboardStore((s) => s.addDestination);
  const updateDestination = useDashboardStore((s) => s.updateDestination);
  const queryClient = useQueryClient();

  const form = useForm<
    DestinationFormInput,
    unknown,
    DestinationFormOutput
  >({
    resolver: zodResolver(destinationSchema),
    mode: 'onChange',
    defaultValues: destination
      ? {
          name: destination.name,
          country: destination.country,
          continent: destination.continent as (typeof CONTINENTS)[number],
          imageUrl: destination.imageUrl,
          totalBookings: destination.totalBookings,
          totalRevenue: destination.totalRevenue,
          averageRating: destination.averageRating,
          coordinates: {
            lat: destination.coordinates.lat,
            lng: destination.coordinates.lng,
          },
          popularMonths: destination.popularMonths.join(', '),
        }
      : {
          name: '',
          country: '',
          continent: 'Europe',
          imageUrl: '',
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 5,
          coordinates: { lat: 0, lng: 0 },
          popularMonths: '',
        },
  });

  const imageUrlValue = form.watch('imageUrl');
  const showPreview = isValidUrl(imageUrlValue);

  async function onSubmit(values: DestinationFormOutput) {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const popularMonths = values.popularMonths
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const payload = {
        name: values.name,
        country: values.country,
        continent: values.continent,
        imageUrl: values.imageUrl,
        totalBookings: values.totalBookings,
        totalRevenue: values.totalRevenue,
        averageRating: values.averageRating,
        coordinates: values.coordinates,
        popularMonths,
      };

      if (isEditMode && destination) {
        updateDestination(destination.id, payload);
        toast.success('Destination updated successfully');
      } else {
        addDestination(payload);
        toast.success('Destination added successfully');
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Name</FormLabel>
                <FormControl>
                  <Input placeholder="Paris" {...field} />
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
                <FormControl>
                  <Input placeholder="France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="continent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Continent</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTINENTS.map((c) => (
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

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://..."
                    {...field}
                    onChange={(e) => {
                      setImageError(false);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showPreview && (
          <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
            {imageError ? (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-6" />
              </div>
            ) : (
              <Image
                src={imageUrlValue}
                alt="Destination preview"
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}

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
            name="totalRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Revenue ($)</FormLabel>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="averageRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Rating (1-5)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step="0.1"
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
            name="coordinates.lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    min={-90}
                    max={90}
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
            name="coordinates.lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    min={-180}
                    max={180}
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
          name="popularMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Popular Months</FormLabel>
              <FormControl>
                <Input placeholder="June, July, August" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of months.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {isEditMode ? 'Save Changes' : 'Add Destination'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
