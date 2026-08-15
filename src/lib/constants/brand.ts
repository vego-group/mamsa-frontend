/**
 * Brand & Platform Constants
 * المصدر الوحيد لمعلومات المنصة المعروضة للمستخدم.
 */

/**
 * قاعدة رابط الموقع العام (تطبيق المستخدم — www). يُستخدم في robots.txt و
 * sitemap.xml والروابط المطلقة. يُضبط لكل بيئة عبر NEXT_PUBLIC_SITE_URL؛
 * القيمة الافتراضية هي نطاق الإنتاج. بدون شرطة مائلة في النهاية.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mamsaa.com').replace(
  /\/+$/,
  '',
);

export const BRAND = {
  nameAr: 'مَمسَى',
  nameEn: 'Mamsa',
  tagline: 'منصة رائدة في مجال حجز أماكن الإقامة الفريدة حول العالم.',
  email: 'info@mamsaa.com',
  phone: '+966 50 000 0000',
  licenseAuthority: 'وزارة السياحة',
  /** رقم السجل التجاري الصادر من المركز السعودي للأعمال — يُعرض في الفوتر. */
  crNumber: '1010920108',
} as const;

/**
 * قاعدة رابط لوحة تحكّم الشركاء (تطبيق منفصل). تُضبط لكل بيئة عبر
 * NEXT_PUBLIC_DASHBOARD_URL — لا تُكتب hardcoded هنا.
 */
export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '';
/** رابط تسجيل دخول الشريك في الداشبورد (فارغ لو لم يُضبط بعد). */
export const DASHBOARD_LOGIN_URL = DASHBOARD_URL ? `${DASHBOARD_URL.replace(/\/+$/, '')}/login` : '';

export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/mamsa',
  instagram: 'https://instagram.com/mamsa',
  twitter: 'https://twitter.com/mamsa',
  facebook: 'https://facebook.com/mamsa',
} as const;

export const CURRENCY = {
  code: 'SAR',
  symbolAr: 'ر.س',
  symbolEn: 'SAR',
} as const;

/**
 * Saudi VAT. Displayed prices are GROSS (VAT-inclusive) everywhere — VAT is
 * broken out DOWNWARD from the gross figure, never added upward to it, so
 * nothing the guest sees ever grows between search and payment.
 *
 * This is the single source of the rate. The only module allowed to do
 * arithmetic with it is `src/lib/pricing.ts`; everything else displays the
 * numbers that module (or the backend) produced.
 */
export const VAT_RATE = 0.15;
/** The same rate as a whole number, for labels like "ضريبة القيمة المضافة (15%)". */
export const VAT_PERCENT_LABEL = 15;

/**
 * Seller of record on a guest tax invoice. Mamsa is the seller — the host's
 * name must NEVER appear here.
 *
 * Held as a constant rather than inlined in the invoice template: these are
 * registration numbers, they change rarely and centrally, and a ZATCA QR is
 * generated server-side from the same values. Consumed by the Phase 3 invoice.
 */
export const INVOICE_SELLER = {
  name: 'شركة ممسى للتقنية',
  vatNumber: '310456370500003',
  crNumber: '1010456370',
  address: 'الرياض، المملكة العربية السعودية',
} as const;

export const DATE_FORMAT = {
  display: 'dd/MM/yyyy', // gregorian only — قرار معتمد
  displayLong: 'dd MMMM yyyy',
  iso: 'yyyy-MM-dd',
} as const;

export const OTP_CONFIG = {
  length: 6,
  expirySeconds: 60,
  maxAttempts: 3,
  resendCooldownSeconds: 30,
} as const;

export const PAGINATION = {
  pageSize: 12,
} as const;

export const PRICE_FILTER = {
  min: 0,
  max: 5000,
  step: 50,
} as const;

/**
 * The backend's closed amenity vocabulary (keys are the slugs it returns on
 * `amenities[].key` and accepts on the `features[]` filter). Keep in sync with
 * AMENITY_ICONS on the unit page and the `amenities` message namespace.
 */
export const AMENITIES_CATALOG = [
  { key: 'wifi', labelAr: 'واي فاي' },
  { key: 'pool', labelAr: 'مسبح' },
  { key: 'kitchen', labelAr: 'مطبخ' },
  { key: 'parking', labelAr: 'موقف سيارات' },
  { key: 'ac', labelAr: 'تكييف' },
  { key: 'garden', labelAr: 'حديقة' },
  { key: 'smart_tv', labelAr: 'تلفزيون ذكي' },
  { key: 'washer', labelAr: 'غسالة ملابس' },
  { key: 'security', labelAr: 'أمن 24 ساعة' },
  { key: 'self_checkin', labelAr: 'دخول ذاتي' },
  { key: 'family_friendly', labelAr: 'مناسب للعائلات' },
  { key: 'bbq', labelAr: 'شواية' },
  { key: 'elevator', labelAr: 'مصعد' },
  { key: 'private_beach', labelAr: 'شاطئ خاص' },
  { key: 'event_hall', labelAr: 'قاعة مناسبات' },
] as const;

export const UNIT_TYPE_LABELS_AR: Record<string, string> = {
  apartment: 'شقة',
  studio: 'استديو',
  villa: 'فيلا',
  all: 'الكل',
};
