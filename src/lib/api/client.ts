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
import { ApiError } from './errors';
import { tokenManager } from '@/lib/auth/tokens';
import {
  mapUnit,
  mapBooking,
  mapReview,
  mapUser,
  mapUserProfile,
  mapCancellationPreview,
  mapTestimonial,
  mapCard,
  mapTransaction,
  mapCategory,
  mapBudget,
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
  SavedCard,
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

export { ApiError };

// ============ Silent session renewal ============
// Access tokens expire after an hour (`expires_in: 3600`). Instead of
// surfacing a raw 401 mid-session, `http()` transparently exchanges the
// refresh token for a new pair and replays the request once.

/** Shared across concurrent 401s so a burst of failing requests triggers ONE refresh round-trip. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  refreshInFlight ??= (async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return null;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken, device: 'web' }),
      });
      if (!res.ok) return null;
      const json: unknown = await res.json();
      const d = (json && typeof json === 'object' && 'data' in json ? (json as { data: unknown }).data : json) as
        | { access_token?: string; refresh_token?: string }
        | null;
      if (!d?.access_token) return null;
      tokenManager.setTokens(d.access_token, d.refresh_token);
      return d.access_token;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** Ends the client session and syncs the UI (header, favourites) to the logged-out state. */
async function forceLogout(): Promise<void> {
  // Dynamic import keeps the 'use client' store out of the server-side module graph.
  const { useAuthStore } = await import('@/stores/auth');
  useAuthStore.getState().logout();
}

/**
 * Real fetch wrapper (used only when USE_MOCK=false).
 * Adds auth header, unwraps the `{ data }` envelope, surfaces Laravel errors,
 * and silently renews an expired session (one refresh + retry per request).
 */
async function http<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const token = tokenManager.getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    // Prices/availability/bookings must always be fresh — Next.js's Server
    // Component fetch defaults to `force-cache` otherwise, which silently
    // serves stale API snapshots (e.g. units fetched before the backend
    // filled in lat/lng). Callers can still override via `init.cache`.
    cache: 'no-store',
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
    // Expired session? Renew once and replay. `/auth/refresh` itself is
    // excluded to avoid loops; without a stored token there is no session
    // to renew (guest hitting a protected endpoint).
    if (res.status === 401 && !isRetry && token && path !== '/auth/refresh') {
      const renewed = await refreshAccessToken();
      if (renewed) return http<T>(path, init, true);
      await forceLogout();
      throw new ApiError(401, 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى.');
    }

    let message = res.statusText;
    let code: string | undefined;
    let retryAfter: number | undefined;
    let remainingAttempts: number | undefined;
    try {
      const body = (await res.json()) as {
        message?: string;
        code?: string;
        errors?: Record<string, string[]>;
        retry_after?: number;
        remaining_attempts?: number;
      };
      message =
        body.message ??
        (body.errors ? Object.values(body.errors).flat()[0] ?? message : message);
      code = body.code;
      retryAfter = body.retry_after;
      remainingAttempts = body.remaining_attempts;
    } catch {
      /* non-JSON error body */
    }
    // A route-level throttle (as opposed to the business cooldown) returns a
    // plain 429 with no `code` — treat it the same as RATE_LIMITED.
    if (res.status === 429 && !code) {
      code = 'RATE_LIMITED';
      retryAfter ??= Number(res.headers.get('Retry-After')) || undefined;
    }
    throw new ApiError(res.status, message, code, retryAfter, remainingAttempts);
  }

  if (res.status === 204) return undefined as T;
  // A 200 with an empty body (some Laravel actions return no content without
  // using 204) would otherwise throw a SyntaxError inside res.json().
  const text = await res.text();
  if (!text) return undefined as T;
  const json: unknown = JSON.parse(text);
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

/**
 * Shape returned whenever an OTP is (re)dispatched. `debugOtp` is only ever
 * present in non-production backend environments — the UI shows it verbatim
 * when set and hides it otherwise, so no environment flag is needed here.
 */
interface OtpDispatch {
  sent: true;
  debugOtp?: string;
}

/**
 * `intent` tells the backend which flow this is, so it can reject early
 * (before sending any SMS or creating a user row):
 *  - "login": 422 `PHONE_NOT_REGISTERED` if the phone has no completed profile.
 *  - "register": 422 `PHONE_ALREADY_REGISTERED` if the phone is already a full account.
 * Omit it for flows where either outcome is fine (e.g. partner sign-up on a
 * phone that may already belong to a regular customer account).
 */
type OtpIntent = 'login' | 'register';

export const authApi = {
  requestOtp: (phone: string, intent?: OtpIntent): Promise<OtpDispatch> =>
    USE_MOCK
      ? withLatency(mockApi.auth.requestOtp(phone))
      : http<{ debug_otp?: string } | null>('/auth/request-otp', {
          method: 'POST',
          body: JSON.stringify(intent ? { phone, intent } : { phone }),
        }).then((d) => ({ sent: true, debugOtp: d?.debug_otp })),

  verifyOtp: (phone: string, code: string) =>
    USE_MOCK
      ? withLatency(mockApi.auth.verifyOtp(phone, code)).then((r) => ({ needsProfile: false, ...r }))
      : http<RawAuthResult>('/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ phone, code, device: 'web' }),
        }).then((d) => ({
          user: mapUser(d.user),
          accessToken: d.access_token,
          refreshToken: d.refresh_token,
          needsProfile: Boolean(d.needs_profile),
        })),

  resendOtp: (phone: string, intent?: OtpIntent): Promise<OtpDispatch> =>
    USE_MOCK
      ? withLatency(mockApi.auth.requestOtp(phone))
      : http<{ debug_otp?: string } | null>('/auth/resend-otp', {
          method: 'POST',
          body: JSON.stringify(intent ? { phone, intent } : { phone }),
        }).then((d) => ({ sent: true, debugOtp: d?.debug_otp })),

  /** OTP-only registration just triggers the OTP; profile is completed after verify. */
  register: (data: { firstName: string; lastName: string; email: string; phone: string }): Promise<OtpDispatch> =>
    USE_MOCK
      ? withLatency(mockApi.auth.register(data))
      : http<{ debug_otp?: string } | null>('/auth/request-otp', {
          method: 'POST',
          body: JSON.stringify({ phone: data.phone, intent: 'register' }),
        }).then((d) => ({ sent: true, debugOtp: d?.debug_otp })),

  /**
   * Partner sign-up: verifies the phone OTP and creates a pending partner account.
   * `type=individual` requires `national_id`; `type=company` requires `cr_number`.
   */
  partnerRegister: (data: {
    type: 'individual' | 'company';
    name: string;
    phone: string; // 05XXXXXXXX
    code: string;
    email: string;
    nationalId?: string;
    crNumber?: string;
  }) =>
    http<RawAuthResult>('/auth/partner/register', {
      method: 'POST',
      body: JSON.stringify({
        type: data.type,
        name: data.name,
        phone: data.phone,
        code: data.code,
        email: data.email,
        national_id: data.type === 'individual' ? data.nationalId : null,
        cr_number: data.type === 'company' ? data.crNumber : null,
        device: 'web',
      }),
    }).then((d) => ({
      user: mapUser(d.user),
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
    })),

  /**
   * Sends the name as two parts — the backend builds `name` from them, so a
   * compound first name ("عبد الله") is stored and returned intact instead of
   * being re-split on the space.
   */
  completeProfile: (data: { firstName: string; lastName: string; email: string }) =>
    USE_MOCK
      ? withLatency(mockApi.account.updateProfile(data))
      : http<RawUser>('/auth/complete-profile', {
          method: 'POST',
          body: JSON.stringify({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          }),
        }).then(mapUser),

  logout: () =>
    USE_MOCK
      ? withLatency(mockApi.auth.logout())
      : http<unknown>('/auth/logout', { method: 'POST', body: '{}' }).then(() => ({ ok: true as const })),

  /** Exchange a refresh token for a fresh access/refresh pair. */
  refresh: (refreshToken: string) =>
    http<RawAuthResult>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken, device: 'web' }),
    }).then((d) => ({
      user: mapUser(d.user),
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
    })),
};

