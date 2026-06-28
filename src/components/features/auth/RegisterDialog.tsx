'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/schemas';
import { normalizeSaudiPhone, formatPhoneDisplay } from '@/lib/utils/phone';
import { OtpStep } from './OtpStep';

export function RegisterDialog() {
  const { authDialog, openAuth, closeAuth } = useUiStore();
  const isOpen = authDialog === 'register';
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
  });

  const handleClose = () => {
    closeAuth();
    setStep('form');
    setError(null);
    form.reset();
  };

  const onSubmitForm = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizeSaudiPhone(values.phone)!;
      await authApi.register({ ...values, phone: normalized });
      await authApi.requestOtp(normalized);
      setPhone(normalized);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (code: string) => {
    const { user, accessToken, refreshToken } = await authApi.verifyOtp(phone, code);
    setSession(user, accessToken, refreshToken);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">إنشاء حساب</DialogTitle>
              <DialogDescription className="text-center">
                أنشئ حسابك للبدء في الحجز — التفعيل عبر رمز تحقق برقم جوالك.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input id="firstName" {...form.register('firstName')} />
                  {form.formState.errors.firstName && (
                    <p className="text-xs text-status-danger">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input id="lastName" {...form.register('lastName')} />
                  {form.formState.errors.lastName && (
                    <p className="text-xs text-status-danger">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" dir="ltr" className="text-start" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-xs text-status-danger">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" type="tel" placeholder="05XXXXXXXX" dir="ltr" className="text-start" {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-status-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
              <p className="text-center text-xs text-brand-muted">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="text-brand-primary underline hover:no-underline"
                >
                  تسجيل دخول
                </button>
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <OtpStep
            phone={phone}
            displayPhone={formatPhoneDisplay(phone)}
            onVerify={onVerifyOtp}
            onResend={() => authApi.requestOtp(phone)}
            onBack={() => setStep('form')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
