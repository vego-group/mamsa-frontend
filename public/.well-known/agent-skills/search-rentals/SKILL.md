---
name: search-rentals
description: Search and inspect Mamsa (مَمسَى) short-term rental listings in Saudi Arabia — filter by city, unit type, guest capacity, nightly price and rating, then read full details and guest reviews.
---

# Searching Mamsa rentals

Mamsa (مَمسَى) is a short-term rental marketplace for Saudi Arabia. Its public
catalogue is readable without any credentials. This skill covers the two ways to
read it: the MCP server (preferred) and plain HTTP (for agents without MCP).

Listing content is in **Arabic** — city names, districts, titles and amenity
labels. Prices are in **SAR**.

## Option A — MCP server (preferred)

Streamable HTTP, no authentication:

```
https://www.mamsaa.com/mcp
```

A machine-readable description lives at
`https://www.mamsaa.com/.well-known/mcp/server-card.json`.

### Tools

| Tool | Arguments | Returns |
|---|---|---|
| `search_units` | `city`, `type`, `capacity`, `minPrice`, `maxPrice`, `minRating`, `sort` — all optional | matching listings |
| `get_unit` | `id` | one listing in full |
| `list_featured_units` | none | currently featured listings |
| `get_unit_reviews` | `id` | guest reviews for one listing |

- `city` — Arabic name, e.g. `"الرياض"`, `"جدة"`
- `type` — `apartment` \| `studio` \| `villa`
- `capacity` — minimum guests the unit must sleep
- `minRating` — 0–5
- `sort` — `price_asc` \| `price_desc` \| `rating` \| `newest`

### Example

Calling `search_units` with `{ "city": "الرياض", "maxPrice": 600 }` returns
entries shaped like:

```json
{
  "id": "2",
  "title": "شقة مودرن بإطلالة على الواجهة",
  "type": "apartment",
  "city": "الرياض",
  "district": "حي الملقا",
  "pricePerNight": 450,
  "currency": "SAR",
  "capacity": 4,
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 2,
  "areaSqm": 120,
  "rating": 5,
  "reviewCount": 4,
  "amenities": ["واي فاي", "مكيف", "مطبخ", "موقف سيارات", "شاشة ذكية"],
  "url": "https://www.mamsaa.com/units/2"
}
```

`get_unit` adds `description`, `checkInTime`, `checkOutTime`,
`cancellationPolicy`, `coordinates` and `images`.

Always surface the `url` when presenting a listing to a person — that is where
they complete a booking.

## Option B — plain HTTP

Same catalogue, no credentials:

```
https://api.mamsaa.com/api/v1
```

| Request | Purpose |
|---|---|
| `GET /units` | search the catalogue |
| `GET /units/{id}` | one listing |
| `GET /units/popular` | featured listings |
| `GET /units/{id}/reviews` | reviews for one listing |
| `POST /units/{id}/availability` | availability + a priced quote |

Query parameters on `GET /units`: `city`, `type`, `capacity`, `bedrooms`,
`min_price`, `max_price`, `min_rating`, `sort`, `q`, and `features[]`
(repeatable, AND semantics).

`features[]` takes a **slug** from this closed vocabulary — not the Arabic
label:

```
wifi · ac · kitchen · parking · pool · security · self_checkin · family_friendly
smart_tv · garden · bbq · elevator · washer · private_beach · event_hall
```

Each listing carries `amenities: [{ key, label }]`, where `key` is one of the
slugs above (or `null` for an amenity outside the vocabulary) and `label` is the
Arabic display text.

Responses are wrapped as `{ success, message, data }` — the listings are in
`data`.

### Price quotes

`POST /units/{id}/availability` with `{ "start_date": "2026-09-10", "end_date":
"2026-09-12" }` returns availability and, when available, a server-computed
`pricing` block (`nights`, `nightly_rate`, `subtotal`, `taxes`, `tax_percent`,
`total`).

**Never compute a total yourself.** Quote the server's numbers. Pricing is
subtotal + 15% VAT — there are no cleaning or service fees.

## Reading pages as Markdown

Any page on `https://www.mamsaa.com` returns Markdown instead of HTML when the
request carries:

```
Accept: text/markdown
```

Useful for reading a listing page as text without parsing HTML.

## What you cannot do

**Booking requires a human.** Creating a booking or paying needs a user access
token, and tokens are only issued through an SMS one-time-password sent to a
person's phone. There is no agent registration, no client-credentials grant and
no service account — see `https://www.mamsaa.com/auth.md`.

So: search, compare and explain listings freely, then hand the person the
listing `url` to finish the booking themselves.
