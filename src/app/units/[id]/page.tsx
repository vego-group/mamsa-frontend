import { cache } from 'react';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { unitsApi } from '@/lib/api/client';
import UnitDetailsPage from './unit-page-client';
import { unitMetadata } from './unit-metadata';

interface Props {
  params: { id: string };
}

/**
 * One read per request, shared by the <head> and the page. Null when it
 * fails: the page then renders as it always has, and the view's own fetch
 * shows the guest whatever went wrong.
 */
const readUnit = cache((ref: string) => unitsApi.getForPage(ref).catch(() => null));

/**
 * The unit's own title, description, share card and canonical. On a failed
 * read, nothing — the site-wide head from the layout stands, and the page is
 * never marked noindex over what may be a passing outage.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await readUnit(params.id);
  return unit ? unitMetadata(unit) : {};
}

/**
 * A unit page opened by anything but its listing key — an old id link, a
 * door of a building — is sent on to the key for good (308). The destination
 * is the key exactly as the server returned it, and the URL is compared with
 * it as is, so the page it lands on matches and does not redirect again.
 */
export default async function UnitPage({ params }: Props) {
  const unit = await readUnit(params.id);
  if (unit?.listingId && params.id !== unit.listingId) {
    permanentRedirect(`/units/${encodeURIComponent(unit.listingId)}`);
  }
  return <UnitDetailsPage />;
}
