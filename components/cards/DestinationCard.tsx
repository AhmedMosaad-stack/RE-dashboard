'use client';

import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import type { Destination } from '@/types/destination';

interface DestinationCardProps {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
}

export function DestinationCard({
  destination,
  onEdit,
  onDelete,
}: DestinationCardProps) {
  return (
    <div
      className="card-pop hand-border group relative overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderRadius: '14px',
        position: 'relative',
        padding: 0,
      }}
    >
      {/* Hover action buttons */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(destination);
          }}
          aria-label={`Edit ${destination.name}`}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(destination);
          }}
          aria-label={`Delete ${destination.name}`}
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '175px', borderBottom: '2.5px solid var(--ink)' }}
      >
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              style={{
                fontFamily: "'Cabin', sans-serif",
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--ink)',
                marginBottom: '4px',
              }}
            >
              {destination.name}
            </h3>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Cabin', sans-serif", fontSize: '12px', color: 'var(--ink-muted)' }}>
                {destination.country}
              </span>
              <span
                className="continent-badge"
                style={{
                  background: 'var(--card-accent, var(--pop-blue))',
                  border: '2px solid var(--ink)',
                  borderRadius: '14px',
                  fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  display: 'inline-block',
                }}
              >
                {destination.continent}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#F9C22E', fontSize: '15px' }}>★</span>
            <span
              style={{
                fontFamily: "'Cabin', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {destination.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <div className="flex flex-col">
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                fontWeight: 700,
                fontFamily: "'Cabin', sans-serif",
              }}
            >
              Bookings
            </span>
            <span
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', fontFamily: "'Cabin', sans-serif" }}
            >
              {formatNumber(destination.totalBookings)}
            </span>
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                fontWeight: 700,
                fontFamily: "'Cabin', sans-serif",
              }}
            >
              Revenue
            </span>
            <span
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', fontFamily: "'Cabin', sans-serif" }}
            >
              {formatCurrency(destination.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Popular months */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {destination.popularMonths.map((month) => (
            <span
              key={month}
              style={{
                background: 'var(--pop-yellow)',
                color: '#1C1C1E',
                border: '1.5px solid var(--ink)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontFamily: "'Cabin', sans-serif",
              }}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
