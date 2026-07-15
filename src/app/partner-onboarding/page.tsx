'use client';

/**
 * Partner onboarding / sign-up flow (triggered by "سجّل عقارك").
 * Full-screen split layout with three steps: profile form → OTP → success.
 * Register-only: collects the partner application (type + identity), verifies the
 * phone OTP, then submits POST /auth/partner/register. The partner does NOT get a
 * website session — approval + dashboard link arrive by email.
 */
import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { authApi } from '@/lib/api/client';
import { BRAND } from '@/lib/constants/brand';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phone';
import { OnboardingForm, type PartnerType } from '@/components/features/auth/OnboardingForm';
import { OtpVerificationForm } from '@/components/features/auth/OtpVerificationForm';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

type Step = 'form' | 'otp' | 'success';

const HERO_IMAGE = '/onboarding-hero.png';

export default function PartnerOnboardingPage() {
  const t = useTranslations('partnerOnboarding');
  const [step, setStep] = useState<Step>('form');
  const [partnerType, setPartnerType] = useState<PartnerType>('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // local digits, e.g. 5XXXXXXXX
  const [nationalId, setNationalId] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>();

  // Normalised +9665XXXXXXXX, or null when invalid.
  const e164 = normalizeSaudiPhone(phone);
  // Backend-friendly 05XXXXXXXX form.
  const phone05 = e164 ? `0${e164.slice(4)}` : '';

  const handleProfileSubmit = async () => {
    const res = await authApi.requestOtp(phone05);
    setDebugOtp(res.debugOtp);
    setStep('otp');
  };

  const handleVerify = async (code: string) => {
    await authApi.partnerRegister({
      type: partnerType,
      name: name.trim(),
      phone: phone05,
      code,
      email: email.trim(),
      nationalId: partnerType === 'individual' ? nationalId.trim() : undefined,
      crNumber: partnerType === 'company' ? crNumber.trim() : undefined,
    });
    setStep('success');
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
            <LanguageToggle />
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
                partnerType={partnerType}
                name={name}
                email={email}
                phone={phone}
                nationalId={nationalId}
                crNumber={crNumber}
                onPartnerType={setPartnerType}
                onName={setName}
                onEmail={setEmail}
                onPhone={setPhone}
                onNationalId={setNationalId}
                onCrNumber={setCrNumber}
                isPhoneValid={isValidSaudiPhone(phone)}
                onSubmit={handleProfileSubmit}
              />
            )}

            {step === 'otp' && (
              <OtpVerificationForm
                variant="onboarding"
                displayPhone={phone}
                debugOtp={debugOtp}
                onSubmit={handleVerify}
                onResend={() => authApi.resendOtp(phone05)}
              />
            )}

            {step === 'success' && <SuccessPanel />}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-brand-muted">
            {t('agreeTo')}{' '}
            <span className="font-medium text-brand-ink">{t('terms')}</span> {t('and')}{' '}
            <span className="font-medium text-brand-ink">{t('privacyPolicy')}</span>.
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
  const t = useTranslations('partnerOnboarding');
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-primary text-brand-primary">
          <Check className="h-6 w-6" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-brand-ink">{t('successTitle')}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-brand-muted">{t('successBody')}</p>
    </div>
  );
}
