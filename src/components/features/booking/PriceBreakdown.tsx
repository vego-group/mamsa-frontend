/**
 * PriceBreakdown — the shared price-summary block
 * (nights × rate / cleaning fee / service fee / tax / divider / bold total).
 *
 * Pure display: it renders whatever numbers it is given — pricing stays
 * calculated where it always was (checkout estimate client-side, payment page
 * from the frozen `initiate.booking` block, details page from the booking).
 *
 * Labels are passed in (pre-translated) rather than pulled from a namespace
 * because the existing pages intentionally differ: the details page says
 * «رسوم التنظيف» / «المجموع الكلي» and lists the service fee first, while
 * checkout/payment say «رسوم النظافة» / «المجموع (ر.س)» with cleaning first.
 */
import type { PriceBreakdown as PriceBreakdownData } from '@/types';

export interface PriceBreakdownLabels {
  /** Pre-interpolated nights line, e.g. "450 ر.س × 2 ليالي". */
  priceLine: string;
  cleaningFee: string;
  serviceFee: string;
  taxes: string;
  total: string;
}

interface PriceBreakdownProps {
  price: PriceBreakdownData;
  labels: PriceBreakdownLabels;
  /** SAR formatter — pages already share formatSAR; injected to keep this component pure. */
  format: (amount: number) => string;
  /** Booking-details layout lists the service fee before the cleaning fee. */
  serviceFeeFirst?: boolean;
}

export function PriceBreakdown({ price, labels, format, serviceFeeFirst = false }: PriceBreakdownProps) {
  const fees: Array<[string, number]> = serviceFeeFirst
    ? [
        [labels.serviceFee, price.serviceFee],
        [labels.cleaningFee, price.cleaningFee],
      ]
    : [
        [labels.cleaningFee, price.cleaningFee],
        [labels.serviceFee, price.serviceFee],
      ];

  return (
    <>
      <PriceRow label={labels.priceLine} value={format(price.subtotal)} />
      {fees.map(([label, value]) => (
        <PriceRow key={label} label={label} value={format(value)} />
      ))}
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
