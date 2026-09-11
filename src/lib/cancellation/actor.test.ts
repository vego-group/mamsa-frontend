import { describe, expect, it } from 'vitest';
import { cancelledByKey } from './actor';

describe('cancelledByKey', () => {
  it.each([
    ['system', 'bySystem'],
    ['admin', 'bySystem'],
    ['partner', 'byPartner'],
    ['customer', 'byCustomer'],
  ] as const)('%s → %s', (cancelledBy, key) => {
    expect(cancelledByKey({ cancelledBy })).toBe(key);
  });

  it('names nobody for unknown — never the guest', () => {
    expect(cancelledByKey({ cancelledBy: 'unknown' })).toBeNull();
  });
});
