// @vitest-environment node
/**
 * The middleware's two jobs: a password in front of a non-production site when
 * STAGING_BASIC_AUTH is set, and Markdown negotiation for agents. With the
 * variable unset the first job does nothing at all — production runs exactly
 * as before.
 *
 * The credentials below are invented for the tests; the real value lives only
 * in the host's environment settings.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { config, middleware } from './middleware';

const SECRET = 'tester:not-the-real-one';
const basic = (credentials: string) => `Basic ${Buffer.from(credentials, 'utf8').toString('base64')}`;

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'https://staging.example.test'), { headers });
}

const passedThrough = (res: Response) => res.headers.get('x-middleware-next') === '1';
const rewrittenTo = (res: Response) => res.headers.get('x-middleware-rewrite');

afterEach(() => {
  vi.unstubAllEnvs();
});

const EVERY_KIND_OF_PATH = [
  '/',
  '/units/u34',
  '/booking/34',
  '/_next/static/chunks/main.js',
  '/_next/image?url=%2Flogo.png&w=64&q=75',
  '/api/md?path=%2F',
  '/mcp',
  '/robots.txt',
  '/sitemap.xml',
  '/.well-known/apple-developer-merchantid-domain-association',
];

describe('with STAGING_BASIC_AUTH set', () => {
  it.each(EVERY_KIND_OF_PATH)('refuses %s without credentials: 401, a Basic challenge, noindex', (path) => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = middleware(request(path));
    expect(res.status).toBe(401);
    expect(res.headers.get('WWW-Authenticate')).toMatch(/^Basic realm=/);
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(passedThrough(res)).toBe(false);
  });

  it.each([
    ['a wrong password', basic('tester:guess')],
    ['a wrong user', basic('someone:not-the-real-one')],
    ['the password with a different user', basic(':not-the-real-one')],
    ['the right pair with a trailing space', basic(`${SECRET} `)],
    ['a scheme other than Basic', `Bearer ${SECRET}`],
    ['credentials that are not base64', 'Basic %%%'],
  ])('refuses %s', (_label, authorization) => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    expect(middleware(request('/', { authorization })).status).toBe(401);
  });

  it.each(EVERY_KIND_OF_PATH)('lets %s through with the right credentials, still noindex', (path) => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = middleware(request(path, { authorization: basic(SECRET) }));
    expect(res.status).not.toBe(401);
    expect(passedThrough(res)).toBe(true);
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('reads the scheme name in any case, as RFC 7617 allows', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = middleware(request('/', { authorization: basic(SECRET).replace('Basic', 'basic') }));
    expect(passedThrough(res)).toBe(true);
  });

  it('accepts a password with non-ASCII characters', () => {
    const arabic = 'مختبر:كلمة-سر-للاختبار';
    vi.stubEnv('STAGING_BASIC_AUTH', arabic);
    expect(passedThrough(middleware(request('/', { authorization: basic(arabic) })))).toBe(true);
  });

  // Only the routing: the renderer's own fetch of the page does not carry the
  // credentials, so on a protected site that fetch is itself refused.
  it('still routes an authenticated agent to the Markdown renderer, noindex', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', SECRET);
    const res = middleware(request('/units/u34', { authorization: basic(SECRET), accept: 'text/markdown' }));
    expect(rewrittenTo(res)).toContain('/api/md?path=%2Funits%2Fu34');
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('locks everyone out when the value has no user:password colon, rather than opening up', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', 'no-colon-here');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(middleware(request('/', { authorization: basic('no-colon-here') })).status).toBe(401);
    expect(middleware(request('/', { authorization: basic(':no-colon-here') })).status).toBe(401);
  });
});

describe('with STAGING_BASIC_AUTH not set (production)', () => {
  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['blank', '   '],
  ])('when %s, every path passes untouched: no challenge, no noindex', (_label, value) => {
    vi.stubEnv('STAGING_BASIC_AUTH', value);
    for (const path of EVERY_KIND_OF_PATH) {
      const res = middleware(request(path));
      expect(passedThrough(res)).toBe(true);
      expect(res.headers.get('X-Robots-Tag')).toBeNull();
      expect(res.headers.get('WWW-Authenticate')).toBeNull();
    }
  });

  it('ignores any Authorization header a visitor sends', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', undefined);
    expect(passedThrough(middleware(request('/', { authorization: basic('anyone:anything') })))).toBe(true);
  });

  it('still rewrites an agent asking a page for Markdown', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', undefined);
    const res = middleware(request('/units/u34?x=1', { accept: 'text/markdown' }));
    expect(rewrittenTo(res)).toContain('/api/md?path=%2Funits%2Fu34%3Fx%3D1');
  });

  // The matcher now covers every path (so the password can too); the Markdown
  // rewrite keeps the narrower set the old matcher allowed.
  it.each(['/api/md?path=%2F', '/mcp', '/_next/static/chunks/main.js', '/_next/image?url=x', '/robots.txt', '/sitemap.xml'])(
    'leaves %s alone even when Markdown is asked for',
    (path) => {
      vi.stubEnv('STAGING_BASIC_AUTH', undefined);
      const res = middleware(request(path, { accept: 'text/markdown' }));
      expect(rewrittenTo(res)).toBeNull();
      expect(passedThrough(res)).toBe(true);
    },
  );

  it('does not loop the renderer back into itself', () => {
    vi.stubEnv('STAGING_BASIC_AUTH', undefined);
    const res = middleware(request('/units/u34', { accept: 'text/markdown', 'x-md-render': '1' }));
    expect(rewrittenTo(res)).toBeNull();
  });
});

describe('matcher', () => {
  it('runs on every path, so nothing on a protected site is served without the password', () => {
    expect(config.matcher).toEqual(['/:path*']);
  });
});
