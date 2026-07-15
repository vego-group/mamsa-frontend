'use client';

/**
 * OtpVerificationForm — THE single OTP entry component.
 *
 * Replaces the former OtpStep (login/register dialogs, change-phone page) and
 * OnboardingOtp (partner sign-up). The verification logic — digit boxes,
 * paste handling, auto-submit on completion, resend cooldown, live debug-OTP
 * hint — is identical everywhere; only the visual skin differs, selected via
 * `variant`:
 *
 *  - "dialog"      square boxes, Button submit, back-link + resend row,
 *                  shows the server's error message on failure.
 *  - "onboarding"  round boxes that turn red on error, pill submit button
 *                  with spinner, "didn't receive?" resend line, generic
 *                  wrong-code error.
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { OTP_CONFIG } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';
import { DebugOtpHint } from './DebugOtpHint';

interface OtpVerificationFormProps {
  /** Phone shown in the prompt (already formatted for display). */
  displayPhone: string;
  /** Test code from the last dispatch (request/resend), shown via DebugOtpHint. */
  debugOtp?: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<{ debugOtp?: string } | void>;
  /** Renders the "change number" link (dialog variant only). */
  onBack?: () => void;
  /** Visual skin — see file header. Defaults to "dialog". */
  variant?: 'dialog' | 'onboarding';
  /** Number of digit boxes. Defaults to OTP_CONFIG.length. */
  length?: number;
  /** Resend cooldown in seconds. Defaults to OTP_CONFIG.resendCooldownSeconds. */
  cooldownSeconds?: number;
  /** Override the default (per-variant) heading. */
  title?: string;
  /** Override the default (per-variant) description line. */
  description?: React.ReactNode;
}

export function OtpVerificationForm({
  displayPhone,
  debugOtp,
  onSubmit,
  onResend,
  onBack,
  variant = 'dialog',
  length = OTP_CONFIG.length,
  cooldownSeconds = OTP_CONFIG.resendCooldownSeconds,
  title,
  description,
}: OtpVerificationFormProps) {
  const t = useTranslations(variant === 'onboarding' ? 'auth.onboardingOtp' : 'auth.otp');
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(cooldownSeconds);
  // Seeded from the initial dispatch; refreshed locally whenever the user hits resend.
  const [liveDebugOtp, setLiveDebugOtp] = useState(debugOtp);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // autofocus first cell
    inputsRef.current[0]?.focus();
  }, []);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async (code: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(code);
    } catch (e) {
      // Dialog flows surface the server's message; onboarding keeps it generic.
      setError(variant === 'dialog' && e instanceof Error ? e.message : t('wrongCode'));
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
    const result = await onResend();
    if (result?.debugOtp) setLiveDebugOtp(result.debugOtp);
    setCooldown(cooldownSeconds);
    setError(null);
  };

  const complete = digits.every((d) => d);

  const boxes = (
    <div className={cn('flex justify-center', variant === 'onboarding' ? 'gap-3' : 'gap-2')} dir="ltr">
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
          className={
            variant === 'onboarding'
              ? cn(
                  'h-14 w-14 rounded-full border text-center text-lg font-semibold text-brand-ink transition focus:outline-none focus:ring-2',
                  error
                    ? 'border-status-danger text-status-danger focus:ring-status-danger/20'
                    : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/20',
                )
              : 'h-12 w-12 rounded-xl border border-brand-border bg-white text-center text-lg font-semibold text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
          }
        />
      ))}
    </div>
  );

  if (variant === 'onboarding') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-brand-ink">{title ?? t('title')}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">
            {description ?? (
              <>
                {t('body')} <span dir="ltr">{displayPhone}</span>. {t('bodyContinued')}
              </>
            )}
          </p>
        </div>

        {boxes}

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
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('verifyNow')}
        </button>

        <p className="text-center text-sm text-brand-ink">
          {t('didNotReceive')}{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="font-bold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:text-brand-muted disabled:no-underline"
          >
            {cooldown > 0 ? t('resendWithCooldown', { seconds: cooldown }) : t('resend')}
          </button>
        </p>

        <DebugOtpHint code={liveDebugOtp} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-semibold text-brand-ink">{title ?? t('title')}</h2>
        <p className="text-sm text-brand-muted">
          {description ?? (
            <>
              {t('sentTo')} <span dir="ltr">{displayPhone}</span>
            </>
          )}
        </p>
      </div>

      {boxes}

      {error && <p className="text-center text-sm text-status-danger">{error}</p>}

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={submitting || !complete}
        onClick={() => submit(digits.join(''))}
      >
        {submitting ? t('verifying') : t('verify')}
      </Button>

      <div className="flex items-center justify-between text-xs">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-brand-muted underline-offset-2 hover:underline"
          >
            {t('changeNumber')}
          </button>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-brand-primary disabled:cursor-not-allowed disabled:text-brand-muted"
        >
          {cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resend')}
        </button>
      </div>

      <DebugOtpHint code={liveDebugOtp} />
    </div>
  );
}
