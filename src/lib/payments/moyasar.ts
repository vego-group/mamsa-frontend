/**
 * Moyasar HOSTED payment form — runs in the BROWSER only.
 *
 * moyasar.js renders a PCI-compliant card/Apple Pay form inside `div.mysr-form`
 * and charges Moyasar directly (card data never touches the Mamsa backend).
 * After payment Moyasar redirects the browser to our callback URL with
 * `?id=<moyasar_id>&status=…&message=…` appended; we add our own `pid` so the
 * callback page knows which of OUR payments to verify server-side.
 */
import type { InitiatePaymentResult } from '@/lib/api/client';

const MOYASAR_VERSION = '1.14.0';
const MOYASAR_TOKENS_URL = 'https://api.moyasar.com/v1/tokens';

export interface CardTokenInput {
  /** Cardholder name as printed on the card. */
  name: string;
  /** Digits only. */
  number: string;
  cvc: string;
  /** e.g. "12" */
  month: string;
  /** 4 digits, e.g. "2028" */
  year: string;
}

/**
 * Exchanges card details for a Moyasar token — BROWSER → Moyasar directly.
 * The PAN never touches the Mamsa API; only the returned token id is sent to
 * `POST /user/cards/from-token`. `callbackUrl` is required by Moyasar.
 * Throws Moyasar's own (already localised) message on validation failure.
 */
export async function createCardToken(
  publishableKey: string,
  card: CardTokenInput,
  callbackUrl: string,
): Promise<{ id: string }> {
  const res = await fetch(MOYASAR_TOKENS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${publishableKey}:`),
    },
    body: JSON.stringify({
      name: card.name,
      number: card.number,
      cvc: card.cvc,
      month: card.month,
      year: card.year,
      callback_url: callbackUrl,
    }),
  });
  const tok: unknown = await res.json().catch(() => null);
  const t = (tok ?? {}) as { id?: string; message?: string };
  if (!res.ok || !t.id) throw new Error(t.message || 'بيانات البطاقة غير صحيحة');
  return { id: t.id };
}

/** Injects moyasar.css + moyasar.js once; resolves when the script is ready. */
export function loadMoyasarAssets(locale: 'ar' | 'en' = 'ar'): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Moyasar?: unknown }).Moyasar) return resolve();

    if (!document.getElementById('moyasar-css')) {
      const link = document.createElement('link');
      link.id = 'moyasar-css';
      link.rel = 'stylesheet';
      link.href = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.css`;
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.js`;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(locale === 'ar' ? 'فشل تحميل بوابة الدفع' : 'Failed to load the payment gateway'));
    document.body.appendChild(script);
  });
}

/**
 * Renders the hosted form into `.mysr-form` (the div must already be mounted
 * and must never be conditionally re-rendered afterwards).
 */
export function initMoyasarForm(info: InitiatePaymentResult): void {
  // The user may have navigated away between the script loading and this
  // deferred call — initialising against a missing element throws inside
  // moyasar.js, so bail out quietly instead.
  if (!document.querySelector('.mysr-form')) return;

  // Moyasar redirects here after payment; pid ties it back to OUR payment row.
  // Built from our own origin (not info.callbackUrl) so the user returns to
  // the domain they started on.
  const callbackUrl = `${window.location.origin}/payment/callback?pid=${info.paymentId}`;

  (window as unknown as { Moyasar: { init: (config: unknown) => void } }).Moyasar.init({
    element: '.mysr-form',
    amount: info.amountHalalas, // halalas from the API — never recompute
    currency: info.currency, // "SAR"
    description: info.description,
    publishable_api_key: info.publishableKey,
    callback_url: callbackUrl,
    save_card: true, // backend persists the token during verify
    methods: ['creditcard', 'applepay'],
    apple_pay: {
      country: 'SA',
      label: 'Mamsa',
      validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
    },
    metadata: {
      payment_id: info.paymentId,
      booking_id: info.bookingId,
    },
  });
}
