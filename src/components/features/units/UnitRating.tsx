'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * A listing has a score only once guests have actually left one.
 *
 * The backend sends `avg_rating: 0` / `reviews_count: 0` for everything else,
 * and printing that verbatim labelled every freshly listed unit "0 — جيد" —
 * the first thing a host saw next to their own property. Every surface that
 * shows a score asks this first and falls back to a "new" badge.
 */
export function hasRating(rating: number, reviewCount: number): boolean {
  return reviewCount > 0 && rating > 0;
}

interface UnitRatingProps {
  rating: number;
  reviewCount: number;
  /** Print the review count after the score, e.g. "4.8 (12)". */
  showCount?: boolean;
  /** Wraps the score; the "new" badge carries its own pill styling. */
  className?: string;
  starClassName?: string;
  /** Overrides the "new" badge's pill, for hosts with a darker ground. */
  newClassName?: string;
}

export function UnitRating({
  rating,
  reviewCount,
  showCount = false,
  className,
  starClassName = 'h-3.5 w-3.5',
  newClassName,
}: UnitRatingProps) {
  const t = useTranslations('card');

  if (!hasRating(rating, reviewCount)) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center rounded-full bg-brand-sage/30 px-2 py-0.5 text-[11px] font-semibold text-brand-primary',
          newClassName,
        )}
      >
        {t('newListing')}
      </span>
    );
  }

  return (
    <span className={cn('flex items-center gap-1', className)}>
      <Star className={cn('fill-yellow-500 text-yellow-500', starClassName)} />
      <span className="font-semibold text-brand-ink">{rating}</span>
      {showCount && <span className="text-brand-muted">({reviewCount})</span>}
    </span>
  );
}
