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
import { loginSchema, type LoginFormValues } from '@/lib/validation/schemas';
import { normalizeSaudiPhone, formatPhoneDisplay } from '@/lib/utils/phone';
import { OtpStep } from './OtpStep';

export function LoginDialog() {
  const { authDialog, openAuth, closeAuth } = useUiStore();
  const isOpen = authDialog === 'login';
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const handleClose = () => {
    closeAuth();
    setStep('phone');
    setError(null);
    form.reset();
  };

  const onSubmitPhone = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizeSaudiPhone(values.phone)!;
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
      <DialogContent>
        {step === 'phone' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">تسجيل الدخول</DialogTitle>
              <DialogDescription className="text-center">
                أدخل رقم جوالك وسنرسل لك رمز تحقق (OTP).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmitPhone)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className="text-start"
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-status-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'جاري الإرسال...' : 'إرسال الرمز'}
              </Button>
              <p className="text-center text-xs text-brand-muted">
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="text-brand-primary underline hover:no-underline"
                >
                  إنشاء حساب
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
            onBack={() => setStep('phone')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
