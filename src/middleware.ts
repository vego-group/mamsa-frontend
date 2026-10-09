import { NextRequest, NextResponse } from 'next/server';

/**
 * Two jobs, in this order:
 *
 * 1. A password in front of a non-production deployment. When the server-side
 *    variable STAGING_BASIC_AUTH holds `user:password`, every request — pages,
 *    assets, route handlers alike — must carry those credentials as HTTP Basic
 *    auth, and every response says `X-Robots-Tag: noindex, nofollow`. When the
 *    variable is unset, empty or blank, this step does nothing at all: that is
 *    production. It is read at request time, never built into the bundle, and
 *    must not be NEXT_PUBLIC_*.
 *
 * 2. Markdown-for-Agents content negotiation. INERT for normal traffic:
 *    browsers send `Accept: text/html,...` and pass through unchanged. Only a
 *    client that explicitly sends `Accept: text/markdown` (i.e. an agent) is
 *    rewritten to `/api/md`, which renders a Markdown version of the same page
 *    and falls back to HTML on any error.
 */
export function middleware(req: NextRequest) {
  const credentials = process.env.STAGING_BASIC_AUTH?.trim();
  if (credentials) {
    if (!authorized(req, credentials)) return challenge();
    return noindex(negotiateMarkdown(req));
  }
  return negotiateMarkdown(req);
}

/**
 * Only real page routes are ever rendered as Markdown. Excludes the API, the
 * MCP endpoint, Next internals, and any path with a file extension (assets,
 * robots.txt, sitemap.xml, /.well-known/*, etc.) so those are served normally
 * regardless of Accept. `mcp` is listed explicitly because it is a route
 * handler without a file extension: an MCP client negotiating content must
 * always reach the transport itself, never the Markdown renderer. (This was the
 * matcher until the password needed to cover every path.)
 */
const MARKDOWN_PAGE = /^\/(?!api|mcp|_next\/static|_next\/image|.*\..*)/;

function negotiateMarkdown(req: NextRequest): NextResponse {
  // Not a markdown request, or not a page → do nothing. (Covers all browser traffic.)
  const accept = req.headers.get('accept') ?? '';
  if (!accept.includes('text/markdown') || !MARKDOWN_PAGE.test(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // The markdown renderer's own self-fetch is marked so we never loop.
  if (req.headers.get('x-md-render')) {
    return NextResponse.next();
  }

  // Rewrite (URL stays the same for the client) to the markdown renderer,
  // passing the original path + query so it knows which page to render.
  const url = req.nextUrl.clone();
  const original = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = '/api/md';
  url.search = `?path=${encodeURIComponent(original)}`;
  return NextResponse.rewrite(url);
}

const NOINDEX = 'noindex, nofollow';

function noindex(res: NextResponse): NextResponse {
  res.headers.set('X-Robots-Tag', NOINDEX);
  return res;
}

function challenge(): NextResponse {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Mamsa staging", charset="UTF-8"',
      'X-Robots-Tag': NOINDEX,
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * True when the request carries exactly `credentials` as Basic auth. A value
 * without a colon can never be sent by a browser, so it locks everyone out
 * rather than opening the site — and says so in the log, without the value.
 */
function authorized(req: NextRequest, credentials: string): boolean {
  if (!credentials.includes(':')) {
    console.error('STAGING_BASIC_AUTH must be user:password — every request is refused until it is.');
    return false;
  }
  const sent = basicCredentials(req.headers.get('authorization'));
  return sent !== null && sameText(sent, credentials);
}

/** The `user:password` an Authorization header carries, decoded as UTF-8; null for anything else. */
function basicCredentials(header: string | null): string | null {
  const match = header?.match(/^basic\s+(\S+)\s*$/i);
  if (!match) return null;
  try {
    const binary = atob(match[1]!);
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** Compares in time that does not depend on where the first difference sits. */
function sameText(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * Every path. The password has to cover assets and route handlers too; the
 * Markdown rewrite keeps its own narrower set (MARKDOWN_PAGE above). With
 * STAGING_BASIC_AUTH unset, a request that is not a Markdown page request
 * passes straight through, as it always did.
 */
export const config = {
  matcher: ['/:path*'],
};
