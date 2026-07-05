/**
 * Pending-payment context, persisted across the 3-D Secure round-trip.
 *
 * The bank redirect leaves our app entirely, so React state is gone by the
 * time Moyasar sends the browser back to /payment/callback — sessionStorage
 * carries the ids the return page needs to verify and route onward.
 */

const KEY = 'mamsa.pendingPayment';

export interface PendingPayment {
  paymentId: number;
  bookingId: string;
}

export function rememberPendingPayment(p: PendingPayment): void {
  sessionStorage.setItem(KEY, JSON.stringify(p));
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingPayment>;
    if (typeof parsed.paymentId !== 'number' || typeof parsed.bookingId !== 'string') return null;
    return { paymentId: parsed.paymentId, bookingId: parsed.bookingId };
  } catch {
    return null;
  }
}

export function clearPendingPayment(): void {
  sessionStorage.removeItem(KEY);
}
