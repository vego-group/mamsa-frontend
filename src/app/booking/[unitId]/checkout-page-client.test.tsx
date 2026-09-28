import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { CheckoutPageClient } from './checkout-page-client';
import { useAuthStore } from '@/stores/auth';
import { bookingsApi, unitsApi } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR } from '@/lib/utils/format';
import type { Booking, User } from '@/types';

const UNIT_ID = 'U-001';
const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ unitId: UNIT_ID }),
  useSearchParams: () => new URLSearchParams({ checkIn: '2026-08-01', checkOut: '2026-08-05', guests: '2' }),
  useRouter: () => ({ push: pushMock }),
}));

function baseUser(overrides: Partial<User> = {}): User {
  return {
    id: 'CURRENT_USER',
    role: 'user',
    firstName: 'محمد',
    lastName: 'أحمد',
    email: 'mohammed.ahmed@mamsaa.com',
    emailVerified: true,
    phone: '+966501234567',
    createdAt: '2025-12-01T08:00:00Z',
    ...overrides,
  };
}

function renderCheckout() {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <CheckoutPageClient />
    </NextIntlClientProvider>,
  );
}

async function waitForUnitToLoad() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  pushMock.mockClear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Checkout — pay button gated by email_verified', () => {
  it('disables "continue to payment" while the email is unverified, with the inline note', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: false }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('وثّق بريدك الإلكتروني لإتمام الحجز')).toBeTruthy();
  });

  it('enables "continue to payment" once the store reports the email verified', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('وثّق بريدك الإلكتروني لإتمام الحجز')).toBeNull();
  });
});

describe('Checkout — EMAIL_VERIFICATION_REQUIRED recovery', () => {
  it('reopens the email card and keeps the typed booking data on a stale-state rejection', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    // The store says verified, so the card renders nothing and payment is enabled —
    // matches the "stale client state" premise this recovery path exists for.
    expect(screen.queryByText('أرسل رمز التحقق')).toBeNull();

    fireEvent.click(screen.getByRole('checkbox'));

    vi.spyOn(bookingsApi, 'create').mockRejectedValueOnce(
      new ApiError(422, 'مطلوب توثيق البريد الإلكتروني قبل إتمام الحجز', 'EMAIL_VERIFICATION_REQUIRED'),
    );

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });

    // The card is back (reopened) — its "send code" form is visible again.
    expect(screen.getByText('أرسل رمز التحقق')).toBeTruthy();
    // No navigation to the payment page happened.
    expect(pushMock).not.toHaveBeenCalled();
    // The one thing the guest can still get wrong survived the round trip.
    expect((screen.getByRole('checkbox') as HTMLInputElement).getAttribute('aria-checked')).toBe('true');
  });
});

// U-001: pricePerNight 1200 GROSS — 4 nights (2026-08-01 → 2026-08-05).
// Prices are VAT-inclusive, so the payable total is a plain multiplication and
// VAT is split back out of it. These are the EXPECTED numbers for the
// assertions only — the component never does this math; it renders whatever
// the (mocked) API returns.
const EXPECTED_QUOTE = { gross: 4800, netBase: 4173.91, vat: 626.09 };

function bookingFixture(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BK-TEST',
    code: 'TESTCODE',
    unitId: UNIT_ID,
    unitSnapshot: { title: 'Test unit', city: 'الرياض', country: 'السعودية', imageUrl: '', ownerName: 'مالك' },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: '2026-08-01',
    checkOutDate: '2026-08-05',
    checkOutTime: '12:00',
    nights: 4,
    guests: { adults: 2, children: 0 },
    price: {
      pricePerNight: 1200,
      nights: 4,
      gross: EXPECTED_QUOTE.gross,
      netBase: EXPECTED_QUOTE.netBase,
      vat: EXPECTED_QUOTE.vat,
    },
    policySnapshot: getPolicyByTemplate('flexible'),
    isReviewed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Checkout — price breakdown renders the server-computed quote exactly', () => {
  it('shows the VAT-inclusive total straight from the quote — no client math, no fee rows', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    // The nights line and the total are both the gross figure.
    expect(screen.getAllByText(formatSAR(EXPECTED_QUOTE.gross)).length).toBeGreaterThan(0);
    // Nothing that could read as VAT added on top of it.
    expect(screen.queryByText(formatSAR(EXPECTED_QUOTE.gross + EXPECTED_QUOTE.vat))).toBeNull();
  });
});

