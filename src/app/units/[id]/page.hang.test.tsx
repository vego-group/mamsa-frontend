/**
 * An API that never answers. Before the page read the unit on the server, a
 * hung API made a slow page in the browser; now it would make a page that
 * never comes back at all. Through the real client: the read gives up, and
 * the page answers with the site-wide head.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// React's `cache` lives in the server build Next renders with, not in the
// React the tests run on — see page.server.test.tsx.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (key: unknown) => unknown) => {
      const memo = new Map<unknown, unknown>();
      return (key: unknown) => {
        if (!memo.has(key)) memo.set(key, fn(key));
        return memo.get(key);
      };
    },
  };
});

type Page = typeof import('./page');
let page: Page;

/** A connection that opens and then says nothing — it ends only when the caller aborts it. */
const hangingFetch = vi.fn(
  (_url: string, init?: RequestInit) =>
    new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
    }),
);

// The mock/real switch is read at module load, so the page (and the client
// under it) is imported with it flipped.
beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  vi.stubGlobal('fetch', hangingFetch);
  page = await import('./page');
}, 60_000);

afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('unit page — an API that never answers', () => {
  it('still answers, with the site-wide head, within the read timeout', async () => {
    const params = { id: 'u12' };
    const started = Date.now();

    const [meta, body] = await Promise.all([page.generateMetadata({ params }), page.default({ params })]);

    expect(meta).toEqual({});
    expect(body).toBeTruthy();
    expect(Date.now() - started).toBeLessThan(4_000);
    expect(hangingFetch).toHaveBeenCalledOnce();
  }, 10_000);
});
