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
 * يعيد فرق الوقت بين تاريخ الدخول ووقت طلب الإلغاء بالأيام (قابل لأن يكون سالبًا).
 * - موجب: الإلغاء قبل الدخول
 * - صفر أو سالب: الإلغاء بعد الدخول → الإلغاء محظور
 */
export function daysUntilCheckIn(checkInISO: string, requestAt: Date): number {
  const checkIn = new Date(checkInISO + 'T00:00:00').getTime();
  const diffMs = checkIn - requestAt.getTime();
  return diffMs / MS_PER_DAY;
}

export function hoursUntilCheckIn(checkInISO: string, requestAt: Date): number {
  const checkIn = new Date(checkInISO + 'T00:00:00').getTime();
  const diffMs = checkIn - requestAt.getTime();
  return diffMs / MS_PER_HOUR;
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

export interface RefundPreview {
  /** نسبة الاسترداد المطبقة (0..100) */
  refundPercent: number;
  /** المبلغ الذي سيُسترد (مدوّر إلى أقرب هللتين) */
  refundAmount: number;
  /** المبلغ الذي سيُخصم من العميل */
  forfeitedAmount: number;
  /** نص يصف المستوى المطبق (يُعرض للعميل) */
  tierLabel: string;
  /** هل الإلغاء مسموح أصلًا */
  isAllowed: boolean;
  /** سبب المنع إن وُجد */
  notAllowedReasonAr?: string;
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
      tierLabel: 'الحجز ملغى مسبقًا',
      isAllowed: false,
      notAllowedReasonAr: 'هذا الحجز ملغى بالفعل.',
      daysRemaining: days,
      hoursRemaining: hours,
    };
  }
  if (booking.status === 'completed') {
    return {
      refundPercent: 0,
      refundAmount: 0,
      forfeitedAmount: booking.price.total,
      tierLabel: 'الحجز منتهي',
      isAllowed: false,
      notAllowedReasonAr: 'لا يمكن إلغاء حجز منتهي.',
      daysRemaining: days,
      hoursRemaining: hours,
    };
  }
  if (days <= 0) {
    return {
      refundPercent: 0,
      refundAmount: 0,
      forfeitedAmount: booking.price.total,
      tierLabel: 'بعد تاريخ الدخول',
      isAllowed: false,
      notAllowedReasonAr: 'لا يمكن إلغاء الحجز بعد تاريخ الدخول.',
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
    tierLabel: tier.labelAr,
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
    tierLabel: preview.tierLabel,
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
