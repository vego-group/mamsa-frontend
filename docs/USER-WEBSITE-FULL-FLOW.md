# Mamsa — User Website: Full As-Built Reference

> **Purpose.** A complete, source-accurate reference of the Mamsa customer-facing web app (`mamsa-app`), written for a team building the **admin/partner dashboard** that must understand and manage this system.
> **Scope.** Everything under `src/` as it exists in the repository today. Every claim below was read from source, not inferred. Where behaviour depends on the backend, it is called out explicitly.
> **A note on terminology.** "Unit" = a rentable property (apartment / studio / villa). "Booking" and "Reservation" are the same entity.

---

## 1. Overview

### 1.1 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14.2.13** (App Router, `reactStrictMode: true`) |
| Language | TypeScript 5.6 |
| Styling | TailwindCSS 3.4 + custom `brand-*` design tokens, shadcn/ui-style primitives (Radix) |
| State | **Zustand 4.5** (`auth`, `favorites`, `ui`) with `persist` middleware |
| Data fetching | `@tanstack/react-query` provider is mounted, but pages predominantly fetch via `useEffect` + the typed API client |
| i18n | **next-intl 4** — cookie-based locale (`ar` default, `en`), **no `/en` URL prefix** |
| Forms | react-hook-form + zod (`@hookform/resolvers`) |
| Maps | leaflet / react-leaflet |
| Dates | date-fns 4 (+ `ar` locale) |
| Payments | **Moyasar** hosted form (moyasar.js loaded from CDN at runtime) |
| Icons | lucide-react |

Scripts: `dev`, `build`, `start`, `lint`, `type-check` (`tsc --noEmit`), `test` / `test:watch` (**vitest** — the cancellation engine has unit tests).

### 1.2 Routing structure (App Router)

All routes are unprefixed (locale lives in a cookie). File → route:

| Route | File | Rendering |
|---|---|---|
| `/` | `src/app/page.tsx` | Server component (async, fetches homepage content) |
| `/units` | `src/app/units/page.tsx` → `units-page-client.tsx` | Client (Suspense-wrapped) |
| `/units/[id]` | `src/app/units/[id]/page.tsx` | Client |
| `/booking/[unitId]` | `src/app/booking/[unitId]/page.tsx` → `checkout-page-client.tsx` | Client (Suspense) |
| `/payment/[bookingId]` | `src/app/payment/[bookingId]/page.tsx` | Client |
| `/payment/callback` | `src/app/payment/callback/page.tsx` | Client (Suspense) |
| `/booking/confirmation/[bookingId]` | `src/app/booking/confirmation/[bookingId]/page.tsx` | Client |
| `/my-reservations` | `src/app/my-reservations/page.tsx` | Client |
| `/my-reservations/[bookingId]` | `src/app/my-reservations/[bookingId]/page.tsx` | Client |
| `/favorites` | `src/app/favorites/page.tsx` | Client |
| `/account` | `src/app/account/page.tsx` | Client |
| `/account/phone` | `src/app/account/phone/page.tsx` | Client |
| `/account/payment-methods` | `src/app/account/payment-methods/page.tsx` | Client |
| `/partner-onboarding` | `src/app/partner-onboarding/page.tsx` | Client (full-screen) |
| `/host` | `src/app/host/page.tsx` | Server (marketing landing) |
| `/picks` | `src/app/picks/page.tsx` | Server shell + client section |
| `/contact` | `src/app/contact/page.tsx` | Client |
| `/about`, `/faq` | `src/app/about/page.tsx`, `src/app/faq/page.tsx` | Static content |
| `/policies/cancellation`, `/policies/safety`, `/policies/house-rules` | `src/app/policies/**/page.tsx` | Static (`PolicyPage` shell) |

**Global chrome** (`src/app/layout.tsx`): `<Header>`, `<Footer>`, `<QueryProvider>`, and three always-mounted globals — `<LoginDialog>`, `<RegisterDialog>` (driven by the `ui` store), and `<FavoritesSync>` (headless auth→favorites bridge). `<html dir>` flips to `rtl` for Arabic; fonts are IBM Plex Sans Arabic + Inter.

### 1.3 Auth model — OTP-only

There is **no password anywhere** in the product (the account page and header dropdown both carry `// NOTE: OTP-only` comments confirming the deliberate omission).

- **Login / Register / Change-phone / Partner sign-up** all authenticate by sending a **6-digit OTP** to a Saudi phone number and verifying it.
- **`TokenManager`** (`src/lib/auth/tokens.ts`) is the *single owner* of the access & refresh tokens, stored in **`localStorage`** under `mamsa.accessToken` / `mamsa.refreshToken`. localStorage (not memory) is deliberate so the session survives the Moyasar 3-DS redirect that leaves the app.
- **`useAuthStore`** (`src/stores/auth.ts`, persisted to `mamsa.auth`) holds **user data only** — never tokens (a second token copy previously went stale after silent refresh). `partialize` persists just `{ user, isAuthenticated }`.
- **Silent session renewal** (`src/lib/api/client.ts`): access tokens expire hourly (`expires_in: 3600`). On any `401`, `http()` exchanges the refresh token via `POST /auth/refresh` **once**, replays the request, and — if refresh fails — calls `forceLogout()` (dynamically imports the store to keep it out of the server graph). A module-level `refreshInFlight` promise dedupes a burst of concurrent 401s into one refresh round-trip.
- **Session bootstrap:** because the store is persisted, a returning user is "authenticated" on first paint; `<FavoritesSync>` starts from `wasAuth=false` so a persisted session still triggers a favourites merge on mount.

