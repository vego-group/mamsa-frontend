// @vitest-environment node
/**
 * CVE-2025-29927 (GHSA-f82v-jwr5-mffw). Up to Next 14.2.24, a request that
 * named the middleware five times in `x-middleware-subrequest` made Next skip
 * the middleware altogether — so the staging password could be walked past with
 * one header. Measured on our own 14.2.13 build: 401 without it, 200 and the
 * whole unit page with it. Fixed in 14.2.25, which dropped that shortcut.
 *
 * The request goes through Next's own middleware sandbox — the code that held
 * the shortcut — with our real middleware and the real variable inside it, so
 * moving back to an affected Next version turns this red. (It cannot see a
 * shortcut added somewhere else in a future Next; a real request against a
 * running build is still the final check.)
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { run } from 'next/dist/server/web/sandbox';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

/** The name Next gives a middleware that lives in src/ (see middleware-manifest.json). */
const NAME = 'src/middleware';
const SECRET = 'tester:not-the-real-one';
const nameFiveTimes = (name: string) => Array(5).fill(name).join(':');

let dir: string;
let entry: string;

// Next's sandbox loads the compiled middleware from files and calls the entry
// it registers. This entry hands the request back to our real middleware.
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'mw-subrequest-'));
  entry = join(dir, 'entry.js');
  writeFileSync(
    entry,
    `globalThis._ENTRIES = { ${JSON.stringify(`middleware_${NAME}`)}: {
      default: async ({ request }) => request.__ourMiddleware(request),
    } };`,
  );
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function throughNext(headers: Record<string, string>): Promise<Response> {
  const result = await run({
    name: NAME,
    paths: [entry],
    distDir: dir,
    useCache: false,
    edgeFunctionEntry: { wasm: [], assets: [], env: {} },
    request: {
      headers,
      method: 'GET',
      url: 'https://staging.example.test/units/u2',
      nextConfig: {},
      geo: {},
      page: { name: '/' },
      __ourMiddleware: (req: { url: string; headers: Record<string, string> }) => ({
        response: middleware(new NextRequest(req.url, { headers: req.headers })),
        waitUntil: Promise.resolve(),
      }),
    },
  } as never);
  return result.response as Response;
}

describe('x-middleware-subrequest cannot walk past the staging password', () => {
  it('refuses a request without credentials (the bridge runs our middleware)', async () => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    expect((await throughNext({})).status).toBe(401);
  });

  it.each([
    ['src/middleware ×5 (our file lives in src/)', nameFiveTimes('src/middleware')],
    ['middleware ×5', nameFiveTimes('middleware')],
  ])('refuses %s without credentials', async (_label, header) => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = await throughNext({ 'x-middleware-subrequest': header });
    expect(res.status).toBe(401);
    expect(res.headers.get('WWW-Authenticate')).toMatch(/^Basic /);
  });

  it('still lets the right credentials through with the header present', async () => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = await throughNext({
      'x-middleware-subrequest': nameFiveTimes('src/middleware'),
      authorization: `Basic ${Buffer.from(SECRET).toString('base64')}`,
    });
    expect(res.status).not.toBe(401);
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });
});
