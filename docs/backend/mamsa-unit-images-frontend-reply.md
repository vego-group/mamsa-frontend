# Unit images — integrated, with two notes back

**From:** Next.js (www) · **Date:** 2026-08-26 · **Re:** `MAMSA-BACKEND-REPLY-unit-images.md`
**Status:** ✅ wired end to end on our side, verified against the **production** API.

All four corrections in your §0 are accepted — three of them caught real errors in my request and
the library is better for it. Details below, then two things going the other way: one about your
deployment status, one about the `width`/`height` advice in your closing section that would have
reserved the wrong box if I'd followed it literally.

---

## 1. My numbers were wrong — you're right

I wrote *"كل صورة ~2–4MB → 12–24MB"* about unit 35. I estimated that from typical partner uploads
and never measured it. Measured just now against production:

| | total for unit 35's six photos |
|---|---|
| originals (`url`) | **311 KB** |
| `thumb` | 65 KB |
| `card` | 135 KB |
| `full` | 207 KB |

Your 271 KB and my 311 KB differ only because I counted after the re-encode. Same picture: the
premise of the "12–24 MB" line was off by roughly 50×, and I should have checked before writing it.

The mechanism was still real — one URL served five display sizes, and the thumbnail strip pulled
full-size files. Measured, the strip is now **311 KB → 65 KB, a 79% cut**. Worth having, not the
emergency I framed it as.

## 2. §0.2 `full` never upscales — agreed, and I should have said so myself

You're right that a 2048 floor would have enlarged the whole library, and right that this is the
same objection I raised in §5 against AI upscaling. Bicubic interpolation invents pixels too. The
cap-without-enlarging behaviour is what I should have specified.

## 3. §0.3 minimum on long/short edge — better than what I asked for

`width ≥ 1280` read literally does reject every portrait, including the 9:16 phone photos the whole
thread started from. Long/short edge is the correct axis.

One thing worth recording, because it makes the 1024/576 floor look better chosen than it may seem:
**a 9:16 phone portrait at long edge 1024 has short edge exactly 576.** The floor sits precisely on
the commonest portrait shape, so it admits phone photos while still excluding genuinely small files.

We accept the consequence you flagged — the 432×768 portraits on units 34/35 would be refused if
re-uploaded. Existing rows are untouched, which is what matters.

## 4. §0.4 aspect ratio not enforced — agreed, and my request contradicted itself

Rejecting 9:16 while building a full-screen viewer for it was incoherent. It's also now moot on our
side: the CSS fix that started this thread makes the lightbox fit **any** ratio, so there is nothing
left for a ratio rule to protect.

## 5. `variants: null` rather than three copies — the right call

Filling the shape with originals would have satisfied our types and silently defeated the feature.
The null is load-bearing and our adapter treats it as the fallback signal, as intended.

---

## 6. Note back: this is already live on production

Your status line says *"live on staging… Not yet on production — awaiting the owner's go-ahead."*
`GET https://api.mamsaa.com/api/v1/units/35` returned this today:

```json
{ "id": 59, "url": "…/file_01m0tfjkr2mr88jccf4zj8nd8c.jpg", "is_main": false,
  "width": 432, "height": 768,
  "variants": { "thumb": "…_thumb.webp", "card": "…_card.webp", "full": "…_full.webp" } }
```

All six photos on unit 35 carry variants, and all four URLs serve `200 image/webp`. So either the
deploy went out after you wrote, or the status line is stale — worth confirming which, because if
the upload-side changes (the new minimum, HEIC, the EXIF strip) went out with it, partners are
already being validated against rules the owner hasn't signed off on.

## 7. Note back: `width`/`height` describe `full` only — not `thumb` or `card`

Your closing section suggests putting `width`/`height` on the `<img>` to reserve the box. That's
correct for `full` and **wrong for the other two**, because they're 4:3 cover crops while
`width`/`height` describe the original. Measured on two real photos:

| source | `width`/`height` | `thumb` | `card` | `full` |
|---|---|---|---|---|
| portrait | 432×768 · **0.563** | 400×300 · 1.333 | 432×324 · 1.333 | 432×768 · **0.563** ✅ |
| landscape | 1024×576 · **1.778** | 400×300 · 1.333 | 768×576 · 1.333 | 1024×576 · **1.778** ✅ |

Reserving a 0.563 box for an image that arrives at 1.333 is a worse layout shift than reserving
nothing. So we use them on the lightbox `<img>` (which renders `full`) and nowhere else — every
other surface sits in a fixed-size container with `object-cover`, where the box is already known
from CSS and the attributes would only do harm.

No change needed from you — `thumb` and `card` are always 4:3, which is all we need. Just worth
adding to the contract docs so the next reader doesn't wire it up the way your note describes.

---

## 8. Your open questions

**`400` vs `422` — keep `400`, and don't move the others.** You're right that one endpoint speaking
two dialects is worse than the mismatch with my request. We read the error code, not the status, so
`IMAGE_TOO_SMALL` is what we branch on either way. Not worth a migration.

**`alt` — yes, we want it.** Add the column when you add the partner form field. Agreed that
generating `"{اسم الوحدة} 3"` server-side just relocates our placeholder; a real caption from the
partner is the only version worth having. No rush.

**Implementation guide — not needed, thanks.** The contract in your §1 was enough; it's integrated
and tested. See below.

**CDN** — agreed it's less urgent now that derivatives are small WebP. Parking it.

---

## 9. What we changed

`UnitImage` is now a type with all four sizes pre-resolved, so no caller branches on null:

```ts
// src/lib/api/adapters.ts
function mapImage(i: RawImage): UnitImage {
  return {
    url: i.url,
    thumb: i.variants?.thumb ?? i.url,
    card:  i.variants?.card  ?? i.url,
    full:  i.variants?.full  ?? i.url,
    width: i.width ?? null,
    height: i.height ?? null,
  };
}
```

| surface | size used |
|---|---|
| lightbox thumbnail strip, checkout summary, booking snapshot | `thumb` |
| search cards, home cards, map pins, gallery collage | `card` |
| lightbox stage (+ `width`/`height`) | `full` |
| MCP `images[]` output | `url` — the original, unprocessed |

Four adapter tests cover it: derivative routing, `variants: null` → original, key absent → original,
and cover-photo ordering. Type-check clean, 152 tests pass.

The thumbnail strip also picked up `loading="lazy"` / `decoding="async"` while we were in there.

---

## 10. Two things we did not take

- **`sort_order`** — thanks for shipping it early, but our adapter still hoists `is_main` to index 0,
  because the gallery's hero and every card's cover image read `images[0]`. Your position/cover
  independence is preserved in the raw response; we reorder in the mapper, not in your contract. If
  a partner-facing reorder UI lands later we'll revisit.
- **A queue** — your §6 reasoning is sound and the requirement was "once at upload, not per read",
  which synchronous satisfies. 1.4s per photo on a signed PUT is fine.

Good catch on the EXIF GPS block, and on HEIC being refused outright rather than stored — both were
worse than what I described in the request.
