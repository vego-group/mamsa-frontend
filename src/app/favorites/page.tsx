'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/stores/favorites';
import { unitsApi } from '@/lib/api/client';
import { UnitCard } from '@/components/features/units/UnitCard';
import { Skeleton } from '@/components/ui/separator';
import type { Unit } from '@/types';

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const { unitIds } = useFavoritesStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    unitsApi.list().then((data) => {
      setUnits(data.filter((u) => unitIds.includes(u.id)));
      setLoading(false);
    });
  }, [unitIds]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 fill-status-danger text-status-danger" />
        <h1 className="text-3xl font-bold text-brand-ink">{t('title')}</h1>
      </div>
      <p className="mb-8 text-sm text-brand-muted">
        {units.length > 0 ? t('savedCount', { count: units.length }) : t('savePrompt')}
      </p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center">
          <Heart className="mx-auto mb-3 h-12 w-12 text-brand-border" />
          <p className="text-brand-muted">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u) => (
            <UnitCard key={u.id} unit={u} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
