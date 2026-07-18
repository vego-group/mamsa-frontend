'use client';

/**
 * EmailVerificationCard — single source of truth for the email-verification
 * flow, used both at checkout (gates payment) and in account settings.
 *
 * Email is a verified *contact channel* only — it never affects login, which
 * stays phone-OTP. This component never branches on mock vs real; it just
 * calls accountApi and reacts to ApiError codes.
 */
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OtpVerificationForm } from '@/components/features/auth/OtpVerificationForm';
import { accountApi } from '@/lib/api/client';
import { ERROR_CODE_MESSAGES, resolveErrorMessage } from '@/lib/api/errors';
import { showToast } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { isValidEmail } from '@/lib/utils/email';
import { cn } from '@/lib/utils/cn';

const RESEND_COOLDOWN_SECONDS = 60;

type Step = 'idle' | 'form' | 'otp' | 'verified';

export interface EmailVerificationCardHandle {
  /** Forces the card back to the email-entry step and scrolls it into view — recovers from a stale EMAIL_VERIFICATION_REQUIRED response. */
  reopen: () => void;
}

interface EmailVerificationCardProps {
  /** Where the card is mounted — drives which collapsed states are reachable and button copy. */
  context: 'checkout' | 'settings';
  className?: string;
}

export const EmailVerificationCard = forwardRef<EmailVerificationCardHandle, EmailVerificationCardProps>(
  function EmailVerificationCard({ context, className }, ref) {
    const t = useTranslations('emailVerification');
    const { user, updateUser } = useAuthStore();
    const rootRef = useRef<HTMLDivElement>(null);
    // Captured once — distinguishes "already verified before this page loaded"
    // (checkout must render nothing at all, A5) from "just verified in this
    // session" (checkout still shows a brief confirmation row, A1 State 3).
    const [wasVerifiedOnMount] = useState(() => user?.emailVerified === true);
    const [step, setStep] = useState<Step>(() =>
      user?.emailVerified ? 'verified' : context === 'settings' && user?.email ? 'idle' : 'form',
    );
    const [emailInput, setEmailInput] = useState(user?.email ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reopen: () => {
        setStep('form');
        setEmailInput(user?.email ?? '');
        setError(null);
        requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      },
    }));

    const handleSend = async () => {
      const trimmed = emailInput.trim();
      if (!isValidEmail(trimmed)) {
        setError(ERROR_CODE_MESSAGES.EMAIL_INVALID ?? t('genericError'));
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        await accountApi.requestEmailVerification(trimmed);
        setEmailInput(trimmed);
        setStep('otp');
      } catch (e) {
        setError(resolveErrorMessage(e, t('genericError')));
      } finally {
        setSubmitting(false);
      }
    };

    const handleSendExisting = async () => {
      if (!user?.email) return;
      setSubmitting(true);
      try {
        await accountApi.requestEmailVerification(user.email);
        setEmailInput(user.email);
        setStep('otp');
      } catch (e) {
        showToast(resolveErrorMessage(e, t('genericError')));
      } finally {
        setSubmitting(false);
      }
    };

    const handleVerify = async (code: string) => {
      try {
        const res = await accountApi.verifyEmail(code);
        updateUser({ email: res.email, emailVerified: true });
        setStep('verified');
      } catch (e) {
        throw new Error(resolveErrorMessage(e, t('genericError')));
      }
    };

    const handleResend = async () => {
      try {
        await accountApi.resendEmailVerification();
      } catch (e) {
        showToast(resolveErrorMessage(e, t('genericError')));
      }
      return {};
    };

    const startEdit = () => {
      setStep('form');
      setEmailInput(user?.email ?? '');
      setError(null);
    };

    if (step === 'idle') {
      return (
        <Card ref={rootRef} className={cn('flex flex-wrap items-center justify-between gap-3 p-6', className)}>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-brand-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-ink">{t('title')}</span>
                <Badge variant="warning">{t('unverifiedBadge')}</Badge>
              </div>
              <div className="text-sm text-brand-muted" dir="ltr">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSendExisting} disabled={submitting}>
              {submitting ? t('sending') : t('sendCodeIdle')}
            </Button>
            <Button size="sm" variant="outline" onClick={startEdit}>
              {t('edit')}
            </Button>
          </div>
        </Card>
      );
    }

    if (step === 'form') {
      const isFirstTimeSave = context === 'settings' && !user?.email;
      return (
        <Card ref={rootRef} className={cn('space-y-3 p-6', className)}>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-brand-primary" />
            <h2 className="font-bold text-brand-ink">{t('title')}</h2>
          </div>
          <div className="space-y-2">
            <Label>{t('emailLabel')}</Label>
            <Input
              type="email"
              dir="ltr"
              className="text-start"
              placeholder="name@mamsaa.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <p className="text-xs text-brand-muted">{t('helper')}</p>
          </div>
          {error && <p className="text-sm text-status-danger">{error}</p>}
          <Button onClick={handleSend} disabled={submitting}>
            {submitting ? t('sending') : isFirstTimeSave ? t('saveAndSend') : t('sendCode')}
          </Button>
        </Card>
      );
    }

    if (step === 'otp') {
      return (
        <Card ref={rootRef} className={cn('p-6', className)}>
          <OtpVerificationForm
            displayPhone={emailInput}
            onSubmit={handleVerify}
            onResend={handleResend}
            onBack={() => setStep('form')}
            backLabel={t('changeEmail')}
            title={t('otpTitle')}
            description={
              <>
                {t('otpSubtitlePrefix')} <span dir="ltr">{emailInput}</span>
              </>
            }
            cooldownSeconds={RESEND_COOLDOWN_SECONDS}
            resendCooldownText={(seconds) => t('resendIn', { seconds })}
          />
        </Card>
      );
    }

    // step === 'verified'
    if (context === 'checkout') {
      if (wasVerifiedOnMount) return null; // A5: verified users see zero email UI at checkout
      return (
        <div
          ref={rootRef}
          className={cn(
            'flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800',
            className,
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span dir="ltr">{user?.email}</span>
          <span>✓ {t('verifiedBadge')}</span>
        </div>
      );
    }

    return (
      <Card ref={rootRef} className={cn('flex items-center justify-between gap-3 p-6', className)}>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-brand-primary" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-ink">{t('title')}</span>
              <Badge variant="success">{t('verifiedBadge')}</Badge>
            </div>
            <div className="text-sm text-brand-muted" dir="ltr">{user?.email}</div>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={startEdit}>
          {t('edit')}
        </Button>
      </Card>
    );
  },
);
