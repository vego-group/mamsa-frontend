import { describe, expect, it } from 'vitest';
import { isSameListing, unitPath } from './listing';

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

/**
 * A door can close while its building stays on sale, and a link by the door's
 * id then 404s. The listing key keeps opening the building.
 */
describe('unitPath — the unit page is addressed by listing', () => {
  it('links a door of a building to the building, by its listing key', () => {
    expect(unitPath({ id: '40', listingId: BUILDING })).toBe(`/units/${BUILDING}`);
  });

  it('links a standalone unit by its u<id> key', () => {
    expect(unitPath({ id: '12', listingId: 'u12' })).toBe('/units/u12');
  });

  it('falls back to the unit id when there is no listing key', () => {
    expect(unitPath({ id: '12' })).toBe('/units/12');
  });

  it('keeps a key with odd characters inside its own path segment', () => {
    expect(unitPath({ id: '1', listingId: 'a/b?c' })).toBe('/units/a%2Fb%3Fc');
  });
});
