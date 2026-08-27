'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { PriceBreakdown } from '@/components/features/booking/PriceBreakdown';
import { LoadError } from '@/components/shared/LoadError';
import { EmailVerificationCard, type EmailVerificationCardHandle } from '@/components/account/email-verification';
import { unitsApi, bookingsApi, type CheckAvailabilityResult } from '@/lib/api/client';
import { ApiError, resolveErrorMessage } from '@/lib/api/errors';
import { showToast } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR, formatDate } from '@/lib/utils/format';
import { vatPercentLabel } from '@/lib/pricing';
import type { Unit, Booking, PriceBreakdown as PriceBreakdownData } from '@/types';

export function CheckoutPageClient() {
  const t = useTranslations('checkout');
  const tPricing = useTranslations('pricing');
  const tc = useTranslations('common');
  const tev = useTranslations('emailVerification');
  const params = useParams<{ unitId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const checkIn = search.get('checkIn') ?? '';
  const checkOut = search.get('checkOut') ?? '';
  // Query params are user-editable — clamp guests to a sane positive integer.
  const guests = Math.max(1, Math.floor(Number(search.get('guests'))) || 1);
  const datesValid =
    /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut) && checkIn < checkOut;
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUiStore((s) => s.openAuth);
  const emailVerified = user?.emailVerified === true;
  const emailCardRef = useRef<EmailVerificationCardHandle>(null);

  const [unit, setUnit] = useState<Unit | null>(null);
  const [unitLoadError, setUnitLoadError] = useState(false);
  // Bumping this re-runs the unit + quote fetches — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);
  // Server-computed price quote for the selected dates (§1.1) — the frontend
  // never computes money, it only ever renders what the backend returns.
  const [quote, setQuote] = useState<CheckAvailabilityResult | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  // Once the booking is created, its FROZEN breakdown replaces the pre-booking
  // quote (§1.3) — the authoritative price, immune to any later rate change.
  const [frozenPrice, setFrozenPrice] = useState<PriceBreakdownData | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // An earlier unpaid booking of ours that holds these dates — offer to pay or manage it.
  const [pendingConflict, setPendingConflict] = useState<Booking | null>(null);

  useEffect(() => {
    setUnitLoadError(false);
    unitsApi
      .getById(params.unitId)
      .then(setUnit)
      .catch(() => setUnitLoadError(true));
  }, [params.unitId, attempt]);

  useEffect(() => {
    if (!datesValid) return;
    setQuoteError(false);
    unitsApi
      .checkAvailability(params.unitId, checkIn, checkOut)
      .then(setQuote)
      .catch(() => setQuoteError(true));
  }, [params.unitId, checkIn, checkOut, datesValid, attempt]);

  if (unitLoadError || quoteError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadError onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }

  if (!unit) return <div className="container mx-auto p-10">{tc('loading')}</div>;

  // Missing/tampered dates would render NaN prices and send a broken booking
  // request — send the user back to pick dates instead.
  if (!datesValid) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-brand-muted">{t('errors.invalidDates')}</p>
        <Button asChild>
          <Link href={`/units/${unit.id}`}>{t('backToUnit')}</Link>
        </Button>
      </div>
    );
  }

  if (!quote) return <div className="container mx-auto p-10">{tc('loading')}</div>;

  if (!quote.available || !quote.pricing) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-brand-muted">{t('errors.unitUnavailable')}</p>
        <Button asChild>
          <Link href={`/units/${unit.id}`}>{t('backToUnit')}</Link>
        </Button>
      </div>
    );
  }

  const quotePricing = quote.pricing;
  // Before booking: the live quote. After booking: the frozen breakdown from
  // the booking response wins — same field names, never recomputed here.
  const displayPrice: PriceBreakdownData = frozenPrice ?? {
    pricePerNight: quotePricing.nightlyRate,
    nights: quotePricing.nights,
    gross: quotePricing.gross,
    netBase: quotePricing.netBase,
    vat: quotePricing.vat,
  };

  /**
   * Only the agreement is the guest's to get wrong now — name, email and phone
   * come from the account, and the email is separately gated by verification.
   */
  const validate = (): string | null => (agreed ? null : t('errors.agree'));

  const handleConfirm = async () => {
    // Booking requires an account — route guests to the login dialog instead
    // of letting the API bounce them with a raw 401.
    if (!isAuth) {
      setError(t('errors.loginFirst'));
      openAuth('login');
      return;
    }
    const invalid = validate();
    if (invalid) { setError(invalid); return; }
    setError(null);
    setSubmitting(true);

    try {
      // Create the pending booking, then hand over to the payment page — it
      // calls /payments/initiate and renders the Moyasar hosted form. Initiate
      // is idempotent per booking, so retrying a failed payment reuses the
      // same pending booking instead of creating a duplicate.
      const booking = await bookingsApi.create({
        unitId: unit.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: { adults: guests, children: 0 },
        paymentMethod: 'visa',
      });
      // The booking's breakdown is now FROZEN (§1.3) — switch the summary to
      // it so nothing here still reflects the pre-booking quote.
      setFrozenPrice(booking.price);
      router.push(`/payment/${booking.id}`);
    } catch (e) {
      // Stale client state: the store said the email was verified, but the
      // backend disagrees. Reopen the card without discarding anything the
      // guest already typed into this form.
      if (e instanceof ApiError && e.code === 'EMAIL_VERIFICATION_REQUIRED') {
        emailCardRef.current?.reopen();
        showToast(resolveErrorMessage(e, t('errors.genericFailed')));
        setSubmitting(false);
        return;
      }
      // "Unit already booked" is often OUR OWN abandoned pending booking still
      // holding the dates (created on a previous attempt, never paid). Reuse
      // it instead of dead-ending: same dates → straight back to payment;
      // different overlapping dates → let the user pay or manage it.
      const mine = await findMyPendingBooking();
      if (mine && mine.checkInDate.slice(0, 10) === checkIn && mine.checkOutDate.slice(0, 10) === checkOut) {
        router.push(`/payment/${mine.id}`);
        return;
      }
      if (mine) setPendingConflict(mine);
      setError(e instanceof Error ? e.message : t('errors.genericFailed'));
      setSubmitting(false);
    }
  };

  /** My unpaid pending booking on this unit that overlaps the requested dates, if any. */
  const findMyPendingBooking = async (): Promise<Booking | null> => {
    try {
      const mine = await bookingsApi.list();
      return (
        mine.find(
          (b) =>
            b.unitId === unit.id &&
            b.status === 'pending_payment' &&
            b.checkInDate.slice(0, 10) < checkOut &&
            b.checkOutDate.slice(0, 10) > checkIn,
        ) ?? null
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-6 md:order-2">
        <h1 className="text-2xl font-bold">{t('title')}</h1>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">{t('yourTrip')}</h2>
          <Row label={t('dates')} value={`${formatDate(checkIn)} → ${formatDate(checkOut)}`} />
          <Row label={t('guests')} value={t('guestCount', { count: guests })} />
        </Card>

        {/* `POST /bookings` records the signed-in account as the guest and
            accepts no separate guest details (confirmed by the backend on
            2026-08-27). These were four editable fields whose contents were
            validated and then dropped on the floor — a guest could carefully
            type a friend's name and email and the booking would still be
            issued to themselves. Shown, not asked. */}
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">{t('personalInfo')}</h2>
          <Row label={t('firstName')} value={user?.firstName ?? '—'} />
          <Row label={t('lastName')} value={user?.lastName ?? '—'} />
          <Row label={t('email')} value={user?.email ?? '—'} />
          <Row label={t('phone')} value={user?.phone ?? '—'} />
          <p className="text-xs leading-relaxed text-brand-muted">{t('bookedForAccount')}</p>
          <Link href="/account" className="text-xs font-medium text-brand-primary hover:underline">
            {t('editInAccount')}
          </Link>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">{t('cancellationPolicyTitle')}</h2>
          <CancellationPolicyDisplay
            policy={unit.cancellationPolicyDetails ?? getPolicyByTemplate(unit.cancellationPolicy)}
            showHeader={false}
          />
        </Card>

        <Card className="space-y-2 p-5 text-sm">
          <label className="flex items-start gap-2">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
            <span className="text-brand-muted">
              {t('agreeTo')}{' '}
              {/* Policies open in a new tab so the typed card/guest data survives. */}
              <Link href="/policies/cancellation" target="_blank" className="text-brand-primary underline">
                {t('cancellationPolicyLink')}
              </Link>
              {t('listSeparator')}{' '}
              <Link href="/policies/safety" target="_blank" className="text-brand-primary underline">
                {t('safetyLink')}
              </Link>
              {t('andLastSeparator')}
              <Link href="/policies/house-rules" target="_blank" className="text-brand-primary underline">
                {' '}{t('houseRulesLink')}
              </Link>
              . {t('agreeChargeNote')}
            </span>
          </label>
        </Card>

        <EmailVerificationCard ref={emailCardRef} context="checkout" />

        {error && <p dir="auto" className="text-sm text-status-danger">{error}</p>}

        {pendingConflict && (
          <Card className="space-y-3 border-amber-300 bg-amber-50 p-5 text-sm">
            <p className="font-medium text-amber-900">
              {t('pendingConflict', {
                checkIn: formatDate(pendingConflict.checkInDate),
                checkOut: formatDate(pendingConflict.checkOutDate),
              })}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/payment/${pendingConflict.id}`}>{t('payPendingBooking')}</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/my-reservations/${pendingConflict.id}`}>{t('managePendingBooking')}</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* The number on this button is the same one the unit page showed —
            say so, because "did it go up?" is the question this whole pricing
            model exists to stop the guest asking at the last step. */}
        <p className="text-center text-xs text-brand-muted">{tPricing('noChangeNote')}</p>
        <Button size="lg" className="w-full" onClick={handleConfirm} disabled={submitting || !emailVerified}>
          {submitting ? t('creatingBooking') : t('continueToPayment', { amount: formatSAR(displayPrice.gross) })}
        </Button>
        {!emailVerified && (
          <p className="text-center text-xs text-status-danger">{tev('verifyToPay')}</p>
        )}
        <p className="text-center text-xs text-brand-muted">
          🔒 {t('secureNote')}
        </p>
      </div>

      <aside className="md:order-1">
        <Card className="sticky top-24 space-y-4 p-5">
          <div className="flex items-center gap-3">
            <img src={unit.images[0]?.thumb} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="text-sm">
              <div className="font-semibold">{unit.title}</div>
              <div className="text-xs text-brand-muted">{unit.city}، {unit.country}</div>
            </div>
          </div>
          <hr className="border-brand-border" />
          <h3 className="font-semibold">{t('priceDetails')}</h3>
          <PriceBreakdown
            price={displayPrice}
            labels={{
              priceLine: t('priceLine', { price: displayPrice.pricePerNight, nights: displayPrice.nights }),
              inclVat: tPricing('inclVat'),
              total: t('total'),
              showTaxDetails: tPricing('showTaxDetails'),
              netBase: tPricing('netBase'),
              // The live quote carries the server's own rate; a frozen booking
              // does not, so that case falls back to the platform constant.
              vat: tPricing('vat', { percent: vatPercentLabel(quotePricing.vatRate) }),
            }}
            format={formatSAR}
          />
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'text-base font-bold' : ''}`}>
      <span className={bold ? '' : 'text-brand-muted'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
