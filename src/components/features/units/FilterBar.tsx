'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UNIT_TYPE_LABELS_AR } from '@/lib/constants/brand';

const CITIES = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'أبها', 'العلا'];
const UNIT_TYPES = ['all', 'apartment', 'studio', 'villa'] as const;

export function FilterBar({ compact = false }: { compact?: boolean }) {
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

  return (
    <div className={compact ? 'mx-auto max-w-6xl' : 'mx-auto max-w-6xl px-4'}>
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-brand-border bg-white p-2 shadow-sm md:flex-nowrap">
        {/* city */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2 transition hover:bg-brand-cream/40">
          <MapPin className="h-4 w-4 shrink-0 text-brand-muted" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            <option value="">المدينة</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* type */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2 transition hover:bg-brand-cream/40">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>نوع الوحدة: {UNIT_TYPE_LABELS_AR[t]}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* guests */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-2 transition hover:bg-brand-cream/40">
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full min-w-0 appearance-none bg-transparent text-sm focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>عدد الأشخاص: {n}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* dates */}
        <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-brand-cream/40">
          <span className="shrink-0 text-sm text-brand-muted">الوصول</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-brand-ink focus:outline-none"
          />
        </label>
        <div className="hidden h-6 w-px bg-brand-border md:block" />
        <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-brand-cream/40">
          <span className="shrink-0 text-sm text-brand-muted">المغادرة</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-brand-ink focus:outline-none"
          />
        </label>

        {/* search button */}
        <Button onClick={handleSearch} className="h-12 rounded-full px-6">
          <Search className="h-4 w-4" />
          <span>ابدأ البحث</span>
        </Button>
      </div>
    </div>
  );
}
