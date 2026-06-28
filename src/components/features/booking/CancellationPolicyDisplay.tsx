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
 */
export function CancellationPolicyDisplay({
  policy,
  showHeader = true,
  className,
}: CancellationPolicyDisplayProps) {
  // sort tiers from longest-window to shortest
  const sortedTiers = [...policy.tiers].sort(
    (a, b) => b.minDaysBeforeCheckIn - a.minDaysBeforeCheckIn,
  );

  return (
    <div className={cn('space-y-3 rounded-2xl bg-brand-cream/40 p-4', className)}>
      {showHeader && (
        <div className="flex items-center gap-2 text-brand-ink">
          <Shield className="h-4 w-4" />
          <h3 className="font-semibold">سياسة الإلغاء — {policy.labelAr}</h3>
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {sortedTiers.map((tier, i) => {
          const next = sortedTiers[i + 1];
          const windowLabel = next
            ? `بين ${next.minDaysBeforeCheckIn} و ${tier.minDaysBeforeCheckIn} أيام قبل الوصول`
            : `أكثر من ${tier.minDaysBeforeCheckIn} أيام قبل الوصول`;
          // first tier (longest window) uses "more than X"
          const firstLabel = `أكثر من ${tier.minDaysBeforeCheckIn} أيام قبل الوصول`;
          const lastLabel =
            tier.minDaysBeforeCheckIn === 0
              ? `أقل من ${sortedTiers[i - 1]?.minDaysBeforeCheckIn ?? 3} أيام قبل الوصول`
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
                {tier.refundPercent === 0 ? 'لا استرداد' : `استرداد ${tier.refundPercent}%`}
              </span>
            </li>
          );
        })}
        <li className="border-t border-brand-border pt-2 text-xs text-brand-muted">
          بعد تاريخ الدخول: الإلغاء غير متاح
        </li>
      </ul>
    </div>
  );
}
