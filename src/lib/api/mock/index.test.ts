import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from './index';
import { MOCK_UNITS, cardIdOf, findUnitById } from '@/data/mock/units';
import { MOCK_BOOKINGS } from '@/data/mock/bookings';

const UNIT_ID = 'U-001';

/** Any six digits sign in on the mock; a fresh code each time, so nothing depends on a value. */
const anyCode = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

async function login() {
  await mockApi.auth.requestOtp('0500000000');
  await mockApi.auth.verifyOtp('0500000000', anyCode());
}

afterEach(async () => {
  await mockApi.auth.logout();
});

describe('mock fixtures — one unit per id', () => {
  it('gives every unit its own id', () => {
    const ids = MOCK_UNITS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points every seeded booking at the unit its snapshot describes', () => {
    // A booking on a building's door describes the building's card.
    for (const b of MOCK_BOOKINGS) {
      expect(findUnitById(cardIdOf(b.unitId))?.title, b.id).toBe(b.unitSnapshot.title);
    }
  });
});

/**
 * U-005 plays a building of three doors. The card is door 1; a booking lands
 * on the first door free for the stay, so its unit can differ from the card.
 * Each test holds its own dates — the in-memory booking list lives for the file.
 */
describe('mock role-plays a building: the booking lands on a free door', () => {
  const BUILDING = 'U-005';

  function book(unitId: string, checkInDate: string, checkOutDate: string) {
    return mockApi.bookings.create({
      unitId,
      checkInDate,
      checkOutDate,
      guests: { adults: 2, children: 0 },
      paymentMethod: 'visa',
    });
  }

  it('lands on door 1, the card itself, while it is free', async () => {
    await login();
    const b = await book(BUILDING, '2027-08-10', '2027-08-13');
    expect(b.unitId).toBe('U-005');
    expect(b.unitSnapshot.apartmentNo).toBe('1');
  });

  it('lands on the next free door when door 1 is taken — not the card the guest opened', async () => {
    await login();
    await book(BUILDING, '2027-09-10', '2027-09-13');
    const second = await book(BUILDING, '2027-09-10', '2027-09-13');
    expect(second.unitId).toBe('U-005-2');
    expect(second.unitSnapshot.apartmentNo).toBe('2');
    // Still the building the guest chose — only the door differs.
    expect(second.unitSnapshot.title).toBe(findUnitById(BUILDING)!.title);
  });

  it('stays bookable while any door is free, and refuses once none is', async () => {
    await login();
    await book(BUILDING, '2027-10-10', '2027-10-13');
    await book(BUILDING, '2027-10-10', '2027-10-13');
    expect((await mockApi.units.checkAvailability(BUILDING, '2027-10-10', '2027-10-13')).available).toBe(true);
    await book(BUILDING, '2027-10-10', '2027-10-13');
    expect((await mockApi.units.checkAvailability(BUILDING, '2027-10-10', '2027-10-13')).available).toBe(false);
    await expect(book(BUILDING, '2027-10-10', '2027-10-13')).rejects.toThrow();
  });

  it('counts the building’s doors on its card, and the free ones for a dated search', async () => {
    await login();
    const undated = (await mockApi.units.list({})).find((u) => u.id === BUILDING)!;
    expect(undated.groupSize).toBe(3);
    expect(undated.availableCount).toBe(3);

    await book(BUILDING, '2028-01-10', '2028-01-13');
    const dated = (await mockApi.units.list({ startDate: '2028-01-10', endDate: '2028-01-13' })).find(
      (u) => u.id === BUILDING,
    )!;
    expect(dated.groupSize).toBe(3);
    expect(dated.availableCount).toBe(2);
  });

  it('keeps a standalone unit at a group of one', async () => {
    const standalone = (await mockApi.units.list({})).find((u) => u.id === 'U-001')!;
    expect(standalone.groupSize).toBe(1);
    expect(standalone.availableCount).toBe(1);
  });

  it('blocks a night on the building’s calendar only once every door holds it', async () => {
    await login();
    // Nights 10–12 on all three doors; night 13 on two of them only.
    for (let i = 0; i < 3; i++) await book(BUILDING, '2028-02-10', '2028-02-13');
    for (let i = 0; i < 2; i++) await book(BUILDING, '2028-02-13', '2028-02-14');

    const blocked = await mockApi.units.getBlockedDates(BUILDING, '2028-02-01', '2028-02-28');
    expect(blocked).toEqual([{ start: '2028-02-10', end: '2028-02-12' }]);
  });

  it('gives the card and every booking on its doors one listing id', async () => {
    await login();
    const card = (await mockApi.units.list({})).find((u) => u.id === BUILDING)!;
    await book(BUILDING, '2028-03-10', '2028-03-13');
    const onDoor2 = await book(BUILDING, '2028-03-10', '2028-03-13');
    expect(card.listingId).toBeTruthy();
    expect(onDoor2.unitId).toBe('U-005-2');
    expect(onDoor2.listingId).toBe(card.listingId);
    // Seeded bookings carry it too — the real API always sends it.
    expect((await mockApi.bookings.getById('BK-010')).listingId).toBe(card.listingId);
  });

  it('answers the unit routes by listing key too, as the API does', async () => {
    const key = (await mockApi.units.list({})).find((u) => u.id === BUILDING)!.listingId!;
    expect((await mockApi.units.getById(key)).id).toBe(BUILDING);
    expect(await mockApi.units.getBlockedDates(key, '2028-02-01', '2028-02-28')).toEqual(
      await mockApi.units.getBlockedDates(BUILDING, '2028-02-01', '2028-02-28'),
    );
    expect((await mockApi.units.checkAvailability(key, '2028-06-10', '2028-06-12')).available).toBe(true);
    expect((await mockApi.units.getById('uU-001')).id).toBe('U-001');
    await expect(mockApi.units.getById('uU-DOES-NOT-EXIST')).rejects.toThrow();
  });

  it('gives a standalone unit u<id> as its listing id', async () => {
    const standalone = (await mockApi.units.list({})).find((u) => u.id === 'U-001')!;
    expect(standalone.listingId).toBe('uU-001');
  });

  it('gives a standalone unit no door number', async () => {
    await login();
    const b = await book('U-003', '2027-11-10', '2027-11-13');
    expect(b.unitId).toBe('U-003');
    expect(b.unitSnapshot.apartmentNo).toBeUndefined();
  });
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

/**
 * U-004 plays a unit whose permit runs out 20 days from today. Relative, so
 * the cap never drifts into the past and takes the fixture with it.
 */
describe('mock role-plays the permit cap the guest API enforces', () => {
  const PERMIT_UNIT = 'U-004';

  function isoInDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  it('blocks from the expiry day itself to the end of the window, tagged permit_expiry', async () => {
    const blocked = await mockApi.units.getBlockedDates(PERMIT_UNIT, isoInDays(0), isoInDays(60));
    expect(blocked).toContainEqual({ start: isoInDays(20), end: isoInDays(60), reason: 'permit_expiry' });
  });

  it('leaves every other span without a reason', async () => {
    const blocked = await mockApi.units.getBlockedDates(UNIT_ID);
    expect(blocked.every((r) => !('reason' in r))).toBe(true);
  });

  it('answers availability past the expiry with 409 BOOKING_EXCEEDS_PERMIT_VALIDITY', async () => {
    await expect(
      mockApi.units.checkAvailability(PERMIT_UNIT, isoInDays(18), isoInDays(22)),
    ).rejects.toMatchObject({ status: 409, code: 'BOOKING_EXCEEDS_PERMIT_VALIDITY' });
  });

  it('allows a stay that checks out on the expiry day', async () => {
    const { available } = await mockApi.units.checkAvailability(PERMIT_UNIT, isoInDays(17), isoInDays(20));
    expect(available).toBe(true);
  });

  it('refuses the booking itself the same way — the probe and the create agree', async () => {
    await login();
    await expect(
      mockApi.bookings.create({
        unitId: PERMIT_UNIT,
        checkInDate: isoInDays(18),
        checkOutDate: isoInDays(22),
        guests: { adults: 2, children: 0 },
        paymentMethod: 'visa',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'BOOKING_EXCEEDS_PERMIT_VALIDITY' });
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

/**
 * The SMS provider failing, as the backend reports it: 503 SMS_SEND_FAILED and
 * this exact copy (an em dash U+2014 with a space on each side, no full stop).
 * The mock answers that way for one number, on every request that texts a code.
 */
describe('mock — the SMS provider failing', () => {
  const FAILS_FOR = '0500000503';
  const MESSAGE = 'تعذّر إرسال رمز التحقق — حاول مرة أخرى بعد قليل';

  it('spells the copy exactly as the backend does', () => {
    expect(MESSAGE).toContain(' \u2014 ');
    expect(MESSAGE.endsWith('.')).toBe(false);
  });

  it.each([
    ['requestOtp', () => mockApi.auth.requestOtp(FAILS_FOR)],
    ['register', () => mockApi.auth.register({ firstName: 'فهد', lastName: 'يحيى', email: 'f@example.com', phone: FAILS_FOR })],
    ['changePhone', () => mockApi.account.changePhone(FAILS_FOR)],
  ])('%s answers 503 SMS_SEND_FAILED with the backend’s copy', async (_name, send) => {
    await expect(send()).rejects.toMatchObject({ status: 503, code: 'SMS_SEND_FAILED', message: MESSAGE });
  });

  it('sends normally to any other number', async () => {
    await expect(mockApi.auth.requestOtp('0500000504')).resolves.toMatchObject({ sent: true });
  });
});

/**
 * The mock accepts any six digits — it has no code of its own, so none is
 * written anywhere in the repo. Anything that is not exactly six digits is
 * still refused, the way the real form never sends it.
 */
describe('mock — any six digits sign in', () => {
  it('accepts twenty different random codes for a phone', async () => {
    for (let i = 0; i < 20; i++) {
      await mockApi.auth.requestOtp('0500000000');
      await expect(mockApi.auth.verifyOtp('0500000000', anyCode())).resolves.toMatchObject({
        accessToken: expect.any(String),
      });
    }
  });

  it('accepts a random code for an email', async () => {
    await login();
    await mockApi.account.requestEmailVerification(`any-${Date.now()}@example.com`);
    await expect(mockApi.account.verifyEmail(anyCode())).resolves.toMatchObject({ verified: true });
  });

  it.each([
    ['five digits', anyCode().slice(1)],
    ['seven digits', `${anyCode()}7`],
    ['letters', 'abcdef'],
    ['empty', ''],
  ])('refuses %s', async (_label, code) => {
    await expect(mockApi.auth.verifyOtp('0500000000', code)).rejects.toThrow();
  });
});
