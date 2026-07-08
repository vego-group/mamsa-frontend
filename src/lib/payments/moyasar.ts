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
