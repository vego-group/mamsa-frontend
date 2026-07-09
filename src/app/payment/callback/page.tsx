'use client';

/**
 * Payment return page — Moyasar (or the backend's safety-net redirect) lands
 * the browser here after the hosted form / 3-D Secure with:
 *   ?pid=<our payment id>&id=<moyasar id>&status=…&message=…
 *
 * The query string is only a hint: we ALWAYS confirm with `POST /payments/verify`
 * (the backend re-fetches the charge from Moyasar) before treating the booking
 * as paid. The route path must stay exactly /payment/callback — the backend's
 * FRONTEND_URL redirect depends on it.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentsApi } from '@/lib/api/client';

function CallbackHandler() {
  const t = useTranslations('paymentCallback');
  const router = useRouter();
  const search = useSearchParams();
  const [failure, setFailure] = useState<string | null>(null);
  const [retryBookingId, setRetryBookingId] = useState<number | null>(null);
  // Verification must run exactly once — StrictMode double-invokes effects.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pid = search.get('pid'); // OUR payment id (we appended it to callback_url)
    const moyasarId = search.get('id'); // Moyasar's payment id
    const moyasarStatus = search.get('status');

    // pid is OUR numeric payment id — a tampered/garbled value would turn
    // into NaN in the verify body, so treat it the same as missing.
    if (!pid || !/^\d+$/.test(pid) || !moyasarId) {
      setFailure(t('missingParams'));
      return;
    }

    // Surface an obvious decline immediately, but STILL verify server-side —
    // the query string is never trusted as the source of truth.
    if (moyasarStatus && moyasarStatus !== 'paid') {
      setFailure(search.get('message') || t('bankDeclined'));
    }

    const run = async () => {
      try {
        const result = await paymentsApi.verify(Number(pid), String(moyasarId));
        setRetryBookingId(result.bookingId);
        if (result.status === 'paid') {
          if (result.bookingId) router.replace(`/booking/confirmation/${result.bookingId}`);
          else router.replace('/my-reservations');
        } else {
          setFailure(result.message || t('verifyFailed'));
        }
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
        {/* Gateway messages arrive in English; dir="auto" keeps their punctuation ordered inside the RTL layout. */}
        <p dir="auto" className="text-sm leading-relaxed text-brand-muted">{failure}</p>
        <div className="flex w-full flex-col gap-2 pt-2">
          {retryBookingId != null && (
            <Button asChild size="lg">
              <Link href={`/payment/${retryBookingId}`}>{t('retryPayment')}</Link>
            </Button>
          )}
          <Button asChild size="lg" variant={retryBookingId != null ? 'outline' : 'default'}>
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
