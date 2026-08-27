'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MapPin, MapPinOff } from 'lucide-react';
import { useStayQuery } from '@/stores/search';
import { cn } from '@/lib/utils/cn';
import { UnitRating } from '@/components/features/units/UnitRating';
import type { MapUnit } from './LocationMap';

export interface LocationUnit extends MapUnit {
  city: string;
  district: string;
  image: string;
  rating: number;
  /** 0 ⇒ nothing has been scored yet, so the card shows a "new" badge. */
  reviewCount: number;
}

// Leaflet needs `window`, so the map is client-only (no SSR).
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-cream/40 text-sm text-brand-muted">
      …
    </div>
  ),
});

export function LocationExplorer({
  units,
  fullBleed = false,
}: {
  units: LocationUnit[];
  /**
   * The map IS the page here (the results page's map view), so it gets the
   * height and the drag straight away. Left off, the map is one section among
   * many and has to be asked before it takes the guest's swipe.
   */
  fullBleed?: boolean;
}) {
  const t = useTranslations('map');
  const tPricing = useTranslations('pricing');
  const [activeId, setActiveId] = useState<string | null>(units[0]?.id ?? null);

  // Touch screens are the ones whose page scroll the map competes for; a mouse
  // can drag the map and still scroll the page with the wheel.
  const [coarse, setCoarse] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);
  const gated = coarse && !fullBleed && !armed;
  // Same stay carry-over as the unit cards — the map is just another way in.
  const stay = useStayQuery();
  const mapUnits = useMemo<MapUnit[]>(
    () => units.map(({ id, title, price, lat, lng }) => ({ id, title, price, lat, lng })),
    [units],
  );

  if (units.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border bg-brand-cream/30 text-center">
        <MapPinOff className="h-8 w-8 text-brand-muted" />
        <p className="text-sm text-brand-muted">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* Listings. A column beside the map from `lg` up; below that a strip the
          guest swipes through, under the map rather than stacked on top of it —
          which is what "map view" used to show first on a phone. */}
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[460px] lg:flex-col lg:gap-2 lg:overflow-x-visible lg:overflow-y-auto lg:pl-1">
        {units.map((u) => {
          const active = u.id === activeId;
          return (
            <Link
              key={u.id}
              href={`/units/${u.id}${stay}`}
              onMouseEnter={() => setActiveId(u.id)}
              onFocus={() => setActiveId(u.id)}
              className={`flex w-[78%] shrink-0 gap-3 rounded-xl border bg-white p-2 transition sm:w-[46%] lg:w-auto lg:shrink ${
                active
                  ? 'border-brand-primary shadow-md ring-1 ring-brand-primary/20'
                  : 'border-brand-border hover:shadow-sm'
              }`}
            >
              <img
                src={u.image}
                alt={u.title}
                loading="lazy"
                decoding="async"
                className="h-20 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{u.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{u.district}، {u.city}</span>
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-primary">
                    {u.price.toLocaleString('en-US')} {t('sar')}
                    <span className="text-xs font-normal text-brand-muted">
                      {' '}{t('perNight')} · {tPricing('inclVatShort')}
                    </span>
                  </span>
                  <UnitRating
                    rating={u.rating}
                    reviewCount={u.reviewCount}
                    className="text-xs"
                    starClassName="h-3 w-3"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* map — `isolate z-0` keeps Leaflet's high internal z-indexes from
          painting over the sticky header (z-40). */}
      <div
        className={cn(
          'relative isolate z-0 order-1 overflow-hidden rounded-2xl border border-brand-border lg:order-2 lg:min-h-[460px]',
          fullBleed ? 'min-h-[70dvh]' : 'min-h-[320px]',
        )}
      >
        <LocationMap
          units={mapUnits}
          activeId={activeId}
          onSelect={setActiveId}
          currencyLabel={t('sar')}
          dragging={!gated}
        />
        {gated && (
          // Transparent on purpose: the pins stay readable and tappable-looking
          // while the swipe still belongs to the page.
          <button
            type="button"
            onClick={() => setArmed(true)}
            className="absolute inset-0 z-[400] flex items-end justify-center pb-4"
          >
            <span className="rounded-full bg-brand-ink/85 px-4 py-2 text-xs font-medium text-white shadow-lg">
              {t('tapToMove')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
