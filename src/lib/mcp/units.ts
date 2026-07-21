/**
 * Server-side data access for the MCP server (`src/app/mcp/route.ts`).
 *
 * Deliberately NOT `@/lib/api/client`: that module is browser-shaped — it reads
 * tokens from localStorage, dynamically imports a zustand store on 401, and runs
 * behind a mock switch that defaults to ON when `NEXT_PUBLIC_USE_MOCK` is unset.
 * An MCP server publishes a Server Card claiming real listings, so it must serve
 * real data or fail loudly; it may never quietly answer an agent with mock units.
 *
 * Everything here is read-only and unauthenticated — the same public browsing
 * surface an anonymous visitor sees. No booking, payment, or account endpoint is
 * reachable from a tool.
 */
import { mapUnit, mapReview, type RawUnit } from '@/lib/api/adapters';
import type { Unit, Review, UnitsFilter } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

/** Agents wait on a tool call; a hung upstream must fail rather than stall the turn. */
const TIMEOUT_MS = 10_000;

export class McpDataError extends Error {}

/**
 * Guards the two ways this server could end up publishing something untrue:
 * no backend configured at all, or the mock switch left on in a deployment.
 */
function assertLiveBackend(): void {
  if (!BASE_URL) {
    throw new McpDataError('NEXT_PUBLIC_API_BASE_URL is not set — no live backend to query.');
  }
  if (USE_MOCK) {
    throw new McpDataError('NEXT_PUBLIC_USE_MOCK is not "false" — refusing to serve mock data over MCP.');
  }
}

async function get<T>(path: string): Promise<T> {
  assertLiveBackend();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        // Skip the ngrok browser-warning interstitial (harmless on a real domain).
        'ngrok-skip-browser-warning': '1',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    throw new McpDataError(
      e instanceof Error && e.name === 'TimeoutError'
        ? `Upstream timed out after ${TIMEOUT_MS}ms.`
        : 'Could not reach the Mamsa API.',
    );
  }

  if (!res.ok) {
    throw new McpDataError(`Mamsa API returned ${res.status} for ${path}.`);
  }

  const json: unknown = await res.json();
  // Most endpoints wrap payloads in `{ success, message, data }`; some return raw.
  if (json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

/** Mirrors `unitFilterToQuery` in the API client — the same params the website sends. */
function toQuery(f: UnitsFilter): string {
  const sp = new URLSearchParams();
  const pairs: Record<string, string | number | undefined> = {
    city: f.city,
    type: f.type && f.type !== 'all' ? f.type : undefined,
    capacity: f.capacity,
    min_price: f.minPrice,
    max_price: f.maxPrice,
    min_rating: f.minRating,
    sort: f.sort,
  };
  for (const [k, v] of Object.entries(pairs)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const searchUnits = (filter: UnitsFilter): Promise<Unit[]> =>
  get<RawUnit[]>(`/units${toQuery(filter)}`).then((rows) => rows.map(mapUnit));

export const getUnit = (id: string): Promise<Unit> => get<RawUnit>(`/units/${id}`).then(mapUnit);

export const getFeaturedUnits = (): Promise<Unit[]> =>
  get<RawUnit[]>('/units/popular').then((rows) => rows.map(mapUnit));

export const getUnitReviews = (id: string): Promise<Review[]> =>
  get<Record<string, unknown>[]>(`/units/${id}/reviews`).then((rows) => rows.map(mapReview));
