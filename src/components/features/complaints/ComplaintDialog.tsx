'use client';

/**
 * The one-shot complaint form.
 *
 * Everything the backend would refuse for SHAPE is refused here first — the
 * guest is on a phone, quite possibly on mobile data, and must never upload
 * six photos to be told the description is nineteen characters. What the
 * backend refuses for STATE (window closed, complaint already filed, booking
 * not completed) is handed back to the section by `code`, never by matching
 * the Arabic message, which the backend is free to reword.
 *
 * A draft survives closing the dialog: the component stays mounted, only
 * the Radix content unmounts, so an accidental tap outside costs nothing.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  COMPLAINT_CODES,
  complaintsApi,
  type SubmitComplaintInput,
  type SubmitComplaintResult,
} from '@/lib/api/client';
import { ApiError, resolveErrorMessage } from '@/lib/api/errors';
import {
  COMPLAINT_DESCRIPTION_MAX,
  COMPLAINT_IMAGE_ACCEPT,
  COMPLAINT_MAX_IMAGES,
  checkComplaintDescription,
  screenComplaintImages,
  type ImageScreening,
} from '@/lib/complaints/rules';
import { cn } from '@/lib/utils/cn';

interface Attached {
  file: File;
  key: string;
  /** Object URL for the thumbnail — null where the runtime can't mint one. Revoked on removal/unmount. */
  previewUrl: string | null;
}

interface ComplaintDialogProps {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  /** The 201 landed. Carries the input too, so the caller can show the submission before re-reading it. */
  onSubmitted: (result: SubmitComplaintResult, input: SubmitComplaintInput) => void;
  /** 409 — a complaint is already on this booking: show it, don't report an error. */
  onAlreadyExists: () => void;
  /** 422 `WINDOW_CLOSED` — the deadline passed while the form was open. */
  onWindowClosed: () => void;
  /** 422 `WINDOW_NOT_OPEN` / `BOOKING_NOT_COMPLETED` — the booking on screen is stale; refetch it. */
  onBookingStale: () => void;
}

let keySeq = 0;

const previewOf = (file: File): string | null =>
  typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(file)
    : null;

const revoke = (url: string | null) => {
  if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function')
    URL.revokeObjectURL(url);
};

/** The `errors` bag keys that belong under the photo picker: `images`, `images.0`, … */
const isImagesField = (key: string) => key === 'images' || key.startsWith('images.');

