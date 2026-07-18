import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PriceBreakdown } from './PriceBreakdown';

afterEach(cleanup);

const LABELS = {
  priceLine: '100 ر.س × 1 ليالي',
  cleaningFee: 'رسوم النظافة',
  serviceFee: 'رسوم الخدمة',
  taxes: 'الضرائب',
  total: 'المجموع',
};

const format = (n: number) => `${n} ر.س`;

describe('PriceBreakdown — cleaning fee row visibility', () => {
  it('hides the cleaning-fee row when the value is 0 and hideZeroCleaningFee is set', () => {
    render(
      <PriceBreakdown
        price={{ pricePerNight: 100, nights: 1, subtotal: 100, cleaningFee: 0, serviceFee: 10, tax: 15, total: 125 }}
        labels={LABELS}
        format={format}
        hideZeroCleaningFee
      />,
    );
    expect(screen.queryByText('رسوم النظافة')).toBeNull();
  });

  it('shows the cleaning-fee row when the value is non-zero, even with hideZeroCleaningFee set', () => {
    render(
      <PriceBreakdown
        price={{ pricePerNight: 100, nights: 1, subtotal: 100, cleaningFee: 50, serviceFee: 10, tax: 15, total: 175 }}
        labels={LABELS}
        format={format}
        hideZeroCleaningFee
      />,
    );
    expect(screen.getByText('رسوم النظافة')).toBeTruthy();
    expect(screen.getByText(format(50))).toBeTruthy();
  });

  it('shows the cleaning-fee row even when 0 if hideZeroCleaningFee is not set (existing pages unaffected)', () => {
    render(
      <PriceBreakdown
        price={{ pricePerNight: 100, nights: 1, subtotal: 100, cleaningFee: 0, serviceFee: 10, tax: 15, total: 125 }}
        labels={LABELS}
        format={format}
      />,
    );
    expect(screen.getByText('رسوم النظافة')).toBeTruthy();
  });
});
