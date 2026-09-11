import type { BookingCancellation } from '@/types';

export type CancelledByKey = 'bySystem' | 'byPartner' | 'byCustomer';

/**
 * The i18n key naming who ended the booking, or `null` when nobody can be
 * named. Branches on the stable `cancelledBy` enum only — `customer` is the
 * guest, `partner` the host, `admin` and `system` both the platform. Never on
 * the free-text `reason`, which the backend may reword at any time, and never
 * on the backend's own `cancelled_by_label`: this app is bilingual and the
 * label has to follow the locale, so this dictionary is the single source.
 *
 * `unknown` (a value outside the closed set) yields `null` and the UI omits
 * the actor line. It must not default to the guest — that would accuse them.
 */
export function cancelledByKey(c: Pick<BookingCancellation, 'cancelledBy'>): CancelledByKey | null {
  switch (c.cancelledBy) {
    case 'system':
    case 'admin':
      return 'bySystem';
    case 'partner':
      return 'byPartner';
    case 'customer':
      return 'byCustomer';
    default:
      return null;
  }
}