describe('Checkout — post-booking price switches to the frozen booking response', () => {
  it('replaces the pre-booking quote with the booking response breakdown once created', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    // Before submitting: the page shows the QUOTE's total.
    expect(screen.getAllByText(formatSAR(EXPECTED_QUOTE.gross)).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('checkbox'));

    // The booking response deliberately differs from the quote above, so we
    // can prove the page switched sources rather than coincidentally matching.
    const booking = bookingFixture({
      price: {
        pricePerNight: 1500,
        nights: 4,
        gross: 6000,
        netBase: 5217.39,
        vat: 782.61,
      },
    });
    vi.spyOn(bookingsApi, 'create').mockResolvedValueOnce(booking);

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });

    // The frozen booking numbers now win — the quote's total is gone.
    expect(screen.getAllByText(formatSAR(6000)).length).toBeGreaterThan(0);
    expect(screen.queryByText(formatSAR(EXPECTED_QUOTE.gross))).toBeNull();
  });
});

/**
 * The server answers "not these dates" with a 409 on both steps. The text comes
 * from the code dictionary; the server's own message only fills in for a code
 * the dictionary does not know.
 */
describe('Checkout — a 409 on the dates is an answer, not a failure', () => {
  const PERMIT_COPY = 'هذه الوحدة غير متاحة للتواريخ المختارة. جرّب تواريخ أقرب.';
  const SERVER_COPY = 'تصريح هذه الوحدة لا يغطي هذه التواريخ';
  const permitError = () => new ApiError(409, SERVER_COPY, 'BOOKING_EXCEEDS_PERMIT_VALIDITY');

  beforeEach(() => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
  });

  it('shows the unavailable screen with the dictionary copy when availability says the permit ends first', async () => {
    vi.spyOn(unitsApi, 'checkAvailability').mockRejectedValue(permitError());
    renderCheckout();
    await waitForUnitToLoad();

    expect(screen.getByText(PERMIT_COPY)).toBeTruthy();
    expect(screen.queryByText(SERVER_COPY)).toBeNull();
    expect(screen.getByText(arMessages.checkout.backToUnit)).toBeTruthy();
    // A retry could only ever get the same 409 back.
    expect(screen.queryByText(arMessages.common.retry)).toBeNull();
  });

  it('sends the guest back to the listing by its key', async () => {
    const { MOCK_UNITS } = await import('@/data/mock/units');
    const card = MOCK_UNITS.find((u) => u.id === UNIT_ID)!;
    vi.spyOn(unitsApi, 'getById').mockResolvedValue({ ...card, listingId: 'uU-001' });
    vi.spyOn(unitsApi, 'checkAvailability').mockRejectedValue(permitError());
    renderCheckout();
    await waitForUnitToLoad();

    const back = screen.getByText(arMessages.checkout.backToUnit).closest('a');
    expect(back?.getAttribute('href')).toBe('/units/uU-001');
  });

  it('falls back to the server message for a 409 code the dictionary does not carry', async () => {
    vi.spyOn(unitsApi, 'checkAvailability').mockRejectedValue(
      new ApiError(409, 'الوحدة غير متاحة في هذه الفترة', 'UNIT_UNAVAILABLE'),
    );
    renderCheckout();
    await waitForUnitToLoad();

    expect(screen.getByText('الوحدة غير متاحة في هذه الفترة')).toBeTruthy();
    expect(screen.queryByText(arMessages.common.retry)).toBeNull();
  });

  it('keeps the generic line for a plain `available: false`, which carries no code', async () => {
    vi.spyOn(unitsApi, 'checkAvailability').mockResolvedValue({ available: false, pricing: null });
    renderCheckout();
    await waitForUnitToLoad();

    expect(screen.getByText(arMessages.checkout.errors.unitUnavailable)).toBeTruthy();
  });

  it('still offers a retry when availability fails for any other reason', async () => {
    vi.spyOn(unitsApi, 'checkAvailability').mockRejectedValue(new ApiError(500, 'Server Error'));
    renderCheckout();
    await waitForUnitToLoad();

    expect(screen.getByText(arMessages.common.retry)).toBeTruthy();
  });

  it('shows the dictionary copy when the booking itself is refused for the permit', async () => {
    renderCheckout();
    await waitForUnitToLoad();

    fireEvent.click(screen.getByRole('checkbox'));
    vi.spyOn(bookingsApi, 'create').mockRejectedValueOnce(permitError());
    vi.spyOn(bookingsApi, 'list').mockResolvedValue([]);

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(screen.getByText(PERMIT_COPY)).toBeTruthy();
    expect(screen.queryByText(SERVER_COPY)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('falls back to the server message on the booking step too — both steps word it the same way', async () => {
    renderCheckout();
    await waitForUnitToLoad();

    fireEvent.click(screen.getByRole('checkbox'));
    vi.spyOn(bookingsApi, 'create').mockRejectedValueOnce(
      new ApiError(409, 'الوحدة غير متاحة في هذه الفترة', 'UNIT_UNAVAILABLE'),
    );
    vi.spyOn(bookingsApi, 'list').mockResolvedValue([]);

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(screen.getByText('الوحدة غير متاحة في هذه الفترة')).toBeTruthy();
  });
});

/**
 * "Unit already booked" is often the guest's own unpaid booking holding the
 * dates. In a building that booking sits on whichever door was free — not the
 * card they opened — so it has to be found by listing, not by unit id.
 */
describe('Checkout — an unpaid booking on another door of the same building is reused', () => {
  const BUILDING = '01M19EZRB4ARP4BDGJ4ET7P03F';

  async function refuseAndOffer(pending: Booking) {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    const { MOCK_UNITS } = await import('@/data/mock/units');
    const card = MOCK_UNITS.find((u) => u.id === UNIT_ID)!;
    vi.spyOn(unitsApi, 'getById').mockResolvedValue({ ...card, listingId: BUILDING });
    renderCheckout();
    await waitForUnitToLoad();

    fireEvent.click(screen.getByRole('checkbox'));
    vi.spyOn(bookingsApi, 'create').mockRejectedValueOnce(
      new ApiError(409, 'الوحدة غير متاحة في هذه الفترة', 'UNIT_UNAVAILABLE'),
    );
    vi.spyOn(bookingsApi, 'list').mockResolvedValue([pending]);

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });
  }

  it('sends the guest back to pay for it, even though its unit id is not the card’s', async () => {
    await refuseAndOffer(
      bookingFixture({ id: 'BK-DOOR', unitId: 'U-001-2', listingId: BUILDING, status: 'pending_payment' }),
    );
    expect(pushMock).toHaveBeenCalledWith('/payment/BK-DOOR');
  });

  it('leaves an unpaid booking in another listing alone', async () => {
    await refuseAndOffer(
      bookingFixture({ id: 'BK-OTHER', unitId: UNIT_ID, listingId: 'u999', status: 'pending_payment' }),
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText('الوحدة غير متاحة في هذه الفترة')).toBeTruthy();
  });
});

describe('Checkout — the guest is the account holder', () => {
  it('shows the account details instead of asking for them again', async () => {
    useAuthStore.setState({
      user: baseUser({ emailVerified: true, firstName: 'محمد', lastName: 'أحمد' }),
      isAuthenticated: true,
    });
    const { container } = renderCheckout();
    await waitForUnitToLoad();

    // `POST /bookings` records the signed-in account as the guest and accepts
    // no separate details — four editable fields were being validated and then
    // dropped on the floor.
    expect(screen.queryByPlaceholderText('أدخل الاسم الأول')).toBeNull();
    expect(screen.queryByPlaceholderText('أدخل اسم العائلة')).toBeNull();
    expect(container.textContent).toContain('محمد');
    expect(container.textContent).toContain('أحمد');
  });

  it('lets the booking through on the agreement alone', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    // Resolved, not called through: the real mock enforces its own email
    // verification and its rejection would leak out of the test.
    const create = vi.spyOn(bookingsApi, 'create').mockResolvedValue(bookingFixture());
    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;

    // Unticked: refused, and nothing is sent.
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(create).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(create).toHaveBeenCalled();
  });
});
