'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, Calendar as CalIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UNIT_TYPE_LABELS_AR } from '@/lib/constants/brand';

const CITIES = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'أبها', 'العلا'];
const UNIT_TYPES = ['all', 'apartment', 'studio', 'villa', 'chalet', 'resort'] as const;

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
    <div className={compact ? 'mx-auto max-w-5xl' : 'mx-auto max-w-5xl px-4'}>
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-brand-border bg-white p-2 shadow-sm md:flex-nowrap">
        {/* city */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-cream/40">
          <MapPin className="h-4 w-4 text-brand-muted" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none bg-transparent text-sm focus:outline-none"
          >
            <option value="">المدينة</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* type */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-cream/40">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none bg-transparent text-sm focus:outline-none"
          >
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>نوع الوحدة: {UNIT_TYPE_LABELS_AR[t]}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* guests */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-cream/40">
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full appearance-none bg-transparent text-sm focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>عدد الأشخاص: {n}</option>
            ))}
          </select>
        </div>

        <div className="hidden h-6 w-px bg-brand-border md:block" />

        {/* dates */}
        <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-cream/40">
          <CalIcon className="h-4 w-4 text-brand-muted" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="تاريخ الوصول"
          />
        </div>
        <div className="hidden h-6 w-px bg-brand-border md:block" />
        <div className="flex flex-1 items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand-cream/40">
          <CalIcon className="h-4 w-4 text-brand-muted" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="تاريخ المغادرة"
          />
        </div>

        {/* search button */}
        <Button onClick={handleSearch} className="h-12 rounded-full px-6">
          <Search className="h-4 w-4" />
          <span>ابدأ البحث</span>
        </Button>
      </div>
    </div>
  );
}
