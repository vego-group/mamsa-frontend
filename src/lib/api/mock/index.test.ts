import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from './index';

const UNIT_ID = 'U-001';

async function login() {
  const { debugOtp } = await mockApi.auth.requestOtp('0500000000');
  await mockApi.auth.verifyOtp('0500000000', debugOtp!);
}

afterEach(async () => {
  await mockApi.auth.logout();
});

describe('mock pricing stays in sync between the quote and booking-creation endpoints', () => {
  it('booking creation produces the exact same breakdown as checkAvailability() for the same unit + dates', async () => {
    await login();

    const checkInDate = '2026-08-01';
    const checkOutDate = '2026-08-04'; // 3 nights

    const { pricing: quote } = await mockApi.units.checkAvailability(UNIT_ID, checkInDate, checkOutDate);
    const booking = await mockApi.bookings.create({
      unitId: UNIT_ID,
      checkInDate,
      checkOutDate,
      guests: { adults: 2, children: 0 },
      paymentMethod: 'visa',
    });

    expect(quote).toBeTruthy();
    expect(booking.price.gross).toBe(quote!.gross);
    expect(booking.price.netBase).toBe(quote!.net_base);
    expect(booking.price.vat).toBe(quote!.vat);
    // VAT is split out of the gross, never added to it: the parts sum back
    // exactly, and the total never exceeds nightly rate × nights.
    expect(booking.price.netBase + booking.price.vat).toBe(booking.price.gross);
    expect(booking.price.gross).toBe(booking.price.pricePerNight * booking.price.nights);
  });
});

describe('mock availability reflects bookings that still hold the dates', () => {
  // Each test holds its OWN window, in a different month. `create()` now
  // refuses a second overlapping booking (mirroring the real backend's fix —
  // see mamsa-booking-availability-question.md), and the in-memory booking
  // list persists for the whole file rather than resetting per test, so
  // sibling tests can no longer share one held window the way they could
  // when creation never checked for conflicts.
  async function hold(checkInDate: string, checkOutDate: string) {
    await login();
    await mockApi.bookings.create({
      unitId: UNIT_ID,
      checkInDate,
      checkOutDate,
      guests: { adults: 2, children: 0 },
      paymentMethod: 'visa',
    });
  }

  it('drops a held unit from a search over the same stay', async () => {
    await hold('2027-03-10', '2027-03-15');
    const clashing = await mockApi.units.list({ startDate: '2027-03-12', endDate: '2027-03-14' });
    expect(clashing.some((u) => u.id === UNIT_ID)).toBe(false);
  });

  it('keeps it in a search that does not overlap', async () => {
    await hold('2027-04-10', '2027-04-15');
    const clear = await mockApi.units.list({ startDate: '2027-04-20', endDate: '2027-04-22' });
    expect(clear.some((u) => u.id === UNIT_ID)).toBe(true);
  });

  it('still lists it when the search carries no dates at all', async () => {
    await hold('2027-05-10', '2027-05-15');
    const all = await mockApi.units.list({});
    expect(all.some((u) => u.id === UNIT_ID)).toBe(true);
  });

  it('treats a departure on another guest’s arrival day as a handover, not a clash', async () => {
    const heldIn = '2027-06-10';
    await hold(heldIn, '2027-06-15');
    const handover = await mockApi.units.list({ startDate: '2027-06-05', endDate: heldIn });
    expect(handover.some((u) => u.id === UNIT_ID)).toBe(true);
  });

  it('refuses the quote for a stay that is already held', async () => {
    await hold('2027-07-10', '2027-07-15');
    const { available } = await mockApi.units.checkAvailability(UNIT_ID, '2027-07-12', '2027-07-14');
    expect(available).toBe(false);
  });
});

describe('cancellation template mapping fails towards the least generous policy', () => {
  it('maps the API’s three live keys to themselves', async () => {
    const { mapUnit } = await import('@/lib/api/adapters');
    for (const key of ['flexible', 'moderate', 'strict'] as const) {
      const u = mapUnit({ id: 1, cancellation_policy: key } as never);
      expect(u.cancellationPolicy).toBe(key);
    }
  });

  it('never quotes moderate tiers for a policy it does not recognise', async () => {
    const { mapUnit } = await import('@/lib/api/adapters');
    // `no_cancel` is the real case: a dead enum value that used to land on the
    // default and promise a guest a refund the platform would never pay.
    for (const key of ['no_cancel', 'something_new', '']) {
      expect(mapUnit({ id: 1, cancellation_policy: key } as never).cancellationPolicy).toBe('strict');
    }
  });
});

describe('fetching units by id — the favourites path', () => {
  it('returns exactly the units named, in the catalogue’s order', async () => {
    const picked = await mockApi.units.list({ ids: ['U-003', 'U-001'] });
    expect(picked.map((u) => u.id)).toEqual(['U-001', 'U-003']);
  });

  it('answers nothing for an id the catalogue does not publish', async () => {
    expect(await mockApi.units.list({ ids: ['U-DOES-NOT-EXIST'] })).toEqual([]);
  });

  it('batches past the API’s ceiling of 50 rather than truncating', async () => {
    const { unitsApi } = await import('@/lib/api/client');
    // 120 ids is three calls; the real endpoint answers 422 to 51 in one.
    const ids = Array.from({ length: 120 }, (_, i) => `U-${String(i).padStart(3, '0')}`);
    const spy = vi.spyOn(unitsApi, 'list').mockResolvedValue([]);
    await unitsApi.byIds(ids);
    expect(spy).toHaveBeenCalledTimes(3);
    for (const [filter] of spy.mock.calls) {
      expect(filter!.ids!.length).toBeLessThanOrEqual(50);
    }
    spy.mockRestore();
  });

  it('asks for nothing when there are no favourites', async () => {
    const { unitsApi } = await import('@/lib/api/client');
    const spy = vi.spyOn(unitsApi, 'list');
    expect(await unitsApi.byIds([])).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
