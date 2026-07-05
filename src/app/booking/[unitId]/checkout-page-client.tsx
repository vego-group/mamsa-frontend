'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { unitsApi, bookingsApi, paymentsApi } from '@/lib/api/client';
import { createCardToken } from '@/lib/payments/moyasar';
import { rememberPendingPayment } from '@/lib/payments/pending';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { Unit } from '@/types';

/** Formats raw digits as "1234 5678 9012 3456", capped at 16 digits. */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Formats raw digits as "MM/YY", capped at 4 digits. */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function CheckoutPageClient() {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const locale = useLocale() as 'ar' | 'en';
  const params = useParams<{ unitId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const checkIn = search.get('checkIn') ?? '';
  const checkOut = search.get('checkOut') ?? '';
  const guests = Number(search.get('guests') ?? '1');
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUiStore((s) => s.openAuth);

  const [unit, setUnit] = useState<Unit | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<'idle' | 'booking' | 'paying'>('idle');
  const [error, setError] = useState<string | null>(null);
  // Booking survives a failed payment attempt so a retry charges the SAME
  // booking instead of creating a duplicate pending one.
  const [bookingId, setBookingId] = useState<string | null>(null);
  const submitting = stage !== 'idle';

  // Guest details — prefilled from the signed-in account (still editable, in
  // case the traveller isn't the account holder), plus card fields.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    unitsApi.getById(params.unitId).then(setUnit);
  }, [params.unitId]);

  // Populate once the account loads, without clobbering anything the user already typed.
  useEffect(() => {
    if (!user) return;
    setFirstName((v) => v || user.firstName);
    setLastName((v) => v || user.lastName);
    setEmail((v) => v || user.email);
    setPhone((v) => v || (user.phone.startsWith('+966') ? user.phone.slice(4) : user.phone));
  }, [user]);

  if (!unit) return <div className="container mx-auto p-10">{tc('loading')}</div>;

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const subtotal = unit.pricePerNight * nights;
  const cleaning = unit.cleaningFee ?? 0;
  const serviceFee = subtotal * ((unit.serviceFeePercent ?? 10) / 100);
  const tax = (subtotal + cleaning + serviceFee) * ((unit.taxPercent ?? 15) / 100);
  const total = subtotal + cleaning + serviceFee + tax;

  /** Localized message for the first invalid form field, or null when everything checks out. */
  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim()) return t('errors.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t('errors.email');
    if (cardNumber.replace(/\D/g, '').length !== 16) return t('errors.cardNumber');
    const [mm, yy] = expiry.split('/');
    const month = Number(mm);
    const year = Number(yy);
    if (!mm || !yy || month < 1 || month > 12) return t('errors.expiry');
    const now = new Date();
    if (year + 2000 < now.getFullYear() || (year + 2000 === now.getFullYear() && month < now.getMonth() + 1))
      return t('errors.expired');
    if (cvv.length !== 3) return t('errors.cvv');
    if (!cardName.trim()) return t('errors.cardName');
    if (!agreed) return t('errors.agree');
    return null;
  };

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

    try {
      // 1) Create the booking — or reuse the one from a failed payment attempt.
      let id = bookingId;
      if (!id) {
        setStage('booking');
        const booking = await bookingsApi.create({
          unitId: unit.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: { adults: guests, children: 0 },
          paymentMethod: 'visa',
        });
        id = booking.id;
        setBookingId(id);
      }

      // 2) Open a payment on the backend; it returns the Moyasar publishable key
      //    (env var is a fallback — the backend-provided key always wins).
      setStage('paying');
      const init = await paymentsApi.initiate(id, 'card');
      const publishableKey = init.publishableKey || process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY || '';
      if (!init.paymentId || !publishableKey) {
        // Mock/dev mode — no real payment opened, treat the booking as done.
        router.push(`/booking/confirmation/${id}`);
        return;
      }

      // 3) Tokenize the card directly with Moyasar (card data never hits our backend).
      const [mm, yy] = expiry.split('/');
      const token = await createCardToken(
        publishableKey,
        {
          name: cardName.trim(),
          number: cardNumber.replace(/\D/g, ''),
          month: mm!.padStart(2, '0'),
          year: yy!,
          cvc: cvv,
        },
        `${window.location.origin}/payment/callback`,
        locale,
      );

      // 4) Charge the token server-side. Remember context first: a 3-DS hop
      //    leaves the app and React state won't survive it.
      rememberPendingPayment({ paymentId: init.paymentId, bookingId: id });
      const pay = await paymentsApi.pay(init.paymentId, token);

      if (pay.transactionUrl) {
        // Bank requires 3-D Secure — hand the browser over to it.
        window.location.assign(pay.transactionUrl);
        return;
      }
      if (pay.status === 'paid' || pay.status === 'captured') {
        router.push(`/booking/confirmation/${id}`);
        return;
      }
      throw new Error(pay.message || t('errors.paymentFailed'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.genericFailed'));
      setStage('idle');
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

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">{t('personalInfo')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('firstName')}</Label>
              <Input placeholder={t('firstNamePlaceholder')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('lastName')}</Label>
              <Input placeholder={t('lastNamePlaceholder')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('email')}</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              dir="ltr"
              className="text-start"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('phone')}</Label>
            <PhoneInput placeholder="5XXXXXXXX" dir="ltr" className="text-start" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">{t('paymentInfo')}</h2>
          <div className="space-y-2">
            <Label>{t('cardNumber')}</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              dir="ltr"
              className="text-start font-mono"
              inputMode="numeric"
              maxLength={19} // 16 digits + 3 spaces
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('expiry')}</Label>
              <Input
                placeholder="MM/YY"
                dir="ltr"
                className="text-start"
                inputMode="numeric"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>CVV</Label>
              <Input
                placeholder="123"
                dir="ltr"
                className="text-start"
                inputMode="numeric"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('cardName')}</Label>
            <Input
              placeholder={t('cardNamePlaceholder')}
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">{t('cancellationPolicyTitle')}</h2>
          <CancellationPolicyDisplay policy={getPolicyByTemplate(unit.cancellationPolicy)} showHeader={false} />
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

        {error && <p className="text-sm text-status-danger">{error}</p>}

        <Button size="lg" className="w-full" onClick={handleConfirm} disabled={submitting}>
          {stage === 'booking'
            ? t('creatingBooking')
            : stage === 'paying'
            ? t('processingPayment')
            : t('payAmount', { amount: formatSAR(total) })}
        </Button>
        <p className="text-center text-xs text-brand-muted">
          🔒 {t('secureNote')}
        </p>
      </div>

      <aside className="md:order-1">
        <Card className="sticky top-24 space-y-4 p-5">
          <div className="flex items-center gap-3">
            <img src={unit.imageUrls[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="text-sm">
              <div className="font-semibold">{unit.title}</div>
              <div className="text-xs text-brand-muted">{unit.city}، {unit.country}</div>
            </div>
          </div>
          <hr className="border-brand-border" />
          <h3 className="font-semibold">{t('priceDetails')}</h3>
          <Row label={t('priceLine', { price: unit.pricePerNight, nights })} value={formatSAR(subtotal)} />
          <Row label={t('cleaningFee')} value={formatSAR(cleaning)} />
          <Row label={t('serviceFee')} value={formatSAR(serviceFee)} />
          <Row label={t('taxes')} value={formatSAR(tax)} />
          <hr className="border-brand-border" />
          <Row label={t('total')} value={formatSAR(total)} bold />
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
