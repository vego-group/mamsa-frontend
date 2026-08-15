import { describe, it, expect } from 'vitest';
import { round2, splitGross, quoteFromNightly } from './pricing';
import { VAT_RATE } from '@/lib/constants/brand';

/**
 * The invariant this whole pricing model rests on: a gross amount split into
 * its net base and VAT must sum back to EXACTLY the gross. A tax invoice whose
 * parts miss the charged total by a halala is an invoice that does not balance.
 *
 * This is why `vat` is derived by subtraction rather than as
 * `netBase × VAT_RATE` — the multiplied form drifts on values like 999.99.
 * These cases pin that, so the cheaper-looking formula can't creep back in.
 */
const GROSS_VALUES = [0.01, 1, 33.33, 100, 999.99, 1000, 1234.56, 7777.77, 100000];

describe('round2', () => {
  it('rounds to halala precision', () => {
    expect(round2(869.5652173913044)).toBe(869.57);
    expect(round2(130.42999999999995)).toBe(130.43);
    expect(round2(100)).toBe(100);
  });
});

describe('splitGross — VAT comes out of the total, never on top of it', () => {
  it.each(GROSS_VALUES)('netBase + vat === gross exactly, for %d', (gross) => {
    const s = splitGross(gross);
    expect(s.gross).toBe(gross);
    // Not toBeCloseTo: the sum must land on the exact charged figure.
    expect(round2(s.netBase + s.vat)).toBe(gross);
  });

  it.each(GROSS_VALUES)('never returns a net base above the gross, for %d', (gross) => {
    const s = splitGross(gross);
    expect(s.netBase).toBeLessThanOrEqual(gross);
    expect(s.vat).toBeGreaterThanOrEqual(0);
  });

  it('splits the canonical example the way the spec states', () => {
    expect(splitGross(1000)).toEqual({ gross: 1000, netBase: 869.57, vat: 130.43 });
  });

  // The two formulas agree on most values, which is exactly why the wrong one
  // survives review. These are cases where they diverge and the multiplied
  // form breaks the invariant — pinned so a "simplification" back to
  // `netBase × VAT_RATE` fails here instead of on someone's tax invoice.
  it.each([
    [0.11, 0.1],
    [500.06, 434.83],
    [500.13, 434.9],
  ])('subtraction holds the invariant at %d where multiplication does not', (gross, expectedNet) => {
    const s = splitGross(gross);
    expect(s.netBase).toBe(expectedNet);
    expect(round2(s.netBase + s.vat)).toBe(gross);

    // What the multiplied form would have produced: a sum that misses gross.
    const multiplied = round2(s.netBase * VAT_RATE);
    expect(s.vat).not.toBe(multiplied);
    expect(round2(s.netBase + multiplied)).not.toBe(gross);
  });
});

describe('quoteFromNightly — the gross rate is multiplied, never marked up', () => {
  it('produces the spec example: 500 × 2 nights', () => {
    expect(quoteFromNightly(500, 2)).toEqual({
      nights: 2,
      nightlyRate: 500,
      gross: 1000,
      netBase: 869.57,
      vat: 130.43,
      vatRate: VAT_RATE,
    });
  });

  it.each([
    [500, 2],
    [1200, 3],
    [1200, 4],
    [450, 1],
    [333.33, 7],
  ])('gross is exactly rate × nights for %d × %d', (rate, nights) => {
    const q = quoteFromNightly(rate, nights);
    expect(q.gross).toBe(round2(rate * nights));
    expect(round2(q.netBase + q.vat)).toBe(q.gross);
    // The guest-facing total never exceeds the advertised rate × nights.
    expect(q.gross).toBeLessThanOrEqual(round2(rate * nights));
  });

  it('returns a zero quote for zero nights rather than a stray rounding artefact', () => {
    expect(quoteFromNightly(500, 0)).toEqual({
      nights: 0,
      nightlyRate: 500,
      gross: 0,
      netBase: 0,
      vat: 0,
      vatRate: VAT_RATE,
    });
  });
});
