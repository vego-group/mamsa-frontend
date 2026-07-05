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

// ============ In-memory state ============
let units: Unit[] = [...MOCK_UNITS];
let bookings: Booking[] = [...MOCK_BOOKINGS];
let reviews: Review[] = [...MOCK_REVIEWS];
let currentUser: User | null = null; // null until login

// ============ Helpers ============
const ok = <T>(value: T) => Promise.resolve(value);
const fail = (msg: string) => Promise.reject(new Error(msg));

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function genCode(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
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
      const unit = findUnitById(input.unitId);
      if (!unit) return fail('الوحدة غير موجودة') as Promise<Booking>;
      const nights = diffNights(input.checkInDate, input.checkOutDate);
      const subtotal = unit.pricePerNight * nights;
      const cleaningFee = unit.cleaningFee ?? 0;
      const serviceFee = (subtotal * (unit.serviceFeePercent ?? 0)) / 100;
      const tax = ((subtotal + cleaningFee + serviceFee) * (unit.taxPercent ?? 0)) / 100;
      const total = subtotal + cleaningFee + serviceFee + tax;

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
          cleaningFee,
          serviceFee: Math.round(serviceFee * 100) / 100,
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

    getCards: async () => ok(MOCK_SAVED_CARDS),

    getTransactions: async () => ok(MOCK_TRANSACTIONS),

    deleteAccount: async () => {
      currentUser = null;
      return ok({ deleted: true as const });
    },
  },
};
