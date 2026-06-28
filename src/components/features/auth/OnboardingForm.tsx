'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OnboardingFormProps {
  name: string;
  email: string;
  phone: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  isPhoneValid: boolean;
  onSubmit: () => Promise<void>;
  onLogin: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OnboardingForm({
  name,
  email,
  phone,
  onName,
  onEmail,
  onPhone,
  isPhoneValid,
  onSubmit,
  onLogin,
}: OnboardingFormProps) {
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; email?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const nameValid = name.trim().length >= 3;
  const emailValid = EMAIL_RE.test(email.trim());
  const formValid = nameValid && isPhoneValid && emailValid;

  const nameError = touched.name && !nameValid ? 'يجب ألا يقل اسم المستخدم عن 3 أحرف' : null;
  const phoneError =
    serverError ?? (touched.phone && !isPhoneValid ? 'رقم جوال سعودي غير صحيح' : null);
  const emailError = touched.email && !emailValid ? 'بريد إلكتروني غير صالح' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    setServerError(null);
    if (!formValid) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'تعذّر إرسال رمز التحقق، حاول مجددًا.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-ink">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-brand-muted">أنشئ حسابك وابدأ رحلتك كشريك مع ممسي.</p>
      </div>

      {/* Name */}
      <Field label="اسم الكريم" error={nameError}>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="مثال : فهد يحي مجرشي"
          className={inputCls(Boolean(nameError))}
        />
      </Field>

      {/* Phone */}
      <Field label="رقم الجوال" error={phoneError}>
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
            dir="ltr"
            placeholder="رقم الجوال"
            className="h-11 w-full bg-transparent px-4 text-start text-brand-ink placeholder:text-brand-muted focus:outline-none"
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="البريد الالكتروني" error={emailError}>
        <input
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          dir="ltr"
          placeholder="مثال : usear@gmail.com"
          className={cn(inputCls(Boolean(emailError)), 'text-start')}
        />
      </Field>

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
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ارسال رمز التحقق'}
      </button>

      <p className="text-center text-sm text-brand-ink">
        لديك حساب؟{' '}
        <button type="button" onClick={onLogin} className="font-bold text-brand-primary hover:underline">
          تسجيل الدخول
        </button>
      </p>
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
