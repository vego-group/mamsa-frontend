/**
 * The unit page's own server-side read: the listing key for its redirect and
 * the fields of its <head>. Neither changes by the minute, so it is cached for
 * five minutes instead of going out on every visit.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Client = typeof import('./client');
let unitsApi: Client['unitsApi'];
let fetchMock: ReturnType<typeof vi.fn>;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// The mock/real switch is read at module load, so the client is imported once
// with it flipped.
beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  ({ unitsApi } = await import('./client'));
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

describe('unitsApi.getForPage', () => {
  it('reads the unit by whatever the URL carried, cached for five minutes', async () => {
    fetchMock.mockResolvedValue(json({ data: { id: 12, listing_id: 'u12', name: 'شقة', images: [] } }, 200));

    const unit = await unitsApi.getForPage('12');

    expect(unit.listingId).toBe('u12');
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.test/api/v1/units/12');
    expect(init.next).toEqual({ revalidate: 300 });
    expect(init.cache).toBeUndefined();
  });
});
