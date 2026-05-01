'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { useTheme } from 'next-themes';
import { useDestinations } from '@/lib/hooks/useDestinations';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { cn } from '@/lib/utils';

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function DestinationsMap() {
  const { data, isLoading } = useDestinations();
  const { resolvedTheme } = useTheme();
  const [hovered, setHovered] = useState<{
    name: string;
    bookings: number;
    x: number;
    y: number;
  } | null>(null);

  if (isLoading || !data) {
    return <CardSkeleton />;
  }

  const isDark = resolvedTheme === 'dark';
  const geoFill = isDark ? 'oklch(0.269 0 0)' : 'oklch(0.93 0 0)';
  const geoStroke = isDark ? 'oklch(0.205 0 0)' : 'oklch(1 0 0)';
  const markerFill = 'var(--chart-1)';

  const maxBookings = Math.max(...data.map((d) => d.totalBookings), 1);

  return (
    <div className="bg-card border-border relative w-full overflow-hidden rounded-lg border">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={geoFill}
                stroke={geoStroke}
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: geoFill },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {data.map((dest) => {
          const radius = 4 + (dest.totalBookings / maxBookings) * 10;
          return (
            <Marker
              key={dest.id}
              coordinates={[dest.coordinates.lng, dest.coordinates.lat]}
              onMouseEnter={(event) =>
                setHovered({
                  name: dest.name,
                  bookings: dest.totalBookings,
                  x: event.clientX,
                  y: event.clientY,
                })
              }
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                r={radius}
                fill={markerFill}
                fillOpacity={0.65}
                stroke={markerFill}
                strokeWidth={1.2}
                className="cursor-pointer transition-opacity hover:fill-opacity-100"
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {hovered && (
        <div
          className={cn(
            'bg-popover text-popover-foreground border-border pointer-events-none fixed z-50 rounded-md border px-3 py-2 text-xs shadow-md'
          )}
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          <div className="font-semibold">{hovered.name}</div>
          <div className="text-muted-foreground">
            {hovered.bookings} bookings
          </div>
        </div>
      )}
    </div>
  );
}
