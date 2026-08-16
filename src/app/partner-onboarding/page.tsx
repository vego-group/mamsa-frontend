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
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError, authApi } from '@/lib/api/client';
import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phone';
import { OnboardingForm, type PartnerType } from '@/components/features/auth/OnboardingForm';
import { OtpVerificationForm } from '@/components/features/auth/OtpVerificationForm';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

type Step = 'form' | 'otp' | 'success';

const STEP_ORDER: Step[] = ['form', 'otp', 'success'];

const HERO_IMAGE = '/onboarding-hero.png';

export default function PartnerOnboardingPage() {
  const t = useTranslations('partnerOnboarding');
  const [step, setStep] = useState<Step>('form');
  const [partnerType, setPartnerType] = useState<PartnerType>('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // local digits, e.g. 5XXXXXXXX
  const [nationalId, setNationalId] = useState('');
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdFileError, setNationalIdFileError] = useState<string | null>(null);
  const [crNumber, setCrNumber] = useState('');
  const [crFile, setCrFile] = useState<File | null>(null);
  const [crFileError, setCrFileError] = useState<string | null>(null);
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
    try {
      await authApi.partnerRegister({
        type: partnerType,
        name: name.trim(),
        phone: phone05,
        code,
        email: email.trim(),
        nationalId: partnerType === 'individual' ? nationalId.trim() : undefined,
        crNumber: partnerType === 'company' ? crNumber.trim() : undefined,
        nationalIdFile: partnerType === 'individual' ? nationalIdFile : undefined,
        crFile: partnerType === 'company' ? crFile : undefined,
      });
    } catch (e) {
      // A 422 on a document can't be answered from the OTP step — send the user
      // back to the form with the complaint on the file input itself.
      const fields = e instanceof ApiError ? e.fields : undefined;
      const idFileError = fields?.national_id_file?.[0];
      const crFileErrorMessage = fields?.cr_file?.[0];
      if (idFileError || crFileErrorMessage) {
        setNationalIdFileError(idFileError ?? null);
        setCrFileError(crFileErrorMessage ?? null);
        setStep('form');
        return;
      }
      throw e;
    }
    setStep('success');
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-brand-primary sm:p-5 md:p-6"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl overflow-hidden bg-white shadow-2xl sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[28px] md:min-h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] lg:min-h-0">
        {/* Right content panel (RTL-first) */}
        <section className="flex min-h-0 w-full min-w-0 flex-col lg:w-[55%]">
          {/* Top bar — brand at the start, language at the end */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-border/70 px-5 py-3.5 sm:px-8">
            <Image
              src="/Mamsa_logo.png"
              alt={BRAND.nameEn}
              width={668}
              height={375}
              className="h-9 w-auto"
              priority
            />
            <LanguageToggle className="h-9" />
          </header>

          {/* Step content — the only part that scrolls, so the hero never moves */}
          <div className="flex min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            {/* `m-auto` rather than justify-center: auto margins centre the step
                without clipping its top edge once it outgrows the panel. */}
            <div className="m-auto w-full max-w-[26rem]">
              <StepBar step={step} />

              {step === 'form' && (
                <OnboardingForm
                  partnerType={partnerType}
                  name={name}
                  email={email}
                  phone={phone}
                  nationalId={nationalId}
                  crNumber={crNumber}
                  nationalIdFile={nationalIdFile}
                  crFile={crFile}
                  onPartnerType={setPartnerType}
                  onName={setName}
                  onEmail={setEmail}
                  onPhone={setPhone}
                  onNationalId={setNationalId}
                  onCrNumber={setCrNumber}
                  onNationalIdFile={(file) => {
                    setNationalIdFile(file);
                    setNationalIdFileError(null);
                  }}
                  onCrFile={(file) => {
                    setCrFile(file);
                    setCrFileError(null);
                  }}
                  nationalIdFileServerError={nationalIdFileError}
                  crFileServerError={crFileError}
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
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-brand-border/70 px-5 py-3 sm:px-8">
            <p className="text-center text-xs leading-relaxed text-brand-muted">
              {t('agreeTo')}{' '}
              <Link href="/policies/terms" className="font-medium text-brand-ink underline-offset-2 hover:text-brand-primary hover:underline">
                {t('terms')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/policies/privacy" className="font-medium text-brand-ink underline-offset-2 hover:text-brand-primary hover:underline">
                {t('privacyPolicy')}
              </Link>.
            </p>
          </footer>
        </section>

        {/* Left brand panel */}
        <aside className="relative hidden lg:block lg:w-[45%]">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="45vw" className="object-cover" />
          {/* Keeps the card edge from cutting the render flat against the white panel. */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/35 via-transparent to-brand-ink/15" />
        </aside>
      </div>
    </div>
  );
}

/** Three-dot progress rail — the flow spans three screens, so it says where you are. */
function StepBar({ step }: { step: Step }) {
  const t = useTranslations('partnerOnboarding.steps');
  const labels = [t('details'), t('verify'), t('done')];
  const current = STEP_ORDER.indexOf(step);

  return (
    <ol className="mb-5 flex items-center gap-2">
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition',
                done
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : active
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-brand-border bg-white text-brand-muted',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                'whitespace-nowrap text-xs transition',
                done || active ? 'font-semibold text-brand-ink' : 'text-brand-muted',
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 && (
              <span className={cn('h-px flex-1 transition', done ? 'bg-brand-primary' : 'bg-brand-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SuccessPanel() {
  const t = useTranslations('partnerOnboarding');
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
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
