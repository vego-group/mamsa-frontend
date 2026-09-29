import type { Unit } from '@/types';

/**
 * A unit without its price: what the page's server read hands the view. That
 * read may be five minutes old, so its price never reaches the browser at
 * all — not on screen, not in the page's source.
 *
 * Its own module, not the view's: the page (a server component) calls
 * `withoutPrice`, and a function exported from a 'use client' file reaches
 * the server as a client reference, not as something it can call.
 */
export type UnitContent = Omit<Unit, 'pricePerNight'>;

/** `unit` with its price taken off, for handing the server's read to the view. */
export function withoutPrice(unit: Unit): UnitContent {
  const { pricePerNight: _price, ...content } = unit;
  return content;
}
