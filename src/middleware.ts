import { NextRequest, NextResponse } from 'next/server';

/**
 * Markdown-for-Agents content negotiation.
 *
 * This middleware is INERT for normal traffic: browsers send
 * `Accept: text/html,...` and hit the early `return NextResponse.next()` on the
 * first line of work — their requests pass through completely unchanged. Only a
 * client that explicitly sends `Accept: text/markdown` (i.e. an agent) is
 * rewritten to `/api/md`, which renders a Markdown version of the same page and
 * falls back to HTML on any error. So HTML stays the default and existing pages
 * are unaffected.
 */
export function middleware(req: NextRequest) {
  const accept = req.headers.get('accept') ?? '';

  // Not a markdown request → do nothing. (Covers all browser traffic.)
  if (!accept.includes('text/markdown')) {
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

/**
 * Only run on real page routes. Excludes the API, the MCP endpoint, Next
 * internals, and any path with a file extension (assets, robots.txt,
 * sitemap.xml, /.well-known/*, etc.) so those are served normally regardless of
 * Accept. `mcp` is listed explicitly because it is a route handler without a
 * file extension: an MCP client negotiating content must always reach the
 * transport itself, never the Markdown renderer.
 */
export const config = {
  matcher: ['/((?!api|mcp|_next/static|_next/image|.*\\..*).*)'],
};