---

## 2. Screen-by-Screen Inventory

> Endpoints listed are the **real-backend** calls (`USE_MOCK=false`). Mock behaviour is summarised per screen and detailed in §5.

### 2.1 Home — `/`
- **Purpose:** Marketing landing + entry search.
- **Key components:** `FilterBar`, category cards, `LocationExplorer` (map), `PicksSection`, "How it works", trust strip, `TestimonialCarousel`.
- **Data:** `Promise.all` of `contentApi.popular()`, `.testimonials()`, `.categories()`, `.budgets()` — each wrapped in a `safe()` helper so a backend hiccup never breaks render (falls back to `[]`). Real endpoints: `GET /units/popular`, `/testimonials`, `/units/categories`, `/units/budgets`. **In mock mode these content endpoints return empty arrays** (except `popular` → featured mock units).
- **Actions:** search via FilterBar; jump to `/units?type=…`, `/units?minPrice=…&maxPrice=…`; open a unit from the map; browse picks.
- **States:** `FilterBar` is Suspense-wrapped. `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` currently hides "الأكثر طلبًا" (Most-requested), "By budget", and the testimonial column pre-launch. Map only plots units with real lat/lng (`latitude !== 0 && longitude !== 0`).

### 2.2 Units listing — `/units`
- **Purpose:** Browse/search/filter units.
- **Key components:** `FilterBar` (compact), `SidebarFilters`, `UnitCard` (list/grid), `LocationExplorer` (map view), mobile filter drawer.
- **Data:** `unitsApi.list({ city, type, capacity })` from URL query params (`GET /units?…`). **Price / rating / amenity filtering and all sorting are done client-side** on the returned set (see `sortUnits` + the `useMemo` filter).
- **Actions:** switch view (list/grid/map); sort (recommended / price asc / price desc / rating); adjust sidebar filters (price range `0–5000`, type, min rating, amenities); remove active-filter chips; "clear all".
- **States:** skeletons while loading; dashed empty card with "clear filters" when zero results.

### 2.3 Unit detail — `/units/[id]`
- **Purpose:** Full unit view + book entry.
- **Key components:** `UnitGallery`, quick-facts, host card, amenities grid, "things to know" (`CancellationPolicyDisplay`), reviews, sticky **booking sidebar**, mobile fixed book-bar.
- **Data:** `Promise.all([unitsApi.getById(id), unitsApi.getReviews(id)])` — reviews are best-effort (`.catch(() => [])`); only the unit fetch decides success. Real: `GET /units/{id}`, `GET /units/{id}/reviews`.
- **Actions:** pick check-in/check-out dates + guests → **client-side price estimate** (`subtotal = pricePerNight × nights`, `serviceFee = subtotal × 0.10`, `total = subtotal + serviceFee`); favourite toggle; share; "Book now".
- **Book-now guard:** if not authenticated → opens login dialog; if dates missing/`nights < 1` → `alert(pickDates)`; else pushes `/booking/{id}?checkIn&checkOut&guests`.
- **States:** `LoadError` component with retry (bumps an `attempt` counter to re-run the fetch); loading text; "no reviews" empty state.

### 2.4 Checkout — `/booking/[unitId]`
- **Purpose:** Collect guest details, agree to policies, create the pending booking.
- **Key components:** trip summary, personal-info form (`Input`, `PhoneInput`), `CancellationPolicyDisplay`, agreement `Checkbox` linking the 3 policy pages, **`PriceBreakdown`**, pending-conflict card.
- **Data:** `unitsApi.getById(unitId)` for the summary. On confirm: `bookingsApi.create({ unitId, checkInDate, checkOutDate, guests, paymentMethod: 'visa' })` → `POST /bookings`.
- **Price math (client-side estimate):** `subtotal = pricePerNight × nights`; `cleaning = unit.cleaningFee ?? 0`; `serviceFee = subtotal × (serviceFeePercent ?? 10)%`; `tax = (subtotal + cleaning + serviceFee) × (taxPercent ?? 15)%`; `total = sum`. These are an **estimate** — the authoritative frozen figures come back from `/payments/initiate` on the next page.
- **Guards / decision points:**
  - Query dates are validated with a regex + `checkIn < checkOut`; invalid → a "pick dates again" screen linking back to the unit.
  - `guests` is clamped to a positive integer.
  - Not authenticated on confirm → error + open login dialog.
  - Form validation: both names required, email regex, agreement checkbox required.
  - **Duplicate-booking recovery:** if `create` fails because the dates are already held, it calls `findMyPendingBooking()`; if the conflict is the user's *own* abandoned `pending_payment` booking for the **same** dates → straight to `/payment/{id}`; for a *different* overlapping range → shows a `pendingConflict` card offering "pay" or "manage".
- **States:** `LoadError`+retry on unit fetch; submit button shows "creating booking…"; inline error text (`dir="auto"`).

### 2.5 Payment — `/payment/[bookingId]`
- **Purpose:** Step 2 — actually charge the (already-created, pending) booking.
- **Key components:** Moyasar **hosted form** (`div.mysr-form`), saved-card **quick-pay** list + CVC, test-mode simulate card, order summary (`PriceBreakdown`).
- **Data:**
  - `POST /payments/initiate { booking_id }` → `InitiatePaymentResult` (payment id, `amount`, **`amountHalalas`** SAR×100, `publishableKey`, `callbackUrl`, `testMode`, and a **frozen `booking` summary** rendered as-is, never recomputed).
  - `accountApi.getCards()` → filters to `chargeable === true` for quick pay (`GET /user/cards`).
  - `paymentsApi.pay(paymentId, …)` → `POST /payments/pay`.
