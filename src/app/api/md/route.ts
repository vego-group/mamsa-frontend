import { NextRequest, NextResponse } from 'next/server';
import { NodeHtmlMarkdown } from 'node-html-markdown';

/**
 * Markdown-for-Agents renderer (RFC 7231 content negotiation).
 *
 * `src/middleware.ts` rewrites requests that carry `Accept: text/markdown` to
 * this handler with the original path in `?path=`. We fetch that page's own
 * HTML from the origin and convert it to Markdown. Browsers never send that
 * Accept value, so they never reach here — HTML stays the default.
 *
 * Fail-safe by design: any problem falls back to serving the original HTML
 * response untouched, so an agent request can never end up worse off than a
 * normal one.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Header the self-fetch carries so the middleware lets it through as HTML
// (belt-and-braces — the middleware already ignores non-markdown Accept).
const RENDER_MARKER = 'x-md-render';

function passthrough(html: string, status: number, contentType: string) {
  return new NextResponse(html, { status, headers: { 'Content-Type': contentType } });
}

export async function GET(req: NextRequest) {
  const rawPath = req.nextUrl.searchParams.get('path') || '/';

  // Only ever fetch a same-origin, absolute path — never an external URL.
  if (!rawPath.startsWith('/') || rawPath.startsWith('//')) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 });
  }

  const target = new URL(rawPath, req.nextUrl.origin);

  let res: Response;
  try {
    res = await fetch(target, {
      headers: {
        Accept: 'text/html',
        [RENDER_MARKER]: '1',
        // Preserve locale/session so the rendered page matches the browser's.
        cookie: req.headers.get('cookie') ?? '',
        'accept-language': req.headers.get('accept-language') ?? '',
      },
      // Server-to-server call to our own origin; no need to cache.
      cache: 'no-store',
    });
  } catch {
    // Origin unreachable — nothing to convert.
    return NextResponse.json({ error: 'upstream fetch failed' }, { status: 502 });
  }

  const upstreamType = res.headers.get('content-type') ?? '';
  const body = await res.text();

  // If the upstream isn't HTML (redirect, error page, asset), hand it back as-is.
  if (!upstreamType.includes('text/html')) {
    return passthrough(body, res.status, upstreamType || 'text/plain; charset=utf-8');
  }

  let markdown: string;
  try {
    markdown = NodeHtmlMarkdown.translate(body).trim();
  } catch {
    // Conversion blew up — serve the original HTML rather than an error.
    return passthrough(body, res.status, 'text/html; charset=utf-8');
  }

  // Rough token estimate (~4 chars/token) for the optional x-markdown-tokens hint.
  const tokenEstimate = Math.max(1, Math.ceil(markdown.length / 4));

  return new NextResponse(markdown, {
    status: res.status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(tokenEstimate),
      // Caches must key on Accept so HTML and Markdown don't get crossed.
      Vary: 'Accept',
    },
  });
}
