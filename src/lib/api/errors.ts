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
    /**
     * Laravel's per-field validation errors (the `errors` bag on a 422), kept
     * alongside the flattened `message` so a form can show the failure on the
     * offending input instead of as one generic line.
     */
    public fields?: Record<string, string[]>,
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
  // 409 on availability and booking: the stay ends after the unit's permit.
  // The guest never sees permit data, so the copy speaks of dates only.
  BOOKING_EXCEEDS_PERMIT_VALIDITY: 'هذه الوحدة غير متاحة للتواريخ المختارة. جرّب تواريخ أقرب.',
};

/**
 * The SMS provider failed to send a code (503 SMS_SEND_FAILED). Unlike every
 * other refusal on the send path it costs the guest nothing — no daily quota,
 * no cooldown — so a screen shows the server's own message (it is deliberately
 * not in ERROR_CODE_MESSAGES) and offers an immediate retry, never a countdown.
 */
export function isSmsSendFailure(e: unknown): e is ApiError {
  return e instanceof ApiError && e.code === 'SMS_SEND_FAILED';
}

/**
 * The OTP itself was refused — wrong, expired, or out of attempts. On the phone
 * flows the API answers a wrong code with a validation error on the `code` field
 * (measured on staging, 2026-10-10); the email flow names it with an OTP_* code.
 * Anything else that fails at a code step is not the code's fault, and must not
 * be shown as if it were.
 */
const OTP_CODES = new Set(['OTP_INVALID', 'OTP_EXPIRED', 'OTP_MAX_ATTEMPTS']);

export function isOtpCodeError(e: unknown): e is ApiError {
  return e instanceof ApiError && (Boolean(e.fields?.code?.length) || (e.code != null && OTP_CODES.has(e.code)));
}

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
