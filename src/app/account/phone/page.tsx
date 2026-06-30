'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { accountApi, authApi } from '@/lib/api/client';
import { changePhoneSchema, type ChangePhoneValues } from '@/lib/validation/schemas';
import { formatPhoneDisplay, normalizeSaudiPhone } from '@/lib/utils/phone';
import { OtpStep } from '@/components/features/auth/OtpStep';

export default function ChangePhonePage() {
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ChangePhoneValues>({
    resolver: zodResolver(changePhoneSchema),
    defaultValues: { newPhone: '' },
  });

  const onSubmit = async (values: ChangePhoneValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizeSaudiPhone(values.newPhone)!;
      await accountApi.changePhone(normalized);
      await authApi.requestOtp(normalized);
      setNewPhone(normalized);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (code: string) => {
    await authApi.verifyOtp(newPhone, code);
    updateUser({ phone: newPhone });
    setSuccess(true);
    setStep('form');
  };

  if (!user) return <div className="container mx-auto p-10">جاري التحميل...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary">
        <ArrowRight className="h-4 w-4" /> العودة لإعدادات الحساب
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-brand-ink">رقم الجوال</h1>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          ✓ تم تحديث رقم الجوال بنجاح.
        </div>
      )}

      {/* Current phone */}
      <Card className="mb-4 space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-brand-primary" />
            <div>
              <div className="text-sm text-brand-muted">رقم الجوال الحالي</div>
              <div dir="ltr" className="font-semibold text-brand-ink">{formatPhoneDisplay(user.phone)}</div>
            </div>
          </div>
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" /> موثّق
          </Badge>
        </div>
      </Card>

      {/* Change phone */}
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold text-brand-ink">تغيير رقم الجوال</h2>
        <p className="text-sm text-brand-muted">
          سيتم إرسال رمز تحقق إلى الرقم الجديد لإتمام عملية التغيير.
        </p>

        {step === 'form' ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>رقم الجوال الجديد</Label>
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
              {submitting ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
          </form>
        ) : (
          <OtpStep
            phone={newPhone}
            displayPhone={formatPhoneDisplay(newPhone)}
            onVerify={onVerify}
            onResend={() => authApi.requestOtp(newPhone)}
            onBack={() => setStep('form')}
          />
        )}
      </Card>

      {/* NOTE: NO password section here — منصة OTP-only */}
    </div>
  );
}
