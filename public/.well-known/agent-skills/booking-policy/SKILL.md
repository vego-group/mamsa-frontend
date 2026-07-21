---
name: booking-policy
description: Mamsa (مَمسَى) booking rules an agent needs before advising a guest — how nightly totals are calculated, the three cancellation policies and their refund tiers, check-in times, and why an agent cannot complete a booking on a user's behalf.
---

# Mamsa booking rules

What to tell a person before they book on Mamsa (مَمسَى), and what you must not
do on their behalf. To find listings first, see the `search-rentals` skill.

## Pricing

```
total = (nightly rate × nights) + 15% VAT
```

There are **no cleaning fees and no service fees**. A listing's `pricePerNight`
is the pre-VAT nightly rate, in SAR.

Get a real quote from `POST /units/{id}/availability` with `start_date` and
`end_date` (see `search-rentals`). It returns `nights`, `nightly_rate`,
`subtotal`, `taxes`, `tax_percent` and `total`.

**Quote those numbers verbatim. Never compute a total yourself** — the server's
figure is the one that gets charged, and it is frozen onto the booking.

## Cancellation policies

Every listing carries exactly one of three policies. `get_unit` returns it as
`cancellationPolicy`. Refund percentage depends on how far ahead of check-in the
guest cancels:

| Policy | 7+ days before | 3–7 days before | Under 3 days |
|---|---|---|---|
| `flexible` (مرنة) | 100% | 75% | 50% |
| `moderate` (متوسطة) — the default | 100% | 50% | 25% |
| `strict` (صارمة) | 75% | 25% | 0% |

Two rules that matter when advising someone:

- **After check-in, cancellation is closed.** No refund path remains.
- **The policy is frozen at payment.** If the host later changes the listing's
  policy, an existing booking keeps the terms it was bought under.

Refunds are calculated server-side from that frozen snapshot and returned to the
original payment method as a partial refund. A guest can see the exact figure
before confirming.

## Check-in and check-out

Per listing, returned by `get_unit` as `checkInTime` / `checkOutTime`. Typical
values are 15:00 and 12:00, but read the listing rather than assuming.

## What an agent cannot do

**You cannot book, pay, or cancel on someone's behalf.**

Those actions need a user access token. Tokens are only issued by sending an SMS
one-time code to a person's phone and having them enter it. There is no agent
registration, no client-credentials grant, no service account, and no scope
model — a token is all-or-nothing and carries the user's full account
privileges, including payment. This is deliberate; see
`https://www.mamsaa.com/auth.md`.

If a person hands you their token, treat it as their personal credential, not a
service credential.

### What to do instead

Research the options, explain the trade-offs — price, location, capacity,
cancellation terms — and give the person the listing URL
(`https://www.mamsaa.com/units/{id}`) to complete the booking themselves.

When comparing listings, cancellation policy is worth surfacing alongside price:
a cheaper `strict` listing can cost more than a dearer `flexible` one if plans
are uncertain.
