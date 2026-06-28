'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingOtpProps {
  length: number;
  /** Local phone digits shown in the prompt. */
  displayPhone: string;
  resendCooldown: number;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<unknown>;
}

export function OnboardingOtp({
  length,
  displayPhone,
  resendCooldown,
  onVerify,
  onResend,
}: OnboardingOtpProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(resendCooldown);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (code: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await onVerify(code);
    } catch {
      setError('رمز التحقق غير صحيح');
      setDigits(Array(length).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (i: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < length - 1) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d) && !submitting) void submit(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length)
      .fill('')
      .map((_, idx) => text[idx] ?? '');
    setDigits(next);
    if (next.every((d) => d)) void submit(next.join(''));
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await onResend();
    setCooldown(resendCooldown);
    setError(null);
  };

  const complete = digits.every((d) => d);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-brand-ink">تحقق من هاتفك ، ارسلنا رمز التحقق</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">
          تحقق من هاتفك أرسلنا رمز التحقق إلى <span dir="ltr">{displayPhone}</span>. أدخل الرمز
          بالأسفل لإكمال عملية التسجيل.
        </p>
      </div>

      <div className="flex justify-center gap-3" dir="ltr">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              'h-14 w-14 rounded-full border text-center text-lg font-semibold text-brand-ink transition focus:outline-none focus:ring-2',
              error
                ? 'border-status-danger text-status-danger focus:ring-status-danger/20'
                : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/20',
            )}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-status-danger">{error}</p>}

      <button
        type="button"
        disabled={!complete || submitting}
        onClick={() => submit(digits.join(''))}
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition',
          complete && !submitting
            ? 'bg-brand-primary text-white hover:bg-brand-primaryDark'
            : 'cursor-not-allowed bg-brand-border/70 text-white',
        )}
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'التحقق الان'}
      </button>

      <p className="text-center text-sm text-brand-ink">
        لم تستلم الرمز ؟{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-bold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:text-brand-muted disabled:no-underline"
        >
          {cooldown > 0 ? `اعاده ارسال الرمز (${cooldown})` : 'اعاده ارسال الرمز'}
        </button>
      </p>
    </div>
  );
}
