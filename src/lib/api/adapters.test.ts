import { describe, it, expect } from 'vitest';
import {
  mapCancellationPreview,
  mapBooking,
  mapUser,
  type RawBooking,
  type RawCancellationPreview,
  type RawUser,
} from './adapters';

function makePreview(overrides: Partial<RawCancellationPreview> = {}): RawCancellationPreview {
  return {
    cancellable: true,
    refund_amount: 500,
    refund_percent: 50,
    total_amount: 1000,
    forfeited_amount: 500,
    tier_label: 'من 3 إلى 7 أيام',
    hours_before_checkin: 120,
    ...overrides,
  };
}

function makeRawBooking(overrides: Partial<RawBooking> = {}): RawBooking {
  return { id: 1, start_date: '2026-09-10', end_date: '2026-09-12', ...overrides };
}

describe('mapCancellationPreview — refund figures', () => {
  it('uses the explicit forfeited amount', () => {
    const p = mapCancellationPreview(makePreview());
    expect(p.refundAmount).toBe(500);
    expect(p.forfeitedAmount).toBe(500);
  });

  // The regression this replaced: forfeited was derived as
  // refund ÷ (percent/100) − refund, which collapses to 0 at percent 0 and told
  // a guest losing the whole booking that they forfeited nothing.
  it('reports the full total as forfeited when nothing is refunded', () => {
    const p = mapCancellationPreview(
      makePreview({ refund_amount: 0, refund_percent: 0, forfeited_amount: 1000 }),
    );
    expect(p.refundAmount).toBe(0);
    expect(p.forfeitedAmount).toBe(1000);
  });

  it('falls back to total − refund when forfeited_amount is absent', () => {
    const p = mapCancellationPreview(
      makePreview({ forfeited_amount: undefined, refund_amount: 250, refund_percent: 25 }),
    );
    expect(p.forfeitedAmount).toBe(750);
  });

  it('never returns a negative forfeited amount', () => {
    const p = mapCancellationPreview(
      makePreview({ forfeited_amount: undefined, total_amount: 100, refund_amount: 250 }),
    );
    expect(p.forfeitedAmount).toBe(0);
  });

  it('converts the matched tier from hours to days', () => {
    const p = mapCancellationPreview(
      makePreview({ tier: { min_hours_before_checkin: 72, refund_percent: 50, label: 'من 3 إلى 7 أيام' } }),
    );
    expect(p.tier).toEqual({ minDaysBeforeCheckIn: 3, refundPercent: 50, labelAr: 'من 3 إلى 7 أيام' });
  });

  it('leaves tier null when the booking is not cancellable', () => {
    const p = mapCancellationPreview(makePreview({ cancellable: false, tier: null, reason: 'بعد تاريخ الدخول' }));
    expect(p.tier).toBeNull();
    expect(p.isAllowed).toBe(false);
    expect(p.rawNotAllowedReason).toBe('بعد تاريخ الدخول');
  });
});

describe('mapBooking — guests split', () => {
  it('uses guests_detail when present', () => {
    const b = mapBooking(makeRawBooking({ guests: 3, guests_detail: { adults: 2, children: 1 } }));
    expect(b.guests).toEqual({ adults: 2, children: 1 });
  });

  it('derives adults from the total when only children are given', () => {
    const b = mapBooking(makeRawBooking({ guests: 4, guests_detail: { children: 2 } }));
    expect(b.guests).toEqual({ adults: 2, children: 2 });
  });

  // Pre-`children` bookings: the total was always adults, so nobody is invented.
  it('treats the whole total as adults when the split is missing', () => {
    const b = mapBooking(makeRawBooking({ guests: 3 }));
    expect(b.guests).toEqual({ adults: 3, children: 0 });
  });
});

describe('mapBooking — cancelledBy', () => {
  it.each(['customer', 'partner', 'admin', 'system'] as const)('passes through %s', (who) => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: who } }));
    expect(b.refund?.cancelledBy).toBe(who);
  });

  it('falls back to customer for a value outside the closed set', () => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: 'guest' } }));
    expect(b.refund?.cancelledBy).toBe('customer');
  });
});

describe('mapBooking — identity fields', () => {
  it('reads user_id and guest_name from the resource', () => {
    const b = mapBooking(makeRawBooking({ user_id: 42, guest_name: 'محمد أحمد' }));
    expect(b.userId).toBe('42');
    expect(b.guestName).toBe('محمد أحمد');
  });
});

describe('mapUser — name parts', () => {
  const base: RawUser = { id: 1, phone: '+966501234567' };

  // The whole point of the two columns: a compound first name must not be
  // re-split on its internal space, which is what the old read did.
  it('keeps a compound first name intact', () => {
    const u = mapUser({ ...base, name: 'عبد الله محمد', first_name: 'عبد الله', last_name: 'محمد' });
    expect(u.firstName).toBe('عبد الله');
    expect(u.lastName).toBe('محمد');
  });

  it('falls back to splitting `name` only when both parts are absent', () => {
    const u = mapUser({ ...base, name: 'محمد أحمد' });
    expect(u.firstName).toBe('محمد');
    expect(u.lastName).toBe('أحمد');
  });

  it('does not fall back when one part is present but the other is null', () => {
    const u = mapUser({ ...base, name: 'محمد أحمد', first_name: 'محمد', last_name: null });
    expect(u.firstName).toBe('محمد');
    expect(u.lastName).toBe('');
  });
});

describe('mapUser — role', () => {
  const base: RawUser = { id: 1, phone: '+966501234567' };

  it('distinguishes a company partner from an individual', () => {
    expect(mapUser({ ...base, is_partner: true, partner_type: 'company' }).role).toBe('company');
    expect(mapUser({ ...base, is_partner: true, partner_type: 'individual' }).role).toBe('individual');
  });

  it('treats a partner with no type as an individual', () => {
    expect(mapUser({ ...base, is_partner: true }).role).toBe('individual');
  });

  it('ranks admin above partner, and defaults to a plain user', () => {
    expect(mapUser({ ...base, is_admin: true, is_partner: true }).role).toBe('super_admin');
    expect(mapUser(base).role).toBe('user');
  });
});
