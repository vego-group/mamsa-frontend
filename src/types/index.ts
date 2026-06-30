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
  email: string;
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
  key: string;
  labelAr: string;
}

export interface Unit {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerType: 'individual' | 'company';
  title: string;
  description: string;
  type: UnitType;
  status: UnitStatus;
  city: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
  pricePerNight: number; // SAR
  cleaningFee?: number;
  serviceFeePercent?: number;
  taxPercent?: number;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: UnitAmenity[];
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  checkInTime: string; // "15:00"
  checkOutTime: string; // "12:00"
  cancellationPolicy: CancellationTemplate;
  isFeatured?: boolean;
  hasDiscount?: boolean;
  discountPercent?: number;
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

export interface PriceBreakdown {
  pricePerNight: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  tax: number;
  total: number;
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
}

// ============ Saved Cards (mock) ============

export interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'mada';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
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
