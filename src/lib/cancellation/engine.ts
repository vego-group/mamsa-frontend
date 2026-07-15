/**
 * Cancellation Engine
 *
 * المنطق الأساسي لاحتساب نسبة الاسترداد ومتى يظهر/يختفي زر الإلغاء.
 * مرجعية: SRS v1.1 — Section 5.2 (Booking & Cancellation Lifecycle).
 *
 * مبادئ التصميم:
 *   - Pure functions: لا تعتمد على وقت النظام مباشرة، يُمرَّر إليها (testable).
 *   - تستهلك Snapshot من السياسة المرتبطة بالحجز (FR-036).
 *   - أي تعديل لاحق على سياسة الوحدة لا يؤثر — نستخدم الـ snapshot فقط.
 */
import type {
  Booking,
  CancellationPolicy,
  CancellationTier,
  RefundRecord,
} from '@/types';

// ============ Time helpers (pure) ============

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * All properties on the platform are in Saudi Arabia, so the check-in day
 * boundary is midnight **Asia/Riyadh** (fixed UTC+3, no DST) — NOT the
 * viewer's local midnight. Refund eligibility must be identical for every
 * user worldwide at the same instant and must match what the backend
 * computes; interpreting the date in the browser's timezone made users in
 * different timezones see different cutoffs for the same booking.
 */
export const PROPERTY_UTC_OFFSET_HOURS = 3;

/** Instant (epoch ms) of midnight at the property on the check-in day. */
function checkInInstant(checkInISO: string): number {
  const offset = `+${String(PROPERTY_UTC_OFFSET_HOURS).padStart(2, '0')}:00`;
  return new Date(`${checkInISO}T00:00:00${offset}`).getTime();
}

/**
 * يعيد فرق الوقت بين تاريخ الدخول (منتصف الليل بتوقيت الرياض) ووقت طلب الإلغاء بالأيام (قابل لأن يكون سالبًا).
 * - موجب: الإلغاء قبل الدخول
 * - صفر أو سالب: الإلغاء بعد الدخول → الإلغاء محظور
 */
export function daysUntilCheckIn(checkInISO: string, requestAt: Date): number {
  return (checkInInstant(checkInISO) - requestAt.getTime()) / MS_PER_DAY;
}

export function hoursUntilCheckIn(checkInISO: string, requestAt: Date): number {
  return (checkInInstant(checkInISO) - requestAt.getTime()) / MS_PER_HOUR;
}

// ============ Eligibility ============

/**
 * هل الحجز مؤهل أصلًا للإلغاء؟ (FR-045)
 * - يجب أن يكون قبل تاريخ الدخول.
 * - الحجز الملغى/المكتمل لا يقبل إلغاء جديد.
 */
export function isBookingCancellable(booking: Booking, requestAt: Date): boolean {
  if (booking.status === 'cancelled' || booking.status === 'completed') return false;
  if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') return false;
  const days = daysUntilCheckIn(booking.checkInDate, requestAt);
  return days > 0;
}

// ============ Tier resolution ============

/**
 * يحدد المستوى الزمني المنطبق على لحظة الإلغاء.
 * الـ tiers مرتبة تنازليًا (الأطول مدة أولًا)، فنأخذ أول tier تنطبق عليه days.
 *
 * مثال: لو الإلغاء قبل 5 أيام:
 *   - tier(>=7d): 100% → لا
 *   - tier(>=3d): 50%  → نعم ✓
 *   - tier(>=0d): 0%   → (لم نصل لها)
 */
export function resolveTier(
  policy: CancellationPolicy,
  daysBeforeCheckIn: number,
): CancellationTier {
  const sorted = [...policy.tiers].sort(
    (a, b) => b.minDaysBeforeCheckIn - a.minDaysBeforeCheckIn,
  );
  for (const tier of sorted) {
    if (daysBeforeCheckIn >= tier.minDaysBeforeCheckIn) return tier;
  }
  // fallback آمن — لا استرداد
  return { minDaysBeforeCheckIn: 0, refundPercent: 0, labelAr: 'بدون استرداد' };
}

