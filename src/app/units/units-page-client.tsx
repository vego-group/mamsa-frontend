'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import { FilterBar } from '@/components/features/units/FilterBar';
import { SidebarFilters, type SidebarFiltersValue } from '@/components/features/units/SidebarFilters';
import { UnitCard } from '@/components/features/units/UnitCard';
import { LocationExplorer } from '@/components/features/home/LocationExplorer';
import { Skeleton } from '@/components/ui/separator';
import { unitsApi } from '@/lib/api/client';
import { AMENITIES_CATALOG, UNIT_TYPE_LABELS_AR } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';
import type { Unit } from '@/types';

type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'rating';
type ViewMode = 'list' | 'grid' | 'map';

const DEFAULT_PRICE: [number, number] = [0, 5000];
const DEFAULT_SIDEBAR: SidebarFiltersValue = {
  priceRange: DEFAULT_PRICE,
  type: 'all',
  minRating: 0,
  amenities: [],
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'الأكثر طلباً' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'rating', label: 'الأعلى تقييماً' },
];

const VIEWS: { value: ViewMode; label: string; icon: typeof List }[] = [
  { value: 'list', label: 'قائمة', icon: List },
  { value: 'grid', label: 'شبكة', icon: LayoutGrid },
  { value: 'map', label: 'خريطة', icon: MapIcon },
];

