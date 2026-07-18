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

// U-001: pricePerNight 1200, cleaningFee 300 — 4 nights (2026-08-01 → 2026-08-05).
// Mirrors the mock backend's formula (10% service fee, 15% tax) purely to
// compute the EXPECTED numbers for these assertions — the component itself
// must never do this math; it only renders whatever the (mocked) API returns.
const EXPECTED_QUOTE = { subtotal: 4800, cleaningFee: 300, serviceFee: 480, taxes: 837, total: 6417 };

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
      subtotal: EXPECTED_QUOTE.subtotal,
      cleaningFee: EXPECTED_QUOTE.cleaningFee,
      serviceFee: EXPECTED_QUOTE.serviceFee,
      tax: EXPECTED_QUOTE.taxes,
      total: EXPECTED_QUOTE.total,
    },
    policySnapshot: getPolicyByTemplate('flexible'),
    isReviewed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Checkout — price breakdown renders the server-computed quote exactly', () => {
  it('shows subtotal / cleaning fee / service fee / taxes / total straight from the quote — no client math', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.subtotal))).toBeTruthy();
    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.cleaningFee))).toBeTruthy();
    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.serviceFee))).toBeTruthy();
    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.taxes))).toBeTruthy();
    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.total))).toBeTruthy();
  });
});

describe('Checkout — post-booking price switches to the frozen booking response', () => {
  it('replaces the pre-booking quote with the booking response breakdown once created', async () => {
    useAuthStore.setState({ user: baseUser({ emailVerified: true }), isAuthenticated: true });
    renderCheckout();
    await waitForUnitToLoad();

    // Before submitting: the page shows the QUOTE's cleaning fee.
    expect(screen.getByText(formatSAR(EXPECTED_QUOTE.cleaningFee))).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('أدخل الاسم الأول'), { target: { value: 'سارة' } });
    fireEvent.change(screen.getByPlaceholderText('أدخل اسم العائلة'), { target: { value: 'محمد' } });
    fireEvent.click(screen.getByRole('checkbox'));

    // The booking response deliberately differs from the quote above, so we
    // can prove the page switched sources rather than coincidentally matching.
    const booking = bookingFixture({
      price: {
        pricePerNight: 1200,
        nights: 4,
        subtotal: EXPECTED_QUOTE.subtotal,
        cleaningFee: 999,
        serviceFee: EXPECTED_QUOTE.serviceFee,
        tax: EXPECTED_QUOTE.taxes,
        total: 7116,
      },
    });
    vi.spyOn(bookingsApi, 'create').mockResolvedValueOnce(booking);

    const button = screen.getByText(/المتابعة إلى الدفع/).closest('button')!;
    await act(async () => {
      fireEvent.click(button);
      await vi.advanceTimersByTimeAsync(350);
    });

    // The frozen booking numbers now win — the quote's old cleaning fee/total are gone.
    expect(screen.getByText(formatSAR(999))).toBeTruthy();
    expect(screen.getByText(formatSAR(7116))).toBeTruthy();
    expect(screen.queryByText(formatSAR(EXPECTED_QUOTE.cleaningFee))).toBeNull();
    expect(screen.queryByText(formatSAR(EXPECTED_QUOTE.total))).toBeNull();
  });
});
