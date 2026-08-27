'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, BedDouble, Bath, Users, Wifi } from 'lucide-react';
import type { Unit } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/stores/favorites';
import { useStayQuery } from '@/stores/search';
import { UnitRating } from '@/components/features/units/UnitRating';
import { formatSAR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface UnitCardProps {
  unit: Unit;
  variant?: 'list' | 'grid';
}

export function UnitCard({ unit, variant = 'list' }: UnitCardProps) {
  const t = useTranslations('card');
  const tPricing = useTranslations('pricing');
  const tAmenities = useTranslations('amenities');
  const { has, toggle } = useFavoritesStore();
  const isFav = has(unit.id);
  // Hand the listing the dates the guest already picked, so its booking widget
  // opens on their stay instead of an empty calendar.
  const stay = useStayQuery();
  const href = `/units/${unit.id}${stay}`;

  /** Amenity labels come from the backend in Arabic — translate known keys, pass through the rest. */
  const amenityLabel = (a: Unit['amenities'][number]) =>
    tAmenities.has(a.key) ? tAmenities(a.key) : a.labelAr;

  if (variant === 'grid') {
    return (
      <Card className="group overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          {unit.images[0] && (
            <img
              src={unit.images[0].card}
              alt={unit.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(unit.id); }}
            className="absolute end-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label={t('save')}
          >
            <Heart className={cn('h-4 w-4 transition', isFav ? 'fill-status-danger text-status-danger' : 'text-brand-muted')} />
          </button>
          {unit.isFeatured && (
            <Badge variant="cream" className="absolute start-3 top-3">{t('featured')}</Badge>
          )}
        </div>
        <div className="space-y-2 p-4">
          <Link href={href} className="block">
            <h3 className="line-clamp-1 font-semibold text-brand-ink group-hover:text-brand-primary">{unit.title}</h3>
          </Link>
          <div className="flex flex-wrap gap-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t('guests', { count: unit.capacity })}</span>
            <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {t('rooms', { count: unit.bedrooms })}</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {t('baths', { count: unit.bathrooms })}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm">
              <div>
                {/* Gross and final — rendered verbatim, never multiplied. */}
                <span className="font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
                <span className="text-xs text-brand-muted"> {t('perNight')}</span>
              </div>
              <div className="text-[11px] text-brand-muted">{tPricing('inclVatShort')}</div>
            </div>
            <UnitRating
              rating={unit.rating}
              reviewCount={unit.reviewCount}
              showCount
              className="text-xs"
            />
          </div>
        </div>
      </Card>
    );
  }

  // list variant — wide horizontal card
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 p-4 md:flex-row-reverse">
        <div className="relative h-56 w-full overflow-hidden rounded-xl md:h-44 md:w-72">
          {unit.images[0] && (
            <img
              src={unit.images[0].card}
              alt={unit.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(unit.id); }}
            className="absolute end-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label={t('save')}
          >
            <Heart className={cn('h-4 w-4', isFav ? 'fill-status-danger text-status-danger' : 'text-brand-muted')} />
          </button>
        </div>

        {/* details */}
        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-ink">{unit.title}</h3>
              <UnitRating
                rating={unit.rating}
                reviewCount={unit.reviewCount}
                showCount
                className="text-sm"
                starClassName="h-4 w-4"
              />
            </div>
            <p className="text-sm text-brand-muted">{unit.city}، {unit.country}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-brand-muted">
              <span>{t('guests', { count: unit.capacity })}</span>
              <span>•</span>
              <span>{t('bedrooms', { count: unit.bedrooms })}</span>
              <span>•</span>
              <span>{t('bathrooms', { count: unit.bathrooms })}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {unit.amenities.slice(0, 4).map((a) => (
                <Badge key={a.key} variant="sage" className="gap-1">
                  {a.key === 'wifi' && <Wifi className="h-3 w-3" />}
                  {amenityLabel(a)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <Button asChild variant="default" size="sm">
              <Link href={href}>{t('viewDetails')}</Link>
            </Button>
            <div className="text-end">
              <div>
                <span className="font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
              </div>
              <div className="text-xs text-brand-muted">{t('perNight')}</div>
              <div className="text-[11px] text-brand-muted">{tPricing('inclVatShort')}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
