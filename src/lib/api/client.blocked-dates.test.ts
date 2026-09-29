/**
 * The real transport for `GET /units/{id}/blocked-dates`: the permit span
 * carries `reason`, every other span comes back without one.
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

describe('unitsApi.getBlockedDates', () => {
  it('keeps permit_expiry on the permit span and adds nothing to the others', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          from: '2026-09-22',
          to: '2026-11-01',
          blocked: [
            { start: '2026-09-25', end: '2026-09-27' },
            { start: '2026-10-02', end: '2026-11-01', reason: 'permit_expiry' },
          ],
        },
        200,
      ),
    );

    const ranges = await unitsApi.getBlockedDates('12', '2026-09-22', '2026-11-01');

    expect(ranges).toEqual([
      { start: '2026-09-25', end: '2026-09-27' },
      { start: '2026-10-02', end: '2026-11-01', reason: 'permit_expiry' },
    ]);
    expect('reason' in ranges[0]!).toBe(false);
  });

  it('drops a reason it does not know rather than passing it through', async () => {
    fetchMock.mockResolvedValue(
      json({ blocked: [{ start: '2026-10-05', end: '2026-10-09', reason: 'manual_block' }] }, 200),
    );

    const ranges = await unitsApi.getBlockedDates('12');

    expect(ranges).toEqual([{ start: '2026-10-05', end: '2026-10-09' }]);
  });
});
