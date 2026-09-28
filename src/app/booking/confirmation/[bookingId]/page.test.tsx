/**
 * In a building the server books whichever door is free, so the confirmation
 * must describe the booking it was handed — its unit, its door — and never the
 * card the guest happened to open.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../../messages/ar.json';
import ConfirmationPage from './page';
import { mockApi } from '@/lib/api/mock';
import { findUnitById } from '@/data/mock/units';

let bookingId = '';

vi.mock('next/navigation', () => ({
  useParams: () => ({ bookingId }),
}));

const doorLine = (n: string) => arMessages.common.apartmentNo.replace('{number}', n);

async function renderPage() {
  const view = render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <ConfirmationPage />
    </NextIntlClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
  return view;
}

function book(unitId: string, checkInDate: string, checkOutDate: string) {
  return mockApi.bookings.create({
    unitId,
    checkInDate,
    checkOutDate,
    guests: { adults: 2, children: 0 },
    paymentMethod: 'visa',
  });
}

beforeEach(async () => {
  const { debugOtp } = await mockApi.auth.requestOtp('0500000000');
  await mockApi.auth.verifyOtp('0500000000', debugOtp!);
});

afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  await mockApi.auth.logout();
});

describe('Booking confirmation — the unit comes from the booking', () => {
  it('shows the door the server allocated, not the card the guest opened', async () => {
    // Door 1 of U-005 is the card; it is taken first, so the second stay on
    // the same dates lands on door 2 — a unit id the guest never saw.
    await book('U-005', '2027-12-10', '2027-12-13');
    const second = await book('U-005', '2027-12-10', '2027-12-13');
    expect(second.unitId).not.toBe('U-005');
    bookingId = second.id;

    vi.useFakeTimers();
    const { container } = await renderPage();

    expect(container.textContent).toContain(findUnitById('U-005')!.title);
    expect(container.textContent).toContain(doorLine('2'));
    expect(container.textContent).not.toContain(doorLine('1'));
  });

  it('shows no door line for a standalone unit', async () => {
    bookingId = (await book('U-003', '2027-12-20', '2027-12-23')).id;

    vi.useFakeTimers();
    const { container } = await renderPage();

    expect(container.textContent).toContain(findUnitById('U-003')!.title);
    expect(container.textContent).not.toContain(doorLine('').trim());
  });
});
