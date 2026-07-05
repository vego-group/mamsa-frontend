'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { OTP_CONFIG } from '@/lib/constants/brand';
import { DebugOtpHint } from './DebugOtpHint';

interface OtpStepProps {
  phone: string;
  displayPhone: string;
  /** Test code from the last dispatch (request/resend), shown via DebugOtpHint. */
  debugOtp?: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<{ debugOtp?: string } | void>;
  onBack: () => void;
}

export function OtpStep({ phone, displayPhone, debugOtp, onVerify, onResend, onBack }: OtpStepProps) {
  const t = useTranslations('auth.otp');
  const [digits, setDigits] = useState<string[]>(Array(OTP_CONFIG.length).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(OTP_CONFIG.resendCooldownSeconds);
  // Seeded from the initial dispatch; refreshed locally whenever the user hits resend.
  const [liveDebugOtp, setLiveDebugOtp] = useState(debugOtp);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    // autofocus first cell
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (i: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < OTP_CONFIG.length - 1) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d) && !submitting) void submit(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_CONFIG.length);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_CONFIG.length).fill('').map((_, idx) => text[idx] ?? '');
    setDigits(next);
    if (next.every((d) => d)) void submit(next.join(''));
  };

  const submit = async (code: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await onVerify(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('wrongCode'));
      setDigits(Array(OTP_CONFIG.length).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    const result = await onResend();
    if (result?.debugOtp) setLiveDebugOtp(result.debugOtp);
    setCooldown(OTP_CONFIG.resendCooldownSeconds);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-semibold text-brand-ink">{t('title')}</h2>
        <p className="text-sm text-brand-muted">
          {t('sentTo')} <span dir="ltr">{displayPhone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2" dir="ltr">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-12 w-12 rounded-xl border border-brand-border bg-white text-center text-lg font-semibold text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-status-danger">{error}</p>}

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={submitting || digits.some((d) => !d)}
        onClick={() => submit(digits.join(''))}
      >
        {submitting ? t('verifying') : t('verify')}
      </Button>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          className="text-brand-muted underline-offset-2 hover:underline"
        >
          {t('changeNumber')}
        </button>
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
