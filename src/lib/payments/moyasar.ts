/**
 * Moyasar card tokenization — runs in the BROWSER only.
 *
 * The raw card number is sent straight to Moyasar and never touches the Mamsa
 * backend (keeps PCI scope with Moyasar). The returned token is what we hand
 * to `POST /payments/pay`; the backend charges it server-side and may come
 * back with a 3-D Secure `transaction_url` we must redirect the user to.
 */

const MOYASAR_TOKENS_URL = 'https://api.moyasar.com/v1/tokens';

export interface CardDetails {
  /** Cardholder name as printed on the card. */
  name: string;
  /** Digits only (spaces already stripped). */
  number: string;
  /** Two-digit month, e.g. "09". */
  month: string;
  /** Two-digit year, e.g. "27". */
  year: string;
  /** 3-digit security code. */
  cvc: string;
}

/**
 * Common Moyasar error messages, translated per locale. Anything unmapped
 * falls back to the locale's generic message (Moyasar only replies in English).
 */
const ERROR_TRANSLATIONS: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    'Invalid card number': 'رقم البطاقة غير صحيح',
    'Card expired': 'البطاقة منتهية الصلاحية',
    'Invalid month': 'شهر الانتهاء غير صحيح',
    'Invalid year': 'سنة الانتهاء غير صحيحة',
    'Invalid cvc': 'رمز الأمان (CVV) غير صحيح',
  },
  en: {
    'Invalid card number': 'Invalid card number',
    'Card expired': 'Card expired',
    'Invalid month': 'Invalid expiry month',
    'Invalid year': 'Invalid expiry year',
    'Invalid cvc': 'Invalid security code (CVV)',
  },
};

const GENERIC_ERROR: Record<'ar' | 'en', string> = {
  ar: 'تعذّر التحقق من بيانات البطاقة، تأكد منها وحاول مجددًا.',
  en: 'Could not verify the card details, please check them and try again.',
};

function toErrorMessage(body: unknown, locale: 'ar' | 'en'): string {
  if (body && typeof body === 'object') {
    const { message, errors } = body as { message?: string; errors?: Record<string, string[]> };
    const raw = message ?? (errors ? Object.values(errors).flat()[0] : undefined);
    if (raw) return ERROR_TRANSLATIONS[locale][raw] ?? raw;
  }
  return GENERIC_ERROR[locale];
}

/**
 * Exchanges card details for a one-time Moyasar token.
 * `callbackUrl` is where Moyasar returns the browser after any 3-DS step.
 */
export async function createCardToken(
  publishableKey: string,
  card: CardDetails,
  callbackUrl: string,
  locale: 'ar' | 'en' = 'ar',
): Promise<string> {
  const res = await fetch(MOYASAR_TOKENS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publishable_api_key: publishableKey,
      name: card.name,
      number: card.number,
      month: card.month,
      year: card.year,
      cvc: card.cvc,
      save_only: true,
      callback_url: callbackUrl,
    }),
  });

  const body: unknown = await res.json().catch(() => null);
  const id = body && typeof body === 'object' ? (body as { id?: string }).id : undefined;
  if (!res.ok || !id) throw new Error(toErrorMessage(body, locale));
  return id;
}
