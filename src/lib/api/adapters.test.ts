import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mapCancellationPreview,
  mapBooking,
  mapUnit,
  mapUser,
  type RawBooking,
  type RawCancellationPreview,
  type RawUnit,
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

// `mapBooking` warns whenever it has to assume a unit's check-out hour, and
// most fixtures in this file carry no unit at all. The warning is captured so
// the run stays readable, and asserted in the one place it is the point.
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});


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
    expect(b.cancellation?.cancelledBy).toBe(who);
  });

  // Never the guest: a default of "customer" would pin a cancellation on
  // someone who may not have made it.
  it.each(['guest', '', undefined])('reads %s (outside the closed set) as unknown, not as the guest', (v) => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: v } }));
    expect(b.cancellation?.cancelledBy).toBe('unknown');
  });
});

/**
 * Since the double-sale fix (2026-09-10) a `cancelled` booking can have been
 * charged and refunded. `refunded_amount` is what actually came back, and 0
 * means the gateway refund FAILED with the admin handling it by hand — so the
 * figure must reach the UI exactly, and anything unusable must read as 0, the
 * value at which the UI says nothing about money at all.
 */
describe('mapBooking — cancellation.refundedAmount', () => {
  it('passes a positive riyal figure through untouched', () => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: 'system', refunded_amount: 1000 } }));
    expect(b.cancellation?.refundedAmount).toBe(1000);
  });

  it('tolerates a numeric string', () => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: 'system', refunded_amount: '391.30' } }));
    expect(b.cancellation?.refundedAmount).toBe(391.3);
  });

  it.each([0, null, undefined, 'n/a', -5])('reads %s as 0 — no money moved', (v) => {
    const b = mapBooking(makeRawBooking({ cancellation: { cancelled_by: 'system', refunded_amount: v } }));
    expect(b.cancellation?.refundedAmount).toBe(0);
  });

  it('leaves cancellation undefined on a booking that was never cancelled', () => {
    expect(mapBooking(makeRawBooking()).cancellation).toBeUndefined();
  });

  it('keeps the free-text reason as text, and drops an empty one', () => {
    const withReason = mapBooking(
      makeRawBooking({ cancellation: { cancelled_by: 'system', reason: 'انتهت مهلة إتمام الدفع' } }),
    );
    expect(withReason.cancellation?.reason).toBe('انتهت مهلة إتمام الدفع');
    const blank = mapBooking(makeRawBooking({ cancellation: { cancelled_by: 'system', reason: '' } }));
    expect(blank.cancellation?.reason).toBeUndefined();
  });

  it('takes cancelled_at from the cancellation block when the top-level key is absent', () => {
    const b = mapBooking(
      makeRawBooking({ cancellation: { cancelled_by: 'system', cancelled_at: '2026-09-10T08:00:00Z' } }),
    );
    expect(b.cancelledAt).toBe('2026-09-10T08:00:00Z');
    expect(b.cancellation?.cancelledAt).toBe('2026-09-10T08:00:00Z');
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

describe('mapUnit — image derivatives', () => {
  const rawUnit = (images: RawUnit['images']): RawUnit => ({
    id: 1,
    name: 'وحدة',
    type: 'apartment',
    price: 300,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    city: 'الرياض',
    images,
  });

  const withVariants = {
    id: 91,
    url: 'https://cdn/a.jpg',
    is_main: true,
    width: 432,
    height: 768,
    variants: { thumb: 'https://cdn/a_thumb.webp', card: 'https://cdn/a_card.webp', full: 'https://cdn/a_full.webp' },
  };

  it('routes each size to its own derivative', () => {
    const [img] = mapUnit(rawUnit([withVariants])).images;
    expect(img).toEqual({
      url: 'https://cdn/a.jpg',
      thumb: 'https://cdn/a_thumb.webp',
      card: 'https://cdn/a_card.webp',
      full: 'https://cdn/a_full.webp',
      width: 432,
      height: 768,
    });
  });

  // The backend sends `variants: null` — never three copies of the original — for
  // rows that predate derivatives or files its processor couldn't read. Every size
  // has to fall back to the original so those photos still render.
  it('falls back to the original when a photo has no derivative set', () => {
    const [img] = mapUnit(rawUnit([{ id: 92, url: 'https://cdn/b.jpg', is_main: true, variants: null }])).images;
    expect(img).toEqual({
      url: 'https://cdn/b.jpg',
      thumb: 'https://cdn/b.jpg',
      card: 'https://cdn/b.jpg',
      full: 'https://cdn/b.jpg',
      width: null,
      height: null,
    });
  });

  it('falls back the same way when the key is absent entirely', () => {
    const [img] = mapUnit(rawUnit([{ id: 93, url: 'https://cdn/c.jpg', is_main: true }])).images;
    expect(img?.full).toBe('https://cdn/c.jpg');
    expect(img?.width).toBeNull();
  });

  it('keeps the cover photo first', () => {
    const unit = mapUnit(
      rawUnit([
        { id: 1, url: 'https://cdn/second.jpg', is_main: false },
        { id: 2, url: 'https://cdn/cover.jpg', is_main: true },
      ]),
    );
    expect(unit.images.map((i) => i.url)).toEqual(['https://cdn/cover.jpg', 'https://cdn/second.jpg']);
  });
});

describe("mapBooking — the unit's check-out hour", () => {
  // The complaint window counts 48h from the check-out INSTANT, and the backend
  // takes that instant from the unit's own `checkout_time` — so the booking has
  // to carry it, with the same 12:00 fallback `mapUnit` applies to a unit that
  // sets none. Never a platform constant inside the window itself.
  function unitWith(checkout_time?: string): RawUnit {
    return {
      id: 7,
      name: 'شقة',
      type: 'apartment',
      price: 500,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      city: 'الرياض',
      checkout_time,
    };
  }

  it('reads checkout_time off the embedded unit', () => {
    expect(mapBooking(makeRawBooking({ unit: unitWith('13:00') })).checkOutTime).toBe('13:00');
  });

  it('trims a seconds-bearing time to HH:mm', () => {
    expect(mapBooking(makeRawBooking({ unit: unitWith('13:00:00') })).checkOutTime).toBe('13:00');
  });

  it('falls back to 12:00 when the unit sets none, or no unit is embedded at all', () => {
    expect(mapBooking(makeRawBooking({ unit: unitWith(undefined) })).checkOutTime).toBe('12:00');
    expect(mapBooking(makeRawBooking({ unit: unitWith('') })).checkOutTime).toBe('12:00');
    expect(mapBooking(makeRawBooking({ unit: undefined })).checkOutTime).toBe('12:00');
  });

  it('falls back rather than pass a malformed hour into the window', () => {
    expect(mapBooking(makeRawBooking({ unit: unitWith('noon') })).checkOutTime).toBe('12:00');
  });

  // The fallback keeps the booking renderable, but a unit that really checks
  // out at 13:00 would then close its complaint window an hour early — and all
  // a guest sees is a button gone sooner than promised. The warning is the only
  // way that ever gets traced back to a field missing from the response.
  it('warns with the booking number, and why, every time it has to assume the hour', () => {
    mapBooking(makeRawBooking({ id: 4711, reference: 'REF4711', unit: undefined }));
    mapBooking(makeRawBooking({ id: 4712, unit: unitWith(undefined) }));
    mapBooking(makeRawBooking({ id: 4713, unit: unitWith('noon') }));

    const warnings = vi.mocked(console.warn).mock.calls.map((call) => String(call[0]));
    expect(warnings).toHaveLength(3);
    expect(warnings[0]).toContain('4711');
    expect(warnings[0]).toContain('REF4711');
    expect(warnings[0]).toContain('embeds no unit');
    expect(warnings[1]).toContain('4712');
    expect(warnings[1]).toContain('checkout_time is missing');
    expect(warnings[2]).toContain('4713');
    expect(warnings[2]).toContain('"noon"');
    expect(warnings[2]).toContain('12:00');
  });

  it('stays silent when the unit carries its hour', () => {
    mapBooking(makeRawBooking({ unit: unitWith('13:00') }));
    mapBooking(makeRawBooking({ unit: unitWith('12:00') }));
    expect(console.warn).not.toHaveBeenCalled();
  });
});
