/**
 * The MCP server follows the site's rule: the real API unless the mock is asked
 * for by name — and over MCP the mock is refused outright.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API = 'https://api.test/api/v1';

let fetchMock: ReturnType<typeof vi.fn>;

async function loadMcp(env: { useMock?: string; apiBaseUrl?: string }) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', env.useMock);
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', env.apiBaseUrl);
  return import('./units');
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('MCP data source', () => {
  it('serves the real API when NEXT_PUBLIC_USE_MOCK is not set', async () => {
    const { getFeaturedUnits } = await loadMcp({ apiBaseUrl: API });
    await expect(getFeaturedUnits()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(`${API}/units/popular`, expect.anything());
  }, 60_000);

  it('refuses when the mock is on', async () => {
    const { getFeaturedUnits, McpDataError } = await loadMcp({ useMock: 'true', apiBaseUrl: API });
    await expect(getFeaturedUnits()).rejects.toBeInstanceOf(McpDataError);
    expect(fetchMock).not.toHaveBeenCalled();
  }, 60_000);

  it.each([
    ['a misspelt NEXT_PUBLIC_USE_MOCK', { useMock: 'TRUE', apiBaseUrl: API }, /NEXT_PUBLIC_USE_MOCK/],
    ['no NEXT_PUBLIC_API_BASE_URL', { useMock: undefined, apiBaseUrl: undefined }, /NEXT_PUBLIC_API_BASE_URL/],
  ])('refuses on %s, naming the variable', async (_label, env, named) => {
    const { getFeaturedUnits, McpDataError } = await loadMcp(env);
    const call = getFeaturedUnits();
    await expect(call).rejects.toBeInstanceOf(McpDataError);
    await expect(call).rejects.toThrow(named);
    expect(fetchMock).not.toHaveBeenCalled();
  }, 60_000);
});
