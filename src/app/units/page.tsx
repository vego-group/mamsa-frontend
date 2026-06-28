'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/features/units/FilterBar';
import { SidebarFilters, type SidebarFiltersValue } from '@/components/features/units/SidebarFilters';
import { UnitCard } from '@/components/features/units/UnitCard';
import { Skeleton } from '@/components/ui/separator';
import { unitsApi } from '@/lib/api/client';
import type { Unit } from '@/types';

export default function UnitsPage() {
  const params = useSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [sidebar, setSidebar] = useState<SidebarFiltersValue>({
    priceRange: [0, 5000],
    type: params.get('type') ?? 'all',
    minRating: 0,
    amenities: [],
  });

  useEffect(() => {
    setLoading(true);
    unitsApi
      .list({
        city: params.get('city') ?? undefined,
        type: (params.get('type') as Unit['type']) ?? 'all',
        capacity: params.get('capacity') ? Number(params.get('capacity')) : undefined,
      })
      .then((data) => setUnits(data))
      .finally(() => setLoading(false));
  }, [params]);

  // Apply sidebar filters client-side
  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (u.pricePerNight < sidebar.priceRange[0] || u.pricePerNight > sidebar.priceRange[1]) return false;
      if (sidebar.type !== 'all' && u.type !== sidebar.type) return false;
      if (sidebar.minRating > 0 && u.rating < sidebar.minRating) return false;
      if (sidebar.amenities.length && !sidebar.amenities.every((a) => u.amenities.some((am) => am.key === a))) return false;
      return true;
    });
  }, [units, sidebar]);

  return (
    <div>
      <div className="bg-brand-primary py-6">
        <FilterBar compact />
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[1fr_280px]">
        {/* Results column */}
        <div className="space-y-4 md:order-2">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold text-brand-ink">نتائج البحث</h1>
            <p className="text-sm text-brand-muted">{filtered.length} وحدة متاحة</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center text-brand-muted">
              لا توجد وحدات تطابق الفلاتر المحددة.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((u) => (
                <UnitCard key={u.id} unit={u} variant="list" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="md:order-1">
          <div className="sticky top-24">
            <SidebarFilters value={sidebar} onChange={setSidebar} />
          </div>
        </aside>
      </div>
    </div>
  );
}
