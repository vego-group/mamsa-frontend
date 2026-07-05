/**
 * Phone validation for Saudi numbers.
 * يقبل صيغ متعددة ويعيد E.164 الموحدة (+966XXXXXXXXX).
 */
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  // 05XXXXXXXX (10 رقم) → +9665XXXXXXXX
  if (digits.length === 10 && digits.startsWith('05')) {
    return `+966${digits.slice(1)}`;
  }
  // 5XXXXXXXX (9 رقم) → +9665XXXXXXXX
  if (digits.length === 9 && digits.startsWith('5')) {
    return `+966${digits}`;
  }
  // 9665XXXXXXXX (12 رقم بدون +)
  if (digits.length === 12 && digits.startsWith('9665')) {
    return `+${digits}`;
  }
  return null;
}

export function isValidSaudiPhone(raw: string): boolean {
  return normalizeSaudiPhone(raw) !== null;
}

/** Backend-friendly local Saudi form: 05XXXXXXXX (or null when invalid). */
export function toSaudiLocal(raw: string): string | null {
  const e164 = normalizeSaudiPhone(raw);
  return e164 ? `0${e164.slice(4)}` : null;
}

/** تنسيق الرقم للعرض: +966 50 *** 4567 (إخفاء جزء للأمان) */
export function maskPhone(e164: string): string {
  if (e164.length < 8) return e164;
  const start = e164.slice(0, 7);
  const end = e164.slice(-4);
  return `${start} *** ${end}`;
}

/** تنسيق الرقم للعرض الكامل */
export function formatPhoneDisplay(e164: string): string {
  if (!e164.startsWith('+966')) return e164;
  const rest = e164.slice(4);
  return `+966 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
}
