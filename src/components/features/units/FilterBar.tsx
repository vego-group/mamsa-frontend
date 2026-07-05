'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/** City VALUES stay Arabic — that's what the backend stores and filters by. */
const CITIES = [
  { value: 'الرياض', key: 'riyadh' },
  { value: 'جدة', key: 'jeddah' },
  { value: 'مكة', key: 'makkah' },
  { value: 'المدينة', key: 'madinah' },
  { value: 'الدمام', key: 'dammam' },
  { value: 'أبها', key: 'abha' },
  { value: 'العلا', key: 'alula' },
] as const;

const UNIT_TYPES = ['all', 'apartment', 'studio', 'villa'] as const;

export function FilterBar({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('filter');
  const tTypes = useTranslations('types');
  const tCities = useTranslations('cities');
  const router = useRouter();
  const params = useSearchParams();
  const [city, setCity] = useState(params.get('city') ?? '');
  const [type, setType] = useState(params.get('type') ?? 'all');
  const [capacity, setCapacity] = useState(params.get('capacity') ?? '1');
  const [startDate, setStartDate] = useState(params.get('start') ?? '');
  const [endDate, setEndDate] = useState(params.get('end') ?? '');

  const handleSearch = () => {
    const q = new URLSearchParams();
    if (city) q.set('city', city);
    if (type !== 'all') q.set('type', type);
    if (capacity) q.set('capacity', capacity);
    if (startDate) q.set('start', startDate);
    if (endDate) q.set('end', endDate);
    router.push(`/units?${q.toString()}`);
  };

  // Mobile: fields stack as soft rows inside a rounded card; desktop keeps the pill bar.
  const fieldCls =
    'flex w-full items-center gap-2 rounded-xl bg-brand-cream/40 px-3 py-2.5 transition md:flex-1 md:rounded-full md:bg-transparent md:py-2 md:hover:bg-brand-cream/40';

  return (
    <div className={compact ? 'mx-auto max-w-6xl' : 'mx-auto max-w-6xl px-4'}>
      <div className="flex flex-col gap-2 rounded-3xl border border-brand-border bg-white p-3 shadow-sm md:flex-row md:items-center md:gap-1 md:rounded-full md:p-2">
        {/* city */}
        <div className={fieldCls}>
          <MapPin className="h-4 w-4 shrink-0 text-brand-muted" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            <option value="">{t('city')}</option>
            {CITIES.map((c) => (
              <option key={c.key} value={c.value}>{tCities(c.key)}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* type */}
        <div className={fieldCls}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            {UNIT_TYPES.map((ty) => (
              <option key={ty} value={ty}>{t('unitType')}: {tTypes(ty)}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* guests */}
        <div className={fieldCls}>
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{t('guests')}: {n}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* dates — side by side on mobile, inline on desktop (md:contents dissolves the wrapper) */}
        <div className="grid grid-cols-2 gap-2 md:contents">
          <label className={cn(fieldCls, 'cursor-pointer')}>
            <span className="shrink-0 text-sm text-brand-muted">{t('checkIn')}</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-brand-ink focus:outline-none"
            />
          </label>
          <div className="hidden h-6 w-px bg-brand-border md:block" />
          <label className={cn(fieldCls, 'cursor-pointer')}>
            <span className="shrink-0 text-sm text-brand-muted">{t('checkOut')}</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-brand-ink focus:outline-none"
            />
          </label>
        </div>

        {/* search button */}
        <Button onClick={handleSearch} className="h-12 w-full rounded-xl px-6 md:w-auto md:rounded-full">
          <Search className="h-4 w-4" />
          <span>{t('search')}</span>
        </Button>
      </div>
    </div>
  );
}