function sortUnits(arr: Unit[], sort: SortKey): Unit[] {
  const out = [...arr];
  switch (sort) {
    case 'price_asc':
      return out.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case 'price_desc':
      return out.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case 'rating':
      return out.sort((a, b) => b.rating - a.rating);
    default:
      return out.sort(
        (a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || b.reviewCount - a.reviewCount,
      );
  }
}

export function UnitsPageClient() {
  const params = useSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [view, setView] = useState<ViewMode>('list');
  const [mobileFilters, setMobileFilters] = useState(false);

  const [sidebar, setSidebar] = useState<SidebarFiltersValue>({
    ...DEFAULT_SIDEBAR,
    type: params.get('type') ?? 'all',
    priceRange: [
      params.get('minPrice') ? Number(params.get('minPrice')) : DEFAULT_PRICE[0],
      params.get('maxPrice') ? Number(params.get('maxPrice')) : DEFAULT_PRICE[1],
    ],
  });

  const city = params.get('city') ?? '';

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

  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (u.pricePerNight < sidebar.priceRange[0] || u.pricePerNight > sidebar.priceRange[1]) return false;
      if (sidebar.type !== 'all' && u.type !== sidebar.type) return false;
      if (sidebar.minRating > 0 && u.rating < sidebar.minRating) return false;
      if (sidebar.amenities.length && !sidebar.amenities.every((a) => u.amenities.some((am) => am.key === a))) return false;
      return true;
    });
  }, [units, sidebar]);

  const sorted = useMemo(() => sortUnits(filtered, sort), [filtered, sort]);

  // Context-aware heading, e.g. "شقق في الرياض"
  const typeWord = sidebar.type !== 'all' ? UNIT_TYPE_LABELS_AR[sidebar.type] : 'إقامات';
  const heading = city ? `${typeWord} في ${city}` : typeWord;

  // Active filter chips (sidebar-controlled filters)
  const update = (patch: Partial<SidebarFiltersValue>) => setSidebar((s) => ({ ...s, ...patch }));
  const priceDirty = sidebar.priceRange[0] !== DEFAULT_PRICE[0] || sidebar.priceRange[1] !== DEFAULT_PRICE[1];
  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...(sidebar.type !== 'all'
      ? [{ key: 'type', label: `النوع: ${UNIT_TYPE_LABELS_AR[sidebar.type]}`, onRemove: () => update({ type: 'all' }) }]
      : []),
    ...(sidebar.minRating > 0
      ? [{ key: 'rating', label: `${sidebar.minRating}+ نجوم`, onRemove: () => update({ minRating: 0 }) }]
      : []),
    ...(priceDirty
      ? [{ key: 'price', label: `السعر: ${sidebar.priceRange[0]}–${sidebar.priceRange[1]} ر.س`, onRemove: () => update({ priceRange: DEFAULT_PRICE }) }]
      : []),
    ...sidebar.amenities.map((a) => ({
      key: `am-${a}`,
      label: AMENITIES_CATALOG.find((x) => x.key === a)?.labelAr ?? a,
      onRemove: () => update({ amenities: sidebar.amenities.filter((x) => x !== a) }),
    })),
  ];
  const clearAll = () => setSidebar({ ...DEFAULT_SIDEBAR });

  const mapUnits = useMemo(
    () =>
      sorted.map((u) => ({
        id: u.id,
        title: u.title,
        price: u.pricePerNight,
        lat: u.latitude,
        lng: u.longitude,
        city: u.city,
        district: u.district,
        image: u.imageUrls[0] ?? '',
        rating: u.rating,
      })),
    [sorted],
  );

  return (
    <div>
      <div className="bg-brand-primary py-6">
        <FilterBar compact />
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
        {/* results */}
        <div className="space-y-4 md:order-2">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-brand-ink">{heading}</h1>
              <p className="text-sm text-brand-muted">{sorted.length} وحدة متاحة</p>
            </div>

            <div className="flex items-center gap-2">
              {/* mobile filters trigger */}
              <button
                onClick={() => setMobileFilters(true)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60 md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                الفلاتر
                {chips.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-xs text-white">
                    {chips.length}
                  </span>
                )}
              </button>

              {/* sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none rounded-full border border-brand-border bg-white py-2 pe-9 ps-4 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  aria-label="ترتيب النتائج"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* view toggle */}
              <div className="hidden items-center rounded-full border border-brand-border bg-white p-1 sm:flex">
                {VIEWS.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setView(v.value)}
                    aria-label={v.label}
                    title={v.label}
                    className={cn(
                      'flex h-8 w-9 items-center justify-center rounded-full transition',
                      view === v.value ? 'bg-brand-primary text-white' : 'text-brand-muted hover:bg-brand-cream/60',
                    )}
                  >
                    <v.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* active filter chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  onClick={c.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1 text-xs text-brand-ink transition hover:bg-brand-cream/70"
                >
                  {c.label}
                  <X className="h-3 w-3 text-brand-muted" />
                </button>
              ))}
              <button onClick={clearAll} className="text-xs font-medium text-brand-primary hover:underline">
                مسح الكل
              </button>
            </div>
          )}

          {/* content */}
          {loading ? (
            <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
              {Array.from({ length: view === 'grid' ? 6 : 3 }).map((_, i) => (
                <Skeleton key={i} className={view === 'grid' ? 'h-72 rounded-2xl' : 'h-48 rounded-2xl'} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center text-brand-muted">
              لا توجد وحدات تطابق الفلاتر المحددة.
              {chips.length > 0 && (
                <button onClick={clearAll} className="ms-2 font-medium text-brand-primary hover:underline">
                  مسح الفلاتر
                </button>
              )}
            </div>
          ) : view === 'map' ? (
            <LocationExplorer units={mapUnits} />
          ) : view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((u) => (
                <UnitCard key={u.id} unit={u} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((u) => (
                <UnitCard key={u.id} unit={u} variant="list" />
              ))}
            </div>
          )}
        </div>

        {/* desktop sidebar */}
        <aside className="hidden md:order-1 md:block">
          <div className="sticky top-24">
            <SidebarFilters value={sidebar} onChange={setSidebar} />
          </div>
        </aside>
      </div>

      {/* mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border p-4">
              <h2 className="text-lg font-bold text-brand-ink">الفلاتر</h2>
              <button
                onClick={() => setMobileFilters(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarFilters value={sidebar} onChange={setSidebar} />
            </div>
            <div className="border-t border-brand-border p-4">
              <button
                onClick={() => setMobileFilters(false)}
                className="w-full rounded-full bg-brand-primary py-2.5 text-sm font-medium text-white transition hover:bg-brand-primaryDark"
              >
                عرض {sorted.length} وحدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
