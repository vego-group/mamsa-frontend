import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../messages/ar.json';
import NotFound from './not-found';

function renderNotFound() {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <NotFound />
    </NextIntlClientProvider>,
  );
}

describe('404 page', () => {
  it('says in Arabic that the page is not there', () => {
    renderNotFound();

    expect(screen.getByRole('heading', { level: 1, name: 'غير موجود' })).toBeTruthy();
    expect(screen.getByText('لم نعثر على ما تبحث عنه.')).toBeTruthy();
    expect(screen.queryByText(/could not be found/i)).toBeNull();
  });

  // A 404 with no way on leaves the visitor only the back button.
  it('offers a way on, to the listings', () => {
    renderNotFound();

    expect(screen.getByRole('link', { name: 'إكتشف وجهتك' }).getAttribute('href')).toBe('/units');
  });
});
