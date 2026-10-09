/**
 * Where the app's data comes from — one rule for the API client and the MCP
 * server alike.
 *
 * The real API is the default. The mock is used only when it is asked for by
 * name, `NEXT_PUBLIC_USE_MOCK=true`. Unset, empty and `false` all mean the real
 * API; any other value is a typo nobody should guess at, so it throws. So does
 * the real API without `NEXT_PUBLIC_API_BASE_URL`: it has nowhere to go.
 *
 * It used to be the other way round — mock unless the flag was literally
 * `false` — so a deployment that lost the variable showed customers fixtures
 * without a word. Throwing at load fails `next build` instead.
 *
 * Callers pass `process.env.NEXT_PUBLIC_*` spelled out in full: Next.js inlines
 * those into the browser bundle only where they are written literally.
 */
export type DataSource = { mock: true } | { mock: false; apiBaseUrl: string };

export class DataSourceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataSourceConfigError';
  }
}

export function resolveDataSource(useMock: string | undefined, apiBaseUrl: string | undefined): DataSource {
  if (useMock === 'true') return { mock: true };
  if (useMock !== undefined && useMock !== '' && useMock !== 'false') {
    throw new DataSourceConfigError(
      `NEXT_PUBLIC_USE_MOCK must be "true" (mock data) or "false"/unset (the real API), got ${JSON.stringify(useMock)}.`,
    );
  }
  const url = apiBaseUrl?.trim();
  if (!url) {
    throw new DataSourceConfigError(
      'NEXT_PUBLIC_API_BASE_URL is not set. The real API is the default — set it, or set NEXT_PUBLIC_USE_MOCK=true for mock data.',
    );
  }
  return { mock: false, apiBaseUrl: url };
}
