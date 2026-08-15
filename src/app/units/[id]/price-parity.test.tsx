import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './page';
import { mockApi } from '@/lib/api/mock';
import { formatSAR } from '@/lib/utils/format';

/**
 * THE regression this whole VAT-inclusive change exists to prevent.
 *
 * For one unit and one date range, the figure the guest sees must be identical
 * on the unit page, at checkout, on the confirmation, and as `totalGross` on the
 * tax invoice. Any reintroduced multiplication — a stray × 1.15, a "subtotal +
 * taxes" that creeps back into a summary — makes one of these diverge, and this
 * file fails loudly.
 */
const UNIT_ID = 'U-001'; // pricePerNight 1200 GROSS in mock data

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: UNIT_ID }),
  useRouter: () => ({ push: vi.fn() }),
}));

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Price parity — one number from search to tax invoice', () => {
  it('quote, booking, and invoice all report the same gross for the same stay', async () => {
    vi.useRealTimers(); // the mock API awaits real promises here
    const { debugOtp } = await mockApi.auth.requestOtp('0500000000');
    await mockApi.auth.verifyOtp('0500000000', debugOtp!);

    const checkInDate = '2026-09-10';
    const checkOutDate = '2026-09-12'; // 2 nights

    const { pricing: quote } = await mockApi.units.checkAvailability(UNIT_ID, checkInDate, checkOutDate);
    const booking = await mockApi.bookings.create({
      unitId: UNIT_ID,
      checkInDate,
      checkOutDate,
      guests: { adults: 2, children: 0 },
      paymentMethod: 'visa',
    });
    const invoice = await mockApi.bookings.getInvoice(booking.id);

    // 1200 gross × 2 nights, with nothing added anywhere along the way.
    expect(quote!.gross).toBe(2400);
    expect(booking.price.gross).toBe(quote!.gross);
    expect(invoice.totalGross).toBe(quote!.gross);
    expect(invoice.lines[0]!.gross).toBe(quote!.gross);

    // And the split still reconciles to that same total on the invoice.
    expect(invoice.totalNetBase! + invoice.totalVat!).toBe(invoice.totalGross);

    await mockApi.auth.logout();
  });

  it('the unit page renders that same gross — no client-side markup', async () => {
    render(
      <NextIntlClientProvider locale="ar" messages={arMessages}>
        <UnitDetailsPage />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
    fireEvent.change(inputs[0]!, { target: { value: isoInDays(30) } });
    fireEvent.change(inputs[1]!, { target: { value: isoInDays(32) } }); // 2 nights

    // Same 2400 the quote/booking/invoice agree on above.
    expect(screen.getByText(formatSAR(2400))).toBeTruthy();
    // The VAT-exclusive predecessor would have shown 2760 (2400 × 1.15).
    expect(screen.queryByText(formatSAR(2760))).toBeNull();
  });
});

describe('Guest surfaces never receive platform margin', () => {
  it('exposes no commission or partnerShare on any guest payload', async () => {
    const quote = await mockApi.units.checkAvailability(UNIT_ID, '2026-09-10', '2026-09-12');
    const unit = await mockApi.units.getById(UNIT_ID);

    // Serialise the whole payload: a nested leak is still a leak.
    for (const payload of [quote, unit]) {
      const json = JSON.stringify(payload);
      expect(json).not.toMatch(/commission/i);
      expect(json).not.toMatch(/partner_?share/i);
    }
  });
});
