import { afterEach, describe, expect, it } from 'vitest';
import { mockApi } from './index';

const UNIT_ID = 'U-001';

async function login() {
  const { debugOtp } = await mockApi.auth.requestOtp('0500000000');
  await mockApi.auth.verifyOtp('0500000000', debugOtp!);
}

afterEach(async () => {
  await mockApi.auth.logout();
});

describe('mock pricing stays in sync between the quote and booking-creation endpoints', () => {
  it('booking creation produces the exact same breakdown as checkAvailability() for the same unit + dates', async () => {
    await login();

    const checkInDate = '2026-08-01';
    const checkOutDate = '2026-08-04'; // 3 nights

    const { pricing: quote } = await mockApi.units.checkAvailability(UNIT_ID, checkInDate, checkOutDate);
    const booking = await mockApi.bookings.create({
      unitId: UNIT_ID,
      checkInDate,
      checkOutDate,
      guests: { adults: 2, children: 0 },
      paymentMethod: 'visa',
    });

    expect(quote).toBeTruthy();
    expect(booking.price.subtotal).toBe(quote!.subtotal);
    expect(booking.price.tax).toBe(quote!.taxes);
    expect(booking.price.total).toBe(quote!.total);
  });
});
