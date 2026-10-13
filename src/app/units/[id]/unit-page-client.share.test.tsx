/**
 * The unit page offers no share button. The one it had did nothing when
 * pressed — it never had a handler — so it is hidden until sharing is built
 * (decision of 2026-10-13). Checked by name and by icon, so a share button
 * back in any wording turns this red.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import UnitDetailsPage from './unit-page-client';
import { useFavoritesStore } from '@/stores/favorites';
import { useSearchStore } from '@/stores/search';
import { MOCK_UNITS } from '@/data/mock/units';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'U-001' }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  useSearchStore.getState().reset();
  useFavoritesStore.setState({ unitIds: [] });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('unit page — sharing', () => {
  it('offers no share button, by name or by icon, and keeps the save button', () => {
    const { container } = render(
      <NextIntlClientProvider locale="ar" messages={arMessages}>
        <UnitDetailsPage initialUnit={{ ...MOCK_UNITS[0]!, listingId: 'uU-001' }} />
      </NextIntlClientProvider>,
    );

    // The header actions did render: the save button sits where share sat.
    expect(screen.getAllByRole('button', { name: arMessages.unit.save }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /مشاركة|share/i })).toBeNull();
    expect(container.querySelector('[class*="lucide-share"]')).toBeNull();
  });
});
