'use client';

import Link from 'next/link';
import { Heart, Star, BedDouble, Bath, Users, Wifi } from 'lucide-react';
import type { Unit } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/stores/favorites';
import { formatSAR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface UnitCardProps {
  unit: Unit;
  variant?: 'list' | 'grid';
}

export function UnitCard({ unit, variant = 'list' }: UnitCardProps) {
  const { has, toggle } = useFavoritesStore();
  const isFav = has(unit.id);

  if (variant === 'grid') {
    return (
      <Card className="group overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          {unit.imageUrls[0] && (
            <img
              src={unit.imageUrls[0]}
              alt={unit.title}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(unit.id); }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label="حفظ في المفضلة"
          >
            <Heart className={cn('h-4 w-4 transition', isFav ? 'fill-status-danger text-status-danger' : 'text-brand-muted')} />
          </button>
          {unit.hasDiscount && unit.discountPercent && (
            <Badge variant="danger" className="absolute left-3 top-3">خصم {unit.discountPercent}%</Badge>
          )}
          {unit.isFeatured && !unit.hasDiscount && (
            <Badge variant="cream" className="absolute left-3 top-3">مميز</Badge>
          )}
        </div>
        <div className="space-y-2 p-4">
          <Link href={`/units/${unit.id}`} className="block">
            <h3 className="line-clamp-1 font-semibold text-brand-ink group-hover:text-brand-primary">{unit.title}</h3>
          </Link>
          <div className="flex flex-wrap gap-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {unit.capacity} ضيوف</span>
            <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {unit.bedrooms} غرف</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {unit.bathrooms} حمام</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm">
              <span className="font-bold text-brand-ink">{unit.pricePerNight}</span>
              <span className="text-xs text-brand-muted"> ر.س / ليلة</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold text-brand-ink">{unit.rating}</span>
              <span className="text-brand-muted">({unit.reviewCount})</span>
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // list variant — wide horizontal card
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 p-4 md:flex-row-reverse">
        {/* image on the left in RTL list */}
        <div className="relative h-56 w-full overflow-hidden rounded-xl md:h-44 md:w-72">
          {unit.imageUrls[0] && (
            <img src={unit.imageUrls[0]} alt={unit.title} className="h-full w-full object-cover" />
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(unit.id); }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label="حفظ"
          >
            <Heart className={cn('h-4 w-4', isFav ? 'fill-status-danger text-status-danger' : 'text-brand-muted')} />
          </button>
        </div>

        {/* details */}
        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-ink">{unit.title}</h3>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{unit.rating}</span>
                <span className="text-brand-muted">({unit.reviewCount})</span>
              </span>
            </div>
            <p className="text-sm text-brand-muted">{unit.city}، {unit.country}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-brand-muted">
              <span>{unit.capacity} ضيوف</span>
              <span>•</span>
              <span>{unit.bedrooms} غرف نوم</span>
              <span>•</span>
              <span>{unit.bathrooms} حمامات</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {unit.amenities.slice(0, 4).map((a) => (
                <Badge key={a.key} variant="sage" className="gap-1">
                  {a.key === 'wifi' && <Wifi className="h-3 w-3" />}
                  {a.labelAr}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <Button asChild variant="default" size="sm">
              <Link href={`/units/${unit.id}`}>عرض التفاصيل</Link>
            </Button>
            <div className="text-end">
              <div>
                <span className="font-bold text-brand-ink">{formatSAR(unit.pricePerNight)}</span>
              </div>
              <div className="text-xs text-brand-muted">/ ليلة</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
