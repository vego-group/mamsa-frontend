import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../../messages/ar.json';
import InvoicePage from './page';
import { bookingsApi, type TaxInvoice } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { INVOICE_SELLER } from '@/lib/constants/brand';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR } from '@/lib/utils/format';
import type { Booking } from '@/types';

const BOOKING_ID = 'BK-TEST';

vi.mock('next/navigation', () => ({
  useParams: () => ({ bookingId: BOOKING_ID }),
}));

function bookingFixture(status: Booking['status'] = 'confirmed'): Booking {
  return {
    id: BOOKING_ID,
    code: 'TESTCODE',
    unitId: 'U-001',
    unitSnapshot: { title: 'شقة تجريبية', city: 'الرياض', country: 'السعودية', imageUrl: '', ownerName: 'مالك' },
    userId: 'CURRENT_USER',
    status,
    checkInDate: '2026-09-10',
    checkOutDate: '2026-09-12',
    nights: 2,
    guests: { adults: 2, children: 0 },
    price: { pricePerNight: 500, nights: 2, gross: 1000, netBase: 869.57, vat: 130.43 },
    policySnapshot: getPolicyByTemplate('flexible'),
    isReviewed: false,
    createdAt: '2026-09-01T00:00:00Z',
  };
}

function invoiceFixture(overrides: Partial<TaxInvoice> = {}): TaxInvoice {
  return {
    invoiceNumber: 'INV-TESTCODE',
    issuedAt: '2026-09-12T10:00:00Z',
    seller: { ...INVOICE_SELLER },
    buyerName: 'محمد أحمد',
    lines: [
      {
        description: 'شقة تجريبية',
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
        nights: 2,
        netBase: 869.57,
        vatRate: 0.15,
        vat: 130.43,
        gross: 1000,
      },
    ],
    totalNetBase: 869.57,
    totalVat: 130.43,
    totalGross: 1000,
    currency: 'SAR',
    qrCode: null,
    ...overrides,
  };
}

async function renderInvoice() {
  render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <InvoicePage />
    </NextIntlClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Tax invoice — Mamsa is the seller of record', () => {
  it('renders the seller block from the constant, never the host', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(invoiceFixture());
    await renderInvoice();

    expect(screen.getByText(INVOICE_SELLER.name)).toBeTruthy();
    expect(screen.getByText(INVOICE_SELLER.vatNumber)).toBeTruthy();
    expect(screen.getByText(INVOICE_SELLER.crNumber)).toBeTruthy();
    // The host's name must never appear as supplier.
    expect(screen.queryByText('مالك')).toBeNull();
  });

  it('shows a total equal to the amount charged, and a split that reconciles', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(invoiceFixture());
    await renderInvoice();

    // Each figure appears twice on a single-line invoice — once on the line,
    // once in the totals band — and both must agree.
    expect(screen.getAllByText(formatSAR(1000)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(formatSAR(869.57)).length).toBe(2);
    expect(screen.getAllByText(formatSAR(130.43)).length).toBe(2);
  });
});

describe('Tax invoice — QR is optional until the backend ships it', () => {
  it('renders a placeholder, not a broken image, when qrCode is null', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(invoiceFixture({ qrCode: null }));
    const { container } = render(
      <NextIntlClientProvider locale="ar" messages={arMessages}>
        <InvoicePage />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(screen.getByText(arMessages.invoice.qrPending)).toBeTruthy();
    expect(container.querySelector('svg.qr, canvas')).toBeNull();
  });

  it('renders the QR from the server payload the moment one arrives', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(
      invoiceFixture({ qrCode: 'AQVNYW1zYQIPMzEwNDU2MzcwNTAwMDAz' }),
    );
    const { container } = render(
      <NextIntlClientProvider locale="ar" messages={arMessages}>
        <InvoicePage />
      </NextIntlClientProvider>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(screen.queryByText(arMessages.invoice.qrPending)).toBeNull();
    // qrcode.react renders an <svg>; the placeholder path renders none.
    expect(container.querySelector('svg[height="104"]')).toBeTruthy();
  });
});