export function ComplaintDialog({
  bookingId,
  open,
  onClose,
  onSubmitted,
  onAlreadyExists,
  onWindowClosed,
  onBookingStale,
}: ComplaintDialogProps) {
  const t = useTranslations('complaints.form');
  const tc = useTranslations('common');
  const [description, setDescription] = useState('');
  const [contacted, setContacted] = useState<boolean | null>(null);
  const [images, setImages] = useState<Attached[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  // Local problems are pointed out after the first attempt, not while the first word is typed.
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Thumbnails are object URLs; release them when the dialog goes away.
  useEffect(() => () => imagesRef.current.forEach((i) => revoke(i.previewUrl)), []);

  const check = useMemo(() => checkComplaintDescription(description), [description]);

  const descriptionError =
    fieldErrors.description?.[0] ??
    (check.problem === 'long'
      ? t('descriptionLong')
      : attempted && check.problem === 'short'
        ? t('descriptionShort')
        : null);
  const contactedError =
    fieldErrors.contacted_partner?.[0] ??
    (attempted && contacted === null ? t('contactedRequired') : null);
  const imageErrors = [
    ...rejections,
    ...Object.entries(fieldErrors)
      .filter(([k]) => isImagesField(k))
      .flatMap(([, v]) => v),
  ];
  const otherErrors = Object.entries(fieldErrors)
    .filter(([k]) => k !== 'description' && k !== 'contacted_partner' && !isImagesField(k))
    .flatMap(([, v]) => v);

  const describeRejections = (rejected: ImageScreening['rejected']): string[] => {
    const lines: string[] = [];
    let overCount = 0;
    for (const r of rejected) {
      if (r.reason === 'type') lines.push(t('imageWrongType', { name: r.file.name }));
      else if (r.reason === 'size') lines.push(t('imageTooLarge', { name: r.file.name }));
      else overCount += 1;
    }
    if (overCount > 0) lines.push(t('imagesTooMany', { count: overCount }));
    return lines;
  };

  const addFiles = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const { accepted, rejected } = screenComplaintImages(images.length, Array.from(picked));
    setImages((prev) => [
      ...prev,
      ...accepted.map((file) => ({ file, key: `img-${keySeq++}`, previewUrl: previewOf(file) })),
    ]);
    setRejections(describeRejections(rejected));
    setFieldErrors((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => !isImagesField(k))),
    );
    // Clear the input, or re-picking the same file would not fire `change`.
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      revoke(prev.find((i) => i.key === key)?.previewUrl ?? null);
      return prev.filter((i) => i.key !== key);
    });
    setRejections([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!check.valid || contacted === null || submitting) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    const input: SubmitComplaintInput = {
      description: description.trim(),
      contactedPartner: contacted,
      images: images.map((i) => i.file),
    };
    try {
      const result = await complaintsApi.submit(bookingId, input);
      onSubmitted(result, input);
    } catch (err) {
      // Branch on the code, never on the message.
      if (err instanceof ApiError) {
        switch (err.code) {
          case COMPLAINT_CODES.ALREADY_EXISTS:
            onAlreadyExists();
            return;
          case COMPLAINT_CODES.WINDOW_CLOSED:
            onWindowClosed();
            return;
          case COMPLAINT_CODES.WINDOW_NOT_OPEN:
          case COMPLAINT_CODES.BOOKING_NOT_COMPLETED:
            onBookingStale();
            return;
        }
        // Ordinary validation: the messages are Arabic and per field — put each under its input.
        if (err.status === 422 && err.fields) {
          setFieldErrors(err.fields);
          return;
        }
      }
      // NOT_YOUR_BOOKING, the 6/min throttle (RATE_LIMITED → retry-after copy), network — the server's own words.
      setError(resolveErrorMessage(err, t('submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !submitting && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Description — 20 to 2000 characters, with a live count. */}
          <div className="space-y-2">
            <Label htmlFor="complaint-description">{t('descriptionLabel')}</Label>
            <Textarea
              id="complaint-description"
              rows={6}
              value={description}
              placeholder={t('descriptionPlaceholder')}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((prev) => {
                  const { description: _drop, ...rest } = prev;
                  return rest;
                });
              }}
              aria-invalid={descriptionError ? true : undefined}
              aria-describedby="complaint-description-hint"
              className={cn(descriptionError && 'border-status-danger')}
            />
            <div
              id="complaint-description-hint"
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className={descriptionError ? 'text-status-danger' : 'text-brand-muted'}>
                {descriptionError ?? t('descriptionHint')}
              </span>
              <span
                dir="ltr"
                className={cn(
                  'shrink-0 tabular-nums',
                  check.problem === 'long' ? 'text-status-danger' : 'text-brand-muted',
                )}
              >
                {t('counter', { count: check.length, max: COMPLAINT_DESCRIPTION_MAX })}
              </span>
            </div>
          </div>

          {/* Contacted the host? Required, but either answer is fine — it's context for the reviewer. */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-brand-ink">{t('contactedLabel')}</legend>
            <p className="text-xs text-brand-muted">{t('contactedHint')}</p>
            <div className="flex gap-2" role="radiogroup" aria-label={t('contactedLabel')}>
              {([true, false] as const).map((value) => (
                <button
                  type="button"
                  key={String(value)}
                  role="radio"
                  aria-checked={contacted === value}
                  onClick={() => setContacted(value)}
                  className={cn(
                    'flex-1 rounded-full border px-4 py-2 text-sm font-medium transition',
                    contacted === value
                      ? 'border-brand-primary bg-brand-primary text-white'
                      : 'border-brand-border bg-white text-brand-ink hover:bg-brand-cream/60',
                  )}
                >
                  {value ? t('yes') : t('no')}
                </button>
              ))}
            </div>
            {contactedError && <p className="text-xs text-status-danger">{contactedError}</p>}
          </fieldset>

          {/* Photos — screened on pick: wrong type, over 5 MB, or a seventh file never leaves the phone. */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="complaint-images">{t('imagesLabel')}</Label>
              <span className="text-xs text-brand-muted">
                {t('imagesCount', { count: images.length, max: COMPLAINT_MAX_IMAGES })}
              </span>
            </div>
            <input
              ref={inputRef}
              id="complaint-images"
              type="file"
              accept={COMPLAINT_IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((img) => (
                <div
                  key={img.key}
                  className="relative aspect-square overflow-hidden rounded-xl border border-brand-border bg-brand-cream/40"
                >
                  {img.previewUrl ? (
                    <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center break-all p-2 text-center text-[11px] text-brand-muted">
                      {img.file.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.key)}
                    aria-label={t('removeImage', { name: img.file.name })}
                    className="absolute left-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {images.length < COMPLAINT_MAX_IMAGES && (
                <label
                  htmlFor="complaint-images"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand-border bg-white text-xs text-brand-muted transition hover:border-brand-primary hover:text-brand-primary"
                >
                  <ImagePlus className="h-5 w-5" />
                  {t('addImages')}
                </label>
              )}
            </div>
            <p className="text-xs text-brand-muted">{t('imagesHint')}</p>
            {imageErrors.map((m) => (
              <p key={m} className="text-xs text-status-danger">
                {m}
              </p>
            ))}
          </div>

          {(error || otherErrors.length > 0) && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-status-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                {error && <p>{error}</p>}
                {otherErrors.map((m) => (
                  <p key={m}>{m}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={onClose}
              disabled={submitting}
            >
              {tc('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
