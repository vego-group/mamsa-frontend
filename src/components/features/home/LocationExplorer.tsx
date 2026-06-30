'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import type { MapUnit } from './LocationMap';

export interface LocationUnit extends MapUnit {
  city: string;
  district: string;
  image: string;
  rating: number;
}

// Leaflet needs `window`, so the map is client-only (no SSR).
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-cream/40 text-sm text-brand-muted">
      جاري تحميل الخريطة...
    </div>
  ),
});

export function LocationExplorer({ units }: { units: LocationUnit[] }) {
  const [activeId, setActiveId] = useState<string | null>(units[0]?.id ?? null);
  const mapUnits = useMemo<MapUnit[]>(
    () => units.map(({ id, title, price, lat, lng }) => ({ id, title, price, lat, lng })),
    [units],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* listings sidebar */}
      <div className="max-h-[460px] space-y-2 overflow-y-auto pl-1">
        {units.map((u) => {
          const active = u.id === activeId;
          return (
            <Link
              key={u.id}
              href={`/units/${u.id}`}
              onMouseEnter={() => setActiveId(u.id)}
              onFocus={() => setActiveId(u.id)}
              className={`flex gap-3 rounded-xl border bg-white p-2 transition ${
                active
                  ? 'border-brand-primary shadow-md ring-1 ring-brand-primary/20'
                  : 'border-brand-border hover:shadow-sm'
              }`}
            >
              <img src={u.image} alt={u.title} className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{u.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{u.district}، {u.city}</span>
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-primary">
                    {u.price.toLocaleString('en-US')} ر.س
                    <span className="text-xs font-normal text-brand-muted"> / ليلة</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-brand-ink">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {u.rating}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* map — `isolate z-0` keeps Leaflet's high internal z-indexes from
          painting over the sticky header (z-40). */}
      <div className="relative z-0 min-h-[460px] overflow-hidden rounded-2xl border border-brand-border isolate">
        <LocationMap units={mapUnits} activeId={activeId} onSelect={setActiveId} />
      </div>
    </div>
  );
}
