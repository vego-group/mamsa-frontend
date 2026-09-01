/**
 * A booking link is normally opened from an email, on whatever browser the
 * person happens to be in — very often one with no session. Every test here
 * describes what that visitor sees: never the loading line, and never a raw
 * fault for what is really an ordinary answer about who they are.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import BookingDetailsPage from './page';
import { bookingsApi, reviewsApi } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import type { Booking, User } from '@/types';

const BOOKING_ID = '101';

vi.mock('next/navigation', () => ({
  useParams: () => ({ bookingId: BOOKING_ID }),
  // The cancel dialog rendered alongside the page reaches for the router.
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

function bookingFixture(): Booking {
  return {
    id: BOOKING_ID,
    code: 'TESTCODE',
    unitId: 'U-001',
    unitSnapshot: { title: 'شقة تجريبية', city: 'الرياض', country: 'السعودية', imageUrl: '', ownerName: 'مالك' },
    userId: 'CURRENT_USER',
    status: 'confirmed',
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

const USER: User = {
  id: 'CURRENT_USER',
  role: 'user',
  firstName: 'محمد',
  lastName: 'أحمد',
  email: 'a@b.com',
  emailVerified: true,
  phone: '+966500000000',
  createdAt: '2026-01-01T00:00:00Z',
};

async function renderPage() {
  render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <BookingDetailsPage />
    </NextIntlClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  useAuthStore.setState({ user: null, isAuthenticated: false });
  useUiStore.setState({ authDialog: null, prefillPhone: '' });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Booking details — a 401 asks for the sign-in it needs', () => {
  it('never leaves a logged-out visitor on the loading line', async () => {
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(401, 'Unauthenticated.'));
    vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    expect(screen.getByText(arMessages.common.signInRequiredTitle)).toBeTruthy();
    expect(screen.queryByText(arMessages.common.loading)).toBeNull();
    // The dialog is opened for them — the link came from an email, and hunting
    // for a login button first is a step with no purpose.
    expect(useUiStore.getState().authDialog).toBe('login');
  });

  it('loads the same booking once the session arrives, with no navigation away', async () => {
    const getById = vi
      .spyOn(bookingsApi, 'getById')
      .mockRejectedValueOnce(new ApiError(401, 'Unauthenticated.'))
      .mockResolvedValue(bookingFixture());
    vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    expect(screen.getByText(arMessages.common.signInRequiredTitle)).toBeTruthy();

    // What the login dialog does on success — the person never left this URL.
    await act(async () => {
      useAuthStore.getState().setSession(USER, 'access', 'refresh');
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(screen.getByText('شقة تجريبية')).toBeTruthy();
    expect(screen.queryByText(arMessages.common.signInRequiredTitle)).toBeNull();
    expect(getById).toHaveBeenCalledTimes(2);
    expect(getById).toHaveBeenLastCalledWith(BOOKING_ID);
  });

  it('does not ask a signed-in visitor to sign in when the booking is not theirs', async () => {
    useAuthStore.setState({ user: USER, isAuthenticated: true });
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(403, 'غير مصرح'));
    vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    expect(screen.getByText(arMessages.bookingDetails.notYours)).toBeTruthy();
    expect(useUiStore.getState().authDialog).toBeNull();
  });

  it('says a missing booking is missing, rather than showing a fault', async () => {
    useAuthStore.setState({ user: USER, isAuthenticated: true });
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(404, 'Not Found'));
    vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    expect(screen.getByText(arMessages.bookingDetails.notFound)).toBeTruthy();
    expect(screen.queryByText(arMessages.common.loadFailed)).toBeNull();
  });

  it('keeps the retry card for a genuine server fault', async () => {
    useAuthStore.setState({ user: USER, isAuthenticated: true });
    const getById = vi
      .spyOn(bookingsApi, 'getById')
      .mockRejectedValueOnce(new ApiError(500, 'boom'))
      .mockResolvedValue(bookingFixture());
    vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    const retry = screen.getByText(arMessages.common.retry);
    await act(async () => {
      retry.click();
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(screen.getByText('شقة تجريبية')).toBeTruthy();
    expect(getById).toHaveBeenCalledTimes(2);
  });
});

describe('Booking details — the review is supplementary', () => {
  it('renders the booking even when the review call fails', async () => {
    useAuthStore.setState({ user: USER, isAuthenticated: true });
    vi.spyOn(bookingsApi, 'getById').mockResolvedValue(bookingFixture());
    vi.spyOn(reviewsApi, 'getForBooking').mockRejectedValue(new ApiError(500, 'boom'));
    await renderPage();

    expect(screen.getByText('شقة تجريبية')).toBeTruthy();
    expect(screen.queryByText(arMessages.common.signInRequiredTitle)).toBeNull();
  });

  it('is not requested at all while the booking itself is unauthorized', async () => {
    vi.spyOn(bookingsApi, 'getById').mockRejectedValue(new ApiError(401, 'Unauthenticated.'));
    const getForBooking = vi.spyOn(reviewsApi, 'getForBooking').mockResolvedValue(null);
    await renderPage();

    // One 401 per logged-out visit, not two — and nothing rejects unhandled.
    expect(getForBooking).not.toHaveBeenCalled();
  });
});
