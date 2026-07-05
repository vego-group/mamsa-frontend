'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

export type PartnerType = 'individual' | 'company';

interface OnboardingFormProps {
  partnerType: PartnerType;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  crNumber: string;
  onPartnerType: (v: PartnerType) => void;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onNationalId: (v: string) => void;
  onCrNumber: (v: string) => void;
  isPhoneValid: boolean;
  onSubmit: () => Promise<void>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^\d{10}$/; // Saudi national ID / CR number = 10 digits

export function OnboardingForm({
  partnerType,
  name,
  email,
  phone,
  nationalId,
  crNumber,
  onPartnerType,
  onName,
  onEmail,
  onPhone,
  onNationalId,
  onCrNumber,
  isPhoneValid,
  onSubmit,
}: OnboardingFormProps) {
  const t = useTranslations('partnerOnboarding.form');
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; email?: boolean; id?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isCompany = partnerType === 'company';
  const nameValid = name.trim().length >= 3;
  const emailValid = EMAIL_RE.test(email.trim());
  const idValid = isCompany ? ID_RE.test(crNumber.trim()) : ID_RE.test(nationalId.trim());
  const formValid = nameValid && isPhoneValid && emailValid && idValid;

  const nameError = touched.name && !nameValid ? t('nameTooShort') : null;
  const phoneError =
    serverError ?? (touched.phone && !isPhoneValid ? t('phoneInvalid') : null);
  const emailError = touched.email && !emailValid ? t('emailInvalid') : null;
  const idError =
    touched.id && !idValid
      ? isCompany
        ? t('crInvalid')
        : t('nationalIdInvalid')
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, id: true });
    setServerError(null);
    if (!formValid) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('sendError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-ink">{t('title')}</h1>
        <p className="mt-1 text-sm text-brand-muted">{t('subtitle')}</p>
      </div>

      {/* Partner type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-ink">{t('partnerType')}</label>
        <div className="grid grid-cols-2 gap-2">
          {([['individual', t('individual')], ['company', t('company')]] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onPartnerType(val)}
              className={cn(
                'h-11 rounded-xl border text-sm font-medium transition',
                partnerType === val
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                  : 'border-brand-border text-brand-ink hover:bg-brand-cream/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <Field label={t('name')} error={nameError}>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder={t('namePlaceholder')}
          className={inputCls(Boolean(nameError))}
        />
      </Field>

      {/* Phone */}
      <Field label={t('phone')} error={phoneError}>
        <div
          className={cn(
            'flex items-stretch overflow-hidden rounded-xl border bg-white transition focus-within:ring-2',
            phoneError
              ? 'border-status-danger focus-within:ring-status-danger/20'
              : 'border-brand-border focus-within:border-brand-primary focus-within:ring-brand-primary/20',
          )}
        >
          <span className="flex items-center gap-1.5 border-e border-brand-border bg-brand-cream/60 px-3 text-sm text-brand-ink">
            <span aria-hidden>🇸🇦</span>
            <span dir="ltr">+966</span>
          </span>
          <input
            value={phone}
            onChange={(e) => onPhone(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            inputMode="tel"
            maxLength={10}
            dir="ltr"
            placeholder="5XXXXXXXX"
            className="h-11 w-full bg-transparent px-4 text-start text-brand-ink placeholder:text-brand-muted focus:outline-none"
          />
        </div>
      </Field>

      {/* Email */}
      <Field label={t('email')} error={emailError}>
        <input
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          dir="ltr"
          placeholder={t('emailPlaceholder')}
          className={cn(inputCls(Boolean(emailError)), 'text-start')}
        />
      </Field>

      {/* National ID (individual) or CR number (company) */}
      {isCompany ? (
        <Field label={t('crNumber')} error={idError}>
          <input
            value={crNumber}
            onChange={(e) => onCrNumber(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => setTouched((t) => ({ ...t, id: true }))}
            inputMode="numeric"
            maxLength={10}
            dir="ltr"
            placeholder="7XXXXXXXXX"
            className={cn(inputCls(Boolean(idError)), 'text-start')}
          />
        </Field>
      ) : (
        <Field label={t('nationalId')} error={idError}>
          <input
            value={nationalId}
            onChange={(e) => onNationalId(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => setTouched((t) => ({ ...t, id: true }))}
            inputMode="numeric"
            maxLength={10}
            dir="ltr"
            placeholder="1XXXXXXXXX"
            className={cn(inputCls(Boolean(idError)), 'text-start')}
          />
        </Field>
      )}

      <button
        type="submit"
        disabled={!formValid || submitting}
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition',
          formValid && !submitting
            ? 'bg-brand-primary text-white hover:bg-brand-primaryDark'
            : 'cursor-not-allowed bg-brand-border/70 text-white',
        )}
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('sendCode')}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={cn('text-sm font-medium', error ? 'text-status-danger' : 'text-brand-ink')}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return cn(
    'h-11 w-full rounded-xl border bg-white px-4 text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2',
    hasError
      ? 'border-status-danger focus:ring-status-danger/20'
      : 'border-brand-border focus:border-brand-primary focus:ring-brand-primary/20',
  );
}