// ============ Units ============

/**
 * The server-computed price breakdown for a date range, from
 * `POST /units/{id}/availability`. Same shape (minus `checkinAt`) as a
 * booking's frozen breakdown — the backend computes all money; the
 * frontend only ever renders these numbers, never recomputes them.
 */
export interface QuotePricing {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  taxes: number;
  taxPercent: number;
  total: number;
}

export interface CheckAvailabilityResult {
  available: boolean;
  /** Present only when `available === true`. */
  pricing: QuotePricing | null;
}

function mapQuotePricing(raw: unknown): QuotePricing | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  return {
    nights: Number(p.nights ?? 0),
    nightlyRate: Number(p.nightly_rate ?? 0),
    subtotal: Number(p.subtotal ?? 0),
    taxes: Number(p.taxes ?? 0),
    taxPercent: Number(p.tax_percent ?? 0),
    total: Number(p.total ?? 0),
  };
}

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
      : http<Record<string, unknown>[]>(`/units/${id}/reviews`).then((rows) => rows.map(mapReview)),

  /** Returns availability + the server-computed price quote for the date range (§1.1). */
  checkAvailability: (id: string, startDate: string, endDate: string): Promise<CheckAvailabilityResult> =>
    USE_MOCK
      ? withLatency(mockApi.units.checkAvailability(id, startDate, endDate)).then((d) => ({
          available: Boolean(d.available),
          pricing: mapQuotePricing(d.pricing),
        }))
      : http<Record<string, unknown>>(`/units/${id}/availability`, {
          method: 'POST',
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        }).then((d) => ({
          available: Boolean(d.available),
          pricing: mapQuotePricing(d.pricing),
        })),
};

