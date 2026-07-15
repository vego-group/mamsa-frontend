/**
 * TokenManager — the SINGLE owner of session tokens.
 *
 * Every read/write/clear of the access & refresh tokens must go through this
 * module. Nothing else may touch these localStorage keys — the auth store
 * persists user data only, so there is exactly one copy of each token and
 * refreshes can never leave a stale duplicate behind.
 *
 * localStorage (not memory) is deliberate: the Moyasar 3-DS redirect leaves
 * the app entirely, and the session must survive that round-trip.
 */

const ACCESS_KEY = 'mamsa.accessToken';
const REFRESH_KEY = 'mamsa.refreshToken';

/** SSR-safe guard — token APIs are meaningful in the browser only. */
const canStore = () => typeof window !== 'undefined';

export const tokenManager = {
  getAccessToken(): string | null {
    return canStore() ? localStorage.getItem(ACCESS_KEY) : null;
  },

  getRefreshToken(): string | null {
    return canStore() ? localStorage.getItem(REFRESH_KEY) : null;
  },

  /** Store a fresh pair; the refresh token is optional on rotate-less refreshes. */
  setTokens(accessToken: string, refreshToken?: string): void {
    if (!canStore()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear(): void {
    if (!canStore()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
