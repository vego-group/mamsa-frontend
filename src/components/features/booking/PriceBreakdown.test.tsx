import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { PriceBreakdown } from './PriceBreakdown';

afterEach(cleanup);

const LABELS = {
  priceLine: '500 ر.س × 2 ليالي',
  inclVat: 'شامل ضريبة القيمة المضافة',
  total: 'الإجمالي',
  showTaxDetails: 'عرض تفاصيل الضريبة',
  netBase: 'الأساس قبل الضريبة',
  vat: 'ضريبة القيمة المضافة (15%)',
};

const format = (n: number) => `${n} ر.س`;

/** 500 gross × 2 nights — the canonical example from the pricing spec. */
const PRICE = { pricePerNight: 500, nights: 2, gross: 1000, netBase: 869.57, vat: 130.43 };

/** Value cells only: `<div><span>label</span><span>value</span></div>`. */
const valueCells = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('div > span:nth-child(2)')).map((el) => el.textContent);

describe('PriceBreakdown — VAT is contained in the total, never added to it', () => {
  it('renders a total exactly equal to gross', () => {
    render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);

    expect(screen.getByText(LABELS.total)).toBeTruthy();
    // The nights line and the total are the SAME number — VAT is already in it.
    expect(screen.getAllByText(format(PRICE.gross))).toHaveLength(2);
  });

  it('captions the price as VAT-inclusive', () => {
    render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);
    expect(screen.getByText(LABELS.inclVat)).toBeTruthy();
  });

  it('never renders a figure larger than the payable total', () => {
    const { container } = render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);

    const amounts = valueCells(container)
      .map((t) => Number(String(t).replace(/[^\d.]/g, '')))
      .filter((n) => Number.isFinite(n));
    expect(amounts.length).toBeGreaterThan(0);
    expect(Math.max(...amounts)).toBe(PRICE.gross);
  });

  it('keeps the net/VAT split summing back to the total', () => {
    render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);
    expect(PRICE.netBase + PRICE.vat).toBe(PRICE.gross);
  });
});

describe('PriceBreakdown — the tax split is a disclosure, closed by default', () => {
  it('starts collapsed, so the guest sees one number first', () => {
    const { container } = render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);

    const details = container.querySelector('details');
    expect(details).toBeTruthy();
    expect(details!.hasAttribute('open')).toBe(false);
  });

  it('places the split INSIDE the disclosure, below the total — never as a row above it', () => {
    const { container } = render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);
    const details = container.querySelector('details')!;

    // Both figures must live inside <details>; if either leaked out into the
    // main rows it would read as a line item being added to the total.
    expect(details.textContent).toContain(format(PRICE.netBase));
    expect(details.textContent).toContain(format(PRICE.vat));

    const outside = container.textContent!.replace(details.textContent!, '');
    expect(outside).not.toContain(format(PRICE.vat));
    expect(outside).not.toContain(format(PRICE.netBase));
  });

  it('reveals the net base and VAT once opened', () => {
    const { container } = render(<PriceBreakdown price={PRICE} labels={LABELS} format={format} />);

    fireEvent.click(container.querySelector('summary')!);

    expect(screen.getByText(LABELS.netBase)).toBeTruthy();
    expect(screen.getByText(LABELS.vat)).toBeTruthy();
    expect(screen.getByText(format(PRICE.netBase))).toBeTruthy();
    expect(screen.getByText(format(PRICE.vat))).toBeTruthy();
  });
});
