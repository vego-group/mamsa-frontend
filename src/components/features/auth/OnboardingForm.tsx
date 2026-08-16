'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
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
  /** Identity scan — individuals only; the API rejects the sign-up without it. */
  nationalIdFile: File | null;
  /**
   * Commercial-registration scan — companies only. Optional for now: the backend
   * accepts a company sign-up without it until `DASHBOARD_REQUIRE_CR_FILE` is
   * flipped on, so it must not block submit.
   */
  crFile: File | null;
  onPartnerType: (v: PartnerType) => void;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onNationalId: (v: string) => void;
  onCrNumber: (v: string) => void;
  onNationalIdFile: (v: File | null) => void;
  onCrFile: (v: File | null) => void;
  /**
   * Server-side complaints about the documents. The register call happens on the
   * OTP step, so a 422 on a file has to be carried back here to be shown on the
   * input it belongs to.
   */
  nationalIdFileServerError?: string | null;
  crFileServerError?: string | null;
  isPhoneValid: boolean;
  onSubmit: () => Promise<void>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^\d{10}$/; // Saudi national ID / CR number = 10 digits

// Mirrors the backend rule shared by `national_id_file` and `cr_file`, so an
// oversized scan is rejected here instead of after a pointless 5 MB upload.
const DOC_MAX_BYTES = 5 * 1024 * 1024;
const DOC_ACCEPT = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf';
const DOC_EXT_RE = /\.(jpe?g|png|pdf)$/i;
const DOC_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

