'use client';

import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import type { CancellationPolicy } from '@/types';
import { cn } from '@/lib/utils/cn';

interface CancellationPolicyDisplayProps {
  policy: CancellationPolicy;
  showHeader?: boolean;
  className?: string;
}

/**
 * يعرض سياسة الإلغاء بشكل مرتب وسهل القراءة.
 * يُستخدم في تفاصيل الوحدة، في الـ checkout، وفي تفاصيل الحجز.
 * Labels are derived from the tier NUMBERS (single source of truth in
 * cancellation-policies.ts) so both locales render from the same data.
 */
export function CancellationPolicyDisplay({
  policy,
  showHeader = true,
  className,
}: CancellationPolicyDisplayProps) {
  const t = useTranslations('cancellationPolicy');
  // sort tiers from longest-window to shortest
  const sortedTiers = [...policy.tiers].sort(
    (a, b) => b.minDaysBeforeCheckIn - a.minDaysBeforeCheckIn,
  );

  return (
    <div className={cn('space-y-3 rounded-2xl bg-brand-cream/40 p-4', className)}>
      {showHeader && (
        <div className="flex items-center gap-2 text-brand-ink">
          <Shield className="h-4 w-4" />
          <h3 className="font-semibold">{t('title')} — {t(`templates.${policy.template}`)}</h3>
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {sortedTiers.map((tier, i) => {
          const next = sortedTiers[i + 1];
          const windowLabel = next
            ? t('between', { from: next.minDaysBeforeCheckIn, to: tier.minDaysBeforeCheckIn })
            : t('moreThan', { days: tier.minDaysBeforeCheckIn });
          const firstLabel = t('moreThan', { days: tier.minDaysBeforeCheckIn });
          const lastLabel =
            tier.minDaysBeforeCheckIn === 0
              ? t('lessThan', { days: sortedTiers[i - 1]?.minDaysBeforeCheckIn ?? 3 })
              : windowLabel;
          return (
            <li key={i} className="flex items-start justify-between gap-3 text-brand-muted">
              <span>
                {i === 0 ? firstLabel : i === sortedTiers.length - 1 ? lastLabel : windowLabel}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  tier.refundPercent >= 75 && 'bg-green-100 text-green-800',
                  tier.refundPercent >= 25 && tier.refundPercent < 75 && 'bg-yellow-100 text-yellow-800',
                  tier.refundPercent < 25 && 'bg-red-100 text-red-700',
                )}
              >
                {tier.refundPercent === 0 ? t('noRefund') : t('refund', { percent: tier.refundPercent })}
              </span>
            </li>
          );
        })}
        <li className="border-t border-brand-border pt-2 text-xs text-brand-muted">
          {t('afterCheckIn')}
        </li>
      </ul>
    </div>
  );
}
