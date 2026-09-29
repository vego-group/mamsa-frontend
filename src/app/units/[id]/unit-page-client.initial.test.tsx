/**
 * The view started from the unit the page read on the server: its content is
 * there from the first HTML, and the price only ever from the browser's own
 * read — the server's copy may be five minutes old.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './unit-page-client';
import { ApiError, unitsApi } from '@/lib/api/client';
import { useFavoritesStore } from '@/stores/favorites';
import { useSearchStore } from '@/stores/search';
import { formatSAR } from '@/lib/utils/format';
import { MOCK_UNITS } from '@/data/mock/units';
import type { Unit } from '@/types';

const UNIT_ID = 'U-001'; // pricePerNight 1200 in mock data — what the browser's read returns

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: UNIT_ID }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

/** The server's copy, five minutes old: its price has since changed. */
const SERVER_COPY: Unit = { ...MOCK_UNITS[0]!, listingId: 'uU-001', pricePerNight: 999 };
const STALE_PRICE = formatSAR(999);
const FRESH_PRICE = formatSAR(1200);

function tree(props: Parameters<typeof UnitDetailsPage>[0] = { initialUnit: SERVER_COPY }) {
  return (
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <UnitDetailsPage {...props} />
    </NextIntlClientProvider>
  );
}

/** Lets the browser's (mock) read land. */
async function browserReadLands() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  useSearchStore.getState().reset();
  useFavoritesStore.setState({ unitIds: [] });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('unit page view — the first HTML', () => {
  it("carries the unit's name, description and amenities, but no price", () => {
    const html = renderToString(tree());

    expect(html).toMatch(new RegExp(`<h1[^>]*>${SERVER_COPY.title}</h1>`));
    expect(html).toContain(arMessages.unit.about);
    expect(html).toContain(arMessages.unit.amenitiesTitle);
    expect(html).not.toContain(arMessages.common.loading);
    expect(html).not.toContain(STALE_PRICE);
  });

  it('is only the loading line when there is no server copy, as before', () => {
    const html = renderToString(tree({}));

    expect(html).toContain(arMessages.common.loading);
    expect(html).not.toContain('<h1');
  });

  // A saved unit is in this browser's storage only: the server renders with
  // none saved, and the browser hydrates that HTML already knowing better.
  it('hydrates without a mismatch while the guest has the unit saved', async () => {
    const html = renderToString(tree());
    useFavoritesStore.setState({ unitIds: [UNIT_ID] });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, tree());
      });

      expect(errors).not.toHaveBeenCalled();
      expect(container.textContent).toContain(arMessages.unit.saved);
    } finally {
      act(() => root?.unmount());
      container.remove();
    }
  });
});

describe('unit page view — the price comes from the browser only', () => {
  it('never shows the server copy’s price, and shows the fresh one once the browser’s read lands', async () => {
    render(tree());

    expect(screen.getByRole('heading', { level: 1, name: SERVER_COPY.title })).toBeTruthy();
    expect(document.body.textContent).not.toContain(STALE_PRICE);
    expect(document.body.textContent).not.toContain(FRESH_PRICE);

    await browserReadLands();

    expect(document.body.textContent).toContain(FRESH_PRICE);
    expect(document.body.textContent).not.toContain(STALE_PRICE);
  });
});

describe('unit page view — when the browser’s read fails', () => {
  it('keeps the content up and puts the retry in the booking card only', async () => {
    const read = vi.spyOn(unitsApi, 'getById').mockRejectedValueOnce(new ApiError(503, 'down'));
    render(tree());
    await browserReadLands();

    expect(screen.getByRole('heading', { level: 1, name: SERVER_COPY.title })).toBeTruthy();
    expect(document.body.textContent).not.toContain(STALE_PRICE);
    const retry = screen.getAllByRole('button', { name: arMessages.common.retry });
    expect(retry.length).toBeGreaterThan(0);

    read.mockRestore();
    fireEvent.click(retry[0]!);
    await browserReadLands();

    expect(document.body.textContent).toContain(FRESH_PRICE);
    expect(screen.queryByRole('button', { name: arMessages.common.retry })).toBeNull();
  });

  it('says the unit is gone when the browser finds it gone, rather than keep showing it', async () => {
    vi.spyOn(unitsApi, 'getById').mockRejectedValue(new ApiError(404, 'الوحدة غير متاحة'));
    render(tree());
    await browserReadLands();

    expect(screen.getByText(arMessages.common.notFoundTitle)).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1, name: SERVER_COPY.title })).toBeNull();
  });
});

describe('unit page view — reviews', () => {
  it("shows the server's reviews until the browser's own arrive", async () => {
    vi.spyOn(unitsApi, 'getReviews').mockResolvedValue([
      {
        id: 'r1',
        bookingId: '',
        unitId: UNIT_ID,
        userId: 'g1',
        userName: 'سارة',
        rating: 5,
        comment: 'تعليق من المتصفح',
        createdAt: '2026-09-01T10:00:00Z',
      },
    ]);
    render(tree({ initialUnit: SERVER_COPY, serverReviews: <p>مراجعات من السيرفر</p> }));

    expect(screen.getByText('مراجعات من السيرفر')).toBeTruthy();

    await browserReadLands();

    expect(screen.queryByText('مراجعات من السيرفر')).toBeNull();
    expect(screen.getByText('تعليق من المتصفح')).toBeTruthy();
  });

  // The price is what the guest is waiting for; the reviews are already on
  // the page from the server.
  it('lets the booking card open without waiting for slow reviews', async () => {
    vi.spyOn(unitsApi, 'getReviews').mockReturnValue(new Promise(() => {}));
    render(tree({ initialUnit: SERVER_COPY, serverReviews: <p>مراجعات من السيرفر</p> }));

    await browserReadLands();

    expect(document.body.textContent).toContain(FRESH_PRICE);
    expect(screen.getByText('مراجعات من السيرفر')).toBeTruthy();
  });

  it("keeps the server's reviews when the browser's own read of them fails", async () => {
    vi.spyOn(unitsApi, 'getReviews').mockRejectedValue(new ApiError(503, 'down'));
    render(tree({ initialUnit: SERVER_COPY, serverReviews: <p>مراجعات من السيرفر</p> }));

    await browserReadLands();

    expect(document.body.textContent).toContain(FRESH_PRICE);
    expect(screen.getByText('مراجعات من السيرفر')).toBeTruthy();
    expect(screen.queryByText(arMessages.unit.noReviews)).toBeNull();
  });
});
