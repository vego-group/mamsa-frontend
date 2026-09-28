/**
 * Mock API implementation.
 * يحاكي سلوك الباك إند على البيانات في data/mock/.
 * يحافظ على state في الذاكرة للجلسة الحالية فقط (sessionStorage معطّل لأنه لا يعمل في artifacts).
 */
import { MOCK_UNITS, doorsOf, findUnitById, listingIdOf, type MockDoor } from '@/data/mock/units';
import { MOCK_BOOKINGS } from '@/data/mock/bookings';
import { MOCK_REVIEWS, getReviewForBooking } from '@/data/mock/reviews';
import { MOCK_CURRENT_USER, MOCK_SAVED_CARDS, MOCK_TRANSACTIONS } from '@/data/mock/users';
import { OTP_CONFIG, INVOICE_SELLER, VAT_RATE } from '@/lib/constants/brand';
import { previewCancellation, buildCancellation } from '@/lib/cancellation/engine';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { ApiError, ERROR_CODE_MESSAGES } from '../errors';
import { isValidEmail } from '@/lib/utils/email';
import { complaintWindowFor } from '@/lib/complaints/window';
import { COMPLAINT_MAX_IMAGES, checkComplaintDescription } from '@/lib/complaints/rules';
import type {
  Booking,
  BookingStatus,
  Review,
  Unit,
  User,
  UnitsFilter,
  GuestComplaint,
  GuestComplaintRow,
  GuestComplaintStatus,
} from '@/types';
import { diffNights } from '@/lib/utils/format';
import { quoteFromNightly } from '@/lib/pricing';
import { todayISO } from '@/stores/search';

// Matches the backend's OTP_FIXED_CODE convention for staging, so the same code
// works whether you're pointed at the local mock or a staging backend.
const MOCK_OTP = process.env.NEXT_PUBLIC_MOCK_OTP ?? '111222';

// The real backend uses the SAME fixed code for phone and email OTP on
// staging (confirmed in NEXTJS-EMAIL-VERIFICATION.md §1), so the mock
// mirrors that instead of using a separate value.
const MOCK_EMAIL_OTP = MOCK_OTP;
const EMAIL_RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_MAX_ATTEMPTS = 5;

// ============ In-memory state ============
let units: Unit[] = [...MOCK_UNITS];
// Every booking carries its listing, as `booking.unit.listing_id` always does on the real API.
let bookings: Booking[] = MOCK_BOOKINGS.map((b) => ({ ...b, listingId: listingIdOf(b.unitId) }));

/**
 * Look-ups MUST go through the live session list, not `findBookingById` from
 * the fixtures module — that one only ever sees the seeded array, so a booking
 * created during the session was invisible to getById/getInvoice/cancellation
 * and the flow died with "الحجز غير موجود" right after checkout.
 */
const findBooking = (id: string): Booking | undefined => bookings.find((b) => b.id === id);

/**
 * Statuses that still hold a unit's dates. `pending_payment` counts: an unpaid
 * booking is holding the calendar until it expires, and letting a second guest
 * through would create exactly the clash checkout exists to prevent.
 */
const HOLDING_STATUSES: BookingStatus[] = ['pending_payment', 'confirmed'];


/**
 * Does any live booking overlap [start, end)? Half-open on purpose — a
 * departure on the day of another guest's arrival is a handover, not a clash.
 */
function isUnitBooked(unitId: string, start: string, end: string): boolean {
  return bookings.some(
    (b) =>
      b.unitId === unitId &&
      HOLDING_STATUSES.includes(b.status) &&
      b.checkInDate.slice(0, 10) < end &&
      b.checkOutDate.slice(0, 10) > start,
  );
}

/**
 * The first door of a card free over [start, end), or null when every door is
 * held. A standalone unit is its own single door.
 */
function freeDoor(cardId: string, start: string, end: string): MockDoor | null {
  return doorsOf(cardId).find((d) => !isUnitBooked(d.id, start, end)) ?? null;
}

/**
 * The card as the API lists it: how many doors the building sells, and how
 * many of those are free — over the searched stay when there is one,
 * otherwise all of them. A standalone unit is a building of one.
 */
