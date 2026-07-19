import { describe, it, expect } from 'vitest';
import {
  daysUntilCheckIn,
  isBookingCancellable,
  previewCancellation,
  resolveTier,
  roundMoney,
} from './engine';
import {
  FLEXIBLE_POLICY,
  MODERATE_POLICY,
  STRICT_POLICY,
} from '@/lib/constants/cancellation-policies';
import type { Booking } from '@/types';

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'B1',
    code: 'TESTCODE',
    unitId: 'U1',
    unitSnapshot: { title: 't', city: 'الرياض', country: 'SA', imageUrl: '', ownerName: 'o' },
    userId: 'U1',
    status: 'confirmed',
    checkInDate: '2026-07-01',
    checkOutDate: '2026-07-05',
    nights: 4,
    guests: { adults: 2, children: 0 },
    price: {
      pricePerNight: 1000,
      nights: 4,
      subtotal: 4000,
      tax: 0,
      total: 4000,
    },
    policySnapshot: FLEXIBLE_POLICY,
    isReviewed: false,
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('daysUntilCheckIn (Riyadh-midnight boundary)', () => {
  it('returns positive value when check-in is in the future', () => {
    // Check-in day starts at 2026-07-10T00:00 Asia/Riyadh = 2026-07-09T21:00Z,
    // i.e. exactly 8.875 days after 2026-07-01T00:00Z — on ANY machine timezone.
    const d = daysUntilCheckIn('2026-07-10', new Date('2026-07-01T00:00:00Z'));
    expect(d).toBeCloseTo(8.875, 3);
  });
  it('returns 0 or less at the day of check-in', () => {
    const d = daysUntilCheckIn('2026-07-01', new Date('2026-07-01T12:00:00Z'));
    expect(d).toBeLessThanOrEqual(0);
  });
  it('is exactly 0 at property midnight regardless of viewer timezone', () => {
    const d = daysUntilCheckIn('2026-07-10', new Date('2026-07-09T21:00:00Z'));
    expect(d).toBe(0);
  });
});

describe('Riyadh-based policy cutoffs flip at the exact boundary instant', () => {
  // Check-in 2026-07-15 → property midnight = 2026-07-14T21:00:00Z.
  // Flexible policy: ≥7 days → 100%, 3–7 days → 75%. The 7-day cutoff
  // instant is therefore 2026-07-07T21:00:00Z for every user worldwide.
  it('one minute BEFORE the 7-day cutoff → still 100% refund', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-07T20:59:00Z'));
    expect(p.refundPercent).toBe(100);
  });
  it('one minute AFTER the 7-day cutoff → drops to 75% refund', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-07T21:01:00Z'));
    expect(p.refundPercent).toBe(75);
  });
  it('cancellability flips exactly at property midnight on the check-in day', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    expect(isBookingCancellable(b, new Date('2026-07-14T20:59:00Z'))).toBe(true);
    expect(isBookingCancellable(b, new Date('2026-07-14T21:00:00Z'))).toBe(false);
  });
});

describe('resolveTier (Flexible)', () => {
  it('returns 100% for > 7 days', () => {
    expect(resolveTier(FLEXIBLE_POLICY, 10).refundPercent).toBe(100);
    expect(resolveTier(FLEXIBLE_POLICY, 7.5).refundPercent).toBe(100);
  });
  it('returns 75% for 3-7 days', () => {
    expect(resolveTier(FLEXIBLE_POLICY, 5).refundPercent).toBe(75);
    expect(resolveTier(FLEXIBLE_POLICY, 3).refundPercent).toBe(75);
  });
  it('returns 50% for < 3 days', () => {
    expect(resolveTier(FLEXIBLE_POLICY, 1).refundPercent).toBe(50);
    expect(resolveTier(FLEXIBLE_POLICY, 0.5).refundPercent).toBe(50);
  });
});

describe('resolveTier (Moderate)', () => {
  it('50% in 3-7 days window (vs Flexible 75%)', () => {
    expect(resolveTier(MODERATE_POLICY, 5).refundPercent).toBe(50);
  });
});

describe('resolveTier (Strict)', () => {
  it('only 75% even when > 7 days', () => {
    expect(resolveTier(STRICT_POLICY, 14).refundPercent).toBe(75);
  });
  it('25% in 3-7 days window', () => {
    expect(resolveTier(STRICT_POLICY, 5).refundPercent).toBe(25);
  });
});

describe('isBookingCancellable', () => {
  it('false for already cancelled bookings', () => {
    const b = makeBooking({ status: 'cancelled' });
    expect(isBookingCancellable(b, new Date('2026-06-01'))).toBe(false);
  });
  it('false for completed bookings', () => {
    const b = makeBooking({ status: 'completed' });
    expect(isBookingCancellable(b, new Date('2026-07-10'))).toBe(false);
  });
  it('false after check-in date', () => {
    const b = makeBooking({ checkInDate: '2026-07-01' });
    expect(isBookingCancellable(b, new Date('2026-07-02'))).toBe(false);
  });
  it('true for confirmed booking before check-in', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    expect(isBookingCancellable(b, new Date('2026-07-01'))).toBe(true);
  });
});

describe('previewCancellation', () => {
  it('Flexible policy, 10 days before → 100% refund', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-05'));
    expect(p.isAllowed).toBe(true);
    expect(p.refundPercent).toBe(100);
    expect(p.refundAmount).toBe(4000);
    expect(p.forfeitedAmount).toBe(0);
  });

  it('Flexible policy, 5 days before → 75% refund', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-10'));
    expect(p.refundPercent).toBe(75);
    expect(p.refundAmount).toBe(3000);
    expect(p.forfeitedAmount).toBe(1000);
  });

  it('Flexible policy, 1 day before → 50% refund', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-14'));
    expect(p.refundPercent).toBe(50);
    expect(p.refundAmount).toBe(2000);
  });

  it('after check-in → not allowed', () => {
    const b = makeBooking({ checkInDate: '2026-07-15' });
    const p = previewCancellation(b, new Date('2026-07-16'));
    expect(p.isAllowed).toBe(false);
    expect(p.refundAmount).toBe(0);
  });

  it('Snapshot independence: editing policy after booking does NOT affect refund', () => {
    // Booking made under Flexible (snapshot frozen) — partner later changes unit to Strict.
    // The booking should STILL be refunded per Flexible rules.
    const b = makeBooking({
      checkInDate: '2026-07-15',
      policySnapshot: FLEXIBLE_POLICY, // frozen at booking time
    });
    // even if current unit policy is now STRICT, the engine only sees policySnapshot
    const p = previewCancellation(b, new Date('2026-07-05')); // 10 days before
    expect(p.refundPercent).toBe(100); // Flexible behavior, not Strict
  });

  it('Strict snapshot enforces strict refund', () => {
    const b = makeBooking({
      checkInDate: '2026-07-15',
      policySnapshot: STRICT_POLICY,
    });
    const p = previewCancellation(b, new Date('2026-07-05')); // 10 days before
    expect(p.refundPercent).toBe(75); // strict rule
    expect(p.refundAmount).toBe(3000);
  });
});

describe('roundMoney', () => {
  it('rounds to 2 decimals', () => {
    expect(roundMoney(1234.567)).toBe(1234.57);
    expect(roundMoney(50.5 * 0.5)).toBe(25.25);
  });
});