/** Some browsers hand over an empty `type` (notably for files off a scanner), so trust the extension too. */
function isAllowedDoc(file: File): boolean {
  return DOC_MIME.includes(file.type) || DOC_EXT_RE.test(file.name);
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function OnboardingForm({
  partnerType,
  name,
  email,
  phone,
  nationalId,
  crNumber,
  nationalIdFile,
  crFile,
  onPartnerType,
  onName,
  onEmail,
  onPhone,
  onNationalId,
  onCrNumber,
  onNationalIdFile,
  onCrFile,
  nationalIdFileServerError,
  crFileServerError,
  isPhoneValid,
  onSubmit,
}: OnboardingFormProps) {
  const t = useTranslations('partnerOnboarding.form');
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    email?: boolean;
    id?: boolean;
    idFile?: boolean;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isCompany = partnerType === 'company';
  const nameValid = name.trim().length >= 3;
  const emailValid = EMAIL_RE.test(email.trim());
  const idValid = isCompany ? ID_RE.test(crNumber.trim()) : ID_RE.test(nationalId.trim());
  // Only the individual's scan gates submit — `cr_file` is still optional server-side.
  const idFileValid = isCompany || nationalIdFile !== null;
  const formValid = nameValid && isPhoneValid && emailValid && idValid && idFileValid;

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
    setTouched({ name: true, phone: true, email: true, id: true, idFile: true });
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-1">
        <h1 className="text-[21px] font-bold leading-snug text-brand-ink">{t('title')}</h1>
        <p className="text-[13px] leading-relaxed text-brand-muted">{t('subtitle')}</p>
      </div>

      {/* Partner type — segmented control */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-brand-ink">{t('partnerType')}</label>
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-brand-border bg-brand-cream/50 p-1">
          {([['individual', t('individual')], ['company', t('company')]] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onPartnerType(val)}
              aria-pressed={partnerType === val}
              className={cn(
                'h-10 rounded-xl text-sm font-medium transition',
                partnerType === val
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-primary/25'
                  : 'text-brand-muted hover:text-brand-ink',
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
          {/* No flag emoji: Windows/Chrome renders regional-indicator pairs as bare "SA". */}
          <span
            className="flex select-none items-center border-e border-brand-border bg-brand-cream/60 px-3.5 text-sm font-medium text-brand-muted"
            dir="ltr"
          >
            +966
          </span>
          <input
            value={phone}
            onChange={(e) => onPhone(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            inputMode="tel"
            maxLength={10}
            dir="ltr"
            placeholder="5XXXXXXXX"
            className="h-11 w-full bg-transparent px-4 text-start text-sm text-brand-ink placeholder:text-brand-muted/70 focus:outline-none"
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

      {/* National ID (individual) or CR number (company) — each with its scan. */}
      {isCompany ? (
        <>
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

          {/* CR scan — optional until the backend flips DASHBOARD_REQUIRE_CR_FILE. */}
          <DocumentUpload
            inputId="cr-file"
            label={t('crFile')}
            hint={t('optional')}
            note={t('crFileNote')}
            file={crFile}
            onFile={onCrFile}
            serverError={crFileServerError}
          />
        </>
      ) : (
        <>
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

          {/* Identity scan — required so the reviewer verifies a document, not a typed number. */}
          <DocumentUpload
            inputId="national-id-file"
            label={t('idFile')}
            hint={t('required')}
            file={nationalIdFile}
            onFile={onNationalIdFile}
            serverError={nationalIdFileServerError}
            missingError={touched.idFile && !nationalIdFile ? t('idFileRequired') : null}
          />
        </>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={!formValid || submitting}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition',
            formValid && !submitting
              ? 'bg-brand-primary text-white shadow-sm hover:bg-brand-primaryDark hover:shadow'
              : 'cursor-not-allowed border border-brand-border bg-brand-cream/70 text-brand-muted',
          )}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('sendCode')}
        </button>
      </div>
    </form>
  );
}

/**
 * One attachable document — the identity scan for individuals, the commercial
 * registration for companies. Both accept the same formats and size cap, and
 * both are picked before there is a session, so the file is held in state and
 * uploaded with the register request rather than presigned.
 */
function DocumentUpload({
  inputId,
  label,
  hint,
  note,
  file,
  onFile,
  serverError,
  missingError,
}: {
  inputId: string;
  label: string;
  /** Required/optional pill next to the label. */
  hint: string;
  /** Extra reassurance under the drop zone, e.g. that a phone photo is fine. */
  note?: string;
  file: File | null;
  onFile: (file: File | null) => void;
  /** 422 from the register call, carried back from the OTP step. */
  serverError?: string | null;
  /** Shown once the user tries to submit without a file this field requires. */
  missingError?: string | null;
}) {
  const t = useTranslations('partnerOnboarding.form');
  const [rejection, setRejection] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = serverError ?? rejection ?? missingError ?? null;

  const accept = (picked: File | null) => {
    if (!picked) {
      setRejection(null);
      onFile(null);
      return;
    }
    if (!isAllowedDoc(picked)) {
      setRejection(t('docWrongType'));
      onFile(null);
      return;
    }
    if (picked.size > DOC_MAX_BYTES) {
      setRejection(t('docTooLarge'));
      onFile(null);
      return;
    }
    setRejection(null);
    onFile(picked);
  };

  const clear = () => {
    setRejection(null);
    onFile(null);
    // The input keeps its old value otherwise, so re-picking the same file
    // would not fire `change`.
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Field label={label} error={error} hint={hint}>
      <input
        ref={inputRef}
        type="file"
        accept={DOC_ACCEPT}
        onChange={(e) => accept(e.target.files?.[0] ?? null)}
        className="sr-only"
        id={inputId}
      />
      {file ? (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-white p-3',
            error ? 'border-status-danger' : 'border-brand-border',
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-cream/70 text-brand-primary">
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-brand-ink">{file.name}</span>
            <span className="block text-xs text-brand-muted" dir="ltr">
              {formatSize(file.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 text-xs font-semibold text-brand-primary hover:underline"
          >
            {t('docReplace')}
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label={t('docRemove')}
            className="shrink-0 rounded-full p-1 text-brand-muted transition hover:bg-brand-cream/70 hover:text-status-danger"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              accept(e.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-start transition',
              error
                ? 'border-status-danger bg-status-danger/5'
                : dragging
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-brand-border bg-white hover:border-brand-primary hover:bg-brand-cream/40',
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Upload className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-ink">{t('docCta')}</span>
              <span className="block text-xs text-brand-muted">{t('docFormats')}</span>
            </span>
          </label>
          {note && <p className="text-[11px] leading-relaxed text-brand-muted">{note}</p>}
        </>
      )}
    </Field>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error: string | null;
  /** Rule reminder shown next to the label; replaced by `error` when one is present. */
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className={cn('text-[13px] font-medium', error ? 'text-status-danger' : 'text-brand-ink')}>
          {label}
        </label>
        {hint && !error && (
          <span className="rounded-full bg-brand-cream/80 px-2 py-0.5 text-[11px] font-medium text-brand-muted">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs leading-relaxed text-status-danger">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return cn(
    'h-11 w-full rounded-xl border bg-white px-4 text-sm text-brand-ink transition placeholder:text-brand-muted/70 focus:outline-none focus:ring-2',
    hasError
      ? 'border-status-danger focus:ring-status-danger/20'
      : 'border-brand-border hover:border-brand-muted/50 focus:border-brand-primary focus:ring-brand-primary/20',
  );
}
