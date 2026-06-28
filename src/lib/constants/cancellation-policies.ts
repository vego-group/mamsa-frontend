/**
 * Cancellation Policy Presets (SRS v1.1 — Section 5.2.2)
 *
 * Configurable values (NFR-013): تظل هنا كمصدر واحد، ويتم استبدالها لاحقًا
 * بقيم من قاعدة البيانات/الإعدادات عند ربط الباك إند، دون تغيير أي منطق في الكود.
 */
import type { CancellationPolicy, CancellationTemplate } from '@/types';

export const FLEXIBLE_POLICY: CancellationPolicy = {
  template: 'flexible',
  labelAr: 'مرنة',
  descriptionAr: 'سياسة سهلة تتيح للضيف الإلغاء قبل الوصول بمرونة.',
  tiers: [
    { minDaysBeforeCheckIn: 7, refundPercent: 100, labelAr: 'استرداد كامل' },
    { minDaysBeforeCheckIn: 3, refundPercent: 50, labelAr: 'استرداد جزئي 50%' },
    { minDaysBeforeCheckIn: 0, refundPercent: 0, labelAr: 'بدون استرداد' },
  ],
  postCheckInBehavior: 'hidden',
};

export const MODERATE_POLICY: CancellationPolicy = {
  template: 'moderate',
  labelAr: 'متوسطة',
  descriptionAr: 'توازن بين مرونة الإلغاء وحماية الشريك.',
  tiers: [
    { minDaysBeforeCheckIn: 7, refundPercent: 100, labelAr: 'استرداد كامل' },
    { minDaysBeforeCheckIn: 3, refundPercent: 25, labelAr: 'استرداد جزئي 25%' },
    { minDaysBeforeCheckIn: 0, refundPercent: 0, labelAr: 'بدون استرداد' },
  ],
  postCheckInBehavior: 'hidden',
};

export const STRICT_POLICY: CancellationPolicy = {
  template: 'strict',
  labelAr: 'صارمة',
  descriptionAr: 'إلغاء محدود — يحمي الشريك من الإلغاءات المتأخرة.',
  tiers: [
    { minDaysBeforeCheckIn: 7, refundPercent: 50, labelAr: 'استرداد جزئي 50%' },
    { minDaysBeforeCheckIn: 3, refundPercent: 0, labelAr: 'بدون استرداد' },
    { minDaysBeforeCheckIn: 0, refundPercent: 0, labelAr: 'بدون استرداد' },
  ],
  postCheckInBehavior: 'hidden',
};

export const POLICY_REGISTRY: Record<CancellationTemplate, CancellationPolicy> = {
  flexible: FLEXIBLE_POLICY,
  moderate: MODERATE_POLICY,
  strict: STRICT_POLICY,
};

export function getPolicyByTemplate(template: CancellationTemplate): CancellationPolicy {
  return POLICY_REGISTRY[template];
}
