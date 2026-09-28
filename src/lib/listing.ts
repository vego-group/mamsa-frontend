import type { Booking, Unit } from '@/types';

/**
 * Whether a booking is on this card's listing. A building is one listing with
 * many doors, and a booking holds whichever door was free — so its unit id is
 * often not the card's. `listing_id` is the one key both sides share (the
 * building's, or `u<id>` for a standalone unit). Unit ids are compared only
 * when either side came without one.
 */
export function isSameListing(
  booking: Pick<Booking, 'unitId' | 'listingId'>,
  unit: Pick<Unit, 'id' | 'listingId'>,
): boolean {
  if (booking.listingId && unit.listingId) return booking.listingId === unit.listingId;
  return booking.unitId === unit.id;
}