/** features[] is repeatable, so it is appended outside URLSearchParams' set(). */
function filterFeatures(f: UnitsFilter): string {
  if (!f.amenities || f.amenities.length === 0) return '';
  return f.amenities.map((a) => `&features[]=${encodeURIComponent(a)}`).join('');
}

// ============ Homepage content ============

export const contentApi = {
  testimonials: () =>
    USE_MOCK
      ? Promise.resolve<Testimonial[]>([])
      : http<Record<string, unknown>[]>('/testimonials').then((r) => r.map(mapTestimonial)),

  categories: () =>
    USE_MOCK
      ? Promise.resolve<UnitCategory[]>([])
      : http<Record<string, unknown>[]>('/units/categories').then((r) => r.map(mapCategory)),

  cities: () => (USE_MOCK ? Promise.resolve<CityCount[]>([]) : http<CityCount[]>('/units/cities')),

  budgets: () =>
    USE_MOCK
      ? Promise.resolve<BudgetRange[]>([])
      : http<Record<string, unknown>[]>('/units/budgets').then((r) => r.map(mapBudget)),

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

  /**
   * SRS FR-046: execute cancellation + auto-refund via Moyasar.
   * The `cancel` endpoint returns a cancellation-result object (same shape as
   * the preview), not the updated booking — so we fetch the booking
   * separately to fulfil the same `{ booking, refund }` contract mock mode
   * provides.
   */
  cancel: (id: string, reason?: string) =>
    USE_MOCK
      ? withLatency(mockApi.bookings.cancel(id, reason))
      : http<RawCancellationPreview>(`/bookings/${id}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }).then(async (result) => {
          const preview = mapCancellationPreview(result);
          const booking = await http<RawBooking>(`/bookings/${id}`).then(mapBooking);
          const refund: RefundRecord = {
            amount: preview.refundAmount,
            percent: preview.refundPercent,
            tierLabel: preview.rawTierLabel ?? '',
            refundedAt: booking.cancelledAt ?? new Date().toISOString(),
            reason,
            cancelledBy: 'customer',
          };
          return { booking, refund };
        }),
};

// ============ Payments ============

/** The frozen order summary `initiate` embeds — render as-is, never recompute. */
export interface PaymentBookingSummary {
  startDate: string;
  endDate: string;
  nights: number;
  guests: number;
  nightlyRate: number;
  subtotal: number;
  taxes: number;
  unit: { name: string; city: string; district: string; imageUrl: string };
}

export interface InitiatePaymentResult {
  paymentId: number;
  bookingId: number;
  amount: number;
  /** SAR × 100 — this exact value goes to Moyasar.init, never computed client-side. */
  amountHalalas: number;
  currency: string;
  description: string;
  publishableKey: string;
  callbackUrl: string;
  testMode: boolean;
  booking: PaymentBookingSummary | null;
}

export interface PayResult {
  /** "paid" (frictionless) or "initiated" (3-DS required) — anything else is a failure. */
  status: string;
  paymentId: number;
  /** Present when the bank requires 3-D Secure; redirect the browser here. */
  transactionUrl?: string;
  message?: string;
}

export interface VerifyResult {
  status: string;
  bookingId: number | null;
  message?: string;
}

/**
 * `POST /payments/pay` accepts exactly one of three shapes:
 *  - `{}`                     → test-mode simulate (staging only)
 *  - `{ savedCardId, cvc }`   → quick pay with a tokenised saved card
 *  - `{ token }`              → manual moyasar.js token (unused by the hosted-form flow)
 */
export type PayInput = { savedCardId?: number | string; cvc?: string; token?: string };

function mapBookingSummary(raw: unknown): PaymentBookingSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  const u = (b.unit ?? {}) as Record<string, unknown>;
  return {
    startDate: String(b.start_date ?? ''),
    endDate: String(b.end_date ?? ''),
    nights: Number(b.nights ?? 0),
    guests: Number(b.guests ?? 0),
    nightlyRate: Number(b.nightly_rate ?? 0),
    subtotal: Number(b.subtotal ?? 0),
    taxes: Number(b.taxes ?? 0),
    unit: {
      name: String(u.name ?? ''),
      city: String(u.city ?? ''),
      district: String(u.district ?? ''),
      imageUrl: String(u.image_url ?? ''),
    },
  };
}

/** Gateway flags for pages that tokenise outside checkout (wallet add-card). */
export interface PaymentsConfig {
  publishableKey: string;
  testMode: boolean;
  currency: string;
}

export const paymentsApi = {
  /** `GET /payments/config` — publishable key + test-mode flag (auth). */
  config: (): Promise<PaymentsConfig> =>
    USE_MOCK
      ? withLatency(Promise.resolve<PaymentsConfig>({ publishableKey: '', testMode: true, currency: 'SAR' }))
      : http<Record<string, unknown>>('/payments/config').then((d) => ({
          publishableKey: String(d.publishable_key ?? ''),
          testMode: Boolean(d.test_mode),
          currency: String(d.currency ?? 'SAR'),
        })),

  initiate: (bookingId: string): Promise<InitiatePaymentResult> =>
    USE_MOCK
      ? // Mock mode has no gateway — testMode makes the payment page show the
        // simulate button, whose mock `pay` always succeeds.
        withLatency(
          Promise.resolve<InitiatePaymentResult>({
            paymentId: 0,
            bookingId: Number(bookingId) || 0,
            amount: 0,
            amountHalalas: 0,
            currency: 'SAR',
            description: '',
            publishableKey: '',
            callbackUrl: '',
            testMode: true,
            booking: null,
          }),
        )
      : http<Record<string, unknown>>('/payments/initiate', {
          method: 'POST',
          body: JSON.stringify({ booking_id: Number(bookingId) }),
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
            booking: mapBookingSummary(d.booking),
          }),
        ),

  pay: (paymentId: number | string, input: PayInput = {}): Promise<PayResult> =>
    USE_MOCK
      ? withLatency(Promise.resolve({ status: 'paid', paymentId: Number(paymentId) || 0 }))
      : http<Record<string, unknown>>('/payments/pay', {
          method: 'POST',
          body: JSON.stringify({
            payment_id: paymentId,
            ...(input.savedCardId != null ? { saved_card_id: input.savedCardId, cvc: input.cvc } : {}),
            ...(input.token ? { token: input.token } : {}),
          }),
        }).then((d) => ({
          status: String(d?.status ?? ''),
          paymentId: Number(d?.payment_id ?? paymentId),
          transactionUrl: d?.transaction_url ? String(d.transaction_url) : undefined,
          message: d?.message ? String(d.message) : undefined,
        })),

  /**
   * Must run after EVERY Moyasar redirect — the backend re-fetches the charge
   * from Moyasar and only then confirms the booking. Idempotent.
   */
  verify: (paymentId: number | string, moyasarId: string): Promise<VerifyResult> =>
    USE_MOCK
      ? withLatency(Promise.resolve({ status: 'paid', bookingId: null }))
      : http<Record<string, unknown> | null>('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({ payment_id: Number(paymentId), moyasar_id: String(moyasarId) }),
        }).then((d) => ({
          status: String(d?.status ?? ''),
          bookingId: d?.booking_id != null ? Number(d.booking_id) : null,
          message: d?.message ? String(d.message) : undefined,
        })),

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
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          }),
        }).then(mapUserProfile),

  /** Step 1: request an OTP to the new phone number. */
  changePhone: (newPhone: string): Promise<OtpDispatch> =>
    USE_MOCK
      ? withLatency(mockApi.account.changePhone(newPhone))
      : http<{ debug_otp?: string } | null>('/user/change-phone', {
          method: 'POST',
          body: JSON.stringify({ new_phone: newPhone }),
        }).then((d) => ({ sent: true, debugOtp: d?.debug_otp })),

  /** Step 2: verify the OTP and switch the phone. */
  verifyChangePhone: (newPhone: string, code: string) =>
    USE_MOCK
      ? withLatency(Promise.resolve({ ok: true as const }))
      : http<unknown>('/user/change-phone/verify', {
          method: 'POST',
          body: JSON.stringify({ new_phone: newPhone, code }),
        }).then(() => ({ ok: true as const })),

  /**
   * Step 1: request a verification code for a new/unverified email.
   * Email is a verified *contact channel* only — it never affects login.
   */
  requestEmailVerification: (email: string): Promise<{ email: string; verified: boolean; resendAvailableIn: number }> =>
    USE_MOCK
      ? withLatency(mockApi.account.requestEmailVerification(email))
      : http<{ email?: string; verified?: boolean; resend_available_in?: number }>('/user/email', {
          method: 'POST',
          body: JSON.stringify({ email }),
        }).then((d) => ({
          email: d.email ?? email,
          verified: Boolean(d.verified),
          resendAvailableIn: Number(d.resend_available_in ?? 60),
        })),

  /** Step 2: confirm the code and mark the pending email verified. */
  verifyEmail: (code: string): Promise<{ email: string; verified: true }> =>
    USE_MOCK
      ? withLatency(mockApi.account.verifyEmail(code))
      : http<{ email?: string }>('/user/email/verify', {
          method: 'POST',
          body: JSON.stringify({ code }),
        }).then((d) => ({ email: d.email ?? '', verified: true as const })),

  /** Resends the pending email verification code. */
  resendEmailVerification: (): Promise<{ resendAvailableIn: number }> =>
    USE_MOCK
      ? withLatency(mockApi.account.resendEmailVerification())
      : http<{ resend_available_in?: number }>('/user/email/resend', { method: 'POST', body: '{}' }).then((d) => ({
          resendAvailableIn: Number(d.resend_available_in ?? 60),
        })),

  deleteAccount: () =>
    USE_MOCK
      ? withLatency(mockApi.account.deleteAccount())
      : http<unknown>('/user/account', { method: 'DELETE' }).then(() => ({ ok: true as const })),

  getCards: () =>
    USE_MOCK
      ? withLatency(mockApi.account.getCards())
      : http<Record<string, unknown>[]>('/user/cards').then((rows) => rows.map(mapCard)),

  /**
   * `POST /user/cards/from-token` — register a card the browser already
   * tokenised directly with Moyasar (live keys), or metadata-only in simulate
   * mode. The PAN must NEVER reach the Mamsa API — only the token id does;
   * the backend re-fetches it with the secret key, trusting nothing else.
   */
  saveCardFromToken: (
    input: { token: string } | { brand: SavedCard['brand']; last4: string; expMonth: number; expYear: number },
  ): Promise<SavedCard> =>
    USE_MOCK
      ? withLatency(
          Promise.resolve<SavedCard>({
            id: String(Date.now()),
            brand: 'token' in input ? 'visa' : input.brand,
            last4: 'token' in input ? '1111' : input.last4,
            expMonth: 'token' in input ? 12 : input.expMonth,
            expYear: 'token' in input ? new Date().getFullYear() + 2 : input.expYear,
            isDefault: false,
            chargeable: 'token' in input,
          }),
        )
      : http<Record<string, unknown>>('/user/cards/from-token', {
          method: 'POST',
          body: JSON.stringify(
            'token' in input
              ? { token: input.token }
              : { brand: input.brand, last4: input.last4, exp_month: input.expMonth, exp_year: input.expYear },
          ),
        }).then(mapCard),

  deleteCard: (id: string) =>
    USE_MOCK
      ? withLatency(Promise.resolve({ ok: true as const }))
      : http<unknown>(`/user/cards/${id}`, { method: 'DELETE' }).then(() => ({ ok: true as const })),

  setDefaultCard: (id: string) =>
    USE_MOCK
      ? withLatency(Promise.resolve({ ok: true as const }))
      : http<unknown>(`/user/cards/${id}/default`, { method: 'POST', body: '{}' }).then(() => ({ ok: true as const })),

  getTransactions: () =>
    USE_MOCK
      ? withLatency(mockApi.account.getTransactions())
      : http<Record<string, unknown>[]>('/user/transactions').then((rows) => rows.map(mapTransaction)),
};

// ============ Favorites ============

export const favoritesApi = {
  /** Returns the ids of the current user's favourited units. */
  list: () =>
    USE_MOCK
      ? Promise.resolve<string[]>([])
      : http<Record<string, unknown>[]>('/user/favorites').then((rows) => rows.map((r) => String(r.id))),

  add: (unitId: string) =>
    USE_MOCK
      ? Promise.resolve()
      // An empty body with a JSON content-type trips some Laravel JSON
      // middleware ("malformed JSON") — send an explicit empty object.
      : http<unknown>(`/user/favorites/${unitId}`, { method: 'POST', body: '{}' }).then(() => undefined),

  remove: (unitId: string) =>
    USE_MOCK
      ? Promise.resolve()
      : http<unknown>(`/user/favorites/${unitId}`, { method: 'DELETE' }).then(() => undefined),
};

// ============ Misc ============

export const miscApi = {
  /** Public contact form. */
  contact: (input: { name: string; phone: string; email: string; message: string }) =>
    USE_MOCK
      ? withLatency(Promise.resolve({ ok: true as const }))
      : http<unknown>('/contact', {
          method: 'POST',
          body: JSON.stringify(input),
        }).then(() => ({ ok: true as const })),
};

// Re-exports for convenience
export type { CancellationPolicy };
export type { Offer, Testimonial, UnitCategory, CityCount, BudgetRange };
