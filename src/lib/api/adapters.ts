/**
 * Backend ↔ Frontend adapters.
 *
 * The Laravel API speaks snake_case with its own field names; the UI consumes
 * the camelCase domain types in `@/types`. Every mapper below is the single
 * place where one backend resource is translated, so endpoint wiring stays thin.
 */
import type {
  Unit,
  UnitType,
  UnitAmenity,
  Booking,
  BookingStatus,
  Review,
  User,
  CancellationTemplate,
  CancellationPolicy,
  SavedCard,
  Transaction,
} from '@/types';
import type { RefundPreview } from '@/lib/cancellation/engine';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';

const DEFAULT_COUNTRY = 'السعودية';

// ============ Raw backend shapes ============

interface RawImage { id: number; url: string; is_main: boolean }
interface RawOwner { id: number; name: string }

/**
 * The tiered cancellation policy as the backend's refund engine sees it.
 * Appears as `cancellation_policy_details` on unit resources (live policy)
 * and as `policy_snapshot` on bookings (frozen at payment — FR-036); both
 * share this exact shape, built from the same source of truth server-side.
 */
interface RawPolicyDetails {
  template?: string;
  name?: string;
  /** Booking snapshots only. */
  checkin_at?: string;
  tiers?: Array<{ min_hours_before_checkin?: number; refund_percent?: number; label?: string }>;
}

export interface RawUnit {
  id: number | string;
  name: string;
  type: string;
  code?: string;
  price: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  city: string;
  district?: string;
  lat?: number | null;
  lng?: number | null;
  description?: string;
  checkin_time?: string;
  checkout_time?: string;
  /** DEPRECATED legacy enum (e.g. "48_hours") — read `cancellation_policy_details` instead. */
  cancellation_policy?: string;
  cancellation_policy_details?: RawPolicyDetails | null;
  status?: string;
  approval_status?: string;
  images?: RawImage[];
  features?: string[];
  avg_rating?: number;
  reviews_count?: number;
  owner?: RawOwner;
  created_at?: string;
}

export interface RawBooking {
  id: number | string;
  reference?: string;
  unit?: RawUnit;
  start_date: string;
  end_date: string;
  nights?: number;
  guests?: number;
  total_amount?: number;
  pricing?: {
    nightly_rate?: number;
    nights?: number;
    subtotal?: number;
    service_fee?: number;
    cleaning_fee?: number;
    taxes?: number;
    total?: number;
  };
  status?: string;
  status_label?: string;
  notes?: string | null;
  cancelled_at?: string | null;
  cancellation?: {
    reason?: string | null;
    cancelled_by_label?: string;
    cancelled_by?: string;
    refunded_amount?: number;
    refund_percent?: number;
    tier_label?: string;
  } | null;
  payment?: { method?: string; last4?: string } | null;
  /**
   * FR-036: the policy version FROZEN at payment-confirmation time — the exact
   * object the backend refund engine computes from. `null` while the booking
   * is unpaid (no snapshot exists yet).
   */
  policy_snapshot?: RawPolicyDetails | null;
  /** Present (non-null) once the guest has reviewed this booking. Exact shape TBD — we only check presence. */
  review?: unknown;
  created_at?: string;
}

export interface RawUser {
  id: number | string;
  name?: string | null;
  phone?: string;
  email?: string | null;
  email_verified?: boolean;
  is_admin?: boolean;
  is_partner?: boolean;
  created_at?: string;
}

export interface RawCancellationPreview {
  cancellable: boolean;
  refund_amount: number;
  refund_percent: number;
  tier_label: string;
  hours_before_checkin: number;
  reason?: string | null;
}

// ============ Lookup tables ============

/** Map common Arabic amenity labels back to icon keys the UI understands. */
const FEATURE_KEYS: Record<string, string> = {
  'واي فاي': 'wifi',
  'واي-فاي': 'wifi',
  wifi: 'wifi',
  مطبخ: 'kitchen',
  مكيف: 'ac',
  تكييف: 'ac',
  'موقف سيارات': 'parking',
  مسبح: 'pool',
  'شاشة ذكية': 'tv',
  تلفزيون: 'tv',
};

