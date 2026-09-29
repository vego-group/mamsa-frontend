# SEO constraints — decided for now, to revisit

Choices that are right while the site stays as it is, and that the larger
indexing work (separate language routes, hreflang) has to reopen. Every claim
cites `path:line`. Opened 2026-09-29 on `feat/sitemap-listing-key`.

---

## 1. The unit page's `<head>` is always Arabic, whatever the language cookie

**What.** `unitMetadata` builds the unit page's title, description, OpenGraph
and X card in Arabic for every visitor:

- The title's separators (` — `, `، `) and brand (`BRAND.nameAr`) are fixed —
  `src/app/units/[id]/unit-metadata.ts` (`unitTitle`).
- The sentence used when a unit has no description takes its words from
  `messages/ar.json` only (`factsSentence`).
- `og:locale` is `ar_SA` (`unitMetadata`).

A visitor with `NEXT_LOCALE=en` therefore gets an Arabic tab title and share
card, under `<html lang="en">` (`src/app/layout.tsx:47`). And when the unit read
fails, the page falls back to the root layout's head, which *does* follow the
cookie (`src/app/layout.tsx:29-39`, `getTranslations('meta')`). So the same URL
can show an Arabic unit title or an English site-wide one, depending on
whether the API answered.

**Why it is right now.** Both languages are served from one URL: the locale
is a cookie, not a path (`src/i18n/request.ts:14-15`). A crawler sends no
cookie and is served Arabic, the default (`src/i18n/request.ts:10`). A URL can
only have one canonical and one `og:locale`, and the head a crawler indexes
should match the content it indexes. Following the cookie would give a
shared link a different card depending on who shared it.

**Revisit with** the larger indexing work, once each language has its own
URL (e.g. `/en/units/{listing_id}`):

- `unitMetadata` takes the locale, and the title template, fallback sentence
  and `og:locale` come from that locale's messages.
- `alternates.languages` (hreflang) points each language at the other, with
  `x-default` on Arabic; `og:locale:alternate` lists the other.
- The canonical stays per language, and the sitemap lists both
  (`src/app/sitemap.ts`).
