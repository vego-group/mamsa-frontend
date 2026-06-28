'use client';

/**
 * Partner onboarding / sign-up flow (triggered by "إدراج عقار").
 * Full-screen split layout with three steps: profile form → OTP → success.
 * Wired to the real auth API (request-otp → verify-otp → complete-profile).
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Check } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { BRAND, OTP_CONFIG } from '@/lib/constants/brand';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phone';
import { OnboardingForm } from '@/components/features/auth/OnboardingForm';
import { OnboardingOtp } from '@/components/features/auth/OnboardingOtp';

type Step = 'form' | 'otp' | 'success';

const HERO_IMAGE = '/onboarding-hero.png';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const updateUser = useAuthStore((s) => s.updateUser);
  const openAuth = useUiStore((s) => s.openAuth);

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // local digits, e.g. 5XXXXXXXX

  // Normalised +9665XXXXXXXX, or null when invalid.
  const e164 = normalizeSaudiPhone(phone);
  // Backend-friendly 05XXXXXXXX form.
  const phone05 = e164 ? `0${e164.slice(4)}` : '';

  const goToLogin = () => {
    router.push('/');
    openAuth('login');
  };

  const handleProfileSubmit = async () => {
    await authApi.requestOtp(phone05);
    setStep('otp');
  };

  const handleVerify = async (code: string) => {
    const { user, accessToken, refreshToken } = await authApi.verifyOtp(phone05, code);
    setSession(user, accessToken, refreshToken);
    try {
      const updated = await authApi.completeProfile({ name: name.trim(), email: email.trim() });
      updateUser(updated);
    } catch {
      // Profile completion is best-effort; the session is already established.
    }
    setStep('success');
    setTimeout(() => router.push('/'), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-brand-primary p-3 md:p-6"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl md:min-h-[calc(100vh-3rem)]">
        {/* Right content panel (RTL-first) */}
        <section className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/50"
            >
              EN
            </button>
            <Image
              src="/Mamsa_logo.png"
              alt={BRAND.nameEn}
              width={668}
              height={375}
              className="h-10 w-auto"
            />
          </div>

          {/* Step content */}
          <div className="flex flex-1 flex-col justify-center py-8">
            {step === 'form' && (
              <OnboardingForm
                name={name}
                email={email}
                phone={phone}
                onName={setName}
                onEmail={setEmail}
                onPhone={setPhone}
                isPhoneValid={isValidSaudiPhone(phone)}
                onSubmit={handleProfileSubmit}
                onLogin={goToLogin}
              />
            )}

            {step === 'otp' && (
              <OnboardingOtp
                length={OTP_CONFIG.length}
                displayPhone={phone}
                resendCooldown={OTP_CONFIG.resendCooldownSeconds}
                onVerify={handleVerify}
                onResend={() => authApi.resendOtp(phone05)}
              />
            )}

            {step === 'success' && <SuccessPanel />}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-brand-muted">
            بالمتابعة، فإنك توافق على{' '}
            <span className="font-medium text-brand-ink">الشروط</span> و{' '}
            <span className="font-medium text-brand-ink">سياسة الخصوصية</span>.
          </p>
        </section>

        {/* Left brand panel */}
        <aside className="relative hidden w-1/2 lg:block">
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" />
        </aside>
      </div>
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-primary text-brand-primary">
          <Check className="h-6 w-6" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-brand-ink">تم التحقق بنجاح!</h2>
      <p className="flex items-center gap-2 text-sm text-brand-muted">
        تم انشاء حسابك بنجاح <Loader2 className="h-4 w-4 animate-spin" />
      </p>
    </div>
  );
}
