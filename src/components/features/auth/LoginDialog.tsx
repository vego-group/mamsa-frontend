'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { authApi, ApiError } from '@/lib/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { makeLoginSchema, type LoginFormValues } from '@/lib/validation/schemas';
import { normalizeSaudiPhone, formatPhoneDisplay, toSaudiLocal } from '@/lib/utils/phone';
import { OtpVerificationForm } from './OtpVerificationForm';

export function LoginDialog() {
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const { authDialog, openAuth, closeAuth, prefillPhone } = useUiStore();
  const isOpen = authDialog === 'login';
  const [step, setStep] = useState<'phone' | 'otp' | 'not-registered'>('phone');
  const [phone, setPhone] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const setSession = useAuthStore((s) => s.setSession);
  const loginSchema = useMemo(() => makeLoginSchema(tv), [tv]);

  // Live resend cooldown — ticks down one second at a time.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  // Prefill the phone when bounced over from the register dialog with a known number.
  useEffect(() => {
    if (isOpen && prefillPhone) form.setValue('phone', prefillPhone);
  }, [isOpen, prefillPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    closeAuth();
    setStep('phone');
    setError(null);
    setCooldown(0);
    setDebugOtp(undefined);
    form.reset();
  };

  const onSubmitPhone = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);
    const normalized = normalizeSaudiPhone(values.phone)!;
    try {
      // intent="login": the backend rejects unregistered numbers here, before
      // sending any OTP or creating a user row.
      const res = await authApi.requestOtp(toSaudiLocal(normalized)!, 'login');
      setPhone(normalized); // E.164 for display
      setDebugOtp(res.debugOtp);
      setStep('otp');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PHONE_NOT_REGISTERED') {
        setPhone(normalized);
        setStep('not-registered');
        return;
      }
      const msg = e instanceof Error ? e.message : t('genericError');
      // If the backend asks to wait N seconds, run a live countdown instead of static text.
      const secs = Number(msg.match(/(\d+)\s*(?:ثانية|seconds?)/)?.[1] ?? 0);
      if (secs > 0) setCooldown(secs);
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (code: string) => {
    const { user, accessToken, refreshToken, needsProfile } = await authApi.verifyOtp(toSaudiLocal(phone)!, code);
    // Belt-and-braces: intent="login" already rejects unregistered numbers up
    // front, but if the account still comes back incomplete for any reason,
    // don't silently start a session — send the person to sign up instead.
    if (needsProfile) {
      setStep('not-registered');
      return;
    }
    setSession(user, accessToken, refreshToken);
    handleClose();
  };

  const goToRegister = () => {
    // Local 9-digit form (matches what PhoneInput expects) so the field arrives prefilled.
    const local = phone.startsWith('+966') ? phone.slice(4) : phone;
    closeAuth();
    openAuth('register', local);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        {step === 'phone' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t('title')}</DialogTitle>
              <DialogDescription className="text-center">{t('subtitle')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmitPhone)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneLabel')}</Label>
                <PhoneInput
                  id="phone"
                  placeholder="5XXXXXXXX"
                  dir="ltr"
                  className="text-start"
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-status-danger">{error}</p>}
              {cooldown > 0 && (
                <p className="text-sm text-status-danger">{t('waitCooldown', { seconds: cooldown })}</p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={submitting || cooldown > 0}>
                {cooldown > 0
                  ? t('resendIn', { seconds: cooldown })
                  : submitting
                  ? tc('loading')
                  : t('sendCode')}
              </Button>
              <p className="text-center text-xs text-brand-muted">
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="text-brand-primary underline hover:no-underline"
                >
                  {t('createAccount')}
                </button>
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <OtpVerificationForm
            displayPhone={formatPhoneDisplay(phone)}
            debugOtp={debugOtp}
            onSubmit={onVerifyOtp}
            onResend={() => authApi.resendOtp(toSaudiLocal(phone)!, 'login')}
            onBack={() => setStep('phone')}
          />
        )}

        {step === 'not-registered' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-ink">{t('notRegisteredTitle')}</h2>
              <p className="mt-1 text-sm text-brand-muted">{t('notRegisteredBody')}</p>
            </div>
            <Button size="lg" className="w-full" onClick={goToRegister}>
              {t('createNewAccount')}
            </Button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-brand-muted underline-offset-2 hover:underline"
            >
              {t('tryAnotherNumber')}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
