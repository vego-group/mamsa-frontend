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
  UnitStatus,
  UnitAmenity,
  Booking,
  BookingStatus,
  PaymentInfo,
  Review,
  User,
  CancellationTemplate,
  CancellationPolicy,
  CancellationTier,
  RefundRecord,
  SavedCard,
  Transaction,
} from '@/types';
import type { RefundPreview } from '@/lib/cancellation/engine';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';

const DEFAULT_COUNTRY = 'السعودية';

// ============ Raw backend shapes ============

interface RawImage { id: number; url: string; is_main: boolean }
interface RawOwner {
  id: number;
  name: string;
  type?: 'individual' | 'company';
  is_verified?: boolean;
  avatar_url?: string | null;
}

/**
 * Structured amenity (`amenities` on the unit resource). `key` is a slug from
 * the backend's closed vocabulary, or `null` when the amenity isn't in it yet —
 * report those labels to the backend so a slug gets assigned.
 */
interface RawAmenity {
  key: string | null;
  label: string;
}

/**
 * The tiered cancellation policy as the backend's refund engine sees it.
 * Appears as `cancellation_policy_details` on unit resources (live policy)
 * and as `policy_snapshot` on bookings (frozen at payment — FR-036); both
 * share this exact shape, built from the same source of truth server-side.
 */
interface RawPolicyTier {
  min_hours_before_checkin?: number;
  refund_percent?: number;
  label?: string;
}

interface RawPolicyDetails {
  template?: string;
  name?: string;
  /** Booking snapshots only. */
  checkin_at?: string;
  tiers?: RawPolicyTier[];
}

export interface RawUnit {
  id: number | string;
  name: string;
  type: string;
  code?: string;
  price: number;
  tax_percent?: number;
  capacity: number;
  bedrooms: number;
  beds?: number;
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
  rejection_reason?: string | null;
  is_featured?: boolean;
  images?: RawImage[];
  /** DEPRECATED — Arabic label strings. Read `amenities` instead. */
  features?: string[];
  amenities?: RawAmenity[];
  avg_rating?: number;
  reviews_count?: number;
  owner?: RawOwner;
  created_at?: string;
}

