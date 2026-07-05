'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CancellationPolicyDisplay } from './CancellationPolicyDisplay';
import { bookingsApi } from '@/lib/api/client';
import { formatSAR } from '@/lib/utils/format';
import type { Booking } from '@/types';
import type { RefundPreview } from '@/lib/cancellation/engine';

interface CancelBookingDialogProps {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}

export function CancelBookingDialog({ booking, open, onClose }: CancelBookingDialogProps) {
  const t = useTranslations('cancelBooking');
  const tp = useTranslations('cancellationPolicy');
  const router = useRouter();
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPreview(null);
    setError(null);
    bookingsApi
      .previewCancellation(booking.id)
      .then((p) => { if (!cancelled) setPreview(p as RefundPreview); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : t('genericError')); });
    return () => { cancelled = true; };
  }, [open, booking.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await bookingsApi.cancel(booking.id, reason || undefined);
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('cancelFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const tierLabel = preview?.tier
    ? tp('refund', { percent: preview.tier.refundPercent })
    : preview?.rawTierLabel ?? '';

  const notAllowedText = preview?.notAllowedReason
    ? t(`notAllowed.${preview.notAllowedReason}`)
    : preview?.rawNotAllowedReason ?? '';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-status-danger">{t('title')}</DialogTitle>
          <p className="text-center text-sm text-brand-muted">{t('confirmPrompt')}</p>
        </DialogHeader>

        {!preview && !error && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-status-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <>
            {/* Policy summary from SNAPSHOT (frozen at booking time) */}
            <CancellationPolicyDisplay policy={booking.policySnapshot} />

            {!preview.isAllowed ? (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-status-danger">
                {notAllowedText}
              </div>
            ) : (
              <div className="rounded-2xl border border-brand-border bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-brand-ink">{t('refundSummary')}</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-brand-muted">{t('applicableTier')}</dt>
                    <dd className="font-medium">{tierLabel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brand-muted">{t('totalAmount')}</dt>
                    <dd>{formatSAR(booking.price.total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brand-muted">{t('refundPercent')}</dt>
                    <dd>{preview.refundPercent}%</dd>
                  </div>
                  <div className="flex justify-between border-t border-brand-border pt-2 font-bold">
                    <dt>{t('refundedAmount')}</dt>
                    <dd className="text-status-success">{formatSAR(preview.refundAmount)}</dd>
                  </div>
                  {preview.forfeitedAmount > 0 && (
                    <div className="flex justify-between text-xs text-brand-muted">
                      <dt>{t('deductedAmount')}</dt>
                      <dd>{formatSAR(preview.forfeitedAmount)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">{t('reasonLabel')}</Label>
              <Textarea
                id="reason"
                placeholder={t('reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('goBack')}
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={!preview.isAllowed || submitting}
                onClick={handleConfirm}
              >
                {submitting ? t('cancelling') : t('confirmCancel')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
