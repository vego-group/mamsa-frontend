'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import { FilterBar } from '@/components/features/units/FilterBar';
import { SidebarFilters, type SidebarFiltersValue } from '@/components/features/units/SidebarFilters';
import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { UnitCard } from '@/components/features/units/UnitCard';
import { LocationExplorer } from '@/components/features/home/LocationExplorer';
import { Skeleton } from '@/components/ui/separator';
import { unitsApi } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/format';
import type { Unit, UnitsFilter } from '@/types';

type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'rating';
type ViewMode = 'list' | 'grid' | 'map';

const DEFAULT_PRICE: [number, number] = [0, 5000];
const DEFAULT_SIDEBAR: SidebarFiltersValue = {
  priceRange: DEFAULT_PRICE,
  type: 'all',
  minRating: 0,
  amenities: [],
};

const SORT_KEYS: SortKey[] = ['recommended', 'price_asc', 'price_desc', 'rating'];

/**
 * "Recommended" is ours, not the API's — it ranks featured listings first and
 * breaks ties on review count, which no backend sort key expresses. Everything
 * else is a key `/units` already understands.
 */
function apiSort(sort: SortKey): UnitsFilter['sort'] {
  return sort === 'recommended' ? undefined : sort;
}

/** How long a dragged price slider settles before it costs a request. */
const FILTER_DEBOUNCE_MS = 250;

/**
 * Rows per request. The API caps `per_page` at 50 and defaults to 12 — twelve
 * was all a host with a hundred-odd units could ever see, because nothing here
 * asked for page two.
 */
const PAGE_SIZE = 24;

const VIEWS: { value: ViewMode; icon: typeof List }[] = [
  { value: 'list', icon: List },
  { value: 'grid', icon: LayoutGrid },
  { value: 'map', icon: MapIcon },
];