/** Backend cancellation policy keys → the 3 frontend templates. */
const TEMPLATE_MAP: Record<string, CancellationTemplate> = {
  flexible: 'flexible',
  '24_hours': 'flexible',
  '48_hours': 'moderate',
  moderate: 'moderate',
  '7_days': 'strict',
  strict: 'strict',
  non_refundable: 'strict',
};

const BOOKING_STATUS_MAP: Record<string, BookingStatus> = {
  pending: 'pending_payment',
  pending_payment: 'pending_payment',
  awaiting_payment: 'pending_payment',
  confirmed: 'confirmed',
  paid: 'confirmed',
  active: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

function mapTemplate(policy?: string): CancellationTemplate {
  return TEMPLATE_MAP[policy ?? ''] ?? 'moderate';
}

/**
 * Builds a full tiered `CancellationPolicy` from the backend's shared
 * `RawPolicyDetails` shape — `cancellation_policy_details` on units (live
 * policy, FR-021) and `policy_snapshot` on bookings (frozen at payment,
 * FR-036) both use it. The backend returns the EXACT tiers its refund engine
 * computes from, so display always matches `cancellation-preview`/refunds
 * even if the shared templates are re-tuned later. Returns null when the
 * field is absent (mock mode, or an unpaid booking with no snapshot yet) —
 * callers fall back to `getPolicyByTemplate(the legacy enum)`.
 */
function mapPolicyDetails(raw: RawPolicyDetails | null | undefined): CancellationPolicy | null {
  if (!raw?.tiers?.length) return null;
  const template = mapTemplate(raw.template);
  const base = getPolicyByTemplate(template);
  return {
    template,
    labelAr: raw.name || base.labelAr,
    descriptionAr: base.descriptionAr,
    // Backend tiers are in hours before check-in; the engine/display use days.
    tiers: raw.tiers
      .map((t) => ({
        minDaysBeforeCheckIn: Number(t.min_hours_before_checkin ?? 0) / 24,
        refundPercent: Number(t.refund_percent ?? 0),
        labelAr: t.label || `${Number(t.refund_percent ?? 0)}%`,
      }))
      .sort((a, b) => b.minDaysBeforeCheckIn - a.minDaysBeforeCheckIn),
    postCheckInBehavior: 'hidden',
  };
}

function mapFeatures(features?: string[]): UnitAmenity[] {
  return (features ?? []).map((f) => ({ key: FEATURE_KEYS[f] ?? f, labelAr: f }));
}

function hhmm(time?: string, fallback = '00:00'): string {
  return (time ?? fallback).slice(0, 5);
}

// ============ Domain mappers ============

export function mapUnit(u: RawUnit): Unit {
  const images = [...(u.images ?? [])].sort((a, b) => Number(b.is_main) - Number(a.is_main));
  return {
    id: String(u.id),
    ownerId: u.owner ? String(u.owner.id) : '',
    ownerName: u.owner?.name ?? '',
    ownerType: 'individual',
    title: u.name ?? '',
    description: u.description ?? '',
    type: u.type as UnitType,
    status: u.approval_status === 'approved' ? 'approved' : 'pending',
    city: u.city ?? '',
    district: u.district ?? '',
    country: DEFAULT_COUNTRY,
    latitude: u.lat ?? 0,
    longitude: u.lng ?? 0,
    pricePerNight: Number(u.price ?? 0),
    capacity: Number(u.capacity ?? 0),
    bedrooms: Number(u.bedrooms ?? 0),
    beds: Number(u.bedrooms ?? 0),
    bathrooms: Number(u.bathrooms ?? 0),
    amenities: mapFeatures(u.features),
    imageUrls: images.map((i) => i.url),
    rating: Number(u.avg_rating ?? 0),
    reviewCount: Number(u.reviews_count ?? 0),
    checkInTime: hhmm(u.checkin_time, '15:00'),
    checkOutTime: hhmm(u.checkout_time, '12:00'),
    cancellationPolicy: mapTemplate(u.cancellation_policy),
    cancellationPolicyDetails: mapPolicyDetails(u.cancellation_policy_details),
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

export function mapBooking(b: RawBooking): Booking {
  const unit = b.unit;
  const p = b.pricing ?? {};
  const mainImage = unit?.images?.find((i) => i.is_main)?.url ?? unit?.images?.[0]?.url ?? '';

  return {
    id: String(b.id),
    code: b.reference ?? '',
    unitId: unit ? String(unit.id) : '',
    unitSnapshot: {
      title: unit?.name ?? '',
      city: unit?.city ?? '',
      country: DEFAULT_COUNTRY,
      imageUrl: mainImage,
      ownerName: unit?.owner?.name ?? '',
    },
    userId: 'CURRENT_USER',
    status: BOOKING_STATUS_MAP[b.status ?? ''] ?? 'confirmed',
    checkInDate: b.start_date,
    checkOutDate: b.end_date,
    nights: Number(b.nights ?? p.nights ?? 0),
    guests: { adults: Number(b.guests ?? 1), children: 0 },
    price: {
      pricePerNight: Number(p.nightly_rate ?? 0),
      nights: Number(p.nights ?? b.nights ?? 0),
      subtotal: Number(p.subtotal ?? 0),
      cleaningFee: Number(p.cleaning_fee ?? 0),
      serviceFee: Number(p.service_fee ?? 0),
      tax: Number(p.taxes ?? 0),
      total: Number(p.total ?? b.total_amount ?? 0),
    },
    // Prefer the API's frozen snapshot (FR-036); the unit's embedded policy is
    // a deprecated legacy enum — used ONLY as the pre-payment fallback.
    policySnapshot:
      mapPolicyDetails(b.policy_snapshot) ?? getPolicyByTemplate(mapTemplate(unit?.cancellation_policy)),
    isReviewed: Boolean(b.review),
    refund: b.cancellation
      ? {
          amount: Number(b.cancellation.refunded_amount ?? 0),
          percent: Number(b.cancellation.refund_percent ?? 0),
          tierLabel: b.cancellation.tier_label ?? '',
          refundedAt: b.cancelled_at ?? new Date().toISOString(),
          reason: b.cancellation.reason ?? undefined,
          cancelledBy: (b.cancellation.cancelled_by as 'customer' | 'partner' | 'admin' | 'system') ?? 'customer',
        }
      : undefined,
    createdAt: b.created_at ?? new Date().toISOString(),
    cancelledAt: b.cancelled_at ?? undefined,
  };
}

export function mapCancellationPreview(c: RawCancellationPreview): RefundPreview {
  const refundAmount = Number(c.refund_amount ?? 0);
  const refundPercent = Number(c.refund_percent ?? 0);
  // The preview endpoint omits the booking total, so derive the forfeited part
  // from the refunded share when a partial refund applies.
  const total = refundPercent > 0 ? refundAmount / (refundPercent / 100) : refundAmount;
  const hours = Number(c.hours_before_checkin ?? 0);
  return {
    refundPercent,
    refundAmount,
    forfeitedAmount: Math.max(0, Math.round((total - refundAmount) * 100) / 100),
    // The live backend only returns pre-rendered text, not structured tier data.
    tier: null,
    rawTierLabel: c.tier_label ?? '',
    isAllowed: Boolean(c.cancellable),
    rawNotAllowedReason: c.cancellable ? undefined : c.reason ?? undefined,
    daysRemaining: Math.floor(hours / 24),
    hoursRemaining: hours,
  };
}

export function mapReview(r: Record<string, unknown>): Review {
  return {
    id: String(r.id ?? ''),
    bookingId: String(r.booking_id ?? ''),
    unitId: String(r.unit_id ?? ''),
    userId: String(r.user_id ?? 'CURRENT_USER'),
    userName: String(r.user_name ?? r.name ?? ''),
    rating: Number(r.rating ?? 0),
    comment: String(r.comment ?? ''),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

export function mapCard(c: Record<string, unknown>): SavedCard {
  return {
    id: String(c.id ?? ''),
    brand: (c.brand as SavedCard['brand']) ?? 'visa',
    last4: String(c.last4 ?? ''),
    expMonth: Number(c.exp_month ?? 0),
    expYear: Number(c.exp_year ?? 0),
    isDefault: Boolean(c.is_default),
    chargeable: Boolean(c.chargeable),
  };
}

export function mapTransaction(t: Record<string, unknown>): Transaction {
  return {
    id: String(t.id ?? ''),
    refCode: String(t.ref_code ?? ''),
    type: (t.type as Transaction['type']) ?? 'payment',
    amount: Number(t.amount ?? 0),
    description: String(t.description ?? ''),
    date: String(t.date ?? ''),
    status: (t.status as Transaction['status']) ?? 'completed',
  };
}

export function mapUser(u: RawUser): User {
  const parts = (u.name ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    id: String(u.id),
    role: u.is_admin ? 'super_admin' : u.is_partner ? 'individual' : 'user',
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    email: u.email ?? null,
    emailVerified: Boolean(u.email_verified),
    phone: u.phone ?? '',
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

/**
 * For endpoints that echo basic profile fields but never carry role info
 * (e.g. `PUT /user/profile`) — omits `role` so callers doing a shallow merge
 * into the stored user (`updateUser(patch)`) can't accidentally downgrade an
 * admin/partner back to a plain "user" just because they edited their name.
 */
export function mapUserProfile(u: RawUser): Omit<User, 'role'> {
  const { role: _role, ...rest } = mapUser(u);
  return rest;
}

// ============ Homepage content types ============

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  imageUrl: string;
  validUntil: string;
  validUntilLabel: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
  deal: string;
}

export interface UnitCategory {
  key: string;
  label: string;
  icon: string;
  count: number;
  imageUrl: string;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface BudgetRange {
  key: string;
  label: string;
  min: number | null;
  max: number | null;
  count: number;
  imageUrl: string;
}

export function mapCategory(c: Record<string, unknown>): UnitCategory {
  return {
    key: String(c.key ?? ''),
    label: String(c.label ?? ''),
    icon: String(c.icon ?? ''),
    count: Number(c.count ?? 0),
    imageUrl: String(c.image_url ?? ''),
  };
}

export function mapBudget(b: Record<string, unknown>): BudgetRange {
  return {
    key: String(b.key ?? ''),
    label: String(b.label ?? ''),
    min: b.min == null ? null : Number(b.min),
    max: b.max == null ? null : Number(b.max),
    count: Number(b.count ?? 0),
    imageUrl: String(b.image_url ?? ''),
  };
}

export function mapOffer(o: Record<string, unknown>): Offer {
  return {
    id: String(o.id ?? ''),
    title: String(o.title ?? ''),
    subtitle: String(o.subtitle ?? ''),
    discountPercent: Number(o.discount_percent ?? 0),
    imageUrl: String(o.image_url ?? ''),
    validUntil: String(o.valid_until ?? ''),
    validUntilLabel: String(o.valid_until_label ?? ''),
  };
}

export function mapTestimonial(t: Record<string, unknown>): Testimonial {
  return {
    id: String(t.id ?? ''),
    name: String(t.name ?? ''),
    role: String(t.role ?? ''),
    quote: String(t.quote ?? ''),
    avatarUrl: String(t.avatar_url ?? ''),
    rating: Number(t.rating ?? 5),
    deal: String(t.deal ?? ''),
  };
}
