'use client';

import { useEffect, useMemo, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { authApi, ApiError } from '@/lib/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { makeRegisterSchema, type RegisterFormValues } from '@/lib/validation/schemas';
import { normalizeSaudiPhone, formatPhoneDisplay, toSaudiLocal } from '@/lib/utils/phone';
import { OtpStep } from './OtpStep';

export function RegisterDialog() {
  const t = useTranslations('auth.register');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const { authDialog, openAuth, closeAuth, prefillPhone } = useUiStore();
  const isOpen = authDialog === 'register';
  const [step, setStep] = useState<'form' | 'otp' | 'already-registered'>('form');
  const [phone, setPhone] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const setSession = useAuthStore((s) => s.setSession);
  const updateUser = useAuthStore((s) => s.updateUser);
  const registerSchema = useMemo(() => makeRegisterSchema(tv), [tv]);

  // Live resend cooldown — ticks down one second at a time.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  // Prefill the phone when bounced over from the login dialog with a known number.
  useEffect(() => {
    if (isOpen && prefillPhone) form.setValue('phone', prefillPhone);
  }, [isOpen, prefillPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    closeAuth();
    setStep('form');
    setError(null);
    setCooldown(0);
    setDebugOtp(undefined);
    form.reset();
  };

  const onSubmitForm = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    const normalized = normalizeSaudiPhone(values.phone)!;
    try {
      // register() sends intent="register" — the backend rejects phones that
      // already have a completed profile, before sending any OTP.
      const res = await authApi.register({ ...values, phone: toSaudiLocal(normalized)! });
      setPhone(normalized); // E.164 for display
      setDebugOtp(res.debugOtp);
      setStep('otp');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PHONE_ALREADY_REGISTERED') {
        setPhone(normalized);
        setStep('already-registered');
        return;
      }
      const msg = e instanceof Error ? e.message : t('genericError');
      const secs = Number(msg.match(/(\d+)\s*(?:ثانية|seconds?)/)?.[1] ?? 0);
      if (secs > 0) setCooldown(secs);
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    // Local 9-digit form (matches what PhoneInput expects) so the field arrives prefilled.
    const local = phone.startsWith('+966') ? phone.slice(4) : phone;
    closeAuth();
    openAuth('login', local);
  };

  const onVerifyOtp = async (code: string) => {
    const values = form.getValues();
    const { user, accessToken, refreshToken } = await authApi.verifyOtp(toSaudiLocal(phone)!, code);
    setSession(user, accessToken, refreshToken);
    // Persist the name/email collected on the form (backend only took the phone at request-otp).
    try {
      const updated = await authApi.completeProfile({
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
      });
      updateUser(updated);
    } catch {
      // Best-effort — the session is already established.
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t('title')}</DialogTitle>
              <DialogDescription className="text-center">{t('subtitle')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('firstName')}</Label>
                  <Input id="firstName" {...form.register('firstName')} />
                  {form.formState.errors.firstName && (
                    <p className="text-xs text-status-danger">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('lastName')}</Label>
                  <Input id="lastName" {...form.register('lastName')} />
                  {form.formState.errors.lastName && (
                    <p className="text-xs text-status-danger">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" dir="ltr" className="text-start" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-xs text-status-danger">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
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
                {t('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="text-brand-primary underline hover:no-underline"
                >
                  {t('login')}
                </button>
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <OtpStep
            phone={phone}
            displayPhone={formatPhoneDisplay(phone)}
            debugOtp={debugOtp}
            onVerify={onVerifyOtp}
            onResend={() => authApi.resendOtp(toSaudiLocal(phone)!, 'register')}
            onBack={() => setStep('form')}
          />
        )}

        {step === 'already-registered' && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-ink">{t('alreadyRegisteredTitle')}</h2>
              <p className="mt-1 text-sm text-brand-muted">{t('alreadyRegisteredBody')}</p>
            </div>
            <Button size="lg" className="w-full" onClick={goToLogin}>
              {t('login')}
            </Button>
            <button
              type="button"
              onClick={() => setStep('form')}
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
