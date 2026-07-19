/**
 * Shared API error type + Arabic copy for machine-readable error codes.
 * Lives outside client.ts/mock/ so both can import it without a circular dependency.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Machine-readable error code (e.g. "PHONE_NOT_REGISTERED") — prefer this over matching `message` text. */
    public code?: string,
    /** Seconds until the caller may retry — only set for RATE_LIMITED. */
    public retryAfter?: number,
    /** Wrong-code attempts left before the code is killed — only set for OTP_INVALID. */
    public remainingAttempts?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Arabic copy keyed by error code, kept separate from whatever `message` text
 * a given backend response happens to carry — this way the email-verification
 * flow (checkout gate + account settings) shows identical, exact wording
 * whether it's talking to the mock layer or the real API.
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  EMAIL_INVALID: 'البريد الإلكتروني غير صحيح',
  EMAIL_ALREADY_IN_USE: 'هذا البريد مستخدم في حساب آخر',
  OTP_INVALID: 'رمز التحقق غير صحيح',
  OTP_EXPIRED: 'انتهت صلاحية الرمز، أعد الإرسال',
  OTP_MAX_ATTEMPTS: 'تجاوزت عدد المحاولات، أعد إرسال رمز جديد',
  EMAIL_VERIFICATION_REQUIRED: 'مطلوب توثيق البريد الإلكتروني قبل إتمام الحجز',
};

/** Resolves a caught error to Arabic display text, preferring the code-based lookup over raw `message`. */
export function resolveErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError && e.code) {
    if (e.code === 'RATE_LIMITED') return `حاول مرة أخرى بعد ${e.retryAfter ?? 60} ثانية`;
    if (e.code === 'OTP_INVALID' && e.remainingAttempts != null) {
      return `الرمز غير صحيح، متبقي ${e.remainingAttempts} محاولات`;
    }
    const known = ERROR_CODE_MESSAGES[e.code];
    if (known) return known;
  }
  return e instanceof Error ? e.message : fallback;
}
