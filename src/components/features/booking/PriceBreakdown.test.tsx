import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PriceBreakdown } from './PriceBreakdown';

afterEach(cleanup);

const LABELS = {
  priceLine: '100 ر.س × 1 ليالي',
  taxes: 'الضرائب (15٪)',
  total: 'المجموع',
};

const format = (n: number) => `${n} ر.س`;

describe('PriceBreakdown — tax-only breakdown', () => {
  it('renders the subtotal, tax, and total rows straight from the given price — no cleaning/service fee rows', () => {
    render(
      <PriceBreakdown
        price={{ pricePerNight: 100, nights: 1, subtotal: 100, tax: 15, total: 115 }}
        labels={LABELS}
        format={format}
      />,
    );
    expect(screen.getByText(LABELS.priceLine)).toBeTruthy();
    expect(screen.getByText(format(100))).toBeTruthy();
    expect(screen.getByText(LABELS.taxes)).toBeTruthy();
    expect(screen.getByText(format(15))).toBeTruthy();
    expect(screen.getByText(LABELS.total)).toBeTruthy();
    expect(screen.getByText(format(115))).toBeTruthy();
  });
});
