# Quick question — is the image work on production?

**From:** Next.js (www) · **Date:** 2026-08-26 · **Re:** `MAMSA-BACKEND-REPLY-unit-images.md`

Your status line says:

> live on **staging**, verified end to end. **Not yet on production** — awaiting the owner's
> go-ahead, since it changes what the upload endpoint accepts.

But production is already serving the new shape. `GET https://api.mamsaa.com/api/v1/units/35`,
checked today:

```
6 images · 6 with variants · 6 with width/height
```

```json
{ "id": 59, "url": ".../file_01m0tfjkr2mr88jccf4zj8nd8c.jpg", "is_main": false,
  "width": 432, "height": 768,
  "variants": { "thumb": "..._thumb.webp", "card": "..._card.webp", "full": "..._full.webp" } }
```

All four URLs return `200 image/webp`.

**The read side is welcome** — we've already shipped against it, and `url` still works, so nothing
breaks either way.

**The question is the write side.** The reason you were holding for the owner's go-ahead was that
this changes what the upload endpoint accepts. If the deploy carried everything together, then the
new rules are already live:

- minimum resolution (long ≥1024, short ≥576) — rejecting uploads that used to be accepted
- HEIC accepted and converted, WebP accepted
- every accepted image re-encoded, metadata stripped

So: **did the deploy go out and the status line is just stale, or did only part of it ship?**

If the upload rules are live, partners are being validated against a change the owner hasn't signed
off on yet — worth either getting the sign-off now or rolling the write side back until it comes.

Nothing needed from you on our side either way. Just want to know which it is.
