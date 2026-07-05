'use client';

/**
 * Payment return page — Moyasar lands the browser here after 3-D Secure,
 * appending `id` (pay_xxx), `status` and `message` query params.
 * We confirm the charge with our backend (`/payments/verify`) and route the
 * guest to the booking confirmation, or show a retry path on failure.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentsApi } from '@/lib/api/client';
import { readPendingPayment, clearPendingPayment } from '@/lib/payments/pending';

function CallbackHandler() {
  const t = useTranslations('paymentCallback');
  const router = useRouter();
  const search = useSearchParams();
  const [failure, setFailure] = useState<string | null>(null);
  // Verification must run exactly once — StrictMode double-invokes effects.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const pending = readPendingPayment();
      if (!pending) {
        setFailure(t('sessionExpired'));
        return;
      }

      const moyasarStatus = search.get('status');
      const moyasarId = search.get('id') ?? '';
      if (moyasarStatus === 'failed') {
        setFailure(search.get('message') || t('bankDeclined'));
        return;
      }

      try {
        await paymentsApi.verify(pending.paymentId, moyasarId);
        clearPendingPayment();
        router.replace(`/booking/confirmation/${pending.bookingId}`);
      } catch (e) {
        setFailure(e instanceof Error ? e.message : t('verifyFailed'));
      }
    };

    void run();
  }, [router, search]); // eslint-disable-line react-hooks/exhaustive-deps

  if (failure) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-brand-border bg-white p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-status-danger">
          <XCircle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-brand-ink">{t('incompleteTitle')}</h1>
        <p className="text-sm leading-relaxed text-brand-muted">{failure}</p>
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button asChild size="lg">
            <Link href="/my-reservations">{t('goToReservations')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/units">{t('browseStays')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-brand-border bg-white p-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
      <h1 className="text-xl font-bold text-brand-ink">{t('verifyingTitle')}</h1>
      <p className="text-sm text-brand-muted">{t('verifyingBody')}</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
