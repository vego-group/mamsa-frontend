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

---

## 2. No exact coordinates in structured data

**Position (decided 2026-09-29).** Publishing a unit's coordinates to five
decimal places (about 1 m) is refused in principle: that is the address of
someone's home. Comparable platforms show an approximate area until a booking
is confirmed.

**Why it comes up.** Google's `VacationRental` markup requires `latitude` and
`longitude` to at least five decimal places
([developers.google.com](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental)),
alongside a Hotel Center account and at least eight photos. None of that
markup exists today, and none is planned in the unit-page phases.

**If `VacationRental` is asked for later,** this condition is the first thing
to settle with the owner, not something to implement because Google requires
it.

**For the record, what is already public.** The unit API returns coordinates
to four decimal places (about 11 m) to anyone — on staging, unit 12 is
`24.7136, 46.6753` — and the site places map pins with them
(`src/app/page.tsx:163-164`, `src/app/units/units-page-client.tsx:202-203`).
This position covers what we add to structured data; whether four decimals on
the public API is itself too precise is a question for the owner and the
backend.

---

## 3. A unit's 404 is a real 404, but its body is drawn in the browser

**What.** When the API answers 404 for a unit, the page calls `notFound()`
(`src/app/units/[id]/page.tsx`). The response is a real `404` with
`<meta name="robots" content="noindex">`, but its HTML is Next's error shell,
`<html id="__next_error__">` with an empty `<body>`: the Arabic 404 page
(`src/app/not-found.tsx`) is drawn by the browser from the RSC payload. A
mistyped URL (`/no-such-page`) gets the same page rendered on the server.

**Why it is acceptable now.** What a crawler acts on — the status and the
noindex — is server-side either way. A visitor with JavaScript sees the same
page, header, footer and the link to the listings (checked in Chrome,
2026-09-29).

**Not ours to fix in the page.** It is Next 14.2.13 (`package.json:37`): the
same shell comes back with Next's default 404 and with `notFound()` also
called from `generateMetadata`. The App Router has no other way to send a 404
from a page.

**Revisit with** the Next.js upgrade: check that `/units/{missing}` then comes
back with the 404 page in its HTML.

---

## 4. Streamed reviews arrive hidden, and JavaScript puts them in place

**What.** The unit page doesn't wait for its reviews: they stream in under a
`<Suspense>` boundary (`src/app/units/[id]/page.tsx`,
`src/app/units/[id]/server-reviews.tsx`). When they arrive after the rest of
the page has been sent, React writes them at the end of the HTML inside
`<div hidden id="S:…">`, and an inline script moves them into the reviews
section.

**Why it is acceptable now.** Google renders JavaScript, and the reviews are
in the HTML it fetches. A crawler that doesn't run JavaScript sees them only
as hidden markup.

**Revisit** if a non-rendering crawler starts to matter, or if reviews should
be in the first flush: that means waiting for them, which this page chose not
to do (a slow reviews read must never hold the page back).

---

## 5. A phase that touches a server component isn't done until `next build` has served it

**The rule.** Run `next build`, start it, and request the changed pages
before calling such a phase finished. Unit tests are not enough.

**Why.** Vitest runs server and client code as one module graph and can't
see the React Server Components boundary. On 2026-09-29 the unit page called
`withoutPrice`, exported from its `'use client'` view. Every test passed, and
the built page answered 500 (`TypeError: d is not a function`): a function
exported from a client module reaches a server component as a client
reference, not as something it can call. The fix moved it to a plain module
(`src/app/units/[id]/unit-content.ts`). Only the built page showed the bug.

---

## 6. Never recognise a unit key by its shape

**The rule.** Whatever the unit URL carries, the page hands it to the API
exactly as it is, and takes the redirect target from the `listing_id` in the
answer (`src/app/units/[id]/page.tsx`). Nothing on our side decides what kind
of key a value is: no `^MRN`, no length, no "has letters", no "looks like a
ULID". An unknown value is the API's to resolve, and a 404 from the API is the
only "not a unit".

**Why.** Unit codes don't have one format: there are two generators (on
production `MRNXDX5D`, on staging `1G4ADB2F` and `ELDZ5BZ9`). What is
guaranteed is the backend's order of resolution, not the shape. And the
answer's `id` is not the target either: `GET /units/42`, a door of building
30, answers `id: 42` with `listing_id: 01M19EZRB4ARP4BDGJ4ET7P03F`. A target
built from `id` (`/units/42`, `/units/u42`) still opens a page, so nobody
would notice the split.

**Tempting, and wrong.** Skipping the read for a value that "already looks
like a key", to save a call. The read is what fills the page's head and
content; a wrong guess sends a crawler to a second URL.

**Pinned by** `src/app/units/[id]/page.keys.test.tsx`: a door's code, a
door's own id, a code in the other format, a code of a unit not on sale
(404, no redirect), and the key itself (no redirect, canonical to itself).
Checked against four ways of breaking it: a target built from `id`, codes
told apart by `^MRN`, a door's id taken as canonical, and the read skipped for
key-shaped values. Each one fails the tests.