export interface RawBooking {
  id: number | string;
  reference?: string;
  user_id?: number | string;
  guest_name?: string | null;
  unit?: RawUnit;
  start_date: string;
  end_date: string;
  nights?: number;
  /** Total headcount. The adults/children split lives in `guests_detail`. */
  guests?: number;
  guests_detail?: { adults?: number; children?: number } | null;
  total_amount?: number;
  pricing?: {
    nightly_rate?: number;
    nights?: number;
    subtotal?: number;
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
  /** Display concatenation of the two parts below — kept for backward compat. */
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string;
  email?: string | null;
  email_verified?: boolean;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_partner?: boolean;
  /** Present when the user is a partner — same source as `owner.type` on units. */
  partner_type?: 'individual' | 'company';
  created_at?: string;
}

export interface RawCancellationPreview {
  cancellable: boolean;
  refund_amount: number;
  refund_percent: number;
  /** The booking total. Explicit since 2026-07-21 — no more reverse-division. */
  total_amount?: number;
  /** Correct even at `refund_percent: 0`, where it equals the full total. */
  forfeited_amount?: number;
  tier_label: string;
  /** The matched tier, same shape as one `cancellation_policy_details.tiers` entry. `null` when not cancellable. */
  tier?: RawPolicyTier | null;
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
/** Backend tiers count hours before check-in; the engine and UI work in days. */
const mapTier = (t: RawPolicyTier): CancellationTier => ({
  minDaysBeforeCheckIn: Number(t.min_hours_before_checkin ?? 0) / 24,
  refundPercent: Number(t.refund_percent ?? 0),
  labelAr: t.label || `${Number(t.refund_percent ?? 0)}%`,
});

function mapPolicyDetails(raw: RawPolicyDetails | null | undefined): CancellationPolicy | null {
  if (!raw?.tiers?.length) return null;
  const template = mapTemplate(raw.template);
  const base = getPolicyByTemplate(template);
  return {
    template,
    labelAr: raw.name || base.labelAr,
    descriptionAr: base.descriptionAr,
    // Backend tiers are in hours before check-in; the engine/display use days.
    tiers: raw.tiers.map(mapTier).sort((a, b) => b.minDaysBeforeCheckIn - a.minDaysBeforeCheckIn),
    postCheckInBehavior: 'hidden',
  };
}

/**
 * Prefers the backend's structured `amenities` (stable slugs) and falls back to
 * the deprecated `features` string array, where the only way to recover a slug
 * is matching the Arabic label — which breaks on any spelling the table misses.
 * A `null` key (amenity outside the vocabulary) degrades to the label, so the UI
 * shows the generic icon rather than dropping the amenity.
 */
function mapAmenities(u: Pick<RawUnit, 'amenities' | 'features'>): UnitAmenity[] {
  if (u.amenities?.length) {
    return u.amenities.map((a) => ({ key: a.key ?? a.label, labelAr: a.label }));
  }
  return (u.features ?? []).map((f) => ({ key: FEATURE_KEYS[f] ?? f, labelAr: f }));
}

const UNIT_STATUSES: readonly UnitStatus[] = ['draft', 'pending', 'approved', 'rejected'];

const mapUnitStatus = (s?: string): UnitStatus =>
  UNIT_STATUSES.includes(s as UnitStatus) ? (s as UnitStatus) : 'pending';

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
    ownerType: u.owner?.type === 'company' ? 'company' : 'individual',
    ownerVerified: Boolean(u.owner?.is_verified),
    ownerAvatarUrl: u.owner?.avatar_url ?? null,
    title: u.name ?? '',
    description: u.description ?? '',
    type: u.type as UnitType,
    status: mapUnitStatus(u.approval_status),
    rejectionReason: u.rejection_reason ?? null,
    city: u.city ?? '',
    district: u.district ?? '',
    country: DEFAULT_COUNTRY,
    latitude: u.lat ?? 0,
    longitude: u.lng ?? 0,
    pricePerNight: Number(u.price ?? 0),
    taxPercent: u.tax_percent == null ? undefined : Number(u.tax_percent),
    capacity: Number(u.capacity ?? 0),
    bedrooms: Number(u.bedrooms ?? 0),
    beds: Number(u.beds ?? 0),
    bathrooms: Number(u.bathrooms ?? 0),
    area: u.area == null ? undefined : Number(u.area),
    amenities: mapAmenities(u),
    imageUrls: images.map((i) => i.url),
    isFeatured: Boolean(u.is_featured),
    rating: Number(u.avg_rating ?? 0),
    reviewCount: Number(u.reviews_count ?? 0),
    checkInTime: hhmm(u.checkin_time, '15:00'),
    checkOutTime: hhmm(u.checkout_time, '12:00'),
    cancellationPolicy: mapTemplate(u.cancellation_policy),
    cancellationPolicyDetails: mapPolicyDetails(u.cancellation_policy_details),
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

/**
 * Closed set confirmed by the backend — `customer` = guest, `partner` = host,
 * `admin` = back-office, `system` = automated (e.g. payment expiry). No aliases
 * (`guest`/`host` are explicitly not used), so anything else means the contract
 * changed; fall back to the commonest case rather than render a blank actor.
 */
const CANCELLED_BY = ['customer', 'partner', 'admin', 'system'] as const;

const mapCancelledBy = (v?: string): RefundRecord['cancelledBy'] =>
  CANCELLED_BY.includes(v as RefundRecord['cancelledBy']) ? (v as RefundRecord['cancelledBy']) : 'customer';

/**
 * `guests` is the total headcount and `guests_detail` the split. When the split
 * is absent (older bookings), everyone counts as an adult — which is what the
 * total meant before `children` existed, so no guest is invented or lost.
 */
function mapGuests(b: RawBooking): { adults: number; children: number } {
  const total = Number(b.guests ?? 1);
  const children = Number(b.guests_detail?.children ?? 0);
  const adults = b.guests_detail?.adults != null ? Number(b.guests_detail.adults) : total - children;
  return { adults: Math.max(0, adults), children: Math.max(0, children) };
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
    userId: b.user_id == null ? 'CURRENT_USER' : String(b.user_id),
    guestName: b.guest_name ?? undefined,
    status: BOOKING_STATUS_MAP[b.status ?? ''] ?? 'confirmed',
    checkInDate: b.start_date,
    checkOutDate: b.end_date,
    nights: Number(b.nights ?? p.nights ?? 0),
    guests: mapGuests(b),
    price: {
      pricePerNight: Number(p.nightly_rate ?? 0),
      nights: Number(p.nights ?? b.nights ?? 0),
      subtotal: Number(p.subtotal ?? 0),
      tax: Number(p.taxes ?? 0),
      total: Number(p.total ?? b.total_amount ?? 0),
    },
    // Prefer the API's frozen snapshot (FR-036); the unit's embedded policy is
    // a deprecated legacy enum — used ONLY as the pre-payment fallback.
    policySnapshot:
      mapPolicyDetails(b.policy_snapshot) ?? getPolicyByTemplate(mapTemplate(unit?.cancellation_policy)),
    isReviewed: Boolean(b.review),
    // Only surface a method the UI can label; `last4` stays optional (wallet
    // methods carry no PAN digits).
    payment: b.payment?.method
      ? { method: b.payment.method as PaymentInfo['method'], last4: b.payment.last4 }
      : undefined,
    refund: b.cancellation
      ? {
          amount: Number(b.cancellation.refunded_amount ?? 0),
          percent: Number(b.cancellation.refund_percent ?? 0),
          tierLabel: b.cancellation.tier_label ?? '',
          refundedAt: b.cancelled_at ?? new Date().toISOString(),
          reason: b.cancellation.reason ?? undefined,
          cancelledBy: mapCancelledBy(b.cancellation.cancelled_by),
        }
      : undefined,
    createdAt: b.created_at ?? new Date().toISOString(),
    cancelledAt: b.cancelled_at ?? undefined,
  };
}

export function mapCancellationPreview(c: RawCancellationPreview): RefundPreview {
  const refundAmount = Number(c.refund_amount ?? 0);
  const refundPercent = Number(c.refund_percent ?? 0);
  const hours = Number(c.hours_before_checkin ?? 0);

  // The backend returns the forfeited figure outright. Fall back to the booking
  // total only if it's missing; the old reverse-division (refund ÷ percent) is
  // gone — it collapsed at refund_percent = 0 and reported "forfeited: 0" when
  // the guest was in fact losing the entire amount.
  const round2 = (n: number) => Math.max(0, Math.round(n * 100) / 100);
  const forfeitedAmount =
    c.forfeited_amount != null
      ? round2(Number(c.forfeited_amount))
      : c.total_amount != null
        ? round2(Number(c.total_amount) - refundAmount)
        : 0;

  return {
    refundPercent,
    refundAmount,
    forfeitedAmount,
    tier: c.tier ? mapTier(c.tier) : null,
    // Kept as the display fallback for when `tier` is absent (not cancellable).
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
    userAvatarUrl: r.user_avatar_url == null ? undefined : String(r.user_avatar_url),
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

function mapRole(u: RawUser): User['role'] {
  if (u.is_admin) return 'super_admin';
  if (!u.is_partner) return 'user';
  return u.partner_type === 'company' ? 'company' : 'individual';
}

export function mapUser(u: RawUser): User {
  // `first_name`/`last_name` are real columns now, so compound Arabic names
  // ("عبد الله محمد") survive intact. The whitespace split is only a fallback
  // for a row that predates the backfill — never the normal path.
  const hasParts = u.first_name != null || u.last_name != null;
  const parts = (u.name ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    id: String(u.id),
    role: mapRole(u),
    firstName: hasParts ? u.first_name ?? '' : parts[0] ?? '',
    lastName: hasParts ? u.last_name ?? '' : parts.slice(1).join(' '),
    email: u.email ?? null,
    emailVerified: Boolean(u.email_verified),
    avatarUrl: u.avatar_url ?? undefined,
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