function asCard(u: Unit, start?: string, end?: string): Unit {
  const doors = doorsOf(u.id);
  const free = start && end ? doors.filter((d) => !isUnitBooked(d.id, start, end)).length : doors.length;
  return { ...u, groupSize: doors.length, availableCount: free, listingId: listingIdOf(u.id) };
}

/** YYYY-MM-DD shifted by N days — local calendar math, no UTC/timezone drift. */
function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d! + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

/**
 * Permit expiry per unit, in days from today — server-side data the guest API
 * never sends. Relative so the cap stays in the calendar's view instead of
 * drifting into the past. Units not listed have no expiry, so no cap.
 */
const PERMIT_EXPIRES_IN_DAYS: Record<string, number> = { 'U-004': 20 };

function permitExpiresAt(unitId: string): string | null {
  const days = PERMIT_EXPIRES_IN_DAYS[unitId];
  return days == null ? null : shiftISO(todayISO(), days);
}

/**
 * The backend's rule: a stay may check out ON the expiry day, never after it.
 * Availability and booking both answer with this, so the probe and the create
 * never disagree.
 */
function permitRefusal(unitId: string, endDate: string): Promise<never> | null {
  const expiresAt = permitExpiresAt(unitId);
  if (!expiresAt || endDate <= expiresAt) return null;
  return Promise.reject(
    new ApiError(409, 'تصريح هذه الوحدة لا يغطي هذه التواريخ', 'BOOKING_EXCEEDS_PERMIT_VALIDITY'),
  );
}

/** Every night a unit's live bookings hold: check-in up to, not including, check-out. */
function nightsHeld(unitId: string): Set<string> {
  const nights = new Set<string>();
  for (const b of bookings) {
    if (b.unitId !== unitId || !HOLDING_STATUSES.includes(b.status)) continue;
    const out = b.checkOutDate.slice(0, 10);
    for (let d = b.checkInDate.slice(0, 10); d < out; d = shiftISO(d, 1)) nights.add(d);
  }
  return nights;
}

/** Nights → inclusive spans with consecutive nights joined, the shape of the real `/blocked-dates` feed. */
function nightsToRanges(nights: Iterable<string>): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  for (const n of [...nights].sort()) {
    const last = ranges[ranges.length - 1];
    if (last && n === shiftISO(last.end, 1)) last.end = n;
    else ranges.push({ start: n, end: n });
  }
  return ranges;
}
let reviews: Review[] = [...MOCK_REVIEWS];
let currentUser: User | null = null; // null until login

// ============ Complaints (in-memory) ============

/** One complaint per booking — the uniqueness the real backend answers with a 409. */
interface MockComplaint extends Omit<GuestComplaint, 'images'> {
  bookingId: string;
  /** The uploaded files; links are minted from them at read time, like the signed URLs. */
  files: File[];
}

// Seeded on the oldest completed fixture so mock mode can show a settled
// refund. 391.3 is riyals as a decimal — this surface never speaks in halalas.
let complaints: MockComplaint[] = [
  {
    id: '1',
    bookingId: 'BK-006',
    status: 'resolved_refunded',
    description: 'المكيف في غرفة النوم الرئيسية لم يعمل طوال مدة الإقامة رغم إبلاغ المضيف في اليوم الأول.',
    contactedPartner: true,
    guestMessage: 'تم التحقق من الشكوى وقبولها، وأُعيد جزء من قيمة الحجز إلى وسيلة الدفع.',
    refundedAmount: 391.3,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    files: [],
  },
];
let nextComplaintId = 2;

const complaintError = (status: number, code: string, message: string): Promise<never> =>
  Promise.reject(new ApiError(status, message, code));

/** Role-plays the 15-minute signed links: produced at read time, never stored on the record. */
function complaintImages(c: MockComplaint): GuestComplaint['images'] {
  const canLink = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
  return c.files.map((f) => ({ url: canLink ? URL.createObjectURL(f) : '', mime: f.type }));
}

