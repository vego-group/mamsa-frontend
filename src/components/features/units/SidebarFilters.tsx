'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AMENITIES_CATALOG, UNIT_TYPE_LABELS_AR } from '@/lib/constants/brand';
import { formatNumber } from '@/lib/utils/format';

const TYPES = ['all', 'villa', 'chalet', 'apartment', 'resort'] as const;
const RATINGS = [5, 4, 3, 2, 1] as const;

export interface SidebarFiltersValue {
  priceRange: [number, number];
  type: string;
  minRating: number;
  amenities: string[];
}

interface SidebarFiltersProps {
  value: SidebarFiltersValue;
  onChange: (next: SidebarFiltersValue) => void;
}

export function SidebarFilters({ value, onChange }: SidebarFiltersProps) {
  const update = (patch: Partial<SidebarFiltersValue>) => onChange({ ...value, ...patch });

  const toggleAmenity = (key: string) => {
    const next = value.amenities.includes(key)
      ? value.amenities.filter((a) => a !== key)
      : [...value.amenities, key];
    update({ amenities: next });
  };

  return (
    <Card className="space-y-6 p-5">
      <h2 className="text-lg font-bold text-brand-ink">الفلاتر</h2>

      {/* Price */}
      <section className="space-y-3">
        <Label className="text-sm font-semibold">السعر (ر.س / ليلة)</Label>
        <Slider
          min={0}
          max={5000}
          step={50}
          value={value.priceRange}
          onValueChange={(v) => update({ priceRange: [v[0]!, v[1]!] as [number, number] })}
        />
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-lg bg-brand-cream/60 py-1.5">
            <div className="text-brand-muted">من</div>
            <div className="font-bold">{formatNumber(value.priceRange[0])} ر.س</div>
          </div>
          <div className="rounded-lg bg-brand-cream/60 py-1.5">
            <div className="text-brand-muted">إلى</div>
            <div className="font-bold">{formatNumber(value.priceRange[1])} ر.س</div>
          </div>
        </div>
      </section>

      {/* Rating */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold">التقييم</Label>
        <div className="space-y-1.5">
          {RATINGS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={value.minRating === r}
                onChange={() => update({ minRating: r })}
                className="accent-brand-primary"
              />
              <span className="flex items-center gap-1">
                {Array.from({ length: r }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="text-brand-muted">فأكثر</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Type */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold">نوع الوحدة</Label>
        <div className="space-y-1.5">
          {TYPES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                checked={value.type === t}
                onChange={() => update({ type: t })}
                className="accent-brand-primary"
              />
              <span>{UNIT_TYPE_LABELS_AR[t]}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="space-y-2">
        <Label className="text-sm font-semibold">المرافق</Label>
        <div className="space-y-2">
          {AMENITIES_CATALOG.slice(0, 6).map((a) => (
            <label key={a.key} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={value.amenities.includes(a.key)}
                onCheckedChange={() => toggleAmenity(a.key)}
              />
              <span>{a.labelAr}</span>
            </label>
          ))}
        </div>
      </section>
    </Card>
  );
}
