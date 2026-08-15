import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { CheckoutPageClient } from './checkout-page-client';
import { useAuthStore } from '@/stores/auth';
import { bookingsApi } from '@/lib/api/client';
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

    fireEvent.change(screen.getByPlaceholderText('أدخل الاسم الأول'), { target: { value: 'سارة' } });
    fireEvent.change(screen.getByPlaceholderText('أدخل اسم العائلة'), { target: { value: 'محمد' } });
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
    // Everything the guest typed survived the round trip.
    expect((screen.getByPlaceholderText('أدخل الاسم الأول') as HTMLInputElement).value).toBe('سارة');
    expect((screen.getByPlaceholderText('أدخل اسم العائلة') as HTMLInputElement).value).toBe('محمد');
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

    fireEvent.change(screen.getByPlaceholderText('أدخل الاسم الأول'), { target: { value: 'سارة' } });
    fireEvent.change(screen.getByPlaceholderText('أدخل اسم العائلة'), { target: { value: 'محمد' } });
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
