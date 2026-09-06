'use client';

import { useTranslations } from 'next-intl';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { GuestComplaintStatus } from '@/types';

/**
 * One colour per state. `approved` is green because the decision is made,
 * even though the money is not yet — the wording beside the badge is what
 * carries that distinction, never a number.
 */
const VARIANT: Record<GuestComplaintStatus, NonNullable<BadgeProps['variant']>> = {
  submitted: 'cream',
  under_review: 'warning',
  approved: 'success',
  resolved_refunded: 'success',
  resolved_rejected: 'danger',
};

export function ComplaintStatusBadge({ status }: { status: GuestComplaintStatus }) {
  const t = useTranslations('complaints.badge');
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
}
