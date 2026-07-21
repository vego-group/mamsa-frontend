import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/brand';

/**
 * Generates /robots.txt (served as plain text, 200) — Next.js App Router
 * convention. Crawl rules follow RFC 9309: everything is crawlable except
 * authenticated and transactional surfaces (account, bookings, payments),
 * which carry no public content and should never be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account',
          '/favorites',
          '/my-reservations',
          '/booking',
          '/payment',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
