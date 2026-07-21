import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/brand';

/**
 * Generates /sitemap.xml (Sitemaps 0.9 protocol) — Next.js App Router
 * convention. Lists the canonical, publicly indexable pages only; authenticated
 * and transactional routes (account, bookings, payments) are intentionally
 * excluded and are also disallowed in robots.txt.
 *
 * Dynamic unit detail pages (/units/[id]) are not enumerated here because their
 * ids come from the backend at request time. When a server-side unit catalogue
 * is available, map it into additional entries below.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/units', priority: 0.9, changeFrequency: 'daily' },
    { path: '/picks', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/host', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/partner-onboarding', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/policies/cancellation', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/policies/safety', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/policies/house-rules', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
