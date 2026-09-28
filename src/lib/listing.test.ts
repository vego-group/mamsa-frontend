import { describe, expect, it } from 'vitest';
import { isSameListing } from './listing';

/** Building 30 on staging: the card is door 30, the others 39–42, one listing_id. */
const BUILDING = '01M19EZRB4ARP4BDGJ4ET7P03F';

describe('isSameListing — is this booking on this card?', () => {
  it('matches a booking on another door of the same building', () => {
    expect(isSameListing({ unitId: '40', listingId: BUILDING }, { id: '30', listingId: BUILDING })).toBe(true);
  });

  it('does not match a booking in a different listing, even with the same unit id', () => {
    expect(isSameListing({ unitId: '30', listingId: 'u30' }, { id: '30', listingId: BUILDING })).toBe(false);
  });

  it('matches a standalone unit by its own u<id> listing', () => {
    expect(isSameListing({ unitId: '12', listingId: 'u12' }, { id: '12', listingId: 'u12' })).toBe(true);
    expect(isSameListing({ unitId: '12', listingId: 'u12' }, { id: '2', listingId: 'u2' })).toBe(false);
  });

  it('falls back to the unit id only when either side has no listing_id', () => {
    expect(isSameListing({ unitId: '12' }, { id: '12', listingId: 'u12' })).toBe(true);
    expect(isSameListing({ unitId: '40', listingId: BUILDING }, { id: '30' })).toBe(false);
  });
});
