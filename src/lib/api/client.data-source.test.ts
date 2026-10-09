/**
 * Where the client reads its data from. The real API unless the mock is asked
 * for by name; a setting that is missing or misspelt stops the client at load
 * instead of letting it answer a customer from fixtures.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API = 'https://api.test/api/v1';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;

/** The switch is read at module load, so every case imports a fresh client. */
async function loadClient(env: { useMock?: string; apiBaseUrl?: string }) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', env.useMock);
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', env.apiBaseUrl);
  return import('./client');
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(json({ data: [] }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('the client reads the real API by default', () => {
  it.each([
    ['not set', undefined],
    ['empty', ''],
    ['"false"', 'false'],
  ])('when NEXT_PUBLIC_USE_MOCK is %s', async (_label, useMock) => {
    const { unitsApi } = await loadClient({ useMock, apiBaseUrl: API });
    await unitsApi.getFeatured();
    expect(fetchMock).toHaveBeenCalledWith(`${API}/units/popular`, expect.anything());
  }, 60_000);
});

describe('the mock needs asking for by name', () => {
  it('reads the fixtures when NEXT_PUBLIC_USE_MOCK is "true", with no API URL needed', async () => {
    const { unitsApi } = await loadClient({ useMock: 'true' });
    const units = await unitsApi.getFeatured();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(units.length).toBeGreaterThan(0);
  }, 60_000);
});

describe('a setting nobody can read with certainty stops the client', () => {
  it.each(['TRUE', 'True', '1', 'yes', 'on', 'true ', 'False', 'no', '0'])(
    'NEXT_PUBLIC_USE_MOCK=%j',
    async (useMock) => {
      await expect(loadClient({ useMock, apiBaseUrl: API })).rejects.toThrow(/NEXT_PUBLIC_USE_MOCK/);
    },
    60_000,
  );

  it.each([
    ['not set', undefined],
    ['empty', ''],
    ['blank', '   '],
  ])('the real API with NEXT_PUBLIC_API_BASE_URL %s', async (_label, apiBaseUrl) => {
    await expect(loadClient({ apiBaseUrl })).rejects.toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  }, 60_000);
});
