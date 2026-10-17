// @vitest-environment node
/**
 * Guard: nothing of the ngrok tunnel is left, and nothing of it goes on the wire.
 *
 * Early on the API sat behind an ngrok tunnel, so every request carried
 * `ngrok-skip-browser-warning` to get past its interstitial. The tunnel went;
 * the header stayed, reached production, and widened what the API's CORS has
 * to allow. Two checks keep it gone: no file of the app names ngrok — header,
 * variable, comment or URL — and no request the app sends, through the API
 * client or the MCP server, carries a header whose name or value does, however
 * that header is spelt or put together. Test files are exempt from the scan;
 * this one has to name what it looks for.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT = join(__dirname, '..');
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?)$/i;
const NGROK = /ngrok/i;

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (!TEST_FILE.test(path) && !BINARY.test(path)) yield path;
  }
}

const SCANNED = [
  ...['src', 'messages', 'scripts', 'public'].flatMap((d) => [...files(join(ROOT, d))]),
  ...['README.md', '.env.example', 'next.config.js', 'package.json']
    .map((f) => join(ROOT, f))
    .filter(existsSync),
];

describe('no ngrok in the app', () => {
  it('no file names it', () => {
    const hits: string[] = [];
    for (const path of SCANNED) {
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (NGROK.test(line)) hits.push(`${relative(ROOT, path)}:${i + 1}`);
        });
    }
    expect(hits).toEqual([]);
  });
});

describe('no ngrok header on a request to the API', () => {
  let client: typeof import('./lib/api/client');
  let mcp: typeof import('./lib/mcp/units');
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
    client = await import('./lib/api/client');
    mcp = await import('./lib/mcp/units');
  }, 180_000);

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  /** Every header, on every request made, whose name or value mentions ngrok. */
  function ngrokHeaders(): string[] {
    expect(fetchMock).toHaveBeenCalled();
    return fetchMock.mock.calls.flatMap((call) => {
      const init = call[1] as RequestInit | undefined;
      const found: string[] = [];
      new Headers(init?.headers).forEach((value, name) => {
        if (NGROK.test(name) || NGROK.test(value)) found.push(`${name}: ${value}`);
      });
      return found;
    });
  }

  it('the API client, on a JSON request', async () => {
    await client.unitsApi.checkAvailability('u1', '2026-11-01', '2026-11-03').catch(() => {});
    expect(ngrokHeaders()).toEqual([]);
  });

  it('the API client, on a multipart request', async () => {
    await client.authApi
      .partnerRegister({
        type: 'individual',
        name: 'Test',
        phone: '0500000000',
        code: 'x',
        email: 'test@example.com',
        nationalIdFile: new File(['x'], 'id.png', { type: 'image/png' }),
      })
      .catch(() => {});
    expect(ngrokHeaders()).toEqual([]);
  });

  it('the MCP server', async () => {
    await mcp.getFeaturedUnits().catch(() => {});
    expect(ngrokHeaders()).toEqual([]);
  });
});
