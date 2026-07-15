'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { accountApi } from '@/lib/api/client';
import { makeChangePhoneSchema, type ChangePhoneValues } from '@/lib/validation/schemas';
import { formatPhoneDisplay, normalizeSaudiPhone, toSaudiLocal } from '@/lib/utils/phone';
import { OtpVerificationForm } from '@/components/features/auth/OtpVerificationForm';

export default function ChangePhonePage() {
  const t = useTranslations('account.phone');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [newPhone, setNewPhone] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePhoneSchema = useMemo(() => makeChangePhoneSchema(tv), [tv]);
  const form = useForm<ChangePhoneValues>({
    resolver: zodResolver(changePhoneSchema),
    defaultValues: { newPhone: '' },
  });

  const onSubmit = async (values: ChangePhoneValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const e164 = normalizeSaudiPhone(values.newPhone)!;
      // Backend expects the local 05XXXXXXXX form; sends the OTP to the new number.
      const res = await accountApi.changePhone(toSaudiLocal(e164)!);
      setNewPhone(e164); // keep E.164 in state for display/store
      setDebugOtp(res.debugOtp);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (code: string) => {
    await accountApi.verifyChangePhone(toSaudiLocal(newPhone)!, code);
    updateUser({ phone: newPhone });
    setSuccess(true);
    setStep('form');
  };

  if (!user) return <div className="container mx-auto p-10">{tc('loading')}</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary">
        <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" /> {t('backToSettings')}
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-brand-ink">{t('title')}</h1>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          ✓ {t('updateSuccess')}
        </div>
      )}

      {/* Current phone */}
      <Card className="mb-4 space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-brand-primary" />
            <div>
              <div className="text-sm text-brand-muted">{t('currentPhone')}</div>
              <div dir="ltr" className="font-semibold text-brand-ink">{formatPhoneDisplay(user.phone)}</div>
            </div>
          </div>
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" /> {t('verified')}
          </Badge>
        </div>
      </Card>

      {/* Change phone */}
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-brand-ink">{t('changeTitle')}</h2>
        <p className="text-sm text-brand-muted">{t('changeSubtitle')}</p>

        {step === 'form' ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>{t('newPhone')}</Label>
              <PhoneInput
                placeholder="5XXXXXXXX"
                dir="ltr"
                className="text-start"
                {...form.register('newPhone')}
              />
              {form.formState.errors.newPhone && (
                <p className="text-xs text-status-danger">{form.formState.errors.newPhone.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-status-danger">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? t('sending') : t('sendCode')}
            </Button>
          </form>
        ) : (
          <OtpVerificationForm
            displayPhone={formatPhoneDisplay(newPhone)}
            debugOtp={debugOtp}
            onSubmit={onVerify}
            onResend={() => accountApi.changePhone(toSaudiLocal(newPhone)!)}
            onBack={() => setStep('form')}
          />
        )}
      </Card>
    </div>
  );
}