describe('Tax invoice — one layout for every booking', () => {
  it('renders a pre-conversion booking with the same columns and totals as a new one', async () => {
    // Booking #107 was charged 1035 under the old net-plus-VAT model. The server
    // derives its split from the stored total, and 1035 / 1.15 recovers the
    // original 900 + 135 exactly — so there is no special case to render.
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(
      invoiceFixture({
        totalNetBase: 900,
        totalVat: 135,
        totalGross: 1035,
        lines: [
          {
            description: 'شقة تجريبية',
            checkIn: '2026-09-10',
            checkOut: '2026-09-12',
            nights: 2,
            netBase: 900,
            vatRate: 0.15,
            vat: 135,
            gross: 1035,
          },
        ],
      }),
    );
    await renderInvoice();

    expect(screen.getAllByText(formatSAR(1035)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(formatSAR(900)).length).toBe(2);
    expect(screen.getAllByText(formatSAR(135)).length).toBe(2);
    // The split columns are present exactly as they are for a new booking.
    expect(screen.getByText(arMessages.invoice.colNetBase)).toBeTruthy();
    expect(screen.getByText(arMessages.invoice.colVat)).toBeTruthy();
  });
});

describe('Tax invoice — the server owns the seller identity', () => {
  it('omits registration rows the server sends as empty strings, without blanks', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(
      invoiceFixture({
        // What staging returns today: a named seller, registrations still blank.
        seller: { name: 'شركة ممسى للتقنية', vatNumber: '', crNumber: '', address: '' },
      }),
    );
    await renderInvoice();

    expect(screen.getByText('شركة ممسى للتقنية')).toBeTruthy();
    // Labels must not appear at all — not appear with nothing after them.
    expect(screen.queryByText(new RegExp(arMessages.invoice.vatNumber))).toBeNull();
    expect(screen.queryByText(new RegExp(arMessages.invoice.crNumber))).toBeNull();
    // And the local constant must NOT be substituted in behind the server's back.
    expect(screen.queryByText(INVOICE_SELLER.vatNumber)).toBeNull();
    expect(screen.queryByText(INVOICE_SELLER.crNumber)).toBeNull();
  });

  it('prefers the server name over the local constant when the two differ', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(bookingsApi, 'getInvoice').mockResolvedValue(
      invoiceFixture({
        seller: { name: 'اسم مختلف', vatNumber: '999', crNumber: '888', address: 'جدة' },
      }),
    );
    await renderInvoice();

    expect(screen.getByText('اسم مختلف')).toBeTruthy();
    expect(screen.getByText('999')).toBeTruthy();
    // A company rename must not require a frontend deploy.
    expect(screen.queryByText(INVOICE_SELLER.name)).toBeNull();
  });
});

describe('Tax invoice — 409 INVOICE_NOT_AVAILABLE is a state, not a failure', () => {
  it('shows the unavailable message rather than an error card', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture('confirmed'));
    vi.spyOn(bookingsApi, 'getInvoice').mockRejectedValue(
      new ApiError(409, 'no invoice', 'INVOICE_NOT_AVAILABLE'),
    );
    await renderInvoice();

    expect(screen.getByText(arMessages.invoice.unavailable)).toBeTruthy();
    expect(screen.queryByText(arMessages.invoice.loadFailed)).toBeNull();
  });

  it('still surfaces a genuine server fault as an error', async () => {
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture('confirmed'));
    vi.spyOn(bookingsApi, 'getInvoice').mockRejectedValue(new ApiError(500, 'boom'));
    await renderInvoice();

    expect(screen.getByText(arMessages.invoice.loadFailed)).toBeTruthy();
  });
});

describe('Tax invoice — only for paid bookings', () => {
  it.each<Booking['status']>(['pending_payment', 'cancelled'])(
    'shows the unavailable message for a %s booking and requests no invoice',
    async (status) => {
      vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture(status));
      const getInvoice = vi.spyOn(bookingsApi, 'getInvoice');
      await renderInvoice();

      expect(screen.getByText(arMessages.invoice.unavailable)).toBeTruthy();
      expect(getInvoice).not.toHaveBeenCalled();
    },
  );
});

describe('Tax invoice — a 401 is a missing session, not a broken invoice', () => {
  it('asks for the sign-in it needs instead of showing a load failure', async () => {
    // The "view tax invoice" button in the confirmation email lands here, very
    // often in a browser with no session.
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(401, 'Unauthenticated.'));
    const getInvoice = vi.spyOn(bookingsApi, 'getInvoice');
    await renderInvoice();

    expect(screen.getByText(arMessages.common.signInRequiredTitle)).toBeTruthy();
    expect(screen.queryByText(arMessages.invoice.loadFailed)).toBeNull();
    expect(screen.queryByText(arMessages.common.loading)).toBeNull();
    expect(getInvoice).not.toHaveBeenCalled();
  });

  it('tells a signed-in visitor plainly when the booking is not theirs', async () => {
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(403, 'غير مصرح'));
    await renderInvoice();

    expect(screen.getByText(arMessages.invoice.notYours)).toBeTruthy();
  });
});