- **Three UI paths (chosen by `initiate`):**
  1. **No `publishableKey`** (mock / gateway-less staging) → "simulate" button → tokenless `pay { payment_id }` (always succeeds in mock).
  2. **`publishableKey` present** → Moyasar hosted card + Apple Pay form mounted via `loadMoyasarAssets` + `initMoyasarForm`. `pk_test…` keys show a test-card hint (`4111 1111 1111 1111`).
  3. **Chargeable saved cards present** → quick-pay radio list + CVC field → `pay { savedCardId, cvc }`.
- **Outcome handling:** `status === 'paid'` → `router.replace('/booking/confirmation/{bookingId}')`; a `transactionUrl` (https) → redirect the browser for a **3-DS** challenge; otherwise show the gateway message.
- **Guards:** `bookingId` must match `^\d+$` (else fail-fast to the error card, avoiding a `NaN` request). Both effects use `useRef` guards against React 18 StrictMode double-runs.
- **States:** full-page spinner while initiating; a dedicated error card (retry / go to reservations) if `initiate` fails; per-action "processing…".

### 2.6 Payment callback — `/payment/callback`
- **Purpose:** The mandatory server-verified return point after the hosted form / 3-DS. **The route path must stay exactly `/payment/callback`** — the backend's `FRONTEND_URL` redirect depends on it.
- **Data:** reads `?pid=<our payment id>&id=<moyasar id>&status&message`, then **always** calls `POST /payments/verify { payment_id, moyasar_id }` (backend re-fetches the charge from Moyasar; idempotent). The query string is treated as a hint only, never as truth.
- **Outcome:** verified `paid` + `bookingId` → `/booking/confirmation/{bookingId}`; paid but no booking id → `/my-reservations`; failure → error card with **retry-payment** (if a booking id came back) / reservations / browse.
- **Guards:** `pid` must be numeric; a non-`paid` `status` surfaces an immediate decline message but still verifies server-side. `useRef` guard so verify runs exactly once under StrictMode. Wrapped in `<Suspense>` (uses `useSearchParams`).

### 2.7 Booking confirmation — `/booking/confirmation/[bookingId]`
- **Purpose:** Success screen after a server-verified payment.
- **Data:** `bookingsApi.getById(bookingId)` → `GET /bookings/{id}`.
- **Actions:** go to My Reservations; view booking details.
- **Critical UX rule:** the user only lands here *after* payment is verified, so a **details-fetch failure must never read like a failed payment** — on error it still shows a green "Paid" state (`paidTitle` / `paidDetailsUnavailable`) with retry + reservations, rather than an error.

### 2.8 My Reservations (dashboard) — `/my-reservations`
- **Purpose:** All of the user's bookings across 4 tabs.
- **Key components:** `Tabs`, `BookingCard`, `LoadError`, skeletons.
- **Data:** `bookingsApi.list()` → `GET /user/bookings`.
- **Tabs & categorisation logic** (`useMemo`, day boundary from the cancellation engine = **Asia/Riyadh**):
  - **Upcoming (`upcoming`)** — `status === 'confirmed'` **and** `daysUntilCheckIn > 14`.
  - **Active (`active`)** — `confirmed` and `daysUntilCheckIn ≤ 14` (and, implicitly, the "everything else confirmed" bucket).
  - **Completed (`completed`)** — `status === 'completed'`.
  - **Cancelled (`cancelled`)** — `status === 'cancelled'`.
- **Per-card actions** depend on tab (see `BookingCard`, §2.8a). Cancelling from a card updates the list in place via `handleCancelled` (no reload).
- **States:** 2 skeletons while loading; `LoadError`+retry; per-tab dashed empty card with a "browse units" CTA.

#### 2.8a `BookingCard` (used by the dashboard)
- Shows image, title, city/country, host, check-in/out, guests×nights, confirmation `code`, total, status badge.
- **Status badge is driven by the *tab context*, not the raw status:** cancelled→danger, completed→sage, active→success ("Confirmed"), and the fallback (upcoming) → warning badge labelled **"Awaiting confirmation"** (`status.pending`).
- **Actions:** "View details" always; **"Cancel"** on upcoming/active *only if* `isBookingCancellable(booking, now)`; **"Book again"** on completed. Cancelled cards append a red refund strip (`cancelledBy`, reason, refunded amount + %).

### 2.9 Booking detail — `/my-reservations/[bookingId]`
- **Purpose:** Full booking view + all lifecycle actions.
- **Key components:** `PriceBreakdown` (with `serviceFeeFirst`), `CancelBookingDialog`, `ContactHostDialog`, `ReviewDialog`, status badge, refund card, house-rules card.
- **Data:** `bookingsApi.getById(id)` (`GET /bookings/{id}`) + `reviewsApi.getForBooking(id)` (mock-only; real backend embeds `review` on the booking).
- **Status badge (raw status here):** cancelled→danger, completed→sage, confirmed→success, else warning ("pending" = **"Awaiting payment"**).
- **Conditional actions:**
  - Always: contact host, **download confirmation** (`downloadBookingConfirmation` → print-to-PDF window).
  - `pending_payment` → "Complete payment" (`/payment/{id}`).
  - `confirmed` **or** `pending_payment` **and** `canCancel` → "Cancel booking".
  - `completed` **and** not reviewed → "Write review"; if reviewed → "✓ reviewed".
  - `completed` **or** `cancelled` → "Book again".
  - Paid reassurance strip shows only for `confirmed`/`completed`.
  - Payment-method card renders only if `booking.payment` present (note: expiry is hardcoded display text `12/25`).

