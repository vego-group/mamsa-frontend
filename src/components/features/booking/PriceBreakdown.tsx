/**
 * PriceBreakdown — the shared price-summary block
 * (nights × rate / tax / divider / bold total).
 *
 * Pure display: it renders whatever numbers it is given — the backend
 * computes all money, this component only ever formats and lays it out.
 * Per the final pricing decision, tax (VAT) is the only fee — no cleaning
 * fee, no service fee.
 */
import type { PriceBreakdown as PriceBreakdownData } from '@/types';

export interface PriceBreakdownLabels {
  /** Pre-interpolated nights line, e.g. "450 ر.س × 2 ليالي". */
  priceLine: string;
  taxes: string;
  total: string;
}

interface PriceBreakdownProps {
  price: PriceBreakdownData;
  labels: PriceBreakdownLabels;
  /** SAR formatter — pages already share formatSAR; injected to keep this component pure. */
  format: (amount: number) => string;
}

export function PriceBreakdown({ price, labels, format }: PriceBreakdownProps) {
  return (
    <>
      <PriceRow label={labels.priceLine} value={format(price.subtotal)} />
      <PriceRow label={labels.taxes} value={format(price.tax)} />
      <hr className="border-brand-border" />
      <PriceRow label={labels.total} value={format(price.total)} bold />
    </>
  );
}

function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'text-base font-bold' : ''}`}>
      <span className={bold ? '' : 'text-brand-muted'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
