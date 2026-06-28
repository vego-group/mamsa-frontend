import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CURRENCY, DATE_FORMAT } from '@/lib/constants/brand';

/**
 * صياغة المبلغ بالريال السعودي.
 * استخدام الأرقام اللاتينية (الغربية) كقرار تصميمي معتمد لتسهيل القراءة على الموبايل.
 */
export function formatSAR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return `${formatted} ${CURRENCY.symbolAr}`;
}

export function formatSARShort(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount));
  return `${formatted} ${CURRENCY.symbolAr}`;
}

/** تنسيق تاريخ ISO إلى DD/MM/YYYY ميلادي */
export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), DATE_FORMAT.display);
  } catch {
    return iso;
  }
}

/** تنسيق تاريخ مع اسم الشهر بالعربي (ميلادي): "10 يوليو 2026" */
export function formatDateLong(iso: string): string {
  try {
    return format(parseISO(iso), DATE_FORMAT.displayLong, { locale: ar });
  } catch {
    return iso;
  }
}

/** "from - to" range, gregorian */
export function formatDateRange(startISO: string, endISO: string): string {
  return `${formatDate(startISO)} → ${formatDate(endISO)}`;
}

/** أرقام مع فواصل الآلاف */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** عدد ليالٍ بين تاريخين (شامل تاريخ الدخول، غير شامل المغادرة) */
export function diffNights(startISO: string, endISO: string): number {
  const start = parseISO(startISO).getTime();
  const end = parseISO(endISO).getTime();
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}
