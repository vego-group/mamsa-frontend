/**
 * Mock API implementation.
 * يحاكي سلوك الباك إند على البيانات في data/mock/.
 * يحافظ على state في الذاكرة للجلسة الحالية فقط (sessionStorage معطّل لأنه لا يعمل في artifacts).
 */
import { MOCK_UNITS, findUnitById } from '@/data/mock/units';
import { MOCK_BOOKINGS, findBookingById } from '@/data/mock/bookings';
import { MOCK_REVIEWS, getReviewForBooking } from '@/data/mock/reviews';
import { MOCK_CURRENT_USER, MOCK_SAVED_CARDS, MOCK_TRANSACTIONS } from '@/data/mock/users';
import { OTP_CONFIG } from '@/lib/constants/brand';
import { previewCancellation, buildRefundRecord } from '@/lib/cancellation/engine';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { ApiError, ERROR_CODE_MESSAGES } from '../errors';
import { isValidEmail } from '@/lib/utils/email';
import type {
  Booking,
  Review,
  Unit,
  User,
  UnitsFilter,
  RefundRecord,
} from '@/types';
import { diffNights } from '@/lib/utils/format';

// Matches the backend's OTP_FIXED_CODE convention for staging, so the same code
// works whether you're pointed at the local mock or a staging backend.
const MOCK_OTP = process.env.NEXT_PUBLIC_MOCK_OTP ?? '111222';

// Deliberately different from MOCK_OTP — lets a dev exercise both flows in the
// same session without one fixed code silently "working" for the other.
const MOCK_EMAIL_OTP = '654321';
const EMAIL_RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_MAX_ATTEMPTS = 5;

// ============ In-memory state ============
let units: Unit[] = [...MOCK_UNITS];
let bookings: Booking[] = [...MOCK_BOOKINGS];
let reviews: Review[] = [...MOCK_REVIEWS];
let currentUser: User | null = null; // null until login

// Email-verification session state — a single pending email per (mock) account,
// mirroring how the real backend would track one outstanding code at a time.
let pendingEmail: string | null = null;
let emailAttempts = 0;
let emailResendAt = 0; // epoch ms; 0 = no cooldown in effect

