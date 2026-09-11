import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { BookingCard } from './BookingCard';
import { FLEXIBLE_POLICY } from '@/lib/constants/cancellation-policies';
import type { Booking } from '@/types';

// CancelBookingDialog is always mounted (closed) and calls useRouter on render.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
}));

afterEach(cleanup);

/** Dates relative to now, so these fixtures can never expire into the past. */
function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'B1',
    code: 'TESTCODE',
    unitId: 'U1',
    unitSnapshot: { title: 'وحدة', city: 'الرياض', country: 'SA', imageUrl: '', ownerName: 'مالك' },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    // 9 days out — inside the 14-day window that my-reservations buckets as "active".
    checkInDate: isoInDays(9),
    checkOutDate: isoInDays(12),
    checkOutTime: '12:00',
    nights: 3,
    guests: { adults: 2, children: 0 },
    price: { pricePerNight: 1000, nights: 3, gross: 3000, netBase: 2608.7, vat: 391.3 },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: isoInDays(-1),
    ...overrides,
  };
}

function renderCard(booking: Booking, tabContext: 'upcoming' | 'active' | 'completed' | 'cancelled') {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <BookingCard booking={booking} tabContext={tabContext} />
    </NextIntlClientProvider>,
  );
}

const CONFIRMED = arMessages.bookingCard.status.confirmed;
const AWAITING_PAYMENT = arMessages.bookingCard.status.pendingPayment;
/** The green `success` badge fill — the visual claim that money changed hands. */
const SUCCESS_BADGE = '.bg-green-100';

/**
 * Regression guard. my-reservations buckets bookings into tabs by elimination
 * (cancelled → completed → date), so a `pending_payment` booking lands in
 * "active" purely because check-in is near. A badge derived from the TAB rather
 * than from `booking.status` therefore renders an unpaid booking as confirmed —
 * and the failure is silent, because it looks exactly like a paid booking.
 */
describe('BookingCard — an unpaid booking is never badged as paid', () => {
  it('shows no success badge for a pending_payment booking checking in inside the 14-day active window', () => {
    const { container } = renderCard(makeBooking({ status: 'pending_payment' }), 'active');

    expect(screen.getByText(AWAITING_PAYMENT)).toBeTruthy();
    expect(screen.queryByText(CONFIRMED)).toBeNull();
    // Assert the styling too: the copy could be relabelled while the green stays.
    expect(container.querySelector(SUCCESS_BADGE)).toBeNull();
  });

  it('shows no success badge for a pending_payment booking in the upcoming tab either', () => {
    const { container } = renderCard(
      makeBooking({ status: 'pending_payment', checkInDate: isoInDays(40), checkOutDate: isoInDays(44) }),
      'upcoming',
    );

    expect(screen.getByText(AWAITING_PAYMENT)).toBeTruthy();
    expect(container.querySelector(SUCCESS_BADGE)).toBeNull();
  });

  // Control: without this, the assertions above would still pass if badges
  // stopped rendering altogether.
  it('still badges a genuinely confirmed booking in the same tab as confirmed', () => {
    const { container } = renderCard(makeBooking({ status: 'confirmed' }), 'active');

    expect(screen.getByText(CONFIRMED)).toBeTruthy();
    expect(screen.queryByText(AWAITING_PAYMENT)).toBeNull();
    expect(container.querySelector(SUCCESS_BADGE)).toBeTruthy();
  });
});

/**
 * Since the double-sale fix (2026-09-10) a cancelled booking can have been
 * charged and refunded, so the cancelled card is where the guest learns what
 * happened to their money. Two rules: a refund is mentioned only when money
 * actually came back (0 means the gateway refund FAILED and an admin is on
 * it — any refund wording then is a lie), and "who cancelled" comes from the
 * stable `cancelledBy` enum, never from the free-text reason.
 */
describe('BookingCard — the cancelled card and the refunded amount', () => {
  const REFUND_LINE = /تم رد المبلغ/;

  const cancelledBooking = (cancellation: NonNullable<Booking['cancellation']>): Booking =>
    makeBooking({
      status: 'cancelled',
      checkInDate: isoInDays(-15),
      checkOutDate: isoInDays(-12),
      cancelledAt: new Date().toISOString(),
      cancellation,
    });

  it('shows the refunded amount when the platform cancelled and money came back', () => {
    renderCard(
      cancelledBooking({ cancelledBy: 'system', reason: 'انتهت مهلة إتمام الدفع', refundedAmount: 1000 }),
      'cancelled',
    );

    expect(screen.getByText(/تم رد المبلغ: 1,000/)).toBeTruthy();
    expect(screen.getByText(new RegExp(arMessages.bookingCard.bySystem))).toBeTruthy();
    expect(screen.getByText(/انتهت مهلة إتمام الدفع/)).toBeTruthy();
  });

  it('says nothing about a refund at all when refundedAmount is 0', () => {
    const { container } = renderCard(cancelledBooking({ cancelledBy: 'system', refundedAmount: 0 }), 'cancelled');

    expect(container.textContent ?? '').not.toMatch(REFUND_LINE);
    // The cancellation itself is still explained.
    expect(screen.getByText(new RegExp(arMessages.bookingCard.bySystem))).toBeTruthy();
  });

  it('names the actor from cancelledBy, not from the reason text', () => {
    renderCard(
      cancelledBooking({ cancelledBy: 'customer', reason: 'انتهت مهلة إتمام الدفع', refundedAmount: 0 }),
      'cancelled',
    );

    expect(screen.getByText(new RegExp(arMessages.bookingCard.byCustomer))).toBeTruthy();
    expect(screen.queryByText(new RegExp(arMessages.bookingCard.bySystem))).toBeNull();
  });
});
