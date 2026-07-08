'use client';

/**
 * Payment page — step 2 of checkout (the booking already exists as `pending`).
 *
 * `POST /payments/initiate` decides what UI to show:
 *  - test_mode           → "simulate" button hitting `POST /payments/pay { payment_id }`
 *  - live                → Moyasar HOSTED form (card + Apple Pay) rendered into
 *                          `.mysr-form`, plus quick-pay with saved chargeable cards.
 *
 * The hosted form charges Moyasar directly, then redirects the browser to
 * /payment/callback?pid=… where the charge is verified server-side. The
 * frontend never marks a payment successful on its own.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paymentsApi, accountApi, type InitiatePaymentResult } from '@/lib/api/client';
import { loadMoyasarAssets, initMoyasarForm } from '@/lib/payments/moyasar';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { SavedCard } from '@/types';

export default function PaymentPage() {
  const t = useTranslations('payment');
  const locale = useLocale() as 'ar' | 'en';
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();

  const [info, setInfo] = useState<InitiatePaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cvc, setCvc] = useState('');
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Both effects guard against React 18 strict-mode double-runs.
  const initiated = useRef(false);
  const formInited = useRef(false);

  useEffect(() => {
    if (initiated.current || !bookingId) return;
    initiated.current = true;
    paymentsApi
      .initiate(bookingId)
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Whenever the backend hands us a publishable key — live OR pk_test — the
  // gateway is configured and `pay` demands a real charge, so mount the hosted
  // form (the .mysr-form div renders with `info`, so this effect always runs
  // after it exists in the DOM) and fetch saved cards for quick pay —
  // best-effort, it must never block the form. The tokenless "simulate" path
  // only exists when the backend has NO gateway key at all.
  useEffect(() => {
    if (!info || !info.publishableKey || formInited.current) return;
    formInited.current = true;

    accountApi
      .getCards()
      .then((cards) => {
        const chargeable = cards.filter((c) => c.chargeable === true);
        setSavedCards(chargeable);
        setSelectedCardId(chargeable.find((c) => c.isDefault)?.id ?? chargeable[0]?.id ?? null);
      })
      .catch(() => setSavedCards([]));

    loadMoyasarAssets(locale)
      .then(() => {
        // Extra tick so React has committed the .mysr-form div.
        setTimeout(() => initMoyasarForm(info), 0);
      })
      .catch((e: unknown) => {
        setErrorMsg(e instanceof Error ? e.message : t('gatewayLoadFailed'));
      });
  }, [info, locale, t]);

  /** Quick pay with a saved (tokenised) card; 3-DS may still bounce us to the callback. */
  const payWithSavedCard = async () => {
    if (!info || !selectedCardId) return;
    setErrorMsg('');
    setPaying(true);
    try {
      const result = await paymentsApi.pay(info.paymentId, { savedCardId: selectedCardId, cvc });
      if (result.status === 'paid') {
        router.replace(`/booking/confirmation/${info.bookingId || bookingId}`);
        return;
      }
      if (result.transactionUrl) {
        window.location.assign(result.transactionUrl); // 3-DS challenge
        return;
      }
      setErrorMsg(result.message || t('payFailed'));
      setPaying(false);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t('payFailed'));
      setPaying(false);
    }
  };

  /** Test-mode simulate (staging/mock only — info.testMode === true). */
  const simulatePay = async () => {
    if (!info) return;
    setErrorMsg('');
    setPaying(true);
    try {
      const result = await paymentsApi.pay(info.paymentId);
      if (result.status === 'paid') {
        router.replace(`/booking/confirmation/${info.bookingId || bookingId}`);
        return;
      }
      setErrorMsg(result.message || t('payFailed'));
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t('payFailed'));
    }
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center px-4 py-16">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-brand-border bg-white p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-status-danger">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-brand-ink">{t('loadFailedTitle')}</h1>
          <p className="text-sm leading-relaxed text-brand-muted">{t('loadFailedBody')}</p>
          <div className="flex w-full flex-col gap-2 pt-2">
            <Button size="lg" onClick={() => window.location.reload()}>
              {t('retry')}
            </Button>
            <Button asChild variant="outline">
              <Link href="/my-reservations">{t('goToReservations')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const booking = info.booking;

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-6 md:order-2">
        <h1 className="text-2xl font-bold">{t('title')}</h1>

        {!info.publishableKey ? (
          // No gateway key at all (mock mode / gateway-less staging) — the
          // backend accepts a tokenless `pay { payment_id }` simulate.
          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">{t('testModeTitle')}</h2>
            <p className="text-sm text-brand-muted">{t('testModeBody')}</p>
            <Button size="lg" className="w-full" onClick={simulatePay} disabled={paying}>
              {paying ? t('processing') : t('simulatePay', { amount: formatSAR(info.amount) })}
            </Button>
          </Card>
        ) : (
          <>
            {info.testMode && (
              <Card className="space-y-1 p-5">
                <h2 className="font-semibold">{t('testModeTitle')}</h2>
                <p className="text-sm text-brand-muted">{t('testModeBody')}</p>
              </Card>
            )}
            {savedCards.length > 0 && (
              <Card className="space-y-4 p-5">
                <h2 className="font-semibold">{t('quickPayTitle')}</h2>
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-border p-3 text-sm has-[:checked]:border-brand-primary"
                    >
                      <input
                        type="radio"
                        name="savedCard"
                        checked={selectedCardId === card.id}
                        onChange={() => setSelectedCardId(card.id)}
                      />
                      <span className="font-semibold uppercase">{card.brand}</span>
                      <span dir="ltr" className="font-mono text-brand-muted">
                        •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="ms-auto rounded-full bg-brand-cream px-2 py-0.5 text-xs text-brand-muted">
                          {t('defaultCard')}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                <div className="flex items-end gap-3">
                  <div className="w-28 space-y-2">
                    <Label>CVC</Label>
                    <Input
                      placeholder="123"
                      dir="ltr"
                      className="text-start"
                      inputMode="numeric"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>
                  <Button
                    className="flex-1"
                    onClick={payWithSavedCard}
                    disabled={paying || !selectedCardId || cvc.length < 3}
                  >
                    {paying ? t('processing') : t('payWithSavedCard')}
                  </Button>
                </div>
                <p className="text-center text-xs text-brand-muted">{t('orNewCard')}</p>
              </Card>
            )}

            <Card className="space-y-4 p-5">
              <h2 className="font-semibold">{t('cardTitle')}</h2>
              {info.publishableKey.startsWith('pk_test') && (
                <p dir="ltr" className="text-start text-xs text-brand-muted">
                  {t('testCardHint')}: 4111 1111 1111 1111
                </p>
              )}
              {/* Moyasar renders the hosted form here — this div must stay mounted. */}
              <div className="mysr-form" />
            </Card>
          </>
        )}

        {errorMsg && <p className="text-sm text-status-danger">{errorMsg}</p>}
        <p className="text-center text-xs text-brand-muted">🔒 {t('secureNote')}</p>
      </div>

      <aside className="md:order-1">
        <Card className="sticky top-24 space-y-4 p-5">
          {booking ? (
            <>
              <div className="flex items-center gap-3">
                {booking.unit.imageUrl && (
                  <img src={booking.unit.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                )}
                <div className="text-sm">
                  <div className="font-semibold">{booking.unit.name}</div>
                  <div className="text-xs text-brand-muted">
                    {booking.unit.city}
                    {booking.unit.district ? `، ${booking.unit.district}` : ''}
                  </div>
                </div>
              </div>
              <hr className="border-brand-border" />
              <SummaryRow label={t('dates')} value={`${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`} />
              <SummaryRow label={t('guests')} value={t('guestCount', { count: booking.guests })} />
              <hr className="border-brand-border" />
              <h3 className="font-semibold">{t('priceDetails')}</h3>
              {/* Fee lines are frozen on the booking — rendered as-is, never recomputed. */}
              <SummaryRow
                label={t('priceLine', { price: booking.nightlyRate, nights: booking.nights })}
                value={formatSAR(booking.subtotal)}
              />
              <SummaryRow label={t('cleaningFee')} value={formatSAR(booking.cleaningFee)} />
              <SummaryRow label={t('serviceFee')} value={formatSAR(booking.serviceFee)} />
              <SummaryRow label={t('taxes')} value={formatSAR(booking.taxes)} />
              <hr className="border-brand-border" />
              <SummaryRow label={t('total')} value={formatSAR(info.amount)} bold />
            </>
          ) : (
            <>
              <h3 className="font-semibold">{t('priceDetails')}</h3>
              <SummaryRow label={t('total')} value={formatSAR(info.amount)} bold />
            </>
          )}
        </Card>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'text-base font-bold' : ''}`}>
      <span className={bold ? '' : 'text-brand-muted'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