// ============ Helpers ============
const ok = <T>(value: T) => Promise.resolve(value);
const fail = (msg: string) => Promise.reject(new Error(msg));
const failCode = (status: number, code: string, retryAfter?: number): Promise<never> =>
  Promise.reject(new ApiError(status, ERROR_CODE_MESSAGES[code] ?? code, code, retryAfter));

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function genCode(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

// Mirrors the real backend's pricing formula so `POST /units/{id}/availability`
// and `POST /bookings` return a `pricing` block matching the real API wire
// shape exactly. Kept LOCAL to this mock layer only — the frontend proper
// never computes money; this function exists purely to role-play what the
// backend would return. Per the final pricing decision, tax (VAT) is the
// only fee — no cleaning fee, no service fee.
const MOCK_TAX_PERCENT = 15;

interface MockPricing {
  nights: number;
  nightly_rate: number;
  subtotal: number;
  taxes: number;
  tax_percent: number;
  total: number;
}

function computeMockPricing(unit: Unit, nights: number): MockPricing {
  const subtotal = unit.pricePerNight * nights;
  const taxes = Math.round(subtotal * (MOCK_TAX_PERCENT / 100) * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  return {
    nights,
    nightly_rate: unit.pricePerNight,
    subtotal,
    taxes,
    tax_percent: MOCK_TAX_PERCENT,
    total,
  };
}

// ============ Mock API ============

export const mockApi = {
  auth: {
    requestOtp: async (_phone: string) => ok({ sent: true as const, debugOtp: MOCK_OTP }),

    verifyOtp: async (phone: string, code: string) => {
      if (code !== MOCK_OTP) return fail('رمز التحقق غير صحيح');
      currentUser = { ...MOCK_CURRENT_USER, phone };
      return ok({
        user: currentUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    },

    register: async (data: { firstName: string; lastName: string; email: string; phone: string }) => {
      currentUser = {
        ...MOCK_CURRENT_USER,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      };
      return ok({ sent: true as const, debugOtp: MOCK_OTP });
    },

    logout: async () => {
      currentUser = null;
      return ok({ ok: true as const });
    },
  },

  units: {
    list: async (filter: UnitsFilter = {}): Promise<Unit[]> => {
      let result = units.filter((u) => u.status === 'approved');

      if (filter.city) result = result.filter((u) => u.city.includes(filter.city!));
      if (filter.type && filter.type !== 'all') result = result.filter((u) => u.type === filter.type);
      if (filter.capacity) result = result.filter((u) => u.capacity >= filter.capacity!);
      if (filter.minPrice != null) result = result.filter((u) => u.pricePerNight >= filter.minPrice!);
      if (filter.maxPrice != null) result = result.filter((u) => u.pricePerNight <= filter.maxPrice!);
      if (filter.minRating != null) result = result.filter((u) => u.rating >= filter.minRating!);
      if (filter.amenities && filter.amenities.length > 0) {
        result = result.filter((u) =>
          filter.amenities!.every((a) => u.amenities.some((am) => am.key === a)),
        );
      }

      switch (filter.sort) {
        case 'price_asc':
          result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
          break;
        case 'price_desc':
          result = [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
          break;
        case 'rating':
          result = [...result].sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
      }
      return ok(result);
    },

    getById: async (id: string) => {
      const u = findUnitById(id);
      if (!u) return fail('الوحدة غير موجودة');
      return ok(u);
    },

    getFeatured: async () => ok(units.filter((u) => u.isFeatured && u.status === 'approved')),

    getReviews: async (unitId: string) => ok(reviews.filter((r) => r.unitId === unitId)),

    checkAvailability: async (unitId: string, startDate: string, endDate: string) => {
      const unit = findUnitById(unitId);
      if (!unit) return fail('الوحدة غير موجودة');
      const nights = diffNights(startDate, endDate);
      return ok({ available: true, pricing: computeMockPricing(unit, nights) });
    },
  },

  bookings: {
    list: async () => ok(bookings.filter((b) => b.userId === 'CURRENT_USER')),

    getById: async (id: string) => {
      const b = findBookingById(id);
      if (!b) return fail('الحجز غير موجود');
      return ok(b);
    },

    create: async (input: {
      unitId: string;
      checkInDate: string;
      checkOutDate: string;
      guests: { adults: number; children: number };
      paymentMethod: 'mada' | 'visa' | 'mastercard' | 'applepay';
    }): Promise<Booking> => {
      if (!currentUser?.emailVerified) return failCode(422, 'EMAIL_VERIFICATION_REQUIRED');
      const unit = findUnitById(input.unitId);
      if (!unit) return fail('الوحدة غير موجودة') as Promise<Booking>;
      const nights = diffNights(input.checkInDate, input.checkOutDate);
      const { subtotal, taxes: tax, total } = computeMockPricing(unit, nights);

      // ⭐ SRS FR-036: snapshot the unit's cancellation policy NOW
      const booking: Booking = {
        id: genId('BK'),
        code: genCode(),
        unitId: unit.id,
        unitSnapshot: {
          title: unit.title,
          city: unit.city,
          country: unit.country,
          imageUrl: unit.imageUrls[0] ?? '',
          ownerName: unit.ownerName,
        },
        userId: 'CURRENT_USER',
        status: 'confirmed',
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        nights,
        guests: input.guests,
        price: {
          pricePerNight: unit.pricePerNight,
          nights,
          subtotal,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
        },
        payment: { method: input.paymentMethod, last4: input.paymentMethod === 'mada' ? '8888' : '4242' },
        policySnapshot: getPolicyByTemplate(unit.cancellationPolicy), // frozen at booking time
        isReviewed: false,
        createdAt: new Date().toISOString(),
      };
      bookings = [booking, ...bookings];
      return ok(booking);
    },

    previewCancellation: async (id: string) => {
      const b = findBookingById(id);
      if (!b) return fail('الحجز غير موجود');
      return ok(previewCancellation(b, new Date()));
    },

    cancel: async (id: string, reason?: string): Promise<{ booking: Booking; refund: RefundRecord }> => {
      const idx = bookings.findIndex((x) => x.id === id);
      if (idx === -1) return fail('الحجز غير موجود') as Promise<never>;
      const b = bookings[idx]!;
      const preview = previewCancellation(b, new Date());
      if (!preview.isAllowed) return fail('الإلغاء غير مسموح');
      const refund = buildRefundRecord(preview, 'customer', reason);
      const updated: Booking = {
        ...b,
        status: 'cancelled',
        refund,
        cancelledAt: new Date().toISOString(),
      };
      bookings = bookings.map((x) => (x.id === id ? updated : x));
      return ok({ booking: updated, refund });
    },
  },

  reviews: {
    add: async (input: { bookingId: string; rating: number; comment: string }) => {
      const b = findBookingById(input.bookingId);
      if (!b) return fail('الحجز غير موجود');
      if (b.status !== 'completed') return fail('لا يمكن إضافة تقييم لحجز غير منتهي');
      if (getReviewForBooking(input.bookingId)) return fail('تم التقييم لهذا الحجز مسبقًا');
      const review: Review = {
        id: genId('R'),
        bookingId: input.bookingId,
        unitId: b.unitId,
        userId: 'CURRENT_USER',
        userName: `${MOCK_CURRENT_USER.firstName} ${MOCK_CURRENT_USER.lastName}`,
        rating: input.rating,
        comment: input.comment,
        createdAt: new Date().toISOString(),
      };
      reviews = [review, ...reviews];
      return ok(review);
    },

    getForBooking: async (bookingId: string) => ok(getReviewForBooking(bookingId) ?? null),
  },

  account: {
    me: async () => {
      if (!currentUser) currentUser = MOCK_CURRENT_USER;
      return ok(currentUser);
    },

    updateProfile: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>) => {
      if (!currentUser) currentUser = { ...MOCK_CURRENT_USER };
      currentUser = { ...currentUser, ...data };
      return ok(currentUser);
    },

    changePhone: async (_newPhone: string) => ok({ sent: true as const, debugOtp: MOCK_OTP }),

    /** Step 1: request a code for a new/unverified email. */
    requestEmailVerification: async (newEmail: string) => {
      if (!isValidEmail(newEmail)) return failCode(422, 'EMAIL_INVALID');
      if (newEmail.trim().toLowerCase() === 'taken@mamsaa.com') return failCode(422, 'EMAIL_ALREADY_IN_USE');
      const now = Date.now();
      if (emailResendAt && now < emailResendAt) {
        return failCode(429, 'RATE_LIMITED', Math.ceil((emailResendAt - now) / 1000));
      }
      pendingEmail = newEmail.trim();
      emailAttempts = 0;
      emailResendAt = now + EMAIL_RESEND_COOLDOWN_SECONDS * 1000;
      return ok({ email: pendingEmail, verified: false as const, resendAvailableIn: EMAIL_RESEND_COOLDOWN_SECONDS });
    },

    /** Step 2: confirm the code and mark the pending email verified. */
    verifyEmail: async (code: string) => {
      if (!pendingEmail) return failCode(422, 'OTP_EXPIRED');
      if (emailAttempts >= EMAIL_MAX_ATTEMPTS) return failCode(422, 'OTP_MAX_ATTEMPTS');
      if (code !== MOCK_EMAIL_OTP) {
        emailAttempts += 1;
        if (emailAttempts >= EMAIL_MAX_ATTEMPTS) return failCode(422, 'OTP_MAX_ATTEMPTS');
        return failCode(422, 'OTP_INVALID');
      }
      if (!currentUser) currentUser = { ...MOCK_CURRENT_USER };
      const verifiedEmail = pendingEmail;
      currentUser = { ...currentUser, email: verifiedEmail, emailVerified: true };
      pendingEmail = null;
      emailAttempts = 0;
      emailResendAt = 0;
      return ok({ email: verifiedEmail, verified: true as const });
    },

    /** Resends the pending code, resetting the wrong-attempt counter and cooldown. */
    resendEmailVerification: async () => {
      const now = Date.now();
      if (emailResendAt && now < emailResendAt) {
        return failCode(429, 'RATE_LIMITED', Math.ceil((emailResendAt - now) / 1000));
      }
      emailAttempts = 0;
      emailResendAt = now + EMAIL_RESEND_COOLDOWN_SECONDS * 1000;
      return ok({ resendAvailableIn: EMAIL_RESEND_COOLDOWN_SECONDS });
    },

    getCards: async () => ok(MOCK_SAVED_CARDS),

    getTransactions: async () => ok(MOCK_TRANSACTIONS),

    deleteAccount: async () => {
      currentUser = null;
      return ok({ deleted: true as const });
    },
  },
};