function toGuestComplaint(c: MockComplaint): GuestComplaint {
  const { bookingId: _bookingId, files: _files, ...rest } = c;
  return { ...rest, images: complaintImages(c) };
}

// Email-verification session state — a single pending email per (mock) account,
// mirroring how the real backend would track one outstanding code at a time.
let pendingEmail: string | null = null;
let emailAttempts = 0;
let emailResendAt = 0; // epoch ms; 0 = no cooldown in effect

// ============ Helpers ============
const ok = <T>(value: T) => Promise.resolve(value);
const fail = (msg: string) => Promise.reject(new Error(msg));
const failCode = (status: number, code: string, retryAfter?: number, remainingAttempts?: number): Promise<never> =>
  Promise.reject(new ApiError(status, ERROR_CODE_MESSAGES[code] ?? code, code, retryAfter, remainingAttempts));

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
interface MockPricing {
  nights: number;
  nightly_rate: number;
  gross: number;
  net_base: number;
  vat: number;
  vat_rate: number;
}

/**
 * `pricePerNight` on the fixtures is already GROSS, so the total is a plain
 * multiplication and VAT is split back out of it — nothing is ever added on
 * top. This is the wire shape the backend will send once its own VAT-inclusive
 * refactor ships.
 */
function computeMockPricing(unit: Unit, nights: number): MockPricing {
  const q = quoteFromNightly(unit.pricePerNight, nights);
  return {
    nights: q.nights,
    nightly_rate: q.nightlyRate,
    gross: q.gross,
    net_base: q.netBase,
    vat: q.vat,
    vat_rate: q.vatRate,
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

      if (filter.ids && filter.ids.length > 0) {
        result = result.filter((u) => filter.ids!.includes(u.id));
      }
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
      // Searching with a stay means searching for units free over it — for a
      // building, any one door free is enough.
      if (filter.startDate && filter.endDate) {
        result = result.filter((u) => freeDoor(u.id, filter.startDate!, filter.endDate!) !== null);
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
      return ok(result.map((u) => asCard(u, filter.startDate, filter.endDate)));
    },

    /** Mirrors the API's paginator so the results page behaves the same offline. */
    listPage: async (filter: UnitsFilter = {}) => {
      const all = await mockApi.units.list(filter);
      const perPage = Math.min(Math.max(filter.perPage ?? 12, 1), 50);
      const lastPage = Math.max(1, Math.ceil(all.length / perPage));
      const page = Math.min(Math.max(filter.page ?? 1, 1), lastPage);
      return ok({
        units: all.slice((page - 1) * perPage, page * perPage),
        page,
        lastPage,
        total: all.length,
      });
    },

    getById: async (id: string) => {
      const u = findUnitById(id);
      if (!u) return fail('الوحدة غير موجودة');
      return ok(asCard(u));
    },

    getFeatured: async () => ok(units.filter((u) => u.isFeatured && u.status === 'approved').map((u) => asCard(u))),

    sitemap: async () =>
      ok(
        units
          .filter((u) => u.status === 'approved')
          .map((u) => ({ id: Number(u.id.replace(/\D/g, '')) || 0, updated_at: u.createdAt })),
      ),

    getReviews: async (unitId: string) => ok(reviews.filter((r) => r.unitId === unitId)),

    checkAvailability: async (unitId: string, startDate: string, endDate: string) => {
      const unit = findUnitById(unitId);
      if (!unit) return fail('الوحدة غير موجودة');
      const nights = diffNights(startDate, endDate);
      const refused = permitRefusal(unitId, endDate);
      if (refused) return refused;
      if (!freeDoor(unitId, startDate, endDate)) return ok({ available: false, pricing: null });
      return ok({ available: true, pricing: computeMockPricing(unit, nights) });
    },

    /**
     * Nights already spoken for, as merged inclusive-night spans — mirrors
     * `GET /units/{id}/blocked-dates`. The checkout date itself is never
     * included: it's the departing guest's last morning, free for the next
     * guest's arrival the same day.
     *
     * A building's night is blocked only once every one of its doors holds
     * it — while one door is free the card is still bookable that night.
     *
     * A unit with a permit expiry also gets one span from the expiry day to
     * the end of the window, tagged `permit_expiry` and kept out of the merge
     * so the tag survives.
     */
    getBlockedDates: async (unitId: string, from?: string, to?: string) => {
      const [first, ...others] = doorsOf(unitId).map((d) => nightsHeld(d.id));
      const blockedNights = [...first!].filter((n) => others.every((held) => held.has(n)));
      const merged: { start: string; end: string; reason?: 'permit_expiry' }[] = nightsToRanges(
        blockedNights,
      ).filter((r) => (!from || r.end >= from) && (!to || r.start <= to));

      const expiresAt = permitExpiresAt(unitId);
      // The backend's default window runs six months out.
      const windowEnd = to ?? shiftISO(todayISO(), 183);
      if (expiresAt && expiresAt <= windowEnd) {
        const start = from && from > expiresAt ? from : expiresAt;
        merged.push({ start, end: windowEnd, reason: 'permit_expiry' });
      }
      return ok(merged);
    },
  },

  bookings: {
    list: async () => ok(bookings.filter((b) => b.userId === 'CURRENT_USER')),

    getById: async (id: string) => {
      const b = findBooking(id);
      if (!b) return fail('الحجز غير موجود');
      return ok(b);
    },

    /**
     * Role-plays `GET /bookings/{id}/invoice`. `qr_code` is deliberately null:
     * the real ZATCA payload is signed server-side and is not ready yet, and a
     * fake base64 string would render a QR that looks valid and scans to
     * nothing — worse than the honest placeholder the page shows for null.
     */
    getInvoice: async (id: string) => {
      const b = findBooking(id);
      if (!b) return fail('الحجز غير موجود');
      return ok({
        invoiceNumber: `INV-${b.code}`,
        issuedAt: new Date().toISOString(),
        seller: { ...INVOICE_SELLER },
        buyerName: b.guestName ?? MOCK_CURRENT_USER.firstName + ' ' + MOCK_CURRENT_USER.lastName,
        lines: [
          {
            description: b.unitSnapshot.title,
            checkIn: b.checkInDate,
            checkOut: b.checkOutDate,
            nights: b.price.nights,
            netBase: b.price.netBase,
            vatRate: VAT_RATE,
            vat: b.price.vat,
            gross: b.price.gross,
          },
        ],
        totalNetBase: b.price.netBase,
        totalVat: b.price.vat,
        totalGross: b.price.gross,
        currency: 'SAR' as const,
        qrCode: null,
      });
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
      const refused = permitRefusal(input.unitId, input.checkOutDate);
      if (refused) return refused;
      // Re-check at creation time, same as the real backend — a prior
      // `checkAvailability` call is a snapshot, never a hold on the dates.
      // In a building the server picks the first free door, so the booked
      // unit can differ from the card the guest opened.
      const door = freeDoor(input.unitId, input.checkInDate, input.checkOutDate);
      if (!door) {
        return fail('الوحدة محجوزة في هذه الفترة') as Promise<Booking>;
      }
      const nights = diffNights(input.checkInDate, input.checkOutDate);
      const quote = computeMockPricing(unit, nights);

      // ⭐ SRS FR-036: snapshot the unit's cancellation policy NOW
      const booking: Booking = {
        id: genId('BK'),
        code: genCode(),
        unitId: door.id,
        listingId: listingIdOf(door.id),
        unitSnapshot: {
          title: unit.title,
          city: unit.city,
          country: unit.country,
          imageUrl: unit.images[0]?.thumb ?? '',
          ownerName: unit.ownerName,
          ...(door.apartmentNo ? { apartmentNo: door.apartmentNo } : {}),
        },
        userId: 'CURRENT_USER',
        status: 'confirmed',
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        checkOutTime: unit.checkOutTime,
        nights,
        guests: input.guests,
        price: {
          pricePerNight: quote.nightly_rate,
          nights,
          gross: quote.gross,
          netBase: quote.net_base,
          vat: quote.vat,
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
      const b = findBooking(id);
      if (!b) return fail('الحجز غير موجود');
      return ok(previewCancellation(b, new Date()));
    },

    cancel: async (id: string, reason?: string): Promise<Booking> => {
      const idx = bookings.findIndex((x) => x.id === id);
      if (idx === -1) return fail('الحجز غير موجود') as Promise<never>;
      const b = bookings[idx]!;
      const preview = previewCancellation(b, new Date());
      if (!preview.isAllowed) return fail('الإلغاء غير مسموح');
      const cancellation = buildCancellation(preview, 'customer', reason);
      const updated: Booking = {
        ...b,
        status: 'cancelled',
        cancellation,
        cancelledAt: cancellation.cancelledAt,
      };
      bookings = bookings.map((x) => (x.id === id ? updated : x));
      return ok(updated);
    },
  },

  reviews: {
    add: async (input: { bookingId: string; rating: number; comment: string }) => {
      const b = findBooking(input.bookingId);
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

  complaints: {
    /**
     * Mirrors the real route's refusals, code for code, so the form's
     * branching is exercised offline exactly as it is against staging.
     */
    submit: async (
      bookingId: string,
      input: { description: string; contactedPartner: boolean; images: File[] },
    ): Promise<{ id: string; status: GuestComplaintStatus; createdAt: string | null }> => {
      const b = findBooking(bookingId);
      if (!b) return fail('الحجز غير موجود') as Promise<never>;
      if (complaints.some((c) => c.bookingId === bookingId)) {
        return complaintError(409, 'COMPLAINT_ALREADY_EXISTS', 'توجد شكوى مسجّلة على هذا الحجز بالفعل.');
      }
      const window = complaintWindowFor(b, new Date());
      if (window === 'not_completed') {
        return complaintError(422, 'BOOKING_NOT_COMPLETED', 'لا يمكن تقديم شكوى إلا على حجز مكتمل.');
      }
      if (window === 'not_open') {
        return complaintError(422, 'WINDOW_NOT_OPEN', 'لم تبدأ مهلة تقديم الشكوى بعد.');
      }
      if (window === 'closed') return complaintError(422, 'WINDOW_CLOSED', 'انتهت مهلة تقديم الشكوى.');

      const check = checkComplaintDescription(input.description);
      if (!check.valid) {
        const msg =
          check.problem === 'short' ? 'يجب ألا يقل الوصف عن 20 حرفًا.' : 'يجب ألا يزيد الوصف عن 2000 حرف.';
        return Promise.reject(new ApiError(422, msg, undefined, undefined, undefined, { description: [msg] }));
      }
      if (input.images.length > COMPLAINT_MAX_IMAGES) {
        const msg = 'الحد الأقصى 6 صور.';
        return Promise.reject(new ApiError(422, msg, undefined, undefined, undefined, { images: [msg] }));
      }

      const created: MockComplaint = {
        id: String(nextComplaintId++),
        bookingId,
        status: 'submitted',
        description: input.description.trim(),
        contactedPartner: input.contactedPartner,
        guestMessage: null,
        refundedAmount: null,
        createdAt: new Date().toISOString(),
        files: [...input.images],
      };
      complaints = [created, ...complaints];
      return ok({ id: created.id, status: created.status, createdAt: created.createdAt });
    },

    /** Rejects with the real route's `NO_COMPLAINT` 404 — the client turns that into `null`. */
    getForBooking: async (bookingId: string): Promise<GuestComplaint> => {
      const c = complaints.find((x) => x.bookingId === bookingId);
      if (!c) return complaintError(404, 'NO_COMPLAINT', 'لا توجد شكوى على هذا الحجز.');
      return ok(toGuestComplaint(c));
    },

    list: async (): Promise<GuestComplaintRow[]> =>
      ok(
        complaints.map((c) => ({
          id: c.id,
          status: c.status,
          bookingId: c.bookingId,
          bookingCode: findBooking(c.bookingId)?.code ?? null,
          createdAt: c.createdAt,
        })),
      ),
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
        return failCode(422, 'OTP_INVALID', undefined, EMAIL_MAX_ATTEMPTS - emailAttempts);
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
