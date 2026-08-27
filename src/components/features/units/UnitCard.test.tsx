import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { UnitCard } from './UnitCard';
import type { Unit } from '@/types';

/**
 * A listing straight off the sign-up flow: the backend has no score for it, so
 * it sends the placeholder zeroes. What the host sees next to their own
 * property on their first visit is decided here.
 */
function unit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'U-TEST',
    ownerId: 'O-1',
    ownerName: 'فهد',
    ownerType: 'individual',
    ownerVerified: true,
    ownerAvatarUrl: null,
    title: 'شقة في الملقا',
    description: '',
    type: 'apartment',
    status: 'approved',
    city: 'الرياض',
    district: 'الملقا',
    country: 'السعودية',
    latitude: 24.7,
    longitude: 46.6,
    pricePerNight: 900,
    capacity: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: [],
    images: [{ url: '/a.jpg', card: '/a.jpg', full: '/a.jpg', thumb: '/a.jpg', width: null, height: null }],
    rating: 0,
    reviewCount: 0,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'flexible',
    createdAt: '2026-08-01',
    ...overrides,
  } as Unit;
}

function renderCard(u: Unit, variant: 'grid' | 'list') {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <UnitCard unit={u} variant={variant} />
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe.each(['grid', 'list'] as const)('UnitCard (%s) — unscored listing', (variant) => {
  it('wears a "new" badge instead of a zero score', () => {
    const { container } = renderCard(unit(), variant);
    expect(screen.getByText(arMessages.card.newListing)).toBeTruthy();
    // The zero must not reach the card in any shape — not as a score, not as
    // a review count, and not as a filled star.
    expect(container.textContent).not.toContain('(0)');
    expect(container.querySelector('.fill-yellow-500')).toBeNull();
  });

  it('shows the real score once guests have left one', () => {
    const { container } = renderCard(unit({ rating: 4.7, reviewCount: 12 }), variant);
    expect(screen.queryByText(arMessages.card.newListing)).toBeNull();
    expect(screen.getByText('4.7')).toBeTruthy();
    expect(container.textContent).toContain('(12)');
  });

  it('treats a score with no reviews behind it as unscored', () => {
    renderCard(unit({ rating: 4.5, reviewCount: 0 }), variant);
    expect(screen.getByText(arMessages.card.newListing)).toBeTruthy();
  });

  it('lazy-loads its photo, so a long results page costs one screenful', () => {
    const { container } = renderCard(unit(), variant);
    expect(container.querySelector('img')?.getAttribute('loading')).toBe('lazy');
  });
});
