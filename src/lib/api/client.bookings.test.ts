/**
 * The real transport for the guest's bookings list. `GET /user/bookings`
 * answers with a bare array — no `{ data }` envelope — and each row carries
 * the unit the server booked, with its listing.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Client = typeof import('./client');
let bookingsApi: Client['bookingsApi'];
let fetchMock: ReturnType<typeof vi.fn>;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const row = {
  id: 94,
  reference: 'MRTEST94',
  unit_id: null,
  start_date: '2026-11-27',
  end_date: '2026-11-29',
  status: 'cancelled',
  unit: {
    id: 40,
    name: 'برج تجريبي - مبنى كامل',
    type: 'apartment',
    price: 450,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    city: 'الرياض',
    listing_id: '01M19EZRB4ARP4BDGJ4ET7P03F',
    apartment_no: '3',
  },
};

beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  ({ bookingsApi } = await import('./client'));
}, 60_000);

afterAll(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bookingsApi.list', () => {
  it('reads GET /user/bookings as a bare array', async () => {
    fetchMock.mockResolvedValue(json([row], 200));

    const list = await bookingsApi.list();

    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('https://api.test/api/v1/user/bookings');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: '94',
      unitId: '40',
      listingId: '01M19EZRB4ARP4BDGJ4ET7P03F',
      status: 'cancelled',
      unitSnapshot: { title: 'برج تجريبي - مبنى كامل', apartmentNo: '3' },
    });
  });

  it('still reads it if the rows ever arrive in a { data } envelope', async () => {
    fetchMock.mockResolvedValue(json({ data: [row] }, 200));
    expect(await bookingsApi.list()).toHaveLength(1);
  });

  it('reads an empty list as no bookings', async () => {
    fetchMock.mockResolvedValue(json([], 200));
    expect(await bookingsApi.list()).toEqual([]);
  });
});
