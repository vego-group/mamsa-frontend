'use client';

import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { makeReviewSchema, type ReviewFormValues } from '@/lib/validation/schemas';
import { reviewsApi } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

interface ReviewDialogProps {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewDialog({ bookingId, open, onClose, onSubmitted }: ReviewDialogProps) {
  const t = useTranslations('review');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewSchema = useMemo(() => makeReviewSchema(tv), [tv]);
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await reviewsApi.add({ bookingId, rating: values.rating, comment: values.comment });
      onSubmitted?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-3">
            <p className="text-sm text-brand-muted">{t('rateYourStay')}</p>
            <div className="flex gap-1.5" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => { setRating(n); form.setValue('rating', n); }}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition',
                      (hover || rating) >= n ? 'fill-yellow-500 text-yellow-500' : 'text-brand-border',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea placeholder={t('commentPlaceholder')} rows={5} {...form.register('comment')} />
          {form.formState.errors.comment && (
            <p className="text-xs text-status-danger">{form.formState.errors.comment.message}</p>
          )}
          {form.formState.errors.rating && (
            <p className="text-xs text-status-danger">{form.formState.errors.rating.message}</p>
          )}
          {error && <p className="text-sm text-status-danger">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" type="button" className="flex-1" onClick={onClose}>
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
