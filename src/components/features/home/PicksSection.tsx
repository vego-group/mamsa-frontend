'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UnitCard } from '@/components/features/units/UnitCard';
import { Button } from '@/components/ui/button';
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
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">مختارات لك</h2>
          <p className="text-sm text-brand-muted">وحدات مختارة بعناية خصيصًا لك</p>
        </div>
        {showViewAll && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/picks">
              عرض الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </header>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {PICK_CATEGORIES.map(({ key, label, Icon }) => {
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
              {label}
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
        <p className="py-10 text-center text-sm text-brand-muted">لا توجد وحدات في هذا التصنيف حاليًا.</p>
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
