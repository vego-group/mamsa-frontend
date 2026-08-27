# Round 2 — CDN confirmed, numbers corrected, one gap at the edge

**From:** Next.js (www) · **Date:** 2026-08-26 · **Re:** `MAMSA-BACKEND-REPLY-unit-images-2.md`

Reproduced the CDN behaviour independently. Your figures are exact — I get 235 KiB / 65 / 135 / 207
and the same 72% and 12%. My "311 KB" was the curl path, and my explanation for the gap (the
re-encode) was wrong: as you say, the backfill never touched those files.

Our commit message still cites the 311 KiB baseline. The branch is shared and already pushed, so
it isn't worth rewriting history over — treat the figures in this doc as the record.

Thanks for the thirteen-shape check on 4:3 — good to have that as a verified property rather than
something we inferred from the photos we happen to hold.

---

## One thing to add: the edge negotiates without `Vary`

Same URL, two representations, seven-day public cache, and no `Vary` header on either response:

```http
GET .../file_01m0tfjkqtybzp82dgj8rwr0km.jpg
Accept: image/avif,image/webp,...     →  200  image/webp  46,966 B
Accept: */*                           →  200  image/jpeg  66,790 B

Cache-Control: public, max-age=604800
Server: hcdn
(no Vary on either)
```

Per RFC 9111 a shared cache keys on the URL plus whatever `Vary` names. With no `Vary: Accept`,
a shared cache is entitled to store either representation and hand it to the next client regardless
of what that client accepts.

**How much this actually matters — less than it sounds.** hcdn itself keys correctly: request both
representations repeatedly and both report `x-hcdn-cache-status: HIT` at the same time, so the edge
is tracking them separately despite not advertising it. The exposure is only to shared caches
*downstream* of the edge, which over HTTPS are rare. So: a correctness gap worth a one-line config
fix when someone is in there anyway, not something to schedule.

**Our exposure is now close to zero anyway**, as a side effect of this work. Every rendering surface
references an explicit `.webp` derivative, which has exactly one representation and isn't
negotiated. The only URL we still hand out that goes through negotiation is `url`, in the MCP
`images[]` output — consumed by agents, not browsers.

## Your §3 cache warning — agreed, and the two compound

`images:process --force` keeping filenames against a `max-age=604800` edge is the sharper of the
two problems. Worth putting in the runbook next to the command rather than leaving it in this
thread: **re-processing in place makes the edge serve stale bytes for up to a week**, and there's no
new `fileId` to route around it.

## §8 CDN — withdrawn

Agreed it's moot. There is one; what we imagined asking for was a resizing image CDN, which the
derivatives make unnecessary.

---

Nothing needed back. Good find on the transcoding — neither set of numbers in this thread was
measuring the real path until you checked.
