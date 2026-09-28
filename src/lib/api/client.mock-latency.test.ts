/**
 * `withLatency` holds a mock answer back by the simulated delay. A mock that
 * rejects has rejected before the delay even starts, so nothing may leave that
 * rejection unhandled while it waits — the dev overlay reports it as an error
 * even though the caller catches it once the delay ends.
 */
import { describe, expect, it } from 'vitest';
import { unitsApi } from './client';

describe('mock latency', () => {
  it('does not leave a mock rejection unhandled while the delay runs', async () => {
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', record);
    try {
      const answer = unitsApi.getById('U-DOES-NOT-EXIST');
      // Past Node's unhandled-rejection check, well short of the 300 ms delay.
      await new Promise((r) => setTimeout(r, 50));
      expect(unhandled).toEqual([]);
      await expect(answer).rejects.toThrow('الوحدة غير موجودة');
    } finally {
      process.off('unhandledRejection', record);
    }
  });
});
