import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from './sitemap';
import { unitsApi } from '@/lib/api/client';
import { SITE_URL } from '@/lib/constants/brand';

/** Rows as staging's `GET /units/sitemap` returns them: one per listing. */
const ROWS = [
  { listing_id: 'u12', id: 12, updated_at: '2026-09-28T18:56:28Z' },
  { listing_id: '01M19EZRB4ARP4BDGJ4ET7P03F', id: 30, updated_at: '2026-09-22T10:14:16Z' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

async function unitEntries() {
  vi.spyOn(unitsApi, 'sitemap').mockResolvedValue(ROWS);
  return (await sitemap()).filter((e) => e.url.startsWith(`${SITE_URL}/units/`));
}

describe('sitemap — unit pages', () => {
  it('lists each listing under its listing_id, not its unit id', async () => {
    const urls = (await unitEntries()).map((e) => e.url);
    expect(urls).toEqual([`${SITE_URL}/units/u12`, `${SITE_URL}/units/01M19EZRB4ARP4BDGJ4ET7P03F`]);
  });

  it('dates each listing by its updated_at', async () => {
    const dates = (await unitEntries()).map((e) => (e.lastModified as Date).toISOString());
    expect(dates).toEqual(['2026-09-28T18:56:28.000Z', '2026-09-22T10:14:16.000Z']);
  });
});
