import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

/**
 * Cookie-based locale (no /en URL prefix): the whole site flips in place when
 * the language toggle rewrites the cookie and refreshes the router.
 */
export const LOCALES = ['ar', 'en'] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'ar';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export default getRequestConfig(async () => {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  const locale: AppLocale = cookieValue === 'en' ? 'en' : DEFAULT_LOCALE;

  // Explicit imports (not a template literal) so webpack resolves them
  // statically instead of scanning the directory as a context module.
  const messages =
    locale === 'en'
      ? (await import('../../messages/en.json')).default
      : (await import('../../messages/ar.json')).default;

  return { locale, messages };
});
