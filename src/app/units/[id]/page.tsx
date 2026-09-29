import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ApiError, unitsApi } from '@/lib/api/client';
import type { Unit } from '@/types';
import UnitDetailsPage from './unit-page-client';
import { unitMetadata } from './unit-metadata';

interface Props {
  params: { id: string };
}

/**
 * One read per request, shared by the <head> and the page. `missing` only
 * when the API answered 404 — the unit is not there, or no longer on sale.
 * Any other failure (5xx, network, timeout) leaves `unit` null: the page then
 * renders as it always has, and the view's own fetch shows the guest what
 * went wrong.
 */
const readUnit = cache(
  (ref: string): Promise<{ unit: Unit | null; missing: boolean }> =>
    unitsApi.getForPage(ref).then(
      (unit) => ({ unit, missing: false }),
      (e: unknown) => ({ unit: null, missing: e instanceof ApiError && e.status === 404 }),
    ),
);

/**
 * The unit's own title, description, share card and canonical. On a failed
 * read, nothing — the site-wide head from the layout stands, and the page is
 * never marked noindex over what may be a passing outage.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { unit } = await readUnit(params.id);
  return unit ? unitMetadata(unit) : {};
}

/**
 * A unit the API says is not there is a real 404 — a unit whose permit ran
 * out leaves the sitemap, and its page must not answer 200 and say so only in
 * the browser. An outage is never a 404.
 *
 * A unit page opened by anything but its listing key — an old id link, a
 * door of a building — is sent on to the key for good (308). The destination
 * is the key exactly as the server returned it, and the URL is compared with
 * it as is, so the page it lands on matches and does not redirect again.
 */
export default async function UnitPage({ params }: Props) {
  const { unit, missing } = await readUnit(params.id);
  if (missing) notFound();
  if (unit?.listingId && params.id !== unit.listingId) {
    permanentRedirect(`/units/${encodeURIComponent(unit.listingId)}`);
  }
  return <UnitDetailsPage />;
}