export function UnitsPageClient() {
  const t = useTranslations('unitsPage');
  const tCommon = useTranslations('common');
  const tTypes = useTranslations('types');
  const tAmenities = useTranslations('amenities');
  const params = useSearchParams();
  // Every page fetched so far, in order. "Show more" appends; anything that
  // changes the query starts again from page one.
  const [units, setUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
  // What the API has actually been asked for. The panel itself updates on every
  // keystroke and every pixel of the price slider; this trails it, so dragging
  // the slider costs one request instead of forty.
  const [applied, setApplied] = useState(sidebar);
  useEffect(() => {
    const id = setTimeout(() => setApplied(sidebar), FILTER_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [sidebar]);

  const city = params.get('city') ?? '';
  // The stay the guest picked in the search bar. Both ends, and in the right
  // order, or it is not a stay the API can check availability against.
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const stay = start && end && start < end ? { start, end } : null;

  const sortOptions = useMemo<SelectOption[]>(
    () => SORT_KEYS.map((k) => ({ value: k, label: t(`sort.${k}`) })),
    [t],
  );

  /** The query as the API sees it, for a given page. */
  const query = useCallback(
    (which: number): UnitsFilter => ({
      city: params.get('city') ?? undefined,
      type: applied.type !== 'all' ? (applied.type as Unit['type']) : undefined,
      capacity: params.get('capacity') ? Number(params.get('capacity')) : undefined,
      // Without these the results ignored the guest's dates entirely: units
      // already booked for the stay stayed in the list, and the clash only
      // surfaced at checkout after the guest had filled in their details.
      // Both ends or neither — one alone is a 422.
      startDate: stay?.start,
      endDate: stay?.end,
      minPrice: applied.priceRange[0] !== DEFAULT_PRICE[0] ? applied.priceRange[0] : undefined,
      maxPrice: applied.priceRange[1] !== DEFAULT_PRICE[1] ? applied.priceRange[1] : undefined,
      minRating: applied.minRating > 0 ? applied.minRating : undefined,
      amenities: applied.amenities.length > 0 ? applied.amenities : undefined,
      sort: apiSort(sort),
      page: which,
      perPage: PAGE_SIZE,
    }),
    // `stay` is derived from `params`, which is the dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, applied, sort],
  );

  // Page one, and again whenever the query changes under it.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    unitsApi
      .listPage(query(1))
      .then((res) => {
        if (cancelled) return;
        setUnits(res.units);
        setPage(res.page);
        setLastPage(res.lastPage);
        setTotal(res.total);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loadMore = () => {
    if (loadingMore || page >= lastPage) return;
    setLoadingMore(true);
    unitsApi
      .listPage(query(page + 1))
      .then((res) => {
        // A page that arrives after the query moved on belongs to the old
        // query — drop it rather than splicing it onto a different result set.
        setUnits((prev) => (res.page === page + 1 ? [...prev, ...res.units] : prev));
        setPage((prev) => Math.max(prev, res.page));
        setLastPage(res.lastPage);
        setTotal(res.total);
      })
      .finally(() => setLoadingMore(false));
  };

  // No client-side filter or sort pass any more. Both are the API's now
  // (confirmed server-side, with tests), and re-sorting here would be wrong
  // regardless: page two's rows would jump above page one's.
  const remaining = Math.max(0, total - units.length);

  // Context-aware heading, e.g. "شقق في الرياض" / "Apartments in Riyadh"
  const typeWord = sidebar.type !== 'all' ? tTypes(sidebar.type) : t('stays');
  const heading = city ? t('headingIn', { type: typeWord, city }) : typeWord;

  // Active filter chips (sidebar-controlled filters)
  const update = (patch: Partial<SidebarFiltersValue>) => setSidebar((s) => ({ ...s, ...patch }));
  const priceDirty = sidebar.priceRange[0] !== DEFAULT_PRICE[0] || sidebar.priceRange[1] !== DEFAULT_PRICE[1];
  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...(sidebar.type !== 'all'
      ? [{ key: 'type', label: t('chipType', { type: tTypes(sidebar.type) }), onRemove: () => update({ type: 'all' }) }]
      : []),
    ...(sidebar.minRating > 0
      ? [{ key: 'rating', label: t('chipRating', { rating: sidebar.minRating }), onRemove: () => update({ minRating: 0 }) }]
      : []),
    ...(priceDirty
      ? [{ key: 'price', label: t('chipPrice', { min: sidebar.priceRange[0], max: sidebar.priceRange[1] }), onRemove: () => update({ priceRange: DEFAULT_PRICE }) }]
      : []),
    ...sidebar.amenities.map((a) => ({
      key: `am-${a}`,
      label: tAmenities.has(a) ? tAmenities(a) : a,
      onRemove: () => update({ amenities: sidebar.amenities.filter((x) => x !== a) }),
    })),
  ];
  const clearAll = () => setSidebar({ ...DEFAULT_SIDEBAR });

  const mapUnits = useMemo(
    () =>
      units.map((u) => ({
        id: u.id,
        title: u.title,
        price: u.pricePerNight,
        lat: u.latitude,
        lng: u.longitude,
        city: u.city,
        district: u.district,
        image: u.images[0]?.card ?? '',
        rating: u.rating,
        reviewCount: u.reviewCount,
      })),
    [units],
  );

  return (
    <div>
      <div className="bg-brand-primary py-6">
        <FilterBar />
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
        {/* results */}
        <div className="space-y-4 md:order-2">
          {/* toolbar */}
          {/* Heading over its controls on a phone; one row from `md` up. The
              three controls used to wrap into a broken second line at 390px. */}
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-ink">{heading}</h1>
              <p className="text-sm text-brand-muted">{t('available', { count: total })}</p>
              {/* Whether the list is availability-checked is the guest's most
                  urgent question here — answer it either way. */}
              {stay ? (
                <p className="mt-0.5 text-xs font-medium text-brand-primary">
                  {t('forStay', { start: formatDate(stay.start), end: formatDate(stay.end) })}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-brand-muted">{t('pickDatesHint')}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* mobile filters trigger */}
              <button
                onClick={() => setMobileFilters(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60 md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('filters.title')}
                {chips.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-xs text-white">
                    {chips.length}
                  </span>
                )}
              </button>

              {/* sort */}
              <SelectField
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={sortOptions}
                label={t('sortLabel')}
                // "ترتيب حسب" is the widest thing in a three-control row on a
                // phone, and the least load-bearing — the value says enough.
                labelClassName="hidden md:inline"
                className="flex-1 md:flex-none"
                fieldClassName="flex w-full items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-3 py-2 transition hover:bg-brand-cream/60 md:w-auto md:justify-start md:px-4"
                // Anchored to its end edge: this control sits at the far end of
                // the toolbar, so the list has to open inwards to stay on screen.
                panelClassName="w-56 start-auto end-0"
              />

              {/* view toggle */}
              <div className="flex shrink-0 items-center rounded-full border border-brand-border bg-white p-1">
                {VIEWS.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setView(v.value)}
                    aria-label={t(`views.${v.value}`)}
                    title={t(`views.${v.value}`)}
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
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-xs text-brand-ink transition hover:bg-brand-cream/70"
                >
                  {c.label}
                  <X className="h-3 w-3 text-brand-muted" />
                </button>
              ))}
              <button onClick={clearAll} className="min-h-[36px] px-1 text-xs font-medium text-brand-primary hover:underline">
                {t('clearAll')}
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
          ) : units.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center text-brand-muted">
              {t('empty')}
              {chips.length > 0 && (
                <button onClick={clearAll} className="ms-2 font-medium text-brand-primary hover:underline">
                  {t('clearFilters')}
                </button>
              )}
            </div>
          ) : view === 'map' ? (
            <LocationExplorer units={mapUnits} fullBleed />
          ) : (
            <>
              {view === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {units.map((u) => (
                    <UnitCard key={u.id} unit={u} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {units.map((u) => (
                    <UnitCard key={u.id} unit={u} variant="list" />
                  ))}
                </div>
              )}

              {page < lastPage && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full rounded-full border border-brand-border bg-white py-3 text-sm font-semibold text-brand-primary transition hover:border-brand-primary hover:bg-brand-cream/50 disabled:opacity-60"
                >
                  {loadingMore ? tCommon('loading') : t('showMore', { count: remaining })}
                </button>
              )}
            </>
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
          <div className="absolute inset-y-0 end-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border p-4">
              <h2 className="text-lg font-bold text-brand-ink">{t('filters.title')}</h2>
              <button
                onClick={() => setMobileFilters(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarFilters value={sidebar} onChange={setSidebar} />
            </div>
            {/* Starting over needed the drawer closed and the chips found
                first — the one thing a guest does most after over-filtering. */}
            <div className="flex items-center gap-2 border-t border-brand-border p-4">
              <button
                onClick={clearAll}
                disabled={chips.length === 0}
                className="min-h-[44px] shrink-0 rounded-full border border-brand-border px-4 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60 disabled:opacity-40"
              >
                {t('clearAll')}
              </button>
              <button
                onClick={() => setMobileFilters(false)}
                className="min-h-[44px] flex-1 rounded-full bg-brand-primary text-sm font-medium text-white transition hover:bg-brand-primaryDark"
              >
                {t('showUnits', { count: total })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
