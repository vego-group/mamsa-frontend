import type { Metadata } from 'next';
import type { Unit } from '@/types';
import { BRAND, SITE_URL } from '@/lib/constants/brand';
import { unitPath } from '@/lib/listing';
import { parseRichText, type InlineNode, type RichBlock } from '@/lib/utils/rich-text';
import ar from '../../../../messages/ar.json';

/** Roughly what a results page shows of a title before it cuts it. */
const TITLE_MAX = 60;
/** …and of a description. */
const DESCRIPTION_MAX = 155;
/** A name cut shorter than this stops naming anything — the title runs long instead. */
const NAME_MIN = 20;

/**
 * The unit page's <head>: its own name, place and description in the title,
 * the snippet and the share card, and the listing-key URL as canonical — the
 * URL an old id link is redirected to.
 */
export function unitMetadata(unit: Unit): Metadata {
  const title = unitTitle(unit);
  const description = unitDescription(unit);
  const cover = unit.images[0]?.full;
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: { canonical: `${SITE_URL}${unitPath(unit)}` },
    openGraph: {
      ...(title && { title }),
      ...(description && { description }),
      ...(cover && { images: [{ url: cover, alt: unit.title.trim() }] }),
      locale: 'ar_SA',
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  };
}

/**
 * The page's breadcrumb trail as BreadcrumbList JSON-LD, ready to write into
 * a `<script type="application/ld+json">`: the same three steps the page
 * shows, the unit at its canonical URL. Arabic, like the rest of the head.
 *
 * The unit's name is the partner's own text, so every `<` is escaped — a
 * name holding `</script>` must not end the script early.
 */
export function unitBreadcrumbJsonLd(unit: Unit): string {
  const trail = [
    { name: ar.common.home, item: `${SITE_URL}/` },
    { name: ar.common.explore, item: `${SITE_URL}/units` },
    { name: unit.title.trim(), item: `${SITE_URL}${unitPath(unit)}` },
  ];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, ...step })),
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** `{name} — {district}، {city} | مَمسَى`. A long name is cut; the place never is. */
function unitTitle(unit: Unit): string | undefined {
  const name = unit.title.trim();
  if (!name) return undefined;
  const place = [unit.district.trim(), unit.city.trim()].filter(Boolean).join('، ');
  const suffix = `${place ? ` — ${place}` : ''} | ${BRAND.nameAr}`;
  return `${clip(name, Math.max(TITLE_MAX - suffix.length, NAME_MIN))}${suffix}`;
}

/** The unit's own description as plain text, or a sentence of its facts when it has none. */
function unitDescription(unit: Unit): string | undefined {
  const text = plainText(unit.description ?? '');
  return clip(text || factsSentence(unit), DESCRIPTION_MAX) || undefined;
}

/**
 * The description with the partner's markup taken off — by the same parser
 * the page renders it with, so nothing it shows as formatting leaks in. A
 * heading leads into what follows it, a list reads as one run of items — each
 * item's own closing stop dropped, so they don't pile up as `.،`.
 */
function plainText(source: string): string {
  const inline = (nodes: InlineNode[]) => nodes.map((n) => n.value).join('').replace(/\s+/g, ' ').trim();
  const item = (nodes: InlineNode[]) => inline(nodes).replace(/[.,،؛;]+$/, '');
  const block = (b: RichBlock): string => {
    if (b.type === 'heading') return withEnd(inline(b.content), ':');
    if ('items' in b) return withEnd(b.items.map(item).filter(Boolean).join('، '), '.');
    return withEnd(inline(b.content), '.');
  };
  return parseRichText(source).map(block).filter(Boolean).join(' ');
}

/** Closes a run of text with `mark` unless it already ends a sentence. */
function withEnd(text: string, mark: string): string {
  return !text || /[.!?؟:…]$/.test(text) ? text : `${text}${mark}`;
}

/** e.g. `شقة في الرياض — 2 غرف نوم، حتى 4 ضيوف.` — only the facts the unit has. */
function factsSentence(unit: Unit): string {
  const type = ar.types[unit.type];
  const city = unit.city.trim();
  const head = [type, city && `في ${city}`].filter(Boolean).join(' ');
  const facts = [
    unit.bedrooms > 0 && `${unit.bedrooms} ${ar.unit.facts.bedrooms}`,
    unit.capacity > 0 && `حتى ${unit.capacity} ${ar.unit.facts.guests}`,
  ].filter(Boolean);
  const sentence = [head, facts.join('، ')].filter(Boolean).join(' — ');
  return sentence && `${sentence}.`;
}

/** `text` cut to at most `max` characters, between words where it can be, ending in `…`. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  let cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  if (space > max / 2) cut = cut.slice(0, space);
  return `${cut.trimEnd()}…`;
}
