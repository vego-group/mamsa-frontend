/**
 * PriceBreakdown — the shared price-summary block.
 *
 * Pure display: it renders whatever numbers it is given — the backend
 * computes all money, this component only ever formats and lays it out.
 * VAT is the only tax — no cleaning fee, no service fee.
 *
 * The layout encodes the pricing model. Prices are VAT-INCLUSIVE, so:
 *
 *   500.00 ر.س × 2 ليالي                       1,000.00 ر.س
 *   شامل ضريبة القيمة المضافة
 *   ────────────────────────────────────────────────────────
 *   الإجمالي                                   1,000.00 ر.س
 *
 *   ▸ عرض تفاصيل الضريبة
 *       الأساس قبل الضريبة                       869.57 ر.س
 *       ضريبة القيمة المضافة (15%)               130.43 ر.س
 *
 * The total EQUALS the nights line — nothing is added between them, and no
 * figure on this block is ever larger than the total. The net/VAT split lives
 * inside a disclosure that is CLOSED by default and sits BELOW the total, so it
 * reads as "what the total is made of" rather than as a step in a running sum.
 * A guest's question is "what do I pay", and one number answers it; the split
 * is there for anyone who wants it and for reconciling against a tax invoice.
 */
import type { PriceBreakdown as PriceBreakdownData } from '@/types';

export interface PriceBreakdownLabels {
  /** Pre-interpolated nights line, e.g. "450 ر.س × 2 ليالي". */
  priceLine: string;
  /** Caption under the nights line, e.g. "شامل ضريبة القيمة المضافة". */
  inclVat: string;
  total: string;
  /** Disclosure trigger, e.g. "عرض تفاصيل الضريبة". */
  showTaxDetails: string;
  netBase: string;
  /** Pre-interpolated with the rate, e.g. "ضريبة القيمة المضافة (15%)". */
  vat: string;
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
      <PriceRow label={labels.priceLine} value={format(price.gross)} />
      <p className="-mt-1 text-xs text-brand-muted">{labels.inclVat}</p>
      <hr className="border-brand-border" />
      <PriceRow label={labels.total} value={format(price.gross)} bold />

      {/* Native <details>: closed by default, keyboard accessible, no JS. */}
      <details className="group pt-1">
        <summary className="cursor-pointer list-none text-xs text-brand-primary underline-offset-2 hover:underline">
          <span className="inline-flex items-center gap-1">
            {labels.showTaxDetails}
            <span aria-hidden className="transition group-open:rotate-180">⌄</span>
          </span>
        </summary>
        {/* Indented: these are components OF the total above, not additions to it. */}
        <div className="mt-2 space-y-1 border-s-2 border-brand-border ps-3">
          <PriceRow label={labels.netBase} value={format(price.netBase)} muted />
          <PriceRow label={labels.vat} value={format(price.vat)} muted />
        </div>
      </details>
    </>
  );
}

function PriceRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex justify-between ${muted ? 'text-xs' : 'text-sm'} ${bold ? 'text-base font-bold' : ''}`}>
      <span className={bold ? '' : 'text-brand-muted'}>{label}</span>
      <span className={muted ? 'text-brand-muted' : ''}>{value}</span>
    </div>
  );
}
