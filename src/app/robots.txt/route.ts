import { SITE_URL } from '@/lib/constants/brand';

/**
 * Serves /robots.txt as plain text (200).
 *
 * This is a route handler rather than the Next.js `robots.ts` metadata
 * convention because `MetadataRoute.Robots` can only emit
 * Allow/Disallow/Sitemap/Host — it has no way to express the `Content-Signal`
 * directive below.
 *
 * Crawl rules follow RFC 9309: everything is crawlable except authenticated and
 * transactional surfaces (account, bookings, payments), which hold no public
 * content and must never be indexed.
 */
export const dynamic = 'force-static';

/**
 * Content Signals — declares how this site's content may be used
 * (https://contentsignals.org/, draft-romm-aipref-contentsignals).
 *
 *   search=yes    → may be indexed to produce search results (links + excerpts).
 *   ai-input=yes  → may be used as real-time input/grounding for AI answers
 *                   (RAG). Deliberately allowed: we WANT assistants to read and
 *                   recommend our listings — that drives bookings.
 *   ai-train=no   → may NOT be used to train or fine-tune AI models.
 *
 * This is a content-rights declaration, not a technical setting. Change these
 * values if the business position changes.
 */
const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no';

/** Authenticated / transactional paths — no public content to index. */
const DISALLOWED = ['/account', '/favorites', '/my-reservations', '/booking', '/payment'];

function buildRobotsTxt(): string {
  return [
    '# Content Signals — https://contentsignals.org/',
    '# search=yes: may be indexed for search results (links and excerpts).',
    '# ai-input=yes: may be used as real-time input/grounding for AI answers.',
    '# ai-train=no: may NOT be used to train or fine-tune AI models.',
    '',
    'User-agent: *',
    `Content-Signal: ${CONTENT_SIGNAL}`,
    'Allow: /',
    ...DISALLOWED.map((path) => `Disallow: ${path}`),
    '',
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

export function GET() {
  return new Response(buildRobotsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
