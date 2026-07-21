# Reply — your two open decisions + one live filter bug

**Date:** 2026-07-21 · Reply to `NEXTJS-UNIT-FIELDS-ANSWERS.md` · From: Next.js (www)

Everything you shipped is wired and verified against staging — `beds`, `owner.type`/`is_verified`/`avatar_url`, structured `amenities`, `tax_percent`, `is_featured`, `area`, `approval_status` + `rejection_reason`. Thank you.

Below: answers to the two items you flagged **needs a decision**, then one bug that is live on the units page right now.

---

## 1. `discount_percent` — dropped, don't build it

**Decision: no discounts. Please don't add the field.**

You were right to hold. There is no discount programme, so a badge would have been decoration over a price that never changes. We've removed unit-level discounts from our side entirely (type, both badge renderers, mock data, translation keys) rather than leave a dormant field that invites someone to switch it on later.

`Offer.discount_percent` on `/offers` is untouched — that's the marketing offers section and a separate thing.

## 2. `first_name` / `last_name` — yes please, add the columns

**Decision: take your offer — collect first/last at registration and store them as two columns.**

Reasoning: our UI already has two separate inputs in three places (registration, checkout guest details, account profile). Registration already collects them and **joins** them before calling you:

```ts
name: `${values.firstName} ${values.lastName}`.trim()
```

…and on read-back we split on whitespace, which is where `"عبد الله محمد"` becomes first name `"عبد"`. So the two-field shape is what the product actually wants; the single `name` column is the only thing forcing the lossy round-trip.

Concretely, when you're ready:

- add `first_name` + `last_name`, keep `name` as the display concatenation (so nothing that reads `name` breaks)
- accept both on `POST /auth/complete-profile` and `PUT /user/profile`
- return both on `GET /auth/me` and `GET /user/profile`
- backfill: naive split is fine for existing rows — users can correct it in account settings

Until that ships we keep the current join-on-write / split-on-read. We have **not** added a cleverer splitting heuristic, because any guess is still wrong for compound Arabic names and would just hide the problem.

---

## 3. 🔴 `features[]` filter takes Arabic labels, so the amenity filter returns nothing

§1.3 gave us stable slugs on the way **out**, but the filter on the way **in** still matches the raw Arabic label. Measured on staging today:

```
GET /units                          → 12 units
GET /units?features[]=wifi          →  0     ← the slug we send
GET /units?features[]=واي فاي        → 12     ← the label
GET /units?features[]=smart_tv      →  0
GET /units?features[]=شاشة ذكية      →  2
```

Our sidebar sends slugs from the vocabulary you published, so **every amenity checkbox on `/units` currently returns zero results.**

### We can't work around it

Sending labels instead would give *wrong* results rather than empty ones, because both spellings exist in the data:

```
GET /units?features[]=تكييف   → 2 units
GET /units?features[]=مكيف    → 9 units    ← same amenity; both map to key "ac" in your response
```

A guest filtering for A/C would see 2 of 11 units and no sign the other 9 exist. `features[]` is AND-semantics, so we can't send both spellings either. There is no label string that returns the correct set.

### The ask

Make `features[]` accept the slug — the same vocabulary you already return in `amenities[].key`:

```
GET /units?features[]=ac&features[]=wifi   → units having BOTH (keep the AND semantics)
```

You already own the label→slug normalization; this is applying it to the query input. Keep label matching as a fallback if you like — we only ever send slugs.

The vocabulary we send:

```
wifi · ac · kitchen · parking · pool · security · self_checkin · family_friendly ·
smart_tv · garden · bbq · elevator · washer · private_beach · event_hall
```

(The sidebar exposes the first six today; the rest are wired and ready.)

**Also worth a one-off pass:** the catalogue stores both `تكييف`/`مكيف` and `تلفزيون ذكي`/`شاشة ذكية`. Once filtering keys off slugs this stops affecting results, but normalizing the stored labels would make the data match the vocabulary too.

---

## Note on `beds`

Live and wired — thanks. Every unit in the staging catalogue currently has `beds === bedrooms` (your backfill), so the displayed number won't visibly change until partners edit their listings. Expected, just flagging that we can't visually confirm the field is independent until one diverges.
