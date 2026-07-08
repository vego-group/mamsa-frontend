'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { UnitCard } from '@/components/features/units/UnitCard';
import { unitsApi } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import type { Unit, UnitsFilter } from '@/types';
import { PICK_CATEGORIES, DEFAULT_PICK_CATEGORY, isValidPickCategory } from './pick-categories';

interface PicksSectionProps {
  /** Pre-selected category key (e.g. from a query param). */
  initialCategory?: string;
  /** Number of cards to display. */
  limit?: number;
  /** Show the "عرض الكل" link that routes to the full /picks page. */
  showViewAll?: boolean;
}

/** Pick-category key → backend `type` filter ('vacation' means no type filter). */
function categoryToFilter(key: string): UnitsFilter {
  return key === 'vacation' ? {} : { type: key as UnitsFilter['type'] };
}

export function PicksSection({ initialCategory, limit = 8, showViewAll = false }: PicksSectionProps) {
  const t = useTranslations('picks');
  const tTypes = useTranslations('types');
  const [active, setActive] = useState(
    isValidPickCategory(initialCategory) ? initialCategory! : DEFAULT_PICK_CATEGORY,
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    unitsApi
      .list(categoryToFilter(active))
      .then((rows) => {
        if (!cancelled) setUnits(rows.slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, limit]);

  return (
    <section className="container mx-auto space-y-6 px-4 py-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">{t('title')}</h2>
          <p className="text-sm text-brand-muted">{t('subtitle')}</p>
        </div>
        {showViewAll && (
          <Link
            href="/picks"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary hover:text-white"
          >
            {t('viewAll')}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
          </Link>
        )}
      </header>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {PICK_CATEGORIES.map(({ key, Icon }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-pressed={selected}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition',
                selected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-border bg-white text-brand-ink hover:bg-brand-cream/50',
              )}
            >
              <Icon className="h-4 w-4" />
              {tTypes(key)}
            </button>
          );
        })}
      </div>

      {/* Units grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-cream/60" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <p className="py-10 text-center text-sm text-brand-muted">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((u) => (
            <UnitCard key={u.id} unit={u} variant="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