### 2.10 Favorites — `/favorites`
- **Purpose:** The user's saved units.
- **Data:** `unitsApi.list()` then filters to `unitIds` from the `favorites` store. (So the *set* of favourites is local/persisted; the unit objects are re-fetched.)
- **Actions:** open/unfavourite via `UnitCard`.
- **States:** skeletons; heart empty state.

### 2.11 Account settings — `/account`
- **Purpose:** Profile + quick links + danger zone.
- **Data:** `accountApi.me()` (`GET /auth/me`) on mount; `accountApi.updateProfile()` (`PUT /user/profile`) on save (uses `mapUserProfile` so a name edit can't downgrade an admin/partner role); `accountApi.deleteAccount()` (`DELETE /user/account`) then logout.
- **Actions:** edit first/last name + email; quick links to reservations / favorites / payment methods; link to `/account/phone`; delete account (confirm modal). **No password section** (OTP-only).
- **States:** loading text; "saved ✓" toast for 2.5 s; delete modal with in-flight state.

### 2.12 Change phone — `/account/phone`
- **Purpose:** Two-step OTP phone change.
- **Data:** Step 1 `accountApi.changePhone(newPhoneLocal)` (`POST /user/change-phone`, returns `debug_otp` in non-prod). Step 2 `accountApi.verifyChangePhone(newPhoneLocal, code)` (`POST /user/change-phone/verify`) → `updateUser({ phone })`.
- **Key components:** `PhoneInput` (zod-validated), shared **`OtpVerificationForm`**.
- **States:** form ↔ otp step; inline errors; green success banner.

### 2.13 Payment methods — `/account/payment-methods`
- **Purpose:** Manage saved cards + transaction history.
- **Data:** `accountApi.getCards()` (`GET /user/cards`) + `accountApi.getTransactions()` (`GET /user/transactions`). Mutations: `deleteCard` (`DELETE /user/cards/{id}`), `setDefaultCard` (`POST /user/cards/{id}/default`), `saveCardFromToken` (`POST /user/cards/from-token`).
- **Add-card flow (PCI-safe):** reads `paymentsApi.config()`. In **test/simulate mode** → metadata-only save (`{ brand, last4, expMonth, expYear }`). In **live mode** → the PAN goes **browser → `api.moyasar.com/v1/tokens`** directly (`createCardToken`) and only the **token id** is sent to the Mamsa API. Card fields live only in the modal's state and are wiped on unmount. Brand auto-detected from leading digits (`^4`=visa, `^5[1-5]|^2[2-7]`=mastercard, else mada).
- **Actions:** add card, set default, delete (confirm modal).
- **States:** loading text; empty-card and empty-transaction states; test-card hint when applicable.

### 2.14 Partner onboarding — `/partner-onboarding`
- **Purpose:** Partner (host) **sign-up application** — reached from "سجّل عقارك" / `/host`. Full-screen split layout, 3 steps: **form → OTP → success**.
- **Data:** `authApi.requestOtp(phone05)` then `authApi.partnerRegister({ type, name, phone, code, email, nationalId|crNumber })` → `POST /auth/partner/register`.
- **Important:** the partner does **NOT** get a website session. Approval + a dashboard link arrive by email (success panel says so). `individual` requires a 10-digit `national_id`; `company` requires a 10-digit `cr_number`.
- **Components:** `OnboardingForm` (client-side validation), `OtpVerificationForm` (`variant="onboarding"`).

### 2.15 Marketing / static
- `/host` — server-rendered partner landing; CTA → `/partner-onboarding`.
- `/picks` — server shell rendering the client `PicksSection` (category chips → `unitsApi.list`).
- `/contact` — contact form (zod-validated) → `miscApi.contact` (`POST /contact`); success popup.
- `/about`, `/faq` — static content.
- `/policies/cancellation`, `/policies/safety`, `/policies/house-rules` — shared `PolicyPage` shell (opened in new tabs from checkout so typed data survives).

---

## 3. Complete User Flows (SRS-style)

### Scenario: OTP Login
**Goal:** An existing customer signs in with just their phone.
**Main flow:**
1. User clicks "Login" (header/drawer) → `openAuth('login')` → `LoginDialog`.
2. Enters Saudi phone; zod validates via `isValidSaudiPhone`.
3. `authApi.requestOtp(local, 'login')` — `intent="login"` lets the backend reject unregistered numbers **before** sending any SMS.
4. On success → `otp` step (`OtpVerificationForm`). Auto-submits when all 6 digits are filled/pasted.
5. `authApi.verifyOtp(local, code)` → `{ user, accessToken, refreshToken, needsProfile }`.
6. `setSession(user, access, refresh)` (writes tokens via TokenManager) → dialog closes.

**Decision points:**
- `PHONE_NOT_REGISTERED` (422 code) → `not-registered` step → offers "create account" (bounces to register dialog with the phone prefilled) or "try another number".
- `needsProfile === true` after verify (belt-and-braces) → also routes to `not-registered` instead of starting a half-session.
- Backend rate-limit message like "…N seconds" → a **live countdown** replaces static error text.

### Scenario: OTP Registration
**Goal:** A new customer creates an account.
**Main flow:**
1. `RegisterDialog` collects first/last name, email, phone (zod-validated).
2. `authApi.register({ …, phone })` sends `intent="register"` → OTP dispatched.
3. `otp` step → `authApi.verifyOtp` → `setSession(...)`.
4. `authApi.completeProfile({ name, email })` persists the name/email collected on the form (the request-otp step only took the phone). Best-effort — the session is already live.

**Decision points:**
- `PHONE_ALREADY_REGISTERED` (422) → `already-registered` step → "login" (prefilled) or "try another number".
- Resend cooldown + live countdown as in login.

### Scenario: Partner sign-up
**Goal:** A property owner applies to become a partner.
**Main flow:** `/host` → `/partner-onboarding` → `OnboardingForm` (type + identity) → OTP → `authApi.partnerRegister` → success panel ("we'll email you").
**Decision points:** `individual` vs `company` toggles the national-id vs CR field (each 10 digits). No session is created.

### Scenario: Browse & filter units
**Goal:** Find a stay.
**Main flow:**
1. From home FilterBar or nav → `/units?city&type&capacity`.
2. `unitsApi.list({ city, type, capacity })` fetches the base set (server-filtered on those three).
3. User refines with the sidebar (price, rating, amenities) and sort — **applied client-side**.
4. Toggle list/grid/map; open a unit.
**Decision points:** zero results → empty card with "clear filters". Map view only shows units with coordinates.

### Scenario: Unit detail → book
**Goal:** Inspect a unit and start a booking.
**Main flow:** open `/units/[id]` → review gallery/amenities/policy/reviews → pick dates + guests (live estimate) → "Book now".
**Decision points:** not authed → login dialog; no/invalid dates → alert; valid → `/booking/[id]?…`.

### Scenario: Checkout → payment (the money path)
**Goal:** Turn an intent into a paid, confirmed booking.
**Main flow:**
1. `/booking/[unitId]` — confirm trip, fill guest details, agree to policies.
2. `bookingsApi.create(...)` → **pending** booking created (`POST /bookings`).
3. Redirect to `/payment/[bookingId]`.
4. `POST /payments/initiate` returns the **frozen** amount (`amountHalalas`) + gateway config + order summary.
5. User pays via hosted form / Apple Pay / saved card / (test) simulate.
6. Moyasar redirects to `/payment/callback?pid&id&status`.
7. `POST /payments/verify` (server re-fetches the charge) — **only now** is the booking treated as paid.
8. → `/booking/confirmation/[bookingId]`.
**Decision points:**
- Create fails on held dates → own-pending-booking recovery (same dates → pay; overlapping → conflict card).
- Pay returns `transactionUrl` → 3-DS redirect, resuming at the callback.
- Verify not `paid` → error card with retry.

**`PriceBreakdown` component logic (shared across checkout / payment / details):** pure display — it renders whatever numbers it's handed and never recomputes. It always shows: nights-line subtotal, two fee rows, taxes, divider, bold total. `serviceFeeFirst` swaps the fee order (details page lists service fee first; checkout/payment list cleaning first). Labels are **passed in pre-translated** because the pages intentionally use different Arabic wording (e.g. «رسوم التنظيف» vs «رسوم النظافة»). The formatter (`formatSAR`) is injected to keep it pure.

### Scenario: Reservations dashboard
**Goal:** Manage existing bookings.
**Main flow:** `/my-reservations` → 4 tabs (Upcoming / Active / Completed / Cancelled) categorised by status + days-to-check-in (Riyadh boundary). Each `BookingCard` exposes tab-appropriate actions; open detail for the full set.
**Decision points:** cancel availability = `isBookingCancellable`; review only on completed-unreviewed; book-again on completed/cancelled.

### Scenario: Cancellation (implemented)
**Goal:** Cancel a booking and preview the refund first (SRS FR-043/044/046).
**Main flow:**
1. From card or detail → `CancelBookingDialog`.
2. On open → `bookingsApi.previewCancellation(id)` (`GET /bookings/{id}/cancellation-preview`).
3. Dialog shows the **frozen `policySnapshot`** (`CancellationPolicyDisplay`) + a refund summary: applicable tier, total, refund %, refunded amount, forfeited amount.
4. User optionally enters a reason → "Confirm cancel" → `bookingsApi.cancel(id, reason)` (`POST /bookings/{id}/cancel`).
5. Real backend returns a cancellation-result; the client then re-fetches the booking to fulfil the same `{ booking, refund }` contract mock provides. `onCancelled` swaps the booking in place; `router.refresh()` re-runs server components.
**Decision points:** if `preview.isAllowed === false` → shows the machine-readable reason (`alreadyCancelled` / `completed` / `afterCheckIn`, or the backend's `rawNotAllowedReason`) and the confirm button is disabled.

**How `policy_snapshot` is used/displayed** — see §6.5. In short: the dialog renders `booking.policySnapshot`, and the numeric refund preview comes from the backend (live) or the local engine (mock), so what the user sees always matches what the refund engine will compute.

### Scenario: Favorites (guest → account merge)
**Goal:** Save units as a guest and keep them after logging in.
**Main flow:** `toggle(unitId)` updates the local persisted store **optimistically**; if authed, it also calls `favoritesApi.add/remove` and **reverts** on failure. On login, `<FavoritesSync>` runs `sync()`: fetches server favourites, pushes guest-only ids up, drops ids the backend 404s (stale mock/legacy ids), and unions the result. On logout, favourites reset.

### Scenario: Account settings / phone / payment methods
Covered in §2.11–2.13. Key rule: profile updates use `mapUserProfile` (role-preserving); phone change is a 2-step OTP; card add is PCI-safe (token-only to the Mamsa API in live mode).

---

## 4. State Management (Zustand)

| Store | File | Persisted key | Shape | What triggers updates |
|---|---|---|---|---|
| **auth** | `stores/auth.ts` | `mamsa.auth` (user + isAuthenticated only) | `{ user, isAuthenticated, setSession, updateUser, logout }` | `setSession` on OTP verify (also writes tokens via TokenManager); `updateUser` on profile/phone edits (shallow merge); `logout` clears tokens + user; `forceLogout()` from the API client on unrecoverable 401 |
| **favorites** | `stores/favorites.ts` | `mamsa.favorites` | `{ unitIds, has, toggle, sync, reset }` | `toggle` (optimistic, reverts on server error); `sync` on login (merge local+server, drop 404 ids); `reset` on logout |
| **ui** | `stores/ui.ts` | (not persisted) | `{ authDialog, prefillPhone, openAuth, closeAuth }` | `openAuth('login'|'register', prefillPhone?)` drives the global auth modals; `closeAuth` |

**Tokens are *not* in any store** — `TokenManager` (`lib/auth/tokens.ts`) owns `mamsa.accessToken` / `mamsa.refreshToken` in localStorage and is the only reader/writer.

---

## 5. API Integration Map

**Switch points:** `NEXT_PUBLIC_USE_MOCK` (mock unless the value is the string `"false"`) and `NEXT_PUBLIC_API_BASE_URL` — both read once at the top of `src/lib/api/client.ts`:
```ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
```
Every API method is a ternary: `USE_MOCK ? mock… : http(…)`. In mock mode a 300 ms latency is simulated. `http()` adds `Authorization: Bearer`, `ngrok-skip-browser-warning: 1`, `cache: 'no-store`, unwraps the `{ data }` envelope, and surfaces Laravel `message`/`errors`/`code` into `ApiError`.

| Screen(s) | Endpoint | Method | Request → Response (mapped type) | Mock behaviour |
|---|---|---|---|---|
| Login/Register/Change-phone/Partner | `/auth/request-otp` | POST | `{ phone, intent? }` → `{ debug_otp? }` → `{ sent, debugOtp }` | returns `{ sent, debugOtp: MOCK_OTP }` |
| " | `/auth/verify-otp` | POST | `{ phone, code, device }` → `RawAuthResult` → `{ user, accessToken, refreshToken, needsProfile }` | code must equal `MOCK_OTP` |
| " | `/auth/resend-otp` | POST | `{ phone, intent? }` → `{ debug_otp? }` | as request-otp |
| Register | `/auth/complete-profile` | POST | `{ name, email }` → `RawUser`→`User` | updates mock user |
| Partner | `/auth/partner/register` | POST | `{ type, name, phone, code, email, national_id|cr_number, device }` → `RawAuthResult` | n/a (real only) |
| Session renewal | `/auth/refresh` | POST | `{ refresh_token, device }` → tokens | n/a |
| Header/account | `/auth/logout` | POST | `{}` → ok | clears mock user |
| Account | `/auth/me` | GET | → `RawUser`→`User` | returns mock user |
| Units listing/picks/favorites | `/units?city&type&capacity&min_price&max_price&min_rating&sort&features[]` | GET | → `RawUnit[]`→`Unit[]` | in-memory filter/sort of `MOCK_UNITS` |
| Unit detail/checkout/payment | `/units/{id}` | GET | → `RawUnit`→`Unit` | `findUnitById` |
| Home | `/units/popular` | GET | → `RawUnit[]` | featured mock units |
| Unit detail | `/units/{id}/reviews` | GET | → `Review[]` | mock reviews |
| Unit detail (unused in UI now) | `/units/{id}/availability` | POST | `{ start_date, end_date }` → `{ available }` | always `{ available: true }` |
| Home | `/testimonials`, `/units/categories`, `/units/cities`, `/units/budgets` | GET | → mapped content types | **all return `[]`** in mock |
| Dashboard | `/user/bookings` | GET | → `RawBooking[]`→`Booking[]` | mock bookings for `CURRENT_USER` |
| Confirmation/detail/checkout | `/bookings/{id}` | GET | → `RawBooking`→`Booking` | `findBookingById` |
| Checkout | `/bookings` | POST | `{ unit_id, start_date, end_date, guests, notes }` → `RawBooking`→`Booking` | builds a `confirmed` booking, freezes policy |
| Cancel dialog | `/bookings/{id}/cancellation-preview` | GET | → `RawCancellationPreview`→`RefundPreview` | local `previewCancellation` engine |
| Cancel dialog | `/bookings/{id}/cancel` | POST | `{ reason }` → cancellation result (+ follow-up `GET /bookings/{id}`) → `{ booking, refund }` | local engine + `buildRefundRecord` |
| Payment | `/payments/config` | GET | → `{ publishable_key, test_mode, currency }` | `{ '', testMode:true, SAR }` |
| Payment | `/payments/initiate` | POST | `{ booking_id }` → `InitiatePaymentResult` (incl. `amount_halalas`, frozen `booking`) | testMode stub, no gateway |
| Payment | `/payments/pay` | POST | one of `{}` / `{ saved_card_id, cvc }` / `{ token }` (+`payment_id`) → `{ status, transaction_url?, message? }` | `{ status:'paid' }` |
| Callback | `/payments/verify` | POST | `{ payment_id, moyasar_id }` → `{ status, booking_id, message? }` | `{ status:'paid', bookingId:null }` |
| Review dialog | `/reviews` | POST | `{ booking_id, rating, comment }` → `Review` | validates completed + not-reviewed |
| Detail | `/reviews` (for-booking) | — | no endpoint; booking embeds `review` | mock `getReviewForBooking` |
| Account | `/user/profile` | PUT | `{ name, email }` → `RawUser`→`Omit<User,'role'>` | merges mock user |
| Change phone | `/user/change-phone` , `/user/change-phone/verify` | POST | `{ new_phone }` / `{ new_phone, code }` → ok(+`debug_otp`) | stubbed ok |
| Account | `/user/account` | DELETE | → ok | clears mock user |
| Payment methods / payment | `/user/cards` | GET | → `SavedCard[]` | `MOCK_SAVED_CARDS` |
| Payment methods | `/user/cards/from-token` | POST | `{ token }` **or** metadata → `SavedCard` | stub card |
| Payment methods | `/user/cards/{id}` , `/user/cards/{id}/default` | DELETE / POST | → ok | stub ok |
| Payment methods | `/user/transactions` | GET | → `Transaction[]` | `MOCK_TRANSACTIONS` |
| Favorites store | `/user/favorites`, `/user/favorites/{id}` | GET / POST / DELETE | ids ↔ ok | GET returns `[]`, add/remove no-op |
| Contact | `/contact` | POST | `{ name, phone, email, message }` → ok | stub ok |

**Direct-to-gateway (not the Mamsa API):** `POST https://api.moyasar.com/v1/tokens` (browser → Moyasar, `createCardToken`) and the moyasar.js hosted form / Apple Pay, all in `src/lib/payments/moyasar.ts`. Assets load from `https://cdn.moyasar.com/mpf/1.14.0/`.

---

## 6. Business Rules Enforced in the UI

### 6.1 Currency
Always **SAR**, rendered by `formatSAR` (`lib/utils/format.ts`) as Western/Latin digits + «ر.س» (a deliberate design decision for mobile legibility). `CURRENCY` in `lib/constants/brand.ts`. Payment amounts to Moyasar use **halalas** (`amountHalalas`, SAR×100) taken verbatim from the API — never recomputed client-side.

### 6.2 Phone (+966)
`lib/utils/phone.ts` normalises `05XXXXXXXX`, `5XXXXXXXX`, `9665XXXXXXXX` → **E.164 `+9665XXXXXXXX`**. UI stores E.164 for display (`formatPhoneDisplay` → `+966 5X XXX XXXX`); the **backend is always sent the local `05XXXXXXXX` form** (`toSaudiLocal`). `PhoneInput` and the onboarding form show a fixed `+966` / 🇸🇦 prefix.

### 6.3 OTP
`OTP_CONFIG` (`brand.ts`): **length 6**, expiry 60 s, max 3 attempts, resend cooldown 30 s. `OtpVerificationForm` is the single OTP entry component (6 digit boxes, paste-to-fill, auto-submit on completion, live resend countdown, two visual `variant`s: `dialog` / `onboarding`).

### 6.4 Booking states shown
Internal `BookingStatus` = `pending_payment | confirmed | completed | cancelled` (`types/index.ts`). The backend's many status strings are collapsed by `BOOKING_STATUS_MAP` (e.g. `paid`/`active` → `confirmed`, `awaiting_payment` → `pending_payment`).

> **Correction to the "no Pending state" assumption:** a pending state **does** surface in the UI, but never with the literal word "Pending":
> - `pending_payment` bookings show a **warning badge "Awaiting payment"** on the detail page and expose a "Complete payment" button.
> - The dashboard **Upcoming** tab renders a warning badge labelled **"Awaiting confirmation"** (`bookingCard.status.pending`) for confirmed-but-far bookings.
>
> So the four *tabs* are Upcoming/Active/Completed/Cancelled, but the underlying `pending_payment` status is real and visible. The dashboard categoriser only sorts `confirmed`/`completed`/`cancelled` explicitly — a `pending_payment` booking falls into the **Active** bucket there (it isn't cancelled/completed and, if check-in is ≤14 days out, isn't "upcoming"). A dashboard building admin views should treat `pending_payment` as a first-class state.

### 6.5 Cancellation policy & `policy_snapshot` (SRS FR-036)
- Three templates (`lib/constants/cancellation-policies.ts`): **flexible** (100%≥7d / 50%≥3d / 0%), **moderate** (100%≥7d / 25%≥3d / 0%), **strict** (50%≥7d / 0% otherwise). Tiers are in **days before check-in**, sorted longest-window first.
- `adapters.ts` `mapPolicySnapshot` builds a booking's frozen policy from the backend's `policy_snapshot.tiers` (backend tiers are in **hours**, divided by 24 to days). Falls back to the unit's live (deprecated legacy-enum) policy only for **unpaid** bookings (no snapshot yet).
- The cancel dialog displays `booking.policySnapshot` via `CancellationPolicyDisplay`, and the numeric refund preview comes from the backend `cancellation-preview` (live) or the local pure engine (mock). This guarantees "what you see" matches "what the refund engine computes", even if templates are re-tuned later.

### 6.6 Date format & timezone
- Display format is **`dd/MM/yyyy` Gregorian only** (`DATE_FORMAT.display`, an explicit decision — `formatDate`). A long form `dd MMMM yyyy` with the Arabic locale is available (`formatDateLong`).
- **Refund/eligibility day boundary is midnight Asia/Riyadh (fixed UTC+3, no DST)** — `PROPERTY_UTC_OFFSET_HOURS = 3` in `lib/cancellation/engine.ts`. All properties are in Saudi Arabia, so cutoffs are identical for every viewer worldwide and match the backend. The reservations tab categoriser uses the same `daysUntilCheckIn` for its 14-day boundary.

### 6.7 RTL / Arabic
Default locale **`ar`**, cookie-based (`NEXT_LOCALE`), no URL prefix; toggling rewrites the cookie and refreshes. `<html dir="rtl">` for Arabic (`layout.tsx`). Components use logical properties (`ms-*`/`me-*`/`start`/`end`) and `dir="ltr"`/`dir="auto"` islands for phone numbers, emails, card numbers, and gateway (English) error messages. Labels for units, amenities, policies are derived from tier **numbers / keys** so both locales render from one source of truth.

---

## 7. Known Gaps / TODOs / Backend Dependencies

1. **`policy_snapshot`** — the UI reads `booking.policy_snapshot` (frozen tiers). For paid bookings the backend must populate it; until then unpaid bookings fall back to the unit's deprecated `cancellation_policy` enum. Admin tooling that edits unit policies must not mutate existing bookings' snapshots.
2. **IDOR / authorization** relies entirely on the backend. The client fetches `/bookings/{id}`, `/payments/{id}`, etc. by id with no client-side ownership check — the backend **must** enforce 403/404 for non-owners. The UI only fail-fasts on malformed ids (non-numeric `pid`/`bookingId`).
3. **Debug OTP hint** — `DebugOtpHint` renders the backend's `debug_otp`. The backend is expected to omit `debug_otp` in production; the component adds a **second** guard (`process.env.NODE_ENV === 'production'` → render nothing). Confirm the backend truly strips it in prod.
4. **Homepage content endpoints** (`/testimonials`, `/units/categories`, `/units/cities`, `/units/budgets`) return `[]` in mock and are `safe()`-wrapped — the homepage degrades gracefully but shows less until the backend serves them. `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` currently hides the sections that depend on them.
5. **Reviews for a booking** — there is no dedicated endpoint; the real backend must embed `review` on the booking resource (the UI checks `booking.isReviewed`). `reviewsApi.getForBooking` resolves `null` in live mode.
6. **Availability endpoint** (`POST /units/{id}/availability`) exists in the client but is **not wired into any screen** currently (checkout relies on the create/booking conflict path instead).
7. **Payment method expiry on booking detail** is a hardcoded display string (`12/25`) — needs real data if surfaced.
8. **Client-side price is an estimate.** Checkout/unit-detail compute prices with default `serviceFeePercent 10` / `taxPercent 15`; the authoritative figures come from `/payments/initiate`. Admin/partner pricing config must stay in sync with those defaults or always drive them from the API.
9. **Base URL / ngrok** — `http()` always sends `ngrok-skip-browser-warning`, a tell that a temporary ngrok/staging base URL is in use. `.env.example` references `https://api.mamsaa.com/api/v1` (prod) and `https://staging.mamsaa.com/api/v1`.
10. **CSP is intentionally not set.** `next.config.js` ships baseline headers (`X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`) but **no Content-Security-Policy**, because moyasar.js injects inline styles/scripts + `data:` images. A CSP must be introduced in Report-Only first.

---

## 8. Security Notes

### H-1 — XSS in `lib/utils/booking-confirmation.ts` → **STILL PRESENT (not mitigated in code)**
`downloadBookingConfirmation()` builds an HTML string with **raw template-literal interpolation** of booking fields — `booking.code`, `unitSnapshot.title`, `city`, `country`, `ownerName`, plus price numbers/ids — and writes it into a **new window** via `w.document.write(html)`, which then auto-invokes `window.print()`. There is **no HTML-escaping helper** applied to any interpolated value:
```ts
<div class="unit">${booking.unitSnapshot.title}</div>
<div class="muted">${booking.unitSnapshot.city}، ${booking.unitSnapshot.country}</div>
<div class="muted">المضيف: ${booking.unitSnapshot.ownerName}</div>
```
These strings originate from backend unit/owner data. If any of those fields can contain markup (e.g. a partner-controlled unit title or owner name), it executes in the generated document. **Recommendation:** add an `escapeHtml()` pass on every interpolated value (or build the DOM with `textContent`) before this can be considered fixed. As of this reading, the sink is unescaped.

### H-2 — Next.js version → **PINNED TO 14.2.13 (not the latest 14.2.x patch)**
`package.json` pins `next: "14.2.13"` and `eslint-config-next: "14.2.13"`. This is an older 14.2.x patch; later 14.2.x releases carry security fixes (advisories affecting middleware/SSR in the 14.2 line). The app has **not** been bumped to the newest 14.2.x. **Recommendation:** upgrade to the latest 14.2.x patch (or the current supported Next major) and re-run `npm audit`.

### Other security-relevant facts (positive)
- **PCI posture:** card PANs never reach the Mamsa API — tokenised **browser → Moyasar** directly; only token ids are sent (`saveCardFromToken` / hosted form). The Mamsa backend re-fetches the token with its secret key.
- **Payment truth is server-side:** the frontend never marks a payment successful on its own — `/payments/verify` (idempotent, backend re-fetches the Moyasar charge) is the sole source of truth; the callback query string is a hint only.
- **Token hygiene:** single-owner `TokenManager`; silent-refresh dedup; forced logout on unrecoverable 401.
- **Baseline headers** set in `next.config.js` (see §7.10); `.well-known/apple-developer-merchantid-domain-association` served with the exact content type Apple requires.
- **Input fail-fast:** numeric-only guards on `bookingId` / `pid` before they enter request bodies.

---

*Generated from a full read of `src/app`, `src/components`, `src/stores`, `src/lib`, `src/data`, `src/types`, `src/i18n`, plus `package.json`, `next.config.js`, `.env.example`. Accurate as of the current working tree (branch `main`).*
