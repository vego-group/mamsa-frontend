/**
 * VAT-inclusive pricing arithmetic — the ONLY module in this repo permitted to
 * do money math with the VAT rate.
 *
 * The platform rule: `pricePerNight` is the GROSS, VAT-inclusive price. It is
 * displayed verbatim and never multiplied by anything but the night count. VAT
 * is split back OUT of that gross figure for the checkout summary and the tax
 * invoice — never added on top of it.
 *
 *   gross   = pricePerNight × nights   ← what the guest pays, shown everywhere
 *   netBase = gross / (1 + VAT_RATE)
 *   vat     = gross − netBase
 *
 * `vat` is derived by SUBTRACTION, never as `netBase × VAT_RATE`. Subtraction
 * is what guarantees `netBase + vat === gross` exactly after rounding — the
 * multiplied form drifts by a halala on values like 999.99 and would put a tax
 * invoice out of balance with the amount actually charged.
 */
import { VAT_RATE, VAT_PERCENT_LABEL } from '@/lib/constants/brand';

/**
 * The VAT rate as a whole number for labels, e.g. "ضريبة القيمة المضافة (15%)".
 * Prefers the rate the server sent with the quote (`vat_rate`), falling back to
 * the platform constant where a screen has no live quote to read it from —
 * a frozen booking, for instance. Kept here so the ×100 stays with the rest of
 * the pricing arithmetic.
 */
export function vatPercentLabel(vatRate?: number | null): number {
  return vatRate == null ? VAT_PERCENT_LABEL : round2(vatRate * 100);
}

/** Rounds to 2 decimals (halalas) — the precision every displayed figure uses. */
export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Splits a gross, VAT-inclusive amount into its net base and VAT parts.
 * Guarantees `netBase + vat === gross` for the rounded values it returns.
 */
export function splitGross(gross: number): { gross: number; netBase: number; vat: number } {
  const g = round2(gross);
  const netBase = round2(g / (1 + VAT_RATE));
  return { gross: g, netBase, vat: round2(g - netBase) };
}

/**
 * Builds the full quote for a stay from the gross nightly rate. This is the
 * shape the unit page, checkout, payment and confirmation screens all render,
 * so the same inputs always produce the same total on every one of them.
 */
export function quoteFromNightly(
  pricePerNight: number,
  nights: number,
): {
  nights: number;
  nightlyRate: number;
  gross: number;
  netBase: number;
  vat: number;
  vatRate: number;
} {
  const { gross, netBase, vat } = splitGross(pricePerNight * nights);
  return { nights, nightlyRate: pricePerNight, gross, netBase, vat, vatRate: VAT_RATE };
}
