/**
 * Every way into a building's page ends on its listing key. Through the real
 * client, against the raw answers staging gave on 2026-09-29 for building 30
 * (its card, doors 39–42 and their codes). The page never reads the shape of
 * what the URL carries: it hands the value to the API as is and takes the
 * destination from the answer's `listing_id` — see SEO-CONSTRAINTS.md §6.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';

// React's `cache` lives in the server build Next renders with, not in the
// React the tests run on — see page.server.test.tsx.
const { memos } = vi.hoisted(() => ({ memos: [] as Map<unknown, unknown>[] }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (key: unknown) => unknown) => {
      const memo = new Map<unknown, unknown>();
      memos.push(memo);
      return (key: unknown) => {
        if (!memo.has(key)) memo.set(key, fn(key));
        return memo.get(key);
      };
    },
  };
});

// Like the real ones, they throw: nothing after a redirect or a 404 runs.
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  permanentRedirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const API = 'https://api.test/api/v1';
const KEY = '01M19EZRB4ARP4BDGJ4ET7P03F';
const SITE = 'https://www.mamsaa.com';

/** A unit of building 30 the way staging's `GET /units/{ref}` wraps it. */
const unitAnswer = (id: number, code: string) => ({
  success: true,
  message: '',
  data: {
    id,
    listing_id: KEY,
    code,
    name: 'برج تجريبي - مبنى كامل',
    city: 'الرياض',
    district: null,
    type: 'apartment',
    description: 'وصف تجريبي للوحدة.',
    images: [],
  },
});

/**
 * What staging answered for each ref. A door's code resolves to the card
 * (id 30); a door's own id resolves to that door (id 42) — same listing_id.
 */
const ANSWERS: Record<string, { status: number; body: unknown }> = {
  ELDZ5BZ9: { status: 200, body: unitAnswer(30, 'NHQKANW1') }, // door 42's code
  '42': { status: 200, body: unitAnswer(42, 'ELDZ5BZ9') }, // door 42 itself
  '1G4ADB2F': { status: 200, body: unitAnswer(30, 'NHQKANW1') }, // door 41's code, the other generator's format
  [KEY]: { status: 200, body: unitAnswer(30, 'NHQKANW1') },
  QX7PL2ZM: { status: 404, body: { message: 'الوحدة غير متاحة' } }, // a unit no longer on sale
};

const fetchMock = vi.fn(async (url: string) => {
  const ref = decodeURIComponent(url.slice(`${API}/units/`.length));
  if (ref.endsWith('/reviews')) return json([], 200);
  const answer = ANSWERS[ref] ?? { status: 404, body: { message: 'المورد غير موجود' } };
  return json(answer.body, answer.status);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

type Page = typeof import('./page');
let page: Page;
/** The view, from the same fresh module graph as `page` — to find it in what the page rendered. */
let UnitDetailsPage: unknown;

beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', API);
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
  vi.stubGlobal('fetch', fetchMock);
  page = await import('./page');
  UnitDetailsPage = (await import('./unit-page-client')).default;
}, 60_000);

afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  fetchMock.mockClear();
  vi.mocked(permanentRedirect).mockClear();
  vi.mocked(notFound).mockClear();
  for (const memo of memos) memo.clear();
});

const open = (id: string) => page.default({ params: { id } });

/** The unit reads the page made — exactly what the URL carried, nothing rewritten. */
const unitReads = () =>
  fetchMock.mock.calls.map(([url]) => url as string).filter((url) => !url.endsWith('/reviews'));

describe('unit page — every way into a building ends on its listing key', () => {
  it("sends a door's code (not the card's) on to the building's key", async () => {
    await expect(open('ELDZ5BZ9')).rejects.toThrow('NEXT_REDIRECT');

    expect(unitReads()).toEqual([`${API}/units/ELDZ5BZ9`]);
    expect(permanentRedirect).toHaveBeenCalledOnce();
    expect(permanentRedirect).toHaveBeenCalledWith(`/units/${KEY}`);
  });

  // The easiest to break without noticing: the answer says `id: 42`, and a
  // target built from it (/units/42, /units/u42) still opens a page.
  it("sends a door's own id (/units/42) on to the building's key, never to anything built from id 42", async () => {
    await expect(open('42')).rejects.toThrow('NEXT_REDIRECT');

    expect(unitReads()).toEqual([`${API}/units/42`]);
    expect(permanentRedirect).toHaveBeenCalledOnce();
    expect(permanentRedirect).toHaveBeenCalledWith(`/units/${KEY}`);
  });

  it("sends a code in the other generator's format (1G4ADB2F) on to the building's key", async () => {
    await expect(open('1G4ADB2F')).rejects.toThrow('NEXT_REDIRECT');

    expect(unitReads()).toEqual([`${API}/units/1G4ADB2F`]);
    expect(permanentRedirect).toHaveBeenCalledWith(`/units/${KEY}`);
  });

  it("answers 404, with no redirect, for the code of a unit that isn't on sale", async () => {
    await expect(open('QX7PL2ZM')).rejects.toThrow('NEXT_NOT_FOUND');

    expect(unitReads()).toEqual([`${API}/units/QX7PL2ZM`]);
    expect(notFound).toHaveBeenCalledOnce();
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  // Even a value that already looks like a key is read: skipping the read to
  // "save a call" would leave the page without its content.
  it('opens the listing key itself with no redirect, canonical to itself, and the unit in the page', async () => {
    const params = { id: KEY };

    const rendered = (await page.default({ params })) as ReactElement<{ children: ReactNode }>;
    const meta = await page.generateMetadata({ params });

    expect(permanentRedirect).not.toHaveBeenCalled();
    expect(notFound).not.toHaveBeenCalled();
    expect(meta.alternates?.canonical).toBe(`${SITE}/units/${KEY}`);
    expect(unitReads()).toEqual([`${API}/units/${KEY}`]);
    const view = Children.toArray(rendered.props.children).find(
      (k) => isValidElement<{ initialUnit?: { listingId?: string } }>(k) && k.type === UnitDetailsPage,
    ) as ReactElement<{ initialUnit?: { listingId?: string } }> | undefined;
    expect(view?.props.initialUnit?.listingId).toBe(KEY);
  });
});