// ============ Refund calculation ============

/** Machine-readable reason codes — the UI maps these to localized copy. */
export type NotAllowedReason = 'alreadyCancelled' | 'completed' | 'afterCheckIn';

export interface RefundPreview {
  /** نسبة الاسترداد المطبقة (0..100) */
  refundPercent: number;
  /** المبلغ الذي سيُسترد (مدوّر إلى أقرب هللتين) */
  refundAmount: number;
  /** المبلغ الذي سيُخصم من العميل */
  forfeitedAmount: number;
  /** المستوى المطبق (numeric — the UI derives the localized label from this) */
  tier: CancellationTier | null;
  /**
   * Pre-rendered fallback label from the live backend (which doesn't return
   * structured tier data) — only used when `tier` is null and this preview
   * didn't come from the local engine above.
   */
  rawTierLabel?: string;
  /** هل الإلغاء مسموح أصلًا */
  isAllowed: boolean;
  /** سبب المنع إن وُجد (machine-readable — translated by the UI) */
  notAllowedReason?: NotAllowedReason;
  /** Pre-rendered fallback reason from the live backend, when no structured code applies. */
  rawNotAllowedReason?: string;
  /** للعرض في الـ UI: عدد الأيام/الساعات قبل الدخول */
  daysRemaining: number;
  hoursRemaining: number;
}

/**
 * المعاينة الكاملة لطلب الإلغاء — تُعرض للعميل قبل التأكيد (FR-043, FR-044).
 *
 * @param booking الحجز محل الإلغاء (يجب أن يحتوي policySnapshot).
 * @param requestAt لحظة طلب الإلغاء (وقت الخادم في الإنتاج، Date.now() في الـ mock).
 */
export function previewCancellation(booking: Booking, requestAt: Date): RefundPreview {
  const days = daysUntilCheckIn(booking.checkInDate, requestAt);
  const hours = hoursUntilCheckIn(booking.checkInDate, requestAt);

  if (booking.status === 'cancelled') {
    return {
      refundPercent: 0,
      refundAmount: 0,
      forfeitedAmount: booking.price.total,
      tier: null,
      isAllowed: false,
      notAllowedReason: 'alreadyCancelled',
      daysRemaining: days,
      hoursRemaining: hours,
    };
  }
  if (booking.status === 'completed') {
    return {
      refundPercent: 0,
      refundAmount: 0,
      forfeitedAmount: booking.price.total,
      tier: null,
      isAllowed: false,
      notAllowedReason: 'completed',
      daysRemaining: days,
      hoursRemaining: hours,
    };
  }
  if (days <= 0) {
    return {
      refundPercent: 0,
      refundAmount: 0,
      forfeitedAmount: booking.price.total,
      tier: null,
      isAllowed: false,
      notAllowedReason: 'afterCheckIn',
      daysRemaining: days,
      hoursRemaining: hours,
    };
  }

  const tier = resolveTier(booking.policySnapshot, days);
  const refundAmount = roundMoney((booking.price.total * tier.refundPercent) / 100);
  const forfeitedAmount = roundMoney(booking.price.total - refundAmount);

  return {
    refundPercent: tier.refundPercent,
    refundAmount,
    forfeitedAmount,
    tier,
    isAllowed: true,
    daysRemaining: days,
    hoursRemaining: hours,
  };
}

/**
 * يُولّد سجل الاسترداد النهائي عند تأكيد الإلغاء (FR-046).
 * في الإنتاج: هذا الـ record يُرسل لـ Moyasar refund API.
 */
export function buildRefundRecord(
  preview: RefundPreview,
  cancelledBy: RefundRecord['cancelledBy'],
  reason?: string,
): RefundRecord {
  return {
    amount: preview.refundAmount,
    percent: preview.refundPercent,
    tierLabel: preview.tier ? `${preview.tier.refundPercent}%` : '',
    refundedAt: new Date().toISOString(),
    cancelledBy,
    reason,
  };
}

// ============ Money rounding ============

/** تدوير المال لأقرب هللتين (.00) — تجنّب أخطاء floating point */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
