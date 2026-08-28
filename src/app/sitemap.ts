import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/brand';
import { unitsApi } from '@/lib/api/client';

/**
 * Generates /sitemap.xml (Sitemaps 0.9 protocol) — Next.js App Router
 * convention. Lists the canonical, publicly indexable pages only; authenticated
 * and transactional routes (account, bookings, payments) are intentionally
 * excluded and are also disallowed in robots.txt.
 *
 * Unit detail pages come from `GET /units/sitemap` — ids and `updated_at` only,
 * unpaginated, so every listing gets a chance at being indexed rather than only
 * whichever page a crawler happened to reach.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { path: '/policies/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/policies/terms', priority: 0.4, changeFrequency: 'yearly' },
  ];

  const staticEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  // Best-effort: a backend hiccup must not take the whole sitemap down with it.
  // A sitemap missing its unit pages still beats a 500 to a crawler.
  let unitEntries: MetadataRoute.Sitemap = [];
  try {
    unitEntries = (await unitsApi.sitemap()).map((u) => ({
      url: `${SITE_URL}/units/${u.id}`,
      lastModified: new Date(u.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    unitEntries = [];
  }

  return [...staticEntries, ...unitEntries];
}
