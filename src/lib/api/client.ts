/**
 * API Client
 *
 * طبقة وسيطة بين الـ UI وبيانات النظام.
 * - وضع الـ Mock (NEXT_PUBLIC_USE_MOCK=true): يقرأ من mock/ مباشرة.
 * - وضع الـ Backend (USE_MOCK=false): fetch حقيقي إلى Laravel API عبر adapters.
 *
 * ⭐ نقطة التبديل: NEXT_PUBLIC_USE_MOCK + NEXT_PUBLIC_API_BASE_URL في .env.local
 */
import { mockApi } from './mock';
import {
  mapUnit,
  mapBooking,
  mapReview,
  mapUser,
  mapCancellationPreview,
  mapOffer,
  mapTestimonial,
  type RawUnit,
  type RawBooking,
  type RawUser,
  type RawCancellationPreview,
  type Offer,
  type Testimonial,
  type UnitCategory,
  type CityCount,
  type BudgetRange,
} from './adapters';
import type {
  Unit,
  Booking,
  Review,
  User,
  UnitsFilter,
  RefundRecord,
  CancellationPolicy,
} from '@/types';
import type { RefundPreview } from '@/lib/cancellation/engine';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// ============ Simulated latency for realistic mock UX ============
const MOCK_LATENCY_MS = 300;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withLatency<T>(promise: Promise<T> | T): Promise<T> {
  if (USE_MOCK) await delay(MOCK_LATENCY_MS);
  return promise;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Real fetch wrapper (used only when USE_MOCK=false).
 * Adds auth header, unwraps the `{ data }` envelope, surfaces Laravel errors.
 */
async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mamsa.accessToken') : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Skip the ngrok browser-warning interstitial (harmless on a real domain).
      'ngrok-skip-browser-warning': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
      message =
        body.message ??
        (body.errors ? Object.values(body.errors).flat()[0] ?? message : message);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const json: unknown = await res.json();
  // Most endpoints wrap payloads in `{ success, message, data }`; some return raw.
  if (json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

const qs = (params: Record<string, string | number | undefined | null>): string => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

// ============ Auth ============

interface RawAuthResult {
  access_token: string;
  refresh_token: string;
  user: RawUser;
  needs_profile?: boolean;
}

export const authApi = {
  requestOtp: (phone: string) =>
    USE_MOCK
      ? withLatency(mockApi.auth.requestOtp(phone))
      : http<unknown>('/auth/request-otp', {
          method: 'POST',
          body: JSON.stringify({ phone }),
        }).then(() => ({ sent: true as const })),

  verifyOtp: (phone: string, code: string) =>
    USE_MOCK
      ? withLatency(mockApi.auth.verifyOtp(phone, code))
      : http<RawAuthResult>('/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ phone, code, device: 'web' }),
        }).then((d) => ({
          user: mapUser(d.user),
          accessToken: d.access_token,
          refreshToken: d.refresh_token,
          needsProfile: Boolean(d.needs_profile),
        })),

  resendOtp: (phone: string) =>
    USE_MOCK
      ? withLatency(mockApi.auth.requestOtp(phone)).then(() => ({ sent: true as const }))
      : http<unknown>('/auth/resend-otp', {
          method: 'POST',
          body: JSON.stringify({ phone }),
        }).then(() => ({ sent: true as const })),

  /** OTP-only registration just triggers the OTP; profile is completed after verify. */
  register: (data: { firstName: string; lastName: string; email: string; phone: string }) =>
    USE_MOCK
      ? withLatency(mockApi.auth.register(data))
      : http<unknown>('/auth/request-otp', {
          method: 'POST',
          body: JSON.stringify({ phone: data.phone }),
        }).then(() => ({ sent: true as const })),

  completeProfile: (data: { name: string; email: string }) =>
    USE_MOCK
      ? withLatency(mockApi.account.updateProfile({ firstName: data.name, email: data.email }))
      : http<RawUser>('/auth/complete-profile', {
          method: 'POST',
          body: JSON.stringify(data),
        }).then(mapUser),

  logout: () =>
    USE_MOCK
      ? withLatency(mockApi.auth.logout())
      : http<unknown>('/auth/logout', { method: 'POST' }).then(() => ({ ok: true as const })),
};

// ============ Units ============

const unitFilterToQuery = (f: UnitsFilter): string =>
  qs({
    city: f.city,
    type: f.type && f.type !== 'all' ? f.type : undefined,
    capacity: f.capacity,
    start_date: f.startDate,
    end_date: f.endDate,
    min_price: f.minPrice,
    max_price: f.maxPrice,
    min_rating: f.minRating,
    sort: f.sort,
  });

export const unitsApi = {
  list: (filter: UnitsFilter = {}) =>
    USE_MOCK
      ? withLatency(mockApi.units.list(filter))
      : http<RawUnit[]>(`/units${unitFilterToQuery(filter)}${filterFeatures(filter)}`).then((rows) =>
          rows.map(mapUnit),
        ),

  getById: (id: string) =>
    USE_MOCK ? withLatency(mockApi.units.getById(id)) : http<RawUnit>(`/units/${id}`).then(mapUnit),

  getFeatured: () =>
    USE_MOCK
      ? withLatency(mockApi.units.getFeatured())
      : http<RawUnit[]>('/units/popular').then((rows) => rows.map(mapUnit)),

  getReviews: (id: string) =>
    USE_MOCK
      ? withLatency(mockApi.units.getReviews(id))
      : // No public reviews-list endpoint yet; unit detail exposes avg_rating/count only.
        Promise.resolve<Review[]>([]),

  checkAvailability: (id: string, startDate: string, endDate: string) =>
    USE_MOCK
      ? withLatency(Promise.resolve({ available: true }))
      : http<{ available: boolean }>(`/units/${id}/availability`, {
          method: 'POST',
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        }),
};

/** features[] is repeatable, so it is appended outside URLSearchParams' set(). */
function filterFeatures(f: UnitsFilter): string {
  if (!f.amenities || f.amenities.length === 0) return '';
  return f.amenities.map((a) => `&features[]=${encodeURIComponent(a)}`).join('');
}

// ============ Homepage content ============

export const contentApi = {
  offers: () =>
    USE_MOCK ? Promise.resolve<Offer[]>([]) : http<Record<string, unknown>[]>('/offers').then((r) => r.map(mapOffer)),

  testimonials: () =>
    USE_MOCK
      ? Promise.resolve<Testimonial[]>([])
      : http<Record<string, unknown>[]>('/testimonials').then((r) => r.map(mapTestimonial)),

  categories: () =>
    USE_MOCK ? Promise.resolve<UnitCategory[]>([]) : http<UnitCategory[]>('/units/categories'),

  cities: () => (USE_MOCK ? Promise.resolve<CityCount[]>([]) : http<CityCount[]>('/units/cities')),

  budgets: () => (USE_MOCK ? Promise.resolve<BudgetRange[]>([]) : http<BudgetRange[]>('/units/budgets')),

  popular: () =>
    USE_MOCK
      ? withLatency(mockApi.units.getFeatured())
      : http<RawUnit[]>('/units/popular').then((rows) => rows.map(mapUnit)),
};

// ============ Bookings ============

export interface CreateBookingInput {
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: { adults: number; children: number };
  paymentMethod: 'mada' | 'visa' | 'mastercard' | 'applepay';
  notes?: string;
}

export const bookingsApi = {
  list: () =>
    USE_MOCK
      ? withLatency(mockApi.bookings.list())
      : http<RawBooking[]>('/user/bookings').then((rows) => rows.map(mapBooking)),

  getById: (id: string) =>
    USE_MOCK
      ? withLatency(mockApi.bookings.getById(id))
      : http<RawBooking>(`/bookings/${id}`).then(mapBooking),

  create: (input: CreateBookingInput) =>
    USE_MOCK
      ? withLatency(mockApi.bookings.create(input))
      : http<RawBooking>('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            unit_id: input.unitId,
            start_date: input.checkInDate,
            end_date: input.checkOutDate,
            guests: input.guests.adults + input.guests.children,
            notes: input.notes ?? '',
          }),
        }).then(mapBooking),

  /** SRS FR-043: preview refund before user confirms cancel */
  previewCancellation: (id: string): Promise<RefundPreview> =>
    USE_MOCK
      ? withLatency(mockApi.bookings.previewCancellation(id))
      : http<RawCancellationPreview>(`/bookings/${id}/cancellation-preview`).then(mapCancellationPreview),

  /** SRS FR-046: execute cancellation + auto-refund via Moyasar */
  cancel: (id: string, reason?: string) =>
    USE_MOCK
      ? withLatency(mockApi.bookings.cancel(id, reason))
      : http<RawBooking>(`/bookings/${id}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }).then((b) => {
          const booking = mapBooking(b);
          const refund: RefundRecord = booking.refund ?? {
            amount: 0,
            percent: 0,
            tierLabel: '',
            refundedAt: new Date().toISOString(),
            reason,
            cancelledBy: 'customer',
          };
          return { booking, refund };
        }),
};

// ============ Payments ============

export interface InitiatePaymentResult {
  paymentId: number;
  bookingId: number;
  amount: number;
  amountHalalas: number;
  currency: string;
  description: string;
  publishableKey: string;
  callbackUrl: string;
  testMode: boolean;
}

export const paymentsApi = {
  initiate: (bookingId: string, paymentMethod: 'card' | 'applepay' = 'card') =>
    http<Record<string, unknown>>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, payment_method: paymentMethod }),
    }).then(
      (d): InitiatePaymentResult => ({
        paymentId: Number(d.payment_id),
        bookingId: Number(d.booking_id),
        amount: Number(d.amount),
        amountHalalas: Number(d.amount_halalas),
        currency: String(d.currency ?? 'SAR'),
        description: String(d.description ?? ''),
        publishableKey: String(d.publishable_key ?? ''),
        callbackUrl: String(d.callback_url ?? ''),
        testMode: Boolean(d.test_mode),
      }),
    ),

  pay: (paymentId: string, token = '') =>
    http<unknown>('/payments/pay', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, token }),
    }),

  verify: (paymentId: string, moyasarId: string) =>
    http<unknown>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, moyasar_id: moyasarId }),
    }),

  getById: (paymentId: string) => http<unknown>(`/payments/${paymentId}`),
};

// ============ Reviews ============

export const reviewsApi = {
  add: (input: { bookingId: string; rating: number; comment: string }) =>
    USE_MOCK
      ? withLatency(mockApi.reviews.add(input))
      : http<Record<string, unknown>>('/reviews', {
          method: 'POST',
          body: JSON.stringify({
            booking_id: input.bookingId,
            rating: input.rating,
            comment: input.comment,
          }),
        }).then(mapReview),

  getForBooking: (bookingId: string) =>
    // No dedicated endpoint; booking detail embeds its review when present.
    USE_MOCK ? withLatency(mockApi.reviews.getForBooking(bookingId)) : Promise.resolve<Review | null>(null),
};

// ============ Account ============

export const accountApi = {
  me: () => (USE_MOCK ? withLatency(mockApi.account.me()) : http<RawUser>('/auth/me').then(mapUser)),

  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>) =>
    USE_MOCK
      ? withLatency(mockApi.account.updateProfile(data))
      : http<RawUser>('/user/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            email: data.email,
          }),
        }).then(mapUser),

  // The endpoints below have no backend counterpart yet — keep them on mock data.
  changePhone: (newPhone: string) => withLatency(mockApi.account.changePhone(newPhone)),
  getCards: () => withLatency(mockApi.account.getCards()),
  getTransactions: () => withLatency(mockApi.account.getTransactions()),
  deleteAccount: () => withLatency(mockApi.account.deleteAccount()),
};

// Re-exports for convenience
export type { CancellationPolicy };
export type { Offer, Testimonial, UnitCategory, CityCount, BudgetRange };
