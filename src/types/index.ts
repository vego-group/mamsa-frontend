/**
 * Mamsa Domain Types
 * مطابق لـ SRS v1.1 و Backend Work Package v1.0
 * هذه الأنواع تمثل الـ contract الذي سيُطابقه الـ Backend عند الربط.
 */

// ============ Auth & Users ============

export type UserRole = 'user' | 'individual' | 'company' | 'super_admin';

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  /** Verified contact channel only — login stays phone-OTP. Null until the user sets one. */
  email: string | null;
  emailVerified: boolean;
  phone: string; // E.164 format e.g. +966501234567
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// ============ Units (Properties) ============

export type UnitType = 'apartment' | 'studio' | 'villa';
export type UnitStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface UnitAmenity {
  /**
   * Stable slug from the backend's closed vocabulary (wifi, ac, kitchen, …).
   * Falls back to the raw Arabic label when the backend sends `key: null`
   * (amenity not yet in the vocabulary) — the UI then shows a generic icon.
   */
  key: string;
  labelAr: string;
}

/**
 * One unit photo, with the fixed-size derivatives the backend generates at
 * upload. Every size is pre-resolved: when a photo has no derivative set (a row
 * predating them, or a file the processor couldn't read) the backend sends
 * `variants: null` and each size here holds the original URL instead, so
 * callers never branch on it.
 */
export interface UnitImage {
  /** The original upload, uncropped and unresized. */
  url: string;
  /** 400×300, cropped to 4:3. Thumbnail strip, checkout summary. */
  thumb: string;
  /** 800×600, cropped to 4:3. Search cards, gallery collage. */
  card: string;
  /** Long edge ≤2048, never cropped — keeps the original aspect ratio. Lightbox. */
  full: string;
  /**
   * Pixel size of the ORIGINAL, or null when the backend hasn't measured it.
   *
   * These describe `full` and `url` only. `thumb` and `card` are 4:3 cover
   * crops, so their real ratio differs from this whenever the source isn't 4:3 —
   * using these to reserve a box for those two sizes reserves the wrong shape.
   */
  width: number | null;
  height: number | null;
}

export interface Unit {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerType: 'individual' | 'company';
  /** Partner application approved — drives the "مضيف موثّق" badge. */
  ownerVerified: boolean;
  /** Null until the backend ships avatar storage; render initials meanwhile. */
  ownerAvatarUrl: string | null;
  title: string;
  description: string;
  type: UnitType;
  status: UnitStatus;
  city: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
  /** SAR, GROSS — VAT-inclusive. Displayed verbatim; never multiplied by a tax rate. */
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  /** Floor area in m². Optional — not every listing carries one. */
  area?: number;
  amenities: UnitAmenity[];
  images: UnitImage[];
  rating: number;
  reviewCount: number;
  checkInTime: string; // "15:00"
  checkOutTime: string; // "12:00"
  cancellationPolicy: CancellationTemplate;
  /**
   * Full tiered policy as the backend's refund engine sees it right now
   * (`cancellation_policy_details`) — same shape a booking's frozen
   * `policySnapshot` will use if the guest books at this moment (FR-021).
   * `null` when the backend hasn't returned it (e.g. mock mode) — fall back
   * to `getPolicyByTemplate(cancellationPolicy)`.
   */
  cancellationPolicyDetails?: CancellationPolicy | null;
  isFeatured?: boolean;
  // No unit-level discount: the platform has none, and a badge that doesn't
  // change the charged price would mislead the guest (owner decision 2026-07-21).
  /** Present when `status === 'rejected'` — the admin's reason. */
  rejectionReason?: string | null;
  createdAt: string;
}

// ============ Cancellation Policy ============

export type CancellationTemplate = 'flexible' | 'moderate' | 'strict';

export interface CancellationTier {
  /** الحد الأدنى لعدد الأيام قبل تاريخ الدخول لتطبيق هذا المستوى (inclusive) */
  minDaysBeforeCheckIn: number;
  refundPercent: number; // 0..100
  labelAr: string;
}

export interface CancellationPolicy {
  template: CancellationTemplate;
  labelAr: string;
  descriptionAr: string;
  /** مرتّبة تنازليًا حسب minDaysBeforeCheckIn — الأطول مدة أولًا */
  tiers: CancellationTier[];
  /** السلوك إذا كان الإلغاء بعد تاريخ الدخول */
  postCheckInBehavior: 'hidden' | 'forbidden';
}

// ============ Bookings ============

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'  // = نشط/جديد حسب القرب
  | 'completed'
  | 'cancelled';

export interface PaymentInfo {
  method: 'mada' | 'visa' | 'mastercard' | 'applepay';
  last4?: string;
  cardholderName?: string;
}

/**
 * A stay's price, VAT-inclusive. `gross` is the payable total and the ONLY
 * number the guest is asked to act on; `netBase` and `vat` are the downward
 * split of it for the tax invoice, and always sum back to it exactly.
 * There is deliberately no `subtotal`/`total` pair — that vocabulary encoded
 * the old "add VAT at checkout" model.
 */
export interface PriceBreakdown {
  /** Gross, VAT-inclusive, per night. */
  pricePerNight: number;
  nights: number;
  /** pricePerNight × nights — what the guest pays. */
  gross: number;
  netBase: number;
  vat: number;
}

export interface RefundRecord {
  amount: number;
  percent: number;
  tierLabel: string;
  refundedAt: string;
  reason?: string;
  cancelledBy: 'customer' | 'partner' | 'admin' | 'system';
}

export interface Booking {
  id: string;
  code: string; // e.g. "NXTZ3K8L5Q"
  unitId: string;
  unitSnapshot: {
    title: string;
    city: string;
    country: string;
    imageUrl: string;
    ownerName: string;
  };
  userId: string;
  guestName?: string;
  status: BookingStatus;
  checkInDate: string; // ISO yyyy-mm-dd
  checkOutDate: string;
  nights: number;
  guests: { adults: number; children: number };
  price: PriceBreakdown;
  payment?: PaymentInfo;
  /**
   * ⭐ نسخة مجمّدة من سياسة الإلغاء وقت الحجز (SRS FR-036).
   * أي تعديل لاحق من الشريك لا يؤثر على هذا الحجز.
   */
  policySnapshot: CancellationPolicy;
  refund?: RefundRecord;
  /** Whether the guest has already reviewed this booking (embedded by the backend on the booking resource). */
  isReviewed: boolean;
  createdAt: string;
  cancelledAt?: string;
}

// ============ Reviews ============

export interface Review {
  id: string;
  bookingId: string;
  unitId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

// ============ Filters & Search ============

export interface UnitsFilter {
  city?: string;
  type?: UnitType | 'all';
  capacity?: number;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  /**
   * Fetch these units by id. The API caps a single call at 50 and answers 51+
   * with a 422 rather than truncating, so callers must batch.
   */
  ids?: string[];
  /** 1-based page number. Omit for the first page. */
  page?: number;
  /** Rows per page. The API caps this at 50 and defaults to 12. */
  perPage?: number;
}

// ============ Saved Cards (mock) ============

export interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'mada';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  /** True when the card has a gateway token — only these can be charged via quick pay. */
  chargeable?: boolean;
}

// ============ Transactions ============

export type TransactionType = 'payment' | 'refund' | 'topup' | 'reward';

export interface Transaction {
  id: string;
  refCode: string;
  type: TransactionType;
  amount: number; // signed: +ve = incoming, -ve = outgoing
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}
