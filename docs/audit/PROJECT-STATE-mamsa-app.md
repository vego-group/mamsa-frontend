# PROJECT STATE — `mamsa-app`

Read-only audit of the user-facing Next.js website repository. Every claim cites `path:line`.
Audit date: 2026-08-12. Git branch `main`, HEAD `f45ef5a`, working tree clean.

---

## 1. Repo Identity & Health

### 1.1 Identity

| Field | Value | Source |
|---|---|---|
| `name` | `mamsa-app` | `package.json:2` |
| `version` | `1.0.0` | `package.json:3` |
| `private` | `true` | `package.json:4` |
| `description` | `Mamsa Platform — User Website (Next.js 14, TypeScript, TailwindCSS, shadcn/ui)` | `package.json:5` |
| Next.js | `14.2.13` (pinned, no caret) | `package.json:37` |
| TypeScript | `^5.6.2` | `package.json:64` |
| React | `^18.3.1` | `package.json:40` |
| Package manager lockfile | `pnpm-lock.yaml` (pnpm) | repo root |
| Tracked files | 150 | `git ls-files` |

### 1.2 Dependencies (`package.json:17-47`)

| Package | Version | Line |
|---|---|---|
| `@hookform/resolvers` | `^3.9.0` | `package.json:17` |
| `@modelcontextprotocol/sdk` | `^1.26.0` | `package.json:18` |
| `@radix-ui/react-avatar` | `^1.1.0` | `package.json:19` |
| `@radix-ui/react-checkbox` | `^1.1.1` | `package.json:20` |
| `@radix-ui/react-dialog` | `^1.1.1` | `package.json:21` |
| `@radix-ui/react-dropdown-menu` | `^2.1.1` | `package.json:22` |
| `@radix-ui/react-label` | `^2.1.0` | `package.json:23` |
| `@radix-ui/react-select` | `^2.1.1` | `package.json:24` |
| `@radix-ui/react-separator` | `^1.1.0` | `package.json:25` |
| `@radix-ui/react-slider` | `^1.2.0` | `package.json:26` |
| `@radix-ui/react-slot` | `^1.1.0` | `package.json:27` |
| `@radix-ui/react-tabs` | `^1.1.0` | `package.json:28` |
| `@radix-ui/react-toast` | `^1.2.1` | `package.json:29` |
| `@tanstack/react-query` | `^5.56.2` | `package.json:30` |
| `class-variance-authority` | `^0.7.0` | `package.json:31` |
| `clsx` | `^2.1.1` | `package.json:32` |
| `date-fns` | `^4.1.0` | `package.json:33` |
| `leaflet` | `1.9.4` | `package.json:34` |
| `lucide-react` | `^0.445.0` | `package.json:35` |
| `mcp-handler` | `^1.1.0` | `package.json:36` |
| `next` | `14.2.13` | `package.json:37` |
| `next-intl` | `^4.13.1` | `package.json:38` |
| `node-html-markdown` | `^2.0.0` | `package.json:39` |
| `react` | `^18.3.1` | `package.json:40` |
| `react-dom` | `^18.3.1` | `package.json:41` |
| `react-hook-form` | `^7.53.0` | `package.json:42` |
| `react-leaflet` | `4.2.1` | `package.json:43` |
| `tailwind-merge` | `^2.5.2` | `package.json:44` |
| `tailwindcss-animate` | `^1.0.7` | `package.json:45` |
| `zod` | `^3.23.8` | `package.json:46` |
| `zustand` | `^4.5.5` | `package.json:47` |

### 1.3 Dev dependencies (`package.json:50-65`)

| Package | Version | Line |
|---|---|---|
| `@testing-library/react` | `^16.0.1` | `package.json:50` |
| `@types/leaflet` | `^1.9.21` | `package.json:51` |
| `@types/node` | `^22.5.5` | `package.json:52` |
| `@types/react` | `^18.3.7` | `package.json:53` |
| `@types/react-dom` | `^18.3.0` | `package.json:54` |
| `@vitejs/plugin-react` | `^4.3.1` | `package.json:55` |
| `autoprefixer` | `^10.4.20` | `package.json:56` |
| `eslint` | `^8.57.1` | `package.json:57` |
| `eslint-config-next` | `14.2.13` | `package.json:58` |
| `happy-dom` | `^15.7.4` | `package.json:59` |
| `postcss` | `^8.4.47` | `package.json:60` |
| `prettier` | `^3.3.3` | `package.json:61` |
| `prettier-plugin-tailwindcss` | `^0.6.6` | `package.json:62` |
| `tailwindcss` | `^3.4.12` | `package.json:63` |
| `typescript` | `^5.6.2` | `package.json:64` |
| `vitest` | `^2.1.1` | `package.json:65` |

### 1.4 npm scripts (`package.json:7-14`)

| Script | Command | Line |
|---|---|---|
| `dev` | `next dev` | `package.json:7` |
| `build` | `next build` | `package.json:8` |
| `start` | `next start` | `package.json:9` |
| `lint` | `next lint` | `package.json:10` |
| `type-check` | `tsc --noEmit` | `package.json:11` |
| `test` | `vitest run` | `package.json:12` |
| `test:watch` | `vitest` | `package.json:13` |
| `skills:index` | `node scripts/build-agent-skills-index.mjs` | `package.json:14` |

### 1.5 Build / check results (actually executed 2026-08-12)

| Command | Status | Errors | Notes |
|---|---|---|---|
| `npx tsc --noEmit` | **PASS** | 0 | exit code 0, no output |
| `npx next lint` | **PASS** | 0 | output: `✔ No ESLint warnings or errors`, exit code 0 |
| `npx vitest run` | **FAIL** | 1 failed test (of 76); 1 failed test file (of 10) | `Test Files 1 failed | 9 passed (10)` / `Tests 1 failed | 75 passed (76)`, duration 88.28s |
| `npx next build` | **PASS** | 0 | `✓ Compiled successfully`, `✓ Generating static pages (26/26)`, exit code 0 |

**Test failures — verbatim (only one exists):**

```
FAIL  src/app/units/[id]/page.test.tsx > Unit details — booking-preview widget shows a subtotal-only estimate > renders no service fee row and computes no fee, once dates are picked
TestingLibraryElementError: Unable to find an element with the text: 4,800 ر.س. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
 ❯ src/app/units/[id]/page.test.tsx:51:19
```

Verifiable facts around that failure:
- The assertion is `expect(screen.getByText(formatSAR(4800))).toBeTruthy();` — `src/app/units/[id]/page.test.tsx:51`.
- The test drives the two date inputs with the fixed literals `2026-08-01` / `2026-08-05` — `src/app/units/[id]/page.test.tsx:47-48`.
- The subtotal row only renders when `nights > 0` — `src/app/units/[id]/page.tsx:355-360`.
- `nights` derives solely from the two input values — `src/app/units/[id]/page.tsx:82-85`.
- The check-in input carries `min={todayStr}` where `todayStr` is the machine's current local date — `src/app/units/[id]/page.tsx:94-97`, `src/app/units/[id]/page.tsx:323`. The literal `2026-08-01` is earlier than the audit date 2026-08-12.
- Whether `happy-dom` refuses to accept a `<input type="date">` value below `min`: `UNKNOWN — not verifiable from code`.

**`next build` route output (verbatim sizes):**

```
Route (app)                              Size     First Load JS
┌ ƒ /                                    7.59 kB         145 kB
├ ƒ /_not-found                          874 B          88.6 kB
├ ƒ /about                               2.13 kB         103 kB
├ ƒ /account                             4.71 kB         144 kB
├ ƒ /account/payment-methods             5.35 kB         138 kB
├ ƒ /account/phone                       6.58 kB         165 kB
├ ƒ /api/md                              0 B                0 B
├ ○ /auth.md                             0 B                0 B
├ ƒ /booking/[unitId]                    6.18 kB         149 kB
├ ƒ /booking/confirmation/[bookingId]    3.01 kB         136 kB
├ ƒ /contact                             6.32 kB         155 kB
├ ƒ /faq                                 2.13 kB         103 kB
├ ƒ /favorites                           3.34 kB         141 kB
├ ƒ /host                                2.13 kB         103 kB
├ ƒ /mcp                                 0 B                0 B
├ ƒ /my-reservations                     6.26 kB         156 kB
├ ƒ /my-reservations/[bookingId]         6.7 kB          178 kB
├ ƒ /partner-onboarding                  6.3 kB          144 kB
├ ƒ /payment/[bookingId]                 5.91 kB         139 kB
├ ƒ /payment/callback                    3.11 kB         136 kB
├ ƒ /picks                               3.52 kB         141 kB
├ ƒ /policies/cancellation               1.06 kB         108 kB
├ ƒ /policies/house-rules                154 B          87.8 kB
├ ƒ /policies/privacy                    154 B          87.8 kB
├ ƒ /policies/safety                     154 B          87.8 kB
├ ƒ /policies/terms                      154 B          87.8 kB
├ ○ /robots.txt                          0 B                0 B
├ ○ /sitemap.xml                         0 B                0 B
├ ƒ /units                               12.6 kB         155 kB
└ ƒ /units/[id]                          11.1 kB         146 kB
+ First Load JS shared by all            87.7 kB
ƒ Middleware                             26.5 kB
```

The build reported `- Environments: .env.local`, i.e. the local env file below was applied to the build.

---

## 2. Environment & Configuration

### 2.1 Every `process.env.*` reference in the repo

| Variable | File:line | Controls | Fallback / default |
|---|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `src/lib/api/client.ts:47` | Whole-app mock switch: `USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'` | unset ⇒ `true` (mock ON) |
| `NEXT_PUBLIC_API_BASE_URL` | `src/lib/api/client.ts:48` | Base URL prefixed to every real request | `''` (empty string) |
| `NEXT_PUBLIC_MOCK_OTP` | `src/lib/api/mock/index.ts:27` | The OTP code the mock layer accepts and echoes as `debugOtp` | `'111222'` |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/constants/brand.ts:11` | Canonical public site origin; used by `robots.txt`, `sitemap.xml`, `auth.md` | `'https://www.mamsaa.com'`, trailing slashes stripped |
| `NEXT_PUBLIC_DASHBOARD_URL` | `src/lib/constants/brand.ts:31` | Partner-dashboard base URL (derives `DASHBOARD_LOGIN_URL` at `brand.ts:33`) | `''` |
| `NEXT_PUBLIC_SITE_URL` | `src/app/mcp/route.ts:21` | Absolute `url` field on every unit an MCP tool returns | `'https://www.mamsaa.com'` |
| `NEXT_PUBLIC_API_BASE_URL` | `src/lib/mcp/units.ts:17` | Base URL for the server-side MCP data fetcher | `''` |
| `NEXT_PUBLIC_USE_MOCK` | `src/lib/mcp/units.ts:18` | Guard: MCP refuses to serve data when mock mode is on | unset ⇒ `true` ⇒ MCP throws |
| `NODE_ENV` | `src/components/features/auth/DebugOtpHint.tsx:16` | Hides the debug-OTP chip when `=== 'production'` | n/a |

There are exactly nine `process.env` reads; no others exist anywhere in `src/`, `scripts/`, or config files.

### 2.2 `.env.example` — full contents (verbatim)

```
# Mamsa — Environment Variables Template
# انسخ هذا الملف إلى .env.local وعدّل القيم

# API Base URL (Laravel backend — يشمل /api/v1)
# الإنتاج (القيمة المرجعية):
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com/api/v1
# بيئة الاختبار متاحة على: https://staging.mamsaa.com/api/v1

# Mock Mode (true = استخدم البيانات الوهمية، false = اربط مع API حقيقي)
NEXT_PUBLIC_USE_MOCK=false

# Canonical public site URL (تطبيق المستخدم — www) — يُستخدم في robots.txt و sitemap.xml
# بدون شرطة مائلة في النهاية. الافتراضي: https://www.mamsaa.com
NEXT_PUBLIC_SITE_URL=https://www.mamsaa.com

# Moyasar: لا يحتاج مفتاح هنا — publishable_key يأتي من POST /payments/initiate

# OTP Mock Code (للاختبار فقط — أي رقم جوال + هذا الرمز = نجاح)
NEXT_PUBLIC_MOCK_OTP=123456
```

`.env.example` does not document `NEXT_PUBLIC_DASHBOARD_URL`, which `src/lib/constants/brand.ts:31` reads.

### 2.3 `.env.local` — present, untracked (in `.gitignore`), applied to the build

```
# Mamsa — Local environment
# production backend (بيئة الإنتاج — تم التحويل النهائي 2026-08-04)
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com/api/v1
NEXT_PUBLIC_USE_MOCK=false

# Partner dashboard (separate app). Set to its base URL, e.g. https://dashboard.mamsa.sa
NEXT_PUBLIC_DASHBOARD_URL=
```

Contains no secrets. `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_MOCK_OTP` are absent, so their code defaults apply.

### 2.4 The mock/real switch — exact mechanism

- **File:** `src/lib/api/client.ts:47` — `const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';`
- **Polarity:** the switch is real-mode-opt-in. Any value other than the exact string `'false'` — including *unset* — leaves mock mode ON.
- **Shape:** `USE_MOCK` is read once at module scope and branched per function with a ternary. Example, `src/lib/api/client.ts:381-382`:
  `getById: (id) => USE_MOCK ? withLatency(mockApi.units.getById(id)) : http<RawUnit>(\`/units/${id}\`).then(mapUnit)`
- **What changes when flipped to `false`:**
  1. Every `authApi` / `unitsApi` / `contentApi` / `bookingsApi` / `paymentsApi` / `reviewsApi` / `accountApi` / `favoritesApi` / `miscApi` method switches from `mockApi.*` (or a canned literal) to `http()` against `BASE_URL` — `src/lib/api/client.ts:220-851`.
  2. The 300 ms artificial latency stops: `withLatency` only delays when `USE_MOCK` — `src/lib/api/client.ts:51-57`.
  3. Bearer auth headers start being attached — `src/lib/api/client.ts:123`.
  4. The silent refresh + forced-logout 401 path becomes reachable — `src/lib/api/client.ts:132-137`.
  5. The MCP server at `/mcp` stops throwing and starts serving — `src/lib/mcp/units.ts:29-36` throws `McpDataError` unless `NEXT_PUBLIC_USE_MOCK === 'false'`.
  6. Content endpoints that have **no** mock implementation start returning data instead of `[]`: `contentApi.testimonials` `src/lib/api/client.ts:421`, `categories` `:426`, `cities` `:429`, `budgets` `:433`; `favoritesApi.list` `:824`, `add` `:829`, `remove` `:836`.
- **Second, independent switch:** `src/lib/mcp/units.ts:18` re-reads the same variable with the same `!== 'false'` polarity, guarded at `src/lib/mcp/units.ts:29-36`.
- **`authApi.partnerRegister` has no mock branch at all** — it always calls the real API — `src/lib/api/client.ts:263-288`. Same for `authApi.refresh` (`:313`) and `paymentsApi.getById` (`:671`).

### 2.5 API base URL resolution, step by step

1. `src/lib/api/client.ts:48` — `const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';`. Inlined at build time by Next.js because of the `NEXT_PUBLIC_` prefix; there is no runtime lookup.
2. `src/lib/api/client.ts:111` — every request is `fetch(\`${BASE_URL}${path}\`, …)` where `path` always begins with `/` (e.g. `'/auth/verify-otp'`, `src/lib/api/client.ts:232`).
3. Therefore the env var must already include the `/api/v1` suffix. `.env.example:6` and `.env.local:3` both set `https://api.mamsaa.com/api/v1`, and `docs/backend/Mamsa-Switch-To-Production.md:41` states the suffix requirement explicitly.
4. If the var is unset, `BASE_URL` is `''` and every request becomes a same-origin relative fetch to the Next.js server (e.g. `/auth/verify-otp`), which has no such route. No error is raised at import time.
5. The refresh call bypasses `http()` and re-derives the URL itself: `src/lib/api/client.ts:75` — `fetch(\`${BASE_URL}/auth/refresh\`, …)`.
6. The MCP server resolves it separately: `src/lib/mcp/units.ts:17` then `src/lib/mcp/units.ts:43` — `fetch(\`${BASE_URL}${path}\`, …)`, with an explicit empty-string guard at `src/lib/mcp/units.ts:30-32`.
7. Fixed defaults on `http()`: `cache: 'no-store'` (`src/lib/api/client.ts:116`), `Accept: application/json` + `Content-Type: application/json` (`:119-120`), `ngrok-skip-browser-warning: 1` (`:122`), `Authorization: Bearer <token>` when a token exists (`:123`).
8. Response unwrapping: `204` → `undefined` (`:169`); empty body → `undefined` (`:172-173`); an object with a `data` key → `json.data` (`:176-178`); otherwise the raw JSON (`:179`).
9. `auth.md` hardcodes the production base independently of the env var: `src/app/auth.md/route.ts:19` — `const API_BASE = 'https://api.mamsaa.com/api/v1';`.
10. `public/.well-known/api-catalog:7` also hardcodes `https://api.mamsaa.com/api/v1`.

### 2.6 Other configuration files

| File | Contents of note |
|---|---|
| `next.config.js:8` | `reactStrictMode: true` |
| `next.config.js:10-13` | `images.remotePatterns`: `images.unsplash.com`, `plus.unsplash.com` only — **`api.mamsaa.com` is not listed**, contradicting `docs/backend/Mamsa-Switch-To-Production.md:47` |
| `next.config.js:20-23` | `/.well-known/apple-developer-merchantid-domain-association` served as `application/octet-stream` |
| `next.config.js:26-34` | `/.well-known/api-catalog` served as `application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"` |
| `next.config.js:40-59` | Global headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and an RFC 8288 `Link` header advertising the api-catalog + MCP server card. No CSP is set (deliberate, per the comment at `next.config.js:37-39`) |
| `next.config.js:4,66` | `next-intl` plugin bound to `./src/i18n/request.ts` |
| `tsconfig.json:7` | `"strict": true` |
| `tsconfig.json:21` | `"noUncheckedIndexedAccess": true` |
| `tsconfig.json:17-19` | path alias `@/*` → `./src/*` |
| `tsconfig.json:6` | `"allowJs": false` |
| `vitest.config.ts:8` | `environment: 'happy-dom'` |
| `vitest.config.ts:9` | `globals: true` |
| `vitest.config.ts:12` | alias `@` → `./src` |
| `.eslintrc.json:2` | extends `next/core-web-vitals` |
| `.eslintrc.json:4-5` | `react/no-unescaped-entities: off`, `@next/next/no-img-element: off` |
| `src/i18n/request.ts:8-11` | locales `['ar','en']`, default `ar`, cookie name `NEXT_LOCALE` |
| `src/i18n/request.ts:15` | any cookie value other than the literal `'en'` resolves to `ar` |

---

## 3. Route Map

### 3.1 Page & handler routes

Auth column reflects what the **code** enforces. There is no route-level auth guard anywhere in this repo (see §3.3); "Component-gated" means the page itself branches on auth state, "API-gated" means the page renders for anyone and the backend rejects the request.

| Route path | File | Server/Client | Auth required? | Layout | Dynamic params |
|---|---|---|---|---|---|
| `/` | `src/app/page.tsx:49` | Server (`async` RSC) | No | `src/app/layout.tsx:41` | — |
| `/about` | `src/app/about/page.tsx:21` | Server | No | root | — |
| `/account` | `src/app/account/page.tsx:21` | Client (`'use client'` `:1`) | API-gated; renders `loading` forever when `user` is null (`src/app/account/page.tsx:71`) | root | — |
| `/account/payment-methods` | `src/app/account/payment-methods/page.tsx:52` | Client (`:1`) | API-gated | root | — |
| `/account/phone` | `src/app/account/phone/page.tsx:20` | Client (`:1`) | Component-gated: returns `loading` when `!user` (`:62`) | root | — |
| `/api/md` | `src/app/api/md/route.ts:27` | Route handler, `runtime = 'nodejs'` (`:16`), `dynamic = 'force-dynamic'` (`:17`) | No | none | query `?path=` |
| `/auth.md` | `src/app/auth.md/route.ts:78` | Route handler, `dynamic = 'force-static'` (`:16`) | No | none | — |
| `/booking/[unitId]` | `src/app/booking/[unitId]/page.tsx:4` → client at `src/app/booking/[unitId]/checkout-page-client.tsx:26` | Server shell + Client (`Suspense`, `page.tsx:6`) | Component-gated on submit only: `handleConfirm` opens the login dialog when `!isAuth` (`checkout-page-client.tsx:153-157`) | root | `unitId` |
| `/booking/confirmation/[bookingId]` | `src/app/booking/confirmation/[bookingId]/page.tsx:14` | Client (`:1`) | API-gated | root | `bookingId` |
| `/contact` | `src/app/contact/page.tsx:37` | Client (`:1`) | No | root | — |
| `/faq` | `src/app/faq/page.tsx:22` | Server | No | root | — |
| `/favorites` | `src/app/favorites/page.tsx:12` | Client (`:1`) | No (reads the local favourites store) | root | — |
| `/host` | `src/app/host/page.tsx:33` | Server | No | root | — |
| `/mcp` | `src/app/mcp/route.ts:159` (`GET`/`POST`/`DELETE`) | Route handler, `runtime = 'nodejs'` (`:18`), `dynamic = 'force-dynamic'` (`:19`) | No — explicitly unauthenticated, read-only (`src/app/mcp/route.ts:6-8`) | none | — |
| `/my-reservations` | `src/app/my-reservations/page.tsx:16` | Client (`:1`) | API-gated | root | — |
| `/my-reservations/[bookingId]` | `src/app/my-reservations/[bookingId]/page.tsx:28` | Client (`:1`) | API-gated | root | `bookingId` |
| `/partner-onboarding` | `src/app/partner-onboarding/page.tsx:26` | Client (`:1`) | No | root (rendered as a `fixed inset-0` overlay, `:63`) | — |
| `/payment/[bookingId]` | `src/app/payment/[bookingId]/page.tsx:30` | Client (`:1`) | API-gated | root | `bookingId` — must match `/^\d+$/` (`:52`) |
| `/payment/callback` | `src/app/payment/callback/page.tsx:104` | Client (`:1`) | API-gated | root | query `?pid=` `&id=` `&status=` `&message=` (`:34-36`) |
| `/picks` | `src/app/picks/page.tsx:9` | Server | No | root | query `?cat=` (`:9`) |
| `/policies/cancellation` | `src/app/policies/cancellation/page.tsx:17` | Server | No | root | — |
| `/policies/house-rules` | `src/app/policies/house-rules/page.tsx:12` | Server | No | root | — |
| `/policies/privacy` | `src/app/policies/privacy/page.tsx:13` | Server | No | root | — |
| `/policies/safety` | `src/app/policies/safety/page.tsx:12` | Server | No | root | — |
| `/policies/terms` | `src/app/policies/terms/page.tsx:13` | Server | No | root | — |
| `/robots.txt` | `src/app/robots.txt/route.ts:53` | Route handler, `dynamic = 'force-static'` (`:15`) | No | none | — |
| `/sitemap.xml` | `src/app/sitemap.ts:14` | Next metadata route | No | none | — |
| `/units` | `src/app/units/page.tsx:4` → client at `src/app/units/units-page-client.tsx:51` | Server shell + Client (`Suspense`, `page.tsx:6`) | No | root | query `city`, `type`, `capacity`, `minPrice`, `maxPrice` (`units-page-client.tsx:64-79`) |
| `/units/[id]` | `src/app/units/[id]/page.tsx:47` | Client (`:1`) | No; the "book" button opens the login dialog when `!isAuth` (`:103`) | root | `id` |

Root layout `src/app/layout.tsx:41-69` wraps every page with `NextIntlClientProvider` (`:51`), `QueryProvider` (`:52`), `Header` (`:53`), `Footer` (`:55`), `LoginDialog` (`:57`), `RegisterDialog` (`:58`), `FavoritesSync` (`:60`), `ToastHost` (`:61`), `WebMcpTools` (`:63`). `<html lang>`/`dir` flip on locale at `src/app/layout.tsx:47`.

### 3.2 `middleware.ts`

- **File:** `src/middleware.ts` (47 lines).
- **Matcher (`src/middleware.ts:45`):** `['/((?!api|mcp|_next/static|_next/image|.*\..*).*)']` — excludes `/api/*`, `/mcp`, `/_next/static`, `/_next/image`, and any path containing a dot (assets, `robots.txt`, `sitemap.xml`, `/.well-known/*`).
- **Redirects:** none. There is no `NextResponse.redirect` anywhere in the repo.
- **Guard conditions, in order:**
  1. `src/middleware.ts:18-20` — if the `Accept` header does not contain `text/markdown`, `return NextResponse.next()`. This is the exit taken by all browser traffic.
  2. `src/middleware.ts:23-25` — if the `x-md-render` header is present (the renderer's own self-fetch), `return NextResponse.next()`.
  3. `src/middleware.ts:29-33` — otherwise **rewrite** (not redirect) to `/api/md?path=<original pathname+search, URL-encoded>`.
- **No auth check, no session read, no cookie read** occurs in the middleware. Locale is resolved server-side from the `NEXT_LOCALE` cookie inside `src/i18n/request.ts:14-15`, not in the middleware.

### 3.3 Route protection summary

No route in this repo is protected by the framework. `/account`, `/account/payment-methods`, `/account/phone`, `/my-reservations`, `/my-reservations/[bookingId]`, `/booking/[unitId]`, `/booking/confirmation/[bookingId]`, `/payment/[bookingId]`, `/payment/callback` and `/favorites` all render for anonymous visitors; the API returns 401 and `http()` triggers `forceLogout()` (`src/lib/api/client.ts:132-137`). The same paths are `Disallow`ed in robots.txt (`src/app/robots.txt/route.ts:33`) and excluded from the sitemap (`src/app/sitemap.ts:17-31`).

---

## 4. Auth & Session

Login is phone-OTP only. There is no password field, no password endpoint, and no password state anywhere; `src/app/account/page.tsx:154` and `src/components/shared/Header.tsx:141` both carry explicit "no password" comments.

### 4.1 Login flow (step by step)

1. Any component calls `useUiStore.getState().openAuth('login')` — store at `src/stores/ui.ts:18`. Trigger sites: `src/components/shared/Header.tsx:150` (desktop button), `src/components/shared/Header.tsx:220` (mobile drawer), `src/app/units/[id]/page.tsx:103` (book-now while signed out), `src/app/booking/[unitId]/checkout-page-client.tsx:156` (checkout submit while signed out), `src/components/features/auth/RegisterDialog.tsx:92` (bounce from register).
2. `LoginDialog` renders because `authDialog === 'login'` — `src/components/features/auth/LoginDialog.tsx:24`.
3. Step `phone`: react-hook-form + zod resolver over `makeLoginSchema` — `src/components/features/auth/LoginDialog.tsx:33`, `:42-45`.
4. On submit the raw input is normalised to E.164 by `normalizeSaudiPhone` — `src/components/features/auth/LoginDialog.tsx:64`; then converted to the local `05XXXXXXXX` form by `toSaudiLocal` for the wire — `src/components/features/auth/LoginDialog.tsx:68`.
5. `authApi.requestOtp(local, 'login')` → `POST /auth/request-otp` with body `{ phone, intent: "login" }` — `src/lib/api/client.ts:221-227`.
6. On `ApiError.code === PHONE_NOT_REGISTERED` the dialog switches to a `not-registered` panel instead of showing an error — `src/components/features/auth/LoginDialog.tsx:73-77`, panel at `:166-186`.
7. Otherwise the error message is scanned for a digit followed by `ثانية`/`seconds` and, if found, drives a live countdown instead of static text — `src/components/features/auth/LoginDialog.tsx:80-82`. The countdown ticks at `src/components/features/auth/LoginDialog.tsx:36-40`.
8. On success `phone` (E.164) and `debugOtp` are stored and the step becomes `otp` — `src/components/features/auth/LoginDialog.tsx:69-71`.
9. `OtpVerificationForm` renders with `variant="dialog"` — `src/components/features/auth/LoginDialog.tsx:157-163`.
10. Entering the last digit auto-submits — `src/components/features/auth/OtpVerificationForm.tsx:115`. Manual submit at `:246`.
11. `authApi.verifyOtp(local, code)` → `POST /auth/verify-otp` with `{ phone, code, device: "web" }` — `src/lib/api/client.ts:229-240`.
12. If the response carries `needs_profile: true`, the dialog refuses to open a session and shows the `not-registered` panel — `src/components/features/auth/LoginDialog.tsx:93-96`.
13. Otherwise `setSession(user, accessToken, refreshToken)` — `src/components/features/auth/LoginDialog.tsx:97` → `src/stores/auth.ts:31-34`, which writes both tokens through `tokenManager.setTokens` and sets `{ user, isAuthenticated: true }`.
14. `handleClose()` resets step/error/cooldown/debugOtp and clears the form — `src/components/features/auth/LoginDialog.tsx:52-59`.
15. `FavoritesSync` observes `isAuthenticated` flipping to true and merges local favourites with the server — `src/components/shared/FavoritesSync.tsx:20-24` → `src/stores/favorites.ts:44-62`.

### 4.2 Registration flow

1. `openAuth('register')` — `src/components/features/auth/RegisterDialog.tsx:25`.
2. Form fields firstName / lastName / email / phone, validated by `makeRegisterSchema` — `src/components/features/auth/RegisterDialog.tsx:34`, `:43-46`.
3. `authApi.register({...values, phone: local})` — `src/components/features/auth/RegisterDialog.tsx:69`. **The real implementation ignores `firstName`/`lastName`/`email` entirely** and posts only `{ phone, intent: "register" }` to `POST /auth/request-otp` — `src/lib/api/client.ts:251-257`.
4. `ApiError.code === PHONE_ALREADY_REGISTERED` switches to an `already-registered` panel — `src/components/features/auth/RegisterDialog.tsx:74-78`, panel at `:194-214`.
5. OTP step uses the same `OtpVerificationForm`, resending with `intent: "register"` — `src/components/features/auth/RegisterDialog.tsx:184-192`.
6. On verify: `setSession(...)` first — `src/components/features/auth/RegisterDialog.tsx:98`.
7. Then `authApi.completeProfile({ firstName, lastName, email })` → `POST /auth/complete-profile` with snake_case body — `src/components/features/auth/RegisterDialog.tsx:101-105`, `src/lib/api/client.ts:295-305`. Failure is swallowed by an empty `catch` at `src/components/features/auth/RegisterDialog.tsx:107-109`, so a user can end up with a live session and no name/email on the account.

### 4.3 Partner registration flow

1. `/partner-onboarding` collects type / name / email / phone / nationalId|crNumber — `src/app/partner-onboarding/page.tsx:29-34`, form at `src/components/features/auth/OnboardingForm.tsx:30`.
2. `authApi.requestOtp(phone05)` with **no** `intent` — `src/app/partner-onboarding/page.tsx:43` (deliberate, per `src/lib/api/client.ts:216-217`).
3. OTP step uses `variant="onboarding"` — `src/app/partner-onboarding/page.tsx:107-113`.
4. `authApi.partnerRegister({...})` → `POST /auth/partner/register` — `src/app/partner-onboarding/page.tsx:49-57`, `src/lib/api/client.ts:263-288`. Body sends `national_id` when type is individual, `cr_number` when type is company, the other as `null` — `src/lib/api/client.ts:280-281`.
5. The returned `access_token` / `refresh_token` are **discarded** — no `setSession` call exists in `src/app/partner-onboarding/page.tsx`; the page just renders `SuccessPanel` (`:58`, `:141-153`). This matches the file header comment at `src/app/partner-onboarding/page.tsx:7-8`.

### 4.4 OTP mechanics

| Property | Value | Source |
|---|---|---|
| Digit count (default) | 6 | `src/lib/constants/brand.ts:55` (`OTP_CONFIG.length`), consumed at `src/components/features/auth/OtpVerificationForm.tsx:65` |
| Digit count (zod schema) | 6, digits-only regex | `src/lib/validation/schemas.ts:20-24` — schema is never used, see §8 |
| Stated expiry | 60 seconds | `src/lib/constants/brand.ts:56` (`OTP_CONFIG.expirySeconds`) — never read by any component |
| Stated max attempts | 3 | `src/lib/constants/brand.ts:57` (`OTP_CONFIG.maxAttempts`) — never read by any component |
| Default resend cooldown | 30 seconds | `src/lib/constants/brand.ts:58`, consumed at `src/components/features/auth/OtpVerificationForm.tsx:66` |
| Email-flow resend cooldown | 60 seconds | `src/components/account/email-verification.tsx:27`, passed at `:219` |
| Mock email resend cooldown | 60 seconds | `src/lib/api/mock/index.ts:33` |
| Mock email max attempts | 5 | `src/lib/api/mock/index.ts:34` |
| Mock OTP code | `NEXT_PUBLIC_MOCK_OTP` env value, else `111222` | `src/lib/api/mock/index.ts:27` |
| Mock email OTP code | same value as the phone code | `src/lib/api/mock/index.ts:32` |
| `.env.example` mock OTP | `123456` | `.env.example:19` |

Resend behaviour — `src/components/features/auth/OtpVerificationForm.tsx:133-141`:
- No-ops while `cooldown > 0` (`:134`).
- Calls the caller-supplied `onResend()` (`:135`).
- Refreshes the on-screen debug code if the response carries one (`:136`).
- Prefers the server's `cooldownSeconds` over the fixed default (`:139`).
- Countdown ticker: one `setTimeout(..., 1000)` per second — `src/components/features/auth/OtpVerificationForm.tsx:88-92`.
- Initial cooldown may be seeded independently via `initialCooldownSeconds` — `:77`; used by the email card to join an in-flight cooldown after a rate-limit response — `src/components/account/email-verification.tsx:89`, `:110`.
- On a wrong code: dialog variant shows the server's message, onboarding variant shows a generic string; digits are cleared and focus returns to box 0 — `src/components/features/auth/OtpVerificationForm.tsx:99-106`.
- Paste of a full code auto-submits — `src/components/features/auth/OtpVerificationForm.tsx:122-131`.
- Backspace on an empty box moves focus back — `src/components/features/auth/OtpVerificationForm.tsx:118-120`.

**Exact Arabic strings, `messages/ar.json`, namespace `auth.otp`:**
`wrongCode` = "رمز خاطئ"; `title` = "أدخل رمز التحقق"; `sentTo` = "تم إرسال رمز التحقق إلى جوالك"; `verifying` = "جاري التحقق..."; `verify` = "تحقق"; `changeNumber` = "تغيير الرقم"; `resendIn` = "إعادة الإرسال خلال {seconds}s"; `resend` = "إعادة إرسال الرمز".

**`auth.onboardingOtp`:** `wrongCode` = "رمز التحقق غير صحيح"; `title` = "تحقق من هاتفك ، ارسلنا رمز التحقق"; `body` = "تحقق من هاتفك أرسلنا رمز التحقق إلى"; `bodyContinued` = "أدخل الرمز بالأسفل لإكمال عملية التسجيل."; `verifyNow` = "التحقق الان"; `didNotReceive` = "لم تستلم الرمز ؟"; `resendWithCooldown` = "اعاده ارسال الرمز ({seconds})"; `resend` = "اعاده ارسال الرمز".

**`auth.debugOtp.label`** = "رمز الاختبار (بيئة التطوير):" — rendered by `src/components/features/auth/DebugOtpHint.tsx:34`, suppressed when `NODE_ENV === 'production'` (`:16`).

**`auth.login`:** `waitCooldown` = "الرجاء الانتظار {seconds} ثانية قبل إعادة الإرسال"; `resendIn` = "إعادة الإرسال خلال {seconds} ثانية"; `notRegisteredTitle` = "هذا الرقم غير مسجّل"; `notRegisteredBody` = "لم نجد حسابًا بهذا الرقم. أنشئ حسابًا جديدًا للمتابعة."

**`auth.register`:** `alreadyRegisteredTitle` = "هذا الرقم مسجّل بالفعل"; `alreadyRegisteredBody` = "يوجد حساب بهذا الرقم مسبقًا. سجّل الدخول للمتابعة."

The mock layer's own wrong-code rejection message is the plain string "رمز التحقق غير صحيح" — `src/lib/api/mock/index.ts:100`.

**Error-code Arabic copy** — `src/lib/api/errors.ts:27-34`:
`EMAIL_INVALID` = "البريد الإلكتروني غير صحيح"; `EMAIL_ALREADY_IN_USE` = "هذا البريد مستخدم في حساب آخر"; `OTP_INVALID` = "رمز التحقق غير صحيح"; `OTP_EXPIRED` = "انتهت صلاحية الرمز، أعد الإرسال"; `OTP_MAX_ATTEMPTS` = "تجاوزت عدد المحاولات، أعد إرسال رمز جديد"; `EMAIL_VERIFICATION_REQUIRED` = "مطلوب توثيق البريد الإلكتروني قبل إتمام الحجز".
Two dynamic messages are built in `resolveErrorMessage` — `src/lib/api/errors.ts:39-41`: rate limit = "حاول مرة أخرى بعد {retryAfter} ثانية", invalid OTP with attempts left = "الرمز غير صحيح، متبقي {n} محاولات".

### 4.5 Email verification flow

Present. Single component `EmailVerificationCard` — `src/components/account/email-verification.tsx:42`, mounted twice: `context="checkout"` at `src/app/booking/[unitId]/checkout-page-client.tsx:292` and `context="settings"` at `src/app/account/page.tsx:138`.

1. Initial step is computed once from the store — `src/components/account/email-verification.tsx:51-53`: `verified` when `user.emailVerified`; `idle` when settings-context and an email exists; otherwise `form`.
2. `wasVerifiedOnMount` is captured once (`:50`) so a checkout user who was already verified renders **nothing** — `:229`.
3. Step 1 (`form`): local `isValidEmail` check before any request — `:73-76`, using `src/lib/utils/email.ts:1-5`.
4. `accountApi.requestEmailVerification(email)` → `POST /user/email` body `{ email }` — `src/components/account/email-verification.tsx:80`, `src/lib/api/client.ts:733-743`.
5. `resend_available_in` from the response seeds the OTP screen's cooldown; default 60 if absent — `src/lib/api/client.ts:742`, consumed at `src/components/account/email-verification.tsx:82`.
6. A rate-limit error is treated as success-with-live-code: the card jumps to the OTP step seeded with `retryAfter` — `src/components/account/email-verification.tsx:87-92`.
7. Step 1b (`idle`, settings only): send a code to the address already on file — `:99-118`, same handling.
8. Step 2 (`otp`): `OtpVerificationForm` with `displayPhone={emailInput}` — the email is passed through the phone slot — `:207-222`.
9. `accountApi.verifyEmail(code)` → `POST /user/email/verify` body `{ code }` — `:122`, `src/lib/api/client.ts:746-752`.
10. On success `updateUser({ email, emailVerified: true })` mutates the persisted auth store — `src/components/account/email-verification.tsx:123`; there is **no** `GET /auth/me` refetch, contrary to `docs/backend/NEXTJS-EMAIL-VERIFICATION-IMPLEMENTATION.md:100`.
11. Resend → `POST /user/email/resend` with body `{}` — `src/components/account/email-verification.tsx:132`, `src/lib/api/client.ts:755-760`.
12. Error copy is resolved by machine `code`, never by message text — `src/lib/api/errors.ts:37-47`.
13. Checkout gate: the pay button is disabled unless `user.emailVerified === true` — `src/app/booking/[unitId]/checkout-page-client.tsx:42`, `:315`; inline note "وثّق بريدك الإلكتروني لإتمام الحجز" at `:319`.
14. Server-side gate recovery: a 422 `EMAIL_VERIFICATION_REQUIRED` from `POST /bookings` calls `emailCardRef.current?.reopen()` and toasts, without clearing the typed form — `src/app/booking/[unitId]/checkout-page-client.tsx:183-188`; `reopen` at `src/components/account/email-verification.tsx:62-69`. It does **not** auto-retry the booking, unlike the pattern in `docs/backend/NEXTJS-EMAIL-VERIFICATION-IMPLEMENTATION.md:112-118`.

### 4.6 Phone-change flow

1. `/account/phone`, step `form` — `src/app/account/phone/page.tsx:25`, schema `makeChangePhoneSchema` (`:32`).
2. `accountApi.changePhone(local05)` → `POST /user/change-phone` body `{ new_phone }` — `src/app/account/phone/page.tsx:44`, `src/lib/api/client.ts:712-718`.
3. OTP step reuses `OtpVerificationForm`; resend re-calls `changePhone` — `src/app/account/phone/page.tsx:119-125`.
4. `accountApi.verifyChangePhone(local05, code)` → `POST /user/change-phone/verify` body `{ new_phone, code }` — `src/app/account/phone/page.tsx:56`, `src/lib/api/client.ts:721-727`.
5. On success `updateUser({ phone: e164 })` and a success banner — `src/app/account/phone/page.tsx:57-59`. In mock mode `verifyChangePhone` always resolves `{ ok: true }` without checking the code — `src/lib/api/client.ts:723`.

### 4.7 Token storage, refresh, expiry, logout

| Concern | Implementation | Source |
|---|---|---|
| Storage medium | `localStorage` | `src/lib/auth/tokens.ts:20-33` |
| Access token key | `mamsa.accessToken` | `src/lib/auth/tokens.ts:13` |
| Refresh token key | `mamsa.refreshToken` | `src/lib/auth/tokens.ts:14` |
| Sole owner | `tokenManager`; the auth store deliberately persists user data only | `src/lib/auth/tokens.ts:1-11`, `src/stores/auth.ts:4-8` |
| SSR guard | `typeof window !== 'undefined'` | `src/lib/auth/tokens.ts:17` |
| Persisted auth store key | `mamsa.auth`, partialized to `{ user, isAuthenticated }` | `src/stores/auth.ts:45-47` |
| Attachment to requests | `Authorization: Bearer <token>` when present | `src/lib/api/client.ts:123` |
| Refresh trigger | status 401 AND not already a retry AND a token existed AND path is not `/auth/refresh` | `src/lib/api/client.ts:132` |
| Refresh call | Raw `fetch` bypassing `http()`: `POST {BASE_URL}/auth/refresh` body `{ refresh_token, device: "web" }` | `src/lib/api/client.ts:75-79` |
| Refresh de-duplication | Module-level `refreshInFlight` promise shared across concurrent 401s, cleared in `finally` | `src/lib/api/client.ts:67`, `:71`, `:91-93` |
| Refresh success | `tokenManager.setTokens(access, refresh?)`, then the original request is replayed **once** | `src/lib/api/client.ts:86`, `:134` |
| Refresh failure | `forceLogout()` then a thrown 401 `ApiError` with message "انتهت جلستك، يرجى تسجيل الدخول مرة أخرى." | `src/lib/api/client.ts:135-136` |
| Expiry handling | No client-side expiry clock exists. Nothing writes an expiry; `AuthSession.expiresAt` (`src/types/index.ts:28`) is never assigned or read. The comment at `src/lib/api/client.ts:63` states tokens expire after 3600 s, but nothing tracks it — expiry is discovered only by receiving a 401 | `src/lib/api/client.ts:62-64` |
| `forceLogout` | Dynamic-imports the store (keeping the client-only store out of the server graph) and calls `logout()` | `src/lib/api/client.ts:98-102` |
| `logout()` | `tokenManager.clear()` plus `set({ user: null, isAuthenticated: false })` | `src/stores/auth.ts:39-42` |
| User-initiated logout | `authApi.logout()` with errors swallowed, then store `logout()` | `src/components/shared/Header.tsx:56-59` |
| Logout side-effect | `FavoritesSync` sees `isAuthenticated` go false and calls `reset()` | `src/components/shared/FavoritesSync.tsx:22`, `src/stores/favorites.ts:64` |
| Account deletion | `accountApi.deleteAccount()` → `authApi.logout()` → store `logout()` → `router.push('/')` | `src/app/account/page.tsx:62-65` |

### 4.8 What happens on 401 / 403

- **401, token present, first attempt, non-refresh path:** silent refresh plus one replay; on refresh failure, forced logout and a thrown 401 `ApiError` — `src/lib/api/client.ts:132-136`.
- **401, no token stored (guest hitting a protected endpoint):** the refresh branch is skipped because `token` is falsy at `:132`, and the error falls through to generic handling — `src/lib/api/client.ts:139-166`.
- **401 on `/auth/refresh` itself:** excluded by the path guard, preventing a loop — `src/lib/api/client.ts:132`.
- **403:** no special handling exists anywhere in the repo. It falls into the generic branch: message taken from `body.message`, else the first flattened `body.errors` value, else `res.statusText` — `src/lib/api/client.ts:139-156`; then `throw new ApiError(status, message, code, retryAfter, remainingAttempts)` (`:166`).
- **429 with no `code` field:** normalised to `code = RATE_LIMITED` with `retryAfter` read from the `Retry-After` header — `src/lib/api/client.ts:162-165`.
- There is **no** global 401 interceptor at the router/middleware level and **no** redirect to a login page; recovery is entirely per-call.

---

## 5. API Layer

Everything lives in one file, `src/lib/api/client.ts` (856 lines), organised into nine exported namespaces: `authApi` (`:220`), `unitsApi` (`:373`), `contentApi` (`:418`), `bookingsApi` (`:453`), `paymentsApi` (`:591`), `reviewsApi` (`:676`), `accountApi` (`:696`), `favoritesApi` (`:820`), `miscApi` (`:842`).

Status legend used below:
- **WIRED** — a real (non-mock) implementation exists AND at least one component/store calls it.
- **MOCK-ONLY** — called by the app, but the non-mock branch is a stub that performs no request.
- **DEFINED-BUT-UNUSED** — exported but never called anywhere in `src/`.
- **CALLED-BUT-NOT-IMPLEMENTED** — none found.

### 5.1 Function table

| Function | HTTP method | Path | Request type | Response type | Called from (file:line) | Mock impl exists? | Real impl exists? | Status |
|---|---|---|---|---|---|---|---|---|
| `authApi.requestOtp` | POST | `/auth/request-otp` | `{ phone: string; intent?: 'login'\|'register' }` (`client.ts:226`) | `OtpDispatch` = `{ sent: true; debugOtp?: string }` (`client.ts:205-208`) | `LoginDialog.tsx:68`; `partner-onboarding/page.tsx:43` | Yes (`mock/index.ts:97`) | Yes (`client.ts:224`) | WIRED |
| `authApi.verifyOtp` | POST | `/auth/verify-otp` | `{ phone, code, device: 'web' }` (`client.ts:234`) | `{ user: User; accessToken; refreshToken; needsProfile: boolean }` (`client.ts:235-240`) | `LoginDialog.tsx:89`; `RegisterDialog.tsx:97` | Yes (`mock/index.ts:99`) | Yes (`client.ts:232`) | WIRED |
| `authApi.resendOtp` | POST | `/auth/resend-otp` | `{ phone, intent? }` (`client.ts:247`) | `OtpDispatch` | `LoginDialog.tsx:161`; `RegisterDialog.tsx:189`; `partner-onboarding/page.tsx:112` | Yes — reuses `mockApi.auth.requestOtp` (`client.ts:244`) | Yes (`client.ts:245`) | WIRED |
| `authApi.register` | POST | `/auth/request-otp` | Accepts `{firstName,lastName,email,phone}`; **sends only** `{ phone, intent: 'register' }` (`client.ts:256`) | `OtpDispatch` | `RegisterDialog.tsx:69` | Yes (`mock/index.ts:109`) | Yes (`client.ts:254`) | WIRED |
| `authApi.partnerRegister` | POST | `/auth/partner/register` | `{ type, name, phone, code, email, national_id, cr_number, device: 'web' }` (`client.ts:274-283`) | `{ user, accessToken, refreshToken }` (`client.ts:284-288`) | `partner-onboarding/page.tsx:49` | **No** — always real | Yes (`client.ts:272`) | WIRED |
| `authApi.completeProfile` | POST | `/auth/complete-profile` | `{ first_name, last_name, email }` (`client.ts:300-304`) | `User` via `mapUser` (`client.ts:305`) | `RegisterDialog.tsx:101` | Yes — routed to `mockApi.account.updateProfile` (`client.ts:297`) | Yes (`client.ts:298`) | WIRED |
| `authApi.logout` | POST | `/auth/logout` | `{}` (`client.ts:310`) | `{ ok: true }` | `Header.tsx:57`; `account/page.tsx:63` | Yes (`mock/index.ts:120`) | Yes (`client.ts:310`) | WIRED |
| `authApi.refresh` | POST | `/auth/refresh` | `{ refresh_token, device: 'web' }` (`client.ts:316`) | `{ user, accessToken, refreshToken }` (`client.ts:317-321`) | — none | **No** | Yes (`client.ts:314`) | DEFINED-BUT-UNUSED (the 401 path uses a separate raw `fetch` at `client.ts:75`) |
| `unitsApi.list` | GET | `/units` + query | `UnitsFilter` → `city,type,capacity,start_date,end_date,min_price,max_price,min_rating,sort` (`client.ts:361-370`) + repeated `features[]` (`client.ts:411-414`) | `Unit[]` via `mapUnit` | `units-page-client.tsx:75`; `favorites/page.tsx:19`; `PicksSection.tsx:39`; `WebMcpTools.tsx:79` | Yes (`mock/index.ts:127`) | Yes (`client.ts:377`) | WIRED |
| `unitsApi.getById` | GET | `/units/{id}` | path param | `Unit` | `units/[id]/page.tsx:73`; `checkout-page-client.tsx:72`; `WebMcpTools.tsx:100` | Yes (`mock/index.ts:159`) | Yes (`client.ts:382`) | WIRED |
| `unitsApi.getFeatured` | GET | `/units/popular` | — | `Unit[]` | — none (`contentApi.popular` is used instead) | Yes (`mock/index.ts:165`) | Yes (`client.ts:387`) | DEFINED-BUT-UNUSED |
| `unitsApi.getReviews` | GET | `/units/{id}/reviews` | path param | `Review[]` via `mapReview` | `units/[id]/page.tsx:73` | Yes (`mock/index.ts:167`) | Yes (`client.ts:392`) | WIRED |
| `unitsApi.checkAvailability` | POST | `/units/{id}/availability` | `{ start_date, end_date }` (`client.ts:403`) | `CheckAvailabilityResult` = `{ available: boolean; pricing: QuotePricing\|null }` (`client.ts:341-345`) | `checkout-page-client.tsx:81` | Yes (`mock/index.ts:169`) | Yes (`client.ts:401`) | WIRED |
| `contentApi.testimonials` | GET | `/testimonials` | — | `Testimonial[]` (`adapters.ts:516-524`) | `page.tsx:56` | No — returns `[]` (`client.ts:421`) | Yes (`client.ts:422`) | WIRED |
| `contentApi.categories` | GET | `/units/categories` | — | `UnitCategory[]` (`adapters.ts:526-532`) | `page.tsx:57` | No — returns `[]` (`client.ts:426`) | Yes (`client.ts:427`) | WIRED |
| `contentApi.cities` | GET | `/units/cities` | — | `CityCount[]` (`adapters.ts:534-537`) | — none | No — returns `[]` (`client.ts:429`) | Yes (`client.ts:429`) | DEFINED-BUT-UNUSED |
| `contentApi.budgets` | GET | `/units/budgets` | — | `BudgetRange[]` (`adapters.ts:539-546`) | `page.tsx:58` | No — returns `[]` (`client.ts:433`) | Yes (`client.ts:434`) | WIRED |
| `contentApi.popular` | GET | `/units/popular` | — | `Unit[]` | `page.tsx:55` | Yes (`mock/index.ts:165`) | Yes (`client.ts:439`) | WIRED |
| `bookingsApi.list` | GET | `/user/bookings` | — | `Booking[]` via `mapBooking` | `my-reservations/page.tsx:28`; `checkout-page-client.tsx:207` | Yes (`mock/index.ts:178`) | Yes (`client.ts:457`) | WIRED |
| `bookingsApi.getById` | GET | `/bookings/{id}` | path param | `Booking` | `my-reservations/[bookingId]/page.tsx:40`; `booking/confirmation/[bookingId]/page.tsx:27` | Yes (`mock/index.ts:180`) | Yes (`client.ts:462`) | WIRED |
| `bookingsApi.create` | POST | `/bookings` | `{ unit_id, start_date, end_date, guests: number, notes: string }` (`client.ts:469-474`) | `Booking` | `checkout-page-client.tsx:168` | Yes (`mock/index.ts:186`) | Yes (`client.ts:467`) | WIRED |
| `bookingsApi.previewCancellation` | GET | `/bookings/{id}/cancellation-preview` | path param | `RefundPreview` via `mapCancellationPreview` (`engine.ts:97-121`) | `CancelBookingDialog.tsx:44` | Yes (`mock/index.ts:233`) | Yes (`client.ts:482`) | WIRED |
| `bookingsApi.cancel` | POST + follow-up GET | `/bookings/{id}/cancel`, then `/bookings/{id}` | `{ reason?: string }` (`client.ts:495`) | `{ booking: Booking; refund: RefundRecord }` (`client.ts:508`) | `CancelBookingDialog.tsx:54` | Yes (`mock/index.ts:239`) | Yes (`client.ts:494-509`) | WIRED |
| `paymentsApi.config` | GET | `/payments/config` | — | `PaymentsConfig` = `{ publishableKey, testMode, currency }` (`client.ts:585-589`) | `account/payment-methods/page.tsx:330`, `:345` | Canned literal, not `mockApi` (`client.ts:595`) | Yes (`client.ts:596`) | WIRED |
| `paymentsApi.initiate` | POST | `/payments/initiate` | `{ booking_id: number }` (`client.ts:622`) | `InitiatePaymentResult` (`client.ts:526-538`) | `payment/[bookingId]/page.tsx:57` | Canned literal (`client.ts:606-619`) | Yes (`client.ts:620`) | WIRED |
| `paymentsApi.pay` | POST | `/payments/pay` | `{ payment_id }` plus optionally `{ saved_card_id, cvc }` or `{ token }` (`client.ts:643-647`) | `PayResult` (`client.ts:540-547`) | `payment/[bookingId]/page.tsx:98`, `:121` | Canned literal (`client.ts:640`) | Yes (`client.ts:641`) | WIRED |
| `paymentsApi.verify` | POST | `/payments/verify` | `{ payment_id: number, moyasar_id: string }` (`client.ts:664`) | `VerifyResult` (`client.ts:549-553`) | `payment/callback/page.tsx:53` | Canned literal (`client.ts:661`) | Yes (`client.ts:662`) | WIRED |
| `paymentsApi.getById` | GET | `/payments/{paymentId}` | path param | `unknown` | — none | **No** | Yes (`client.ts:671`) | DEFINED-BUT-UNUSED |
| `reviewsApi.add` | POST | `/reviews` | `{ booking_id, rating, comment }` (`client.ts:682-686`) | `Review` via `mapReview` | `ReviewDialog.tsx:41` | Yes (`mock/index.ts:258`) | Yes (`client.ts:680`) | WIRED |
| `reviewsApi.getForBooking` | — | — (no endpoint) | `bookingId: string` | `Review \| null` | `my-reservations/[bookingId]/page.tsx:41`, `:222` | Yes (`mock/index.ts:277`) | **No** — real branch is `Promise.resolve(null)` (`client.ts:691`) | MOCK-ONLY |
| `accountApi.me` | GET | `/auth/me` | — | `User` via `mapUser` | `account/page.tsx:39` | Yes (`mock/index.ts:281`) | Yes (`client.ts:697`) | WIRED |
| `accountApi.updateProfile` | PUT | `/user/profile` | `{ first_name, last_name, email }` (`client.ts:704-708`) | `Omit<User,'role'>` via `mapUserProfile` (`adapters.ts:499`) | `account/page.tsx:47` | Yes (`mock/index.ts:286`) | Yes (`client.ts:702`) | WIRED |
| `accountApi.changePhone` | POST | `/user/change-phone` | `{ new_phone }` (`client.ts:717`) | `OtpDispatch` | `account/phone/page.tsx:44`, `:123` | Yes (`mock/index.ts:292`) | Yes (`client.ts:715`) | WIRED |
| `accountApi.verifyChangePhone` | POST | `/user/change-phone/verify` | `{ new_phone, code }` (`client.ts:726`) | `{ ok: true }` | `account/phone/page.tsx:56` | Canned literal, no code check (`client.ts:723`) | Yes (`client.ts:724`) | WIRED |
| `accountApi.requestEmailVerification` | POST | `/user/email` | `{ email }` (`client.ts:738`) | `{ email, verified, resendAvailableIn }` (`client.ts:739-743`) | `email-verification.tsx:80`, `:103` | Yes (`mock/index.ts:295`) | Yes (`client.ts:736`) | WIRED |
| `accountApi.verifyEmail` | POST | `/user/email/verify` | `{ code }` (`client.ts:751`) | `{ email, verified: true }` (`client.ts:752`) | `email-verification.tsx:122` | Yes (`mock/index.ts:309`) | Yes (`client.ts:749`) | WIRED |
| `accountApi.resendEmailVerification` | POST | `/user/email/resend` | `{}` (`client.ts:758`) | `{ resendAvailableIn }` (`client.ts:758-760`) | `email-verification.tsx:132` | Yes (`mock/index.ts:327`) | Yes (`client.ts:758`) | WIRED |
| `accountApi.deleteAccount` | DELETE | `/user/account` | — | `{ ok: true }` | `account/page.tsx:62` | Yes (`mock/index.ts:341`) | Yes (`client.ts:765`) | WIRED |
| `accountApi.getCards` | GET | `/user/cards` | — | `SavedCard[]` via `mapCard` (`adapters.ts:444`) | `payment/[bookingId]/page.tsx:74`; `account/payment-methods/page.tsx:70`, `:76` | Yes (`mock/index.ts:337`) | Yes (`client.ts:770`) | WIRED |
| `accountApi.saveCardFromToken` | POST | `/user/cards/from-token` | `{ token }` OR `{ brand, last4, exp_month, exp_year }` (`client.ts:795-799`) | `SavedCard` | `account/payment-methods/page.tsx:348`, `:360` | Canned literal (`client.ts:782-792`) | Yes (`client.ts:793`) | WIRED |
| `accountApi.deleteCard` | DELETE | `/user/cards/{id}` | path param | `{ ok: true }` | `account/payment-methods/page.tsx:81` | Canned literal (`client.ts:804`) | Yes (`client.ts:805`) | WIRED |
| `accountApi.setDefaultCard` | POST | `/user/cards/{id}/default` | `{}` (`client.ts:810`) | `{ ok: true }` | `account/payment-methods/page.tsx:86` | Canned literal (`client.ts:809`) | Yes (`client.ts:810`) | WIRED |
| `accountApi.getTransactions` | GET | `/user/transactions` | — | `Transaction[]` via `mapTransaction` (`adapters.ts:456`) | `account/payment-methods/page.tsx:70` | Yes (`mock/index.ts:339`) | Yes (`client.ts:815`) | WIRED |
| `favoritesApi.list` | GET | `/user/favorites` | — | `string[]` (ids) (`client.ts:825`) | `stores/favorites.ts:47` | No — returns `[]` (`client.ts:824`) | Yes (`client.ts:825`) | WIRED |
| `favoritesApi.add` | POST | `/user/favorites/{unitId}` | `{}` (`client.ts:832`) | `void` | `stores/favorites.ts:35`, `:56` | No — resolves `undefined` (`client.ts:829`) | Yes (`client.ts:832`) | WIRED |
| `favoritesApi.remove` | DELETE | `/user/favorites/{unitId}` | path param | `void` | `stores/favorites.ts:35` | No — resolves `undefined` (`client.ts:835`) | Yes (`client.ts:837`) | WIRED |
| `miscApi.contact` | POST | `/contact` | `{ name, phone, email, message }` passed through unchanged (`client.ts:849`) | `{ ok: true }` | `contact/page.tsx:60` | Canned literal (`client.ts:846`) | Yes (`client.ts:847`) | WIRED |

Server-side MCP data functions live outside `client.ts` and duplicate four of the paths above:

| Function | HTTP method | Path | Called from | Status |
|---|---|---|---|---|
| `searchUnits` | GET | `/units` + query (`mcp/units.ts:92`) | `src/app/mcp/route.ts:111` | WIRED (real only — throws in mock mode, `mcp/units.ts:33-35`) |
| `getUnit` | GET | `/units/{id}` (`mcp/units.ts:94`) | `src/app/mcp/route.ts:123` | WIRED (real only) |
| `getFeaturedUnits` | GET | `/units/popular` (`mcp/units.ts:97`) | `src/app/mcp/route.ts:134` | WIRED (real only) |
| `getUnitReviews` | GET | `/units/{id}/reviews` (`mcp/units.ts:100`) | `src/app/mcp/route.ts:145` | WIRED (real only) |

### 5.2 Every endpoint path string that appears anywhere in the repo (deduped, sorted)

Mamsa API paths (relative to `NEXT_PUBLIC_API_BASE_URL`):

1. `/auth/complete-profile` — `client.ts:298`
2. `/auth/logout` — `client.ts:310`
3. `/auth/me` — `client.ts:697`
4. `/auth/partner/register` — `client.ts:272`
5. `/auth/refresh` — `client.ts:75`, `client.ts:132`, `client.ts:314`
6. `/auth/request-otp` — `client.ts:224`, `client.ts:254`
7. `/auth/resend-otp` — `client.ts:245`
8. `/auth/verify-otp` — `client.ts:232`
9. `/bookings` — `client.ts:467`
10. `/bookings/{id}` — `client.ts:462`, `client.ts:499`
11. `/bookings/{id}/cancel` — `client.ts:494`
12. `/bookings/{id}/cancellation-preview` — `client.ts:482`
13. `/contact` — `client.ts:847`
14. `/payments/config` — `client.ts:596`
15. `/payments/initiate` — `client.ts:620`
16. `/payments/pay` — `client.ts:641`
17. `/payments/verify` — `client.ts:662`
18. `/payments/{paymentId}` — `client.ts:671`
19. `/reviews` — `client.ts:680`
20. `/testimonials` — `client.ts:422`
21. `/units` — `client.ts:377`, `mcp/units.ts:92`
22. `/units/budgets` — `client.ts:434`
23. `/units/categories` — `client.ts:427`
24. `/units/cities` — `client.ts:429`
25. `/units/popular` — `client.ts:387`, `client.ts:439`, `mcp/units.ts:97`
26. `/units/{id}` — `client.ts:382`, `mcp/units.ts:94`
27. `/units/{id}/availability` — `client.ts:401`
28. `/units/{id}/reviews` — `client.ts:392`, `mcp/units.ts:100`
29. `/user/account` — `client.ts:765`
30. `/user/bookings` — `client.ts:457`
31. `/user/cards` — `client.ts:770`
32. `/user/cards/from-token` — `client.ts:793`
33. `/user/cards/{id}` — `client.ts:805`
34. `/user/cards/{id}/default` — `client.ts:810`
35. `/user/change-phone` — `client.ts:715`
36. `/user/change-phone/verify` — `client.ts:724`
37. `/user/email` — `client.ts:736`
38. `/user/email/resend` — `client.ts:758`
39. `/user/email/verify` — `client.ts:749`
40. `/user/favorites` — `client.ts:825`
41. `/user/favorites/{unitId}` — `client.ts:832`, `client.ts:837`
42. `/user/profile` — `client.ts:702`
43. `/user/transactions` — `client.ts:815`

Documentation-only path strings (never called from code): `/auth/request-otp` and `/auth/verify-otp` and `/auth/refresh` restated in `src/app/auth.md/route.ts:37-39`.

Absolute third-party URLs:

- `https://api.moyasar.com/v1/tokens` — `src/lib/payments/moyasar.ts:13`, used at `:38`
- `https://api.moyasar.com/v1/applepay/initiate` — `src/lib/payments/moyasar.ts:108`
- `https://cdn.moyasar.com/mpf/1.14.0/moyasar.css` — `src/lib/payments/moyasar.ts:68`
- `https://cdn.moyasar.com/mpf/1.14.0/moyasar.js` — `src/lib/payments/moyasar.ts:73`
- `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` — `src/components/features/home/LocationMap.tsx:77`
- `https://api.mamsaa.com/api/v1` (hardcoded, not env-derived) — `src/app/auth.md/route.ts:19`, `public/.well-known/api-catalog:7`, `public/.well-known/api-catalog:13`
- `https://api.mamsaa.com/up` — `public/.well-known/api-catalog:17`

Internal Next.js paths fetched by the app itself: `/api/md` (rewrite target, `src/middleware.ts:31`) and the same-origin page URL it re-fetches (`src/app/api/md/route.ts:35`, `:39`).

### 5.3 Every `fetch(` / `axios` call that bypasses the API layer

There is no `axios` dependency and no `axios` import anywhere. Five raw `fetch` call sites exist:

| File:line | Target | Bypasses `http()`? | Notes |
|---|---|---|---|
| `src/lib/api/client.ts:111` | `${BASE_URL}${path}` | — this **is** `http()` | The single shared wrapper |
| `src/lib/api/client.ts:75` | `${BASE_URL}/auth/refresh` | **Yes** | Inside the API layer but deliberately outside `http()` to avoid a 401 loop; sets its own headers and does not send `Authorization` |
| `src/lib/mcp/units.ts:43` | `${BASE_URL}${path}` | **Yes** | Separate server-side fetcher with its own envelope unwrapping (`:66-69`) and a 10 s `AbortSignal.timeout` (`:21`, `:50`); documented rationale at `src/lib/mcp/units.ts:5-13` |
| `src/lib/payments/moyasar.ts:38` | `https://api.moyasar.com/v1/tokens` | **Yes** — third-party | Browser→Moyasar card tokenisation with HTTP Basic auth built from the publishable key (`:42`) |
| `src/app/api/md/route.ts:39` | same-origin page URL | **Yes** — internal | Server-to-server self-fetch for the Markdown renderer |

Additionally, `src/lib/payments/moyasar.ts:60-79` injects a `<link>` and a `<script>` pointing at `cdn.moyasar.com`, and `src/lib/payments/moyasar.ts:96` calls `window.Moyasar.init(...)` — network activity that never passes through the API layer.

---

## 6. Data Models & Types

Domain types live in `src/types/index.ts` (234 lines); API-facing raw shapes and a few view-model types live in `src/lib/api/adapters.ts`; pricing/payment view models live in `src/lib/api/client.ts`; the refund preview lives in `src/lib/cancellation/engine.ts`.

Field marks: **FROM-API** (populated by a mapper from a response), **SENT-TO-API** (appears in a request body/query), **BOTH**, **UI-ONLY** (produced client-side), **ORPHAN** (declared and possibly populated, but never read anywhere in `src/` outside its own mapper/mock fixture).

### 6.1 `UserRole` (enum/union) — `src/types/index.ts:9`
Values: `'user' | 'individual' | 'company' | 'super_admin'`. Derived in `mapRole` — `src/lib/api/adapters.ts:468-472`.

### 6.2 `User` — `src/types/index.ts:11-22`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:481`; read `mock/index.ts:178` |
| `role` | `UserRole` | no | FROM-API | `adapters.ts:482`; omitted by `mapUserProfile` (`adapters.ts:499-502`). Never branched on in any component |
| `firstName` | `string` | no | BOTH | `adapters.ts:483`; sent `client.ts:301`; read `account/page.tsx:85`, `Header.tsx:61` |
| `lastName` | `string` | no | BOTH | `adapters.ts:484`; sent `client.ts:302`; read `account/page.tsx:85` |
| `email` | `string \| null` | no | BOTH | `adapters.ts:485`; sent `client.ts:303`, `client.ts:738`; read `account/page.tsx:87`, `email-verification.tsx:161` |
| `emailVerified` | `boolean` | no | FROM-API | `adapters.ts:486`; read `checkout-page-client.tsx:42`, `email-verification.tsx:50-52` |
| `phone` | `string` (E.164) | no | FROM-API | `adapters.ts:488`; read `account/page.tsx:88`, `checkout-page-client.tsx:92` |
| `avatarUrl` | `string` | yes | ORPHAN | mapped `adapters.ts:487`; never read — `Header.tsx:105` renders initials instead |
| `createdAt` | `string` | no | ORPHAN | mapped `adapters.ts:489`; never read |

### 6.3 `AuthSession` — `src/types/index.ts:24-29`
Fields `user`, `accessToken`, `refreshToken`, `expiresAt` (all required). **The entire interface is ORPHAN** — never imported or referenced outside its declaration.

### 6.4 `UnitType` / `UnitStatus` — `src/types/index.ts:33-34`
`UnitType` = `'apartment' | 'studio' | 'villa'`. `UnitStatus` = `'draft' | 'pending' | 'approved' | 'rejected'`; the runtime list is `adapters.ts:271`, coercion at `adapters.ts:273-274` (anything else becomes `'pending'`).

### 6.5 `UnitAmenity` — `src/types/index.ts:36-44`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `key` | `string` | no | BOTH | `adapters.ts:266`; sent as `features[]` `client.ts:413`; read `units/[id]/page.tsx:219` |
| `labelAr` | `string` | no | FROM-API | `adapters.ts:266`; read `units/[id]/page.tsx:225`, `UnitCard.tsx:27` |

### 6.6 `Unit` — `src/types/index.ts:46-93`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:285` |
| `ownerId` | `string` | no | ORPHAN | `adapters.ts:286`; never read |
| `ownerName` | `string` | no | FROM-API | `adapters.ts:287`; read `units/[id]/page.tsx:195` |
| `ownerType` | `'individual'\|'company'` | no | FROM-API | `adapters.ts:288`; read `units/[id]/page.tsx:197` |
| `ownerVerified` | `boolean` | no | FROM-API | `adapters.ts:289`; read `units/[id]/page.tsx:201` |
| `ownerAvatarUrl` | `string \| null` | no | FROM-API | `adapters.ts:290`; read `units/[id]/page.tsx:182` |
| `title` | `string` | no | FROM-API | `adapters.ts:291`; read `UnitCard.tsx:53` |
| `description` | `string` | no | FROM-API | `adapters.ts:292`; read `units/[id]/page.tsx:209` |
| `type` | `UnitType` | no | BOTH | `adapters.ts:293`; sent `client.ts:363`; read `units/[id]/page.tsx:139` |
| `status` | `UnitStatus` | no | ORPHAN (UI) | `adapters.ts:294`; read only by mock filters `mock/index.ts:128`, `:165` |
| `city` | `string` | no | BOTH | `adapters.ts:296`; sent `client.ts:362`; read `UnitCard.tsx:104` |
| `district` | `string` | no | FROM-API | `adapters.ts:297`; read `units/[id]/page.tsx:152` |
| `country` | `string` | no | UI-ONLY | constant `'السعودية'` `adapters.ts:28`, assigned `:298`; read `UnitCard.tsx:104` |
| `latitude` | `number` | no | FROM-API | `adapters.ts:299`; read `page.tsx:82`, `:192` |
| `longitude` | `number` | no | FROM-API | `adapters.ts:300`; read `page.tsx:82`, `:193` |
| `pricePerNight` | `number` | no | FROM-API | `adapters.ts:301`; read `units/[id]/page.tsx:89`, `UnitCard.tsx:62`, `:130` |
| `taxPercent` | `number` | yes | ORPHAN | mapped `adapters.ts:302`; never read — checkout reads `quotePricing.taxPercent` instead (`checkout-page-client.tsx:341`) |
| `capacity` | `number` | no | BOTH | `adapters.ts:303`; sent `client.ts:364`; read `units/[id]/page.tsx:174` |
| `bedrooms` | `number` | no | FROM-API | `adapters.ts:304`; read `units/[id]/page.tsx:175` |
| `beds` | `number` | no | FROM-API | `adapters.ts:305`; read `units/[id]/page.tsx:176` |
| `bathrooms` | `number` | no | FROM-API | `adapters.ts:306`; read `units/[id]/page.tsx:177` |
| `area` | `number` | yes | FROM-API | `adapters.ts:307`; read only by MCP `mcp/route.ts:42` |
| `amenities` | `UnitAmenity[]` | no | FROM-API | `adapters.ts:308`; read `units/[id]/page.tsx:218` |
| `imageUrls` | `string[]` | no | FROM-API | `adapters.ts:309`; read `UnitGallery.tsx:46-47` |
| `rating` | `number` | no | BOTH | `adapters.ts:311`; sent as `min_rating` `client.ts:368`; read `UnitCard.tsx:67` |
| `reviewCount` | `number` | no | FROM-API | `adapters.ts:312`; read `UnitCard.tsx:68` |
| `checkInTime` | `string` | no | FROM-API | `adapters.ts:313` (default `'15:00'`); read `units/[id]/page.tsx:242` |
| `checkOutTime` | `string` | no | FROM-API | `adapters.ts:314` (default `'12:00'`); read `units/[id]/page.tsx:243` |
| `cancellationPolicy` | `CancellationTemplate` | no | FROM-API | `adapters.ts:315`; read `units/[id]/page.tsx:247`, `checkout-page-client.tsx:265` |
| `cancellationPolicyDetails` | `CancellationPolicy \| null` | yes | FROM-API | `adapters.ts:316`; read `units/[id]/page.tsx:247`, `checkout-page-client.tsx:265` |
| `isFeatured` | `boolean` | yes | FROM-API | `adapters.ts:310`; read `units-page-client.tsx:46`, `UnitCard.tsx:47` |
| `rejectionReason` | `string \| null` | yes | ORPHAN | mapped `adapters.ts:295`; never read |
| `createdAt` | `string` | no | FROM-API | `adapters.ts:317`; read by mock sort `mock/index.ts:153` |

### 6.7 `CancellationTemplate` / `CancellationTier` / `CancellationPolicy` — `src/types/index.ts:97-114`

`CancellationTemplate` = `'flexible' | 'moderate' | 'strict'`. Backend-key mapping table at `adapters.ts:200-208` accepts `flexible`, `24_hours`, `48_hours`, `moderate`, `7_days`, `strict`, `non_refundable`; unknown values fall back to `'moderate'` (`adapters.ts:223`).

`CancellationTier`:

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `minDaysBeforeCheckIn` | `number` | no | FROM-API (hours ÷ 24) | `adapters.ts:238`; read `engine.ts:86`, `CancellationPolicyDisplay.tsx:28` |
| `refundPercent` | `number` (0..100) | no | FROM-API | `adapters.ts:239`; read `engine.ts:171`, `CancellationPolicyDisplay.tsx:59-64` |
| `labelAr` | `string` | no | ORPHAN | `adapters.ts:240`; never read — the display derives labels from the numbers (`CancellationPolicyDisplay.tsx:44-52`) |

`CancellationPolicy`:

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `template` | `CancellationTemplate` | no | FROM-API | `adapters.ts:248`; read `CancellationPolicyDisplay.tsx:36` |
| `labelAr` | `string` | no | ORPHAN | `adapters.ts:249`; never read |
| `descriptionAr` | `string` | no | ORPHAN | `adapters.ts:250`; never read |
| `tiers` | `CancellationTier[]` | no | FROM-API | `adapters.ts:252`; read `engine.ts:82`, `CancellationPolicyDisplay.tsx:27` |
| `postCheckInBehavior` | `'hidden'\|'forbidden'` | no | ORPHAN | always set to `'hidden'` (`adapters.ts:253`, `cancellation-policies.ts:18`, `:30`, `:42`); never read |

### 6.8 `BookingStatus` — `src/types/index.ts:118-122`
Values: `'pending_payment' | 'confirmed' | 'completed' | 'cancelled'`. Backend-value map at `adapters.ts:210-220` accepts `pending`, `pending_payment`, `awaiting_payment`, `confirmed`, `paid`, `active`, `completed`, `cancelled`, `canceled`; anything unmapped becomes `'confirmed'` (`adapters.ts:362`).

### 6.9 `PaymentInfo` — `src/types/index.ts:124-128`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `method` | `'mada'\|'visa'\|'mastercard'\|'applepay'` | no | BOTH | `adapters.ts:382`; sent by `CreateBookingInput.paymentMethod` (`client.ts:449`) — **but dropped from the outgoing body** (`client.ts:469-474`); read `my-reservations/[bookingId]/page.tsx:185` |
| `last4` | `string` | yes | FROM-API | `adapters.ts:382`; read `my-reservations/[bookingId]/page.tsx:186` |
| `cardholderName` | `string` | yes | ORPHAN | only ever set in mock fixture `data/mock/bookings.ts:31`; never mapped, never read |

### 6.10 `PriceBreakdown` — `src/types/index.ts:130-136`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `pricePerNight` | `number` | no | FROM-API | `adapters.ts:368`; read `PriceBreakdown.tsx` label input at `my-reservations/[bookingId]/page.tsx:74` |
| `nights` | `number` | no | FROM-API | `adapters.ts:369`; read `checkout-page-client.tsx:340` |
| `subtotal` | `number` | no | FROM-API | `adapters.ts:370`; read `PriceBreakdown.tsx:29` |
| `tax` | `number` | no | FROM-API | `adapters.ts:371`; read `PriceBreakdown.tsx:30` |
| `total` | `number` | no | FROM-API | `adapters.ts:372`; read `PriceBreakdown.tsx:32`, `BookingCard.tsx:79` |

### 6.11 `RefundRecord` — `src/types/index.ts:138-145`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `amount` | `number` | no | FROM-API | `adapters.ts:386`; read `BookingCard.tsx:107`, `my-reservations/[bookingId]/page.tsx:146` |
| `percent` | `number` | no | FROM-API | `adapters.ts:387`; read same two lines |
| `tierLabel` | `string` | no | ORPHAN | set `adapters.ts:388`, `client.ts:502`, `engine.ts:197`; never read |
| `refundedAt` | `string` | no | ORPHAN | set `adapters.ts:389`, `client.ts:503`, `engine.ts:198`; never read (`cancelledAt` is displayed instead — `my-reservations/[bookingId]/page.tsx:145`) |
| `reason` | `string` | yes | BOTH | sent `client.ts:495`; mapped `adapters.ts:390`; read `BookingCard.tsx:106` |
| `cancelledBy` | `'customer'\|'partner'\|'admin'\|'system'` | no | FROM-API | `adapters.ts:391`, closed set at `adapters.ts:327`; read `BookingCard.tsx:105` |

### 6.12 `Booking` — `src/types/index.ts:147-177`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:350`; read `BookingCard.tsx:83` |
| `code` | `string` | no | FROM-API | `adapters.ts:351`; read `BookingCard.tsx:72`, confirmation `:72` |
| `unitId` | `string` | no | FROM-API | `adapters.ts:352`; read `BookingCard.tsx:93` |
| `unitSnapshot.title` | `string` | no | FROM-API | `adapters.ts:354`; read `BookingCard.tsx:54` |
| `unitSnapshot.city` | `string` | no | FROM-API | `adapters.ts:355`; read `BookingCard.tsx:57` |
| `unitSnapshot.country` | `string` | no | UI-ONLY | constant `adapters.ts:356`; read `BookingCard.tsx:57` |
| `unitSnapshot.imageUrl` | `string` | no | FROM-API | `adapters.ts:357`; read `BookingCard.tsx:45` |
| `unitSnapshot.ownerName` | `string` | no | FROM-API | `adapters.ts:358`; read `BookingCard.tsx:61` |
| `userId` | `string` | no | ORPHAN (UI) | `adapters.ts:360`; read only by the mock list filter `mock/index.ts:178` |
| `guestName` | `string` | yes | ORPHAN | mapped `adapters.ts:361`; never read |
| `status` | `BookingStatus` | no | FROM-API | `adapters.ts:362`; read `my-reservations/page.tsx:54-59`, `engine.ts:61-62` |
| `checkInDate` | `string` (ISO date) | no | BOTH | sent `client.ts:471`; mapped `adapters.ts:363`; read `engine.ts:63` |
| `checkOutDate` | `string` | no | BOTH | sent `client.ts:472`; mapped `adapters.ts:364` |
| `nights` | `number` | no | FROM-API | `adapters.ts:365`; read `my-reservations/[bookingId]/page.tsx:166` |
| `guests.adults` | `number` | no | BOTH | summed into `guests` on send `client.ts:473`; mapped `adapters.ts:340`; read `my-reservations/[bookingId]/page.tsx:170` |
| `guests.children` | `number` | no | BOTH | same send/read paths; mapped `adapters.ts:339` |
| `price` | `PriceBreakdown` | no | FROM-API | `adapters.ts:367-373` |
| `payment` | `PaymentInfo` | yes | FROM-API | `adapters.ts:381-383` |
| `policySnapshot` | `CancellationPolicy` | no | FROM-API | `adapters.ts:376-377`; read `CancelBookingDialog.tsx:107`, `engine.ts:170` |
| `refund` | `RefundRecord` | yes | FROM-API | `adapters.ts:384-393` |
| `isReviewed` | `boolean` | no | FROM-API | `adapters.ts:378`; read `my-reservations/[bookingId]/page.tsx:47` |
| `createdAt` | `string` | no | ORPHAN | `adapters.ts:394`; never read |
| `cancelledAt` | `string` | yes | FROM-API | `adapters.ts:395`; read `my-reservations/[bookingId]/page.tsx:145` |

### 6.13 `Review` — `src/types/index.ts:181-191`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:431`; used as React key `units/[id]/page.tsx:276` |
| `bookingId` | `string` | no | ORPHAN (UI) | `adapters.ts:432`; sent separately as `booking_id` (`client.ts:683`); read only by mock lookup `data/mock/reviews.ts:33` |
| `unitId` | `string` | no | ORPHAN (UI) | `adapters.ts:433`; read only by mock filter `mock/index.ts:167` |
| `userId` | `string` | no | ORPHAN | `adapters.ts:434`; never read |
| `userName` | `string` | no | FROM-API | `adapters.ts:436`; read `units/[id]/page.tsx:282`, `:286` |
| `userAvatarUrl` | `string` | yes | FROM-API | `adapters.ts:437`; read `units/[id]/page.tsx:278-279` |
| `rating` | `number` (1..5) | no | BOTH | sent `client.ts:684`; mapped `adapters.ts:438`; read `units/[id]/page.tsx:290` |
| `comment` | `string` | no | BOTH | sent `client.ts:685`; mapped `adapters.ts:439`; read `units/[id]/page.tsx:295` |
| `createdAt` | `string` | no | FROM-API | `adapters.ts:440`; read `units/[id]/page.tsx:287` |

### 6.14 `UnitsFilter` — `src/types/index.ts:195-206`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `city` | `string` | yes | SENT-TO-API | query `client.ts:362`; set `units-page-client.tsx:77`, `WebMcpTools.tsx:80`, `mcp/route.ts:98` |
| `type` | `UnitType \| 'all'` | yes | SENT-TO-API | query `client.ts:363`; set `units-page-client.tsx:78`, `PicksSection.tsx:24` |
| `capacity` | `number` | yes | SENT-TO-API | query `client.ts:364`; set `units-page-client.tsx:79`, `WebMcpTools.tsx:82` |
| `startDate` | `string` | yes | ORPHAN | query `client.ts:365`; **no caller ever sets it** |
| `endDate` | `string` | yes | ORPHAN | query `client.ts:366`; **no caller ever sets it** |
| `minPrice` | `number` | yes | SENT-TO-API | query `client.ts:367`; set only via MCP `mcp/route.ts:101` |
| `maxPrice` | `number` | yes | SENT-TO-API | query `client.ts:368`; set `WebMcpTools.tsx:83`, `mcp/route.ts:102` |
| `minRating` | `number` | yes | SENT-TO-API | query `client.ts:369`; set only via MCP `mcp/route.ts:103` |
| `amenities` | `string[]` | yes | ORPHAN | serialised by `filterFeatures` `client.ts:411-414`; **no caller ever sets it** — `/units` filters amenities client-side at `units-page-client.tsx:90` |
| `sort` | `'price_asc'\|'price_desc'\|'rating'\|'newest'` | yes | SENT-TO-API | query `client.ts:370`; set only via MCP `mcp/route.ts:104-107`. `/units` sorts client-side with a different key set (`units-page-client.tsx:16`, `:35-49`) |

### 6.15 `SavedCard` — `src/types/index.ts:210-219`

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:446`; sent as a path param `client.ts:805`, `:810`, and as `saved_card_id` `client.ts:645` |
| `brand` | `'visa'\|'mastercard'\|'mada'` | no | BOTH | `adapters.ts:447`; sent `client.ts:798`; read `payment-methods/page.tsx:305` |
| `last4` | `string` | no | BOTH | `adapters.ts:448`; sent `client.ts:798`; read `payment-methods/page.tsx:295` |
| `expMonth` | `number` | no | BOTH | `adapters.ts:449`; sent `client.ts:798`; read `payment-methods/page.tsx:302` |
| `expYear` | `number` | no | BOTH | `adapters.ts:450`; sent `client.ts:798`; read `payment-methods/page.tsx:302` |
| `isDefault` | `boolean` | no | FROM-API | `adapters.ts:451`; read `payment-methods/page.tsx:119`, `payment/[bookingId]/page.tsx:78` |
| `chargeable` | `boolean` | yes | FROM-API | `adapters.ts:452`; read `payment/[bookingId]/page.tsx:76` |

### 6.16 `TransactionType` / `Transaction` — `src/types/index.ts:223-233`

`TransactionType` = `'payment' | 'refund' | 'topup' | 'reward'` — read at `payment-methods/page.tsx:56-61`, `:179`.

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `id` | `string` | no | FROM-API | `adapters.ts:458`; React key `payment-methods/page.tsx:168` |
| `refCode` | `string` | no | FROM-API | `adapters.ts:459`; read `payment-methods/page.tsx:185` |
| `type` | `TransactionType` | no | FROM-API | `adapters.ts:460`; read `payment-methods/page.tsx:173`, `:179`, `:184` |
| `amount` | `number` (signed) | no | FROM-API | `adapters.ts:461`; read `payment-methods/page.tsx:166`, `:190` |
| `description` | `string` | no | FROM-API | `adapters.ts:462`; read `payment-methods/page.tsx:182` |
| `date` | `string` | no | FROM-API | `adapters.ts:463`; read `payment-methods/page.tsx:192` |
| `status` | `'completed'\|'pending'\|'failed'` | no | ORPHAN | `adapters.ts:464`; never read |

### 6.17 Raw backend shapes — `src/lib/api/adapters.ts`

Declared but consumed only inside the mappers: `RawImage` (`:32`), `RawOwner` (`:33-39`), `RawAmenity` (`:46-49`), `RawPolicyTier` (`:57-61`), `RawPolicyDetails` (`:63-69`), `RawUnit` (`:71-105`), `RawBooking` (`:107-149`), `RawUser` (`:151-166`), `RawCancellationPreview` (`:168-181`). `RawUnit.code` (`:75`), `RawUnit.status` (`:93`) and `RawBooking.status_label` (`:128`), `RawBooking.notes` (`:129`) are declared but never read by any mapper.

### 6.18 View-model types in `src/lib/api/client.ts`

| Type | Fields | Marks |
|---|---|---|
| `OtpDispatch` (`:205-208`) | `sent: true`, `debugOtp?: string` | `sent` ORPHAN (never read); `debugOtp` FROM-API, read `LoginDialog.tsx:70` |
| `OtpIntent` (`:218`) | `'login' \| 'register'` | SENT-TO-API |
| `RawAuthResult` (`:193-198`) | `access_token`, `refresh_token`, `user`, `needs_profile?` | all FROM-API |
| `QuotePricing` (`:332-339`) | `nights`, `nightlyRate`, `subtotal`, `taxes`, `taxPercent`, `total` | all FROM-API; all read (`checkout-page-client.tsx:134-140`, `:341`) |
| `CheckAvailabilityResult` (`:341-345`) | `available`, `pricing` | both FROM-API, read `checkout-page-client.tsx:120` |
| `CreateBookingInput` (`:444-451`) | `unitId`, `checkInDate`, `checkOutDate`, `guests{adults,children}`, `paymentMethod`, `notes?` | `paymentMethod` **declared and passed by the caller but never serialised** (`client.ts:469-474`); `notes` SENT-TO-API but no UI collects it |
| `PaymentBookingSummary` (`:515-524`) | `startDate`, `endDate`, `nights`, `guests`, `nightlyRate`, `subtotal`, `taxes`, `unit{name,city,district,imageUrl}` | all FROM-API, all read (`payment/[bookingId]/page.tsx:260-294`) |
| `InitiatePaymentResult` (`:526-538`) | `paymentId`, `bookingId`, `amount`, `amountHalalas`, `currency`, `description`, `publishableKey`, `callbackUrl`, `testMode`, `booking` | `callbackUrl` ORPHAN — `moyasar.ts:94` builds its own from `window.location.origin`; all others read |
| `PayResult` (`:540-547`) | `status`, `paymentId`, `transactionUrl?`, `message?` | `paymentId` ORPHAN; others read `payment/[bookingId]/page.tsx:99-107` |
| `VerifyResult` (`:549-553`) | `status`, `bookingId`, `message?` | all read `payment/callback/page.tsx:54-59` |
| `PayInput` (`:561`) | `savedCardId?`, `cvc?`, `token?` | `savedCardId`/`cvc` SENT-TO-API (`payment/[bookingId]/page.tsx:98`); `token` never used by any caller — ORPHAN |
| `PaymentsConfig` (`:585-589`) | `publishableKey`, `testMode`, `currency` | `currency` ORPHAN; others read `payment-methods/page.tsx:337`, `:346` |

### 6.19 `RefundPreview` / `NotAllowedReason` — `src/lib/cancellation/engine.ts:95-121`

`NotAllowedReason` = `'alreadyCancelled' | 'completed' | 'afterCheckIn'` (`:95`).

| Field | Type | Optional | Mark | Evidence |
|---|---|---|---|---|
| `refundPercent` | `number` | no | FROM-API / UI | `adapters.ts:417`; read `CancelBookingDialog.tsx:127` |
| `refundAmount` | `number` | no | FROM-API / UI | `adapters.ts:418`; read `CancelBookingDialog.tsx:131` |
| `forfeitedAmount` | `number` | no | FROM-API / UI | `adapters.ts:419`; read `CancelBookingDialog.tsx:133`, `:136` |
| `tier` | `CancellationTier \| null` | no | FROM-API | `adapters.ts:420`; read `CancelBookingDialog.tsx:65` |
| `rawTierLabel` | `string` | yes | FROM-API | `adapters.ts:422`; read `CancelBookingDialog.tsx:67` |
| `isAllowed` | `boolean` | no | FROM-API | `adapters.ts:423`; read `CancelBookingDialog.tsx:109`, `:162` |
| `notAllowedReason` | `NotAllowedReason` | yes | UI-ONLY (local engine only) | `engine.ts:140`, `:152`, `:164`; read `CancelBookingDialog.tsx:69-70` |
| `rawNotAllowedReason` | `string` | yes | FROM-API | `adapters.ts:424`; read `CancelBookingDialog.tsx:71` |
| `daysRemaining` | `number` | no | ORPHAN | `adapters.ts:425`; never read |
| `hoursRemaining` | `number` | no | ORPHAN | `adapters.ts:426`; never read |

### 6.20 Homepage content types — `src/lib/api/adapters.ts:504-546`

| Type | Fields | Marks |
|---|---|---|
| `Offer` (`:506-514`) | `id`, `title`, `subtitle`, `discountPercent`, `imageUrl`, `validUntil`, `validUntilLabel` | **Entire type ORPHAN** — `mapOffer` (`:569`) is never called; no `/offers` endpoint is defined |
| `Testimonial` (`:516-524`) | `id`, `name`, `role`, `quote`, `avatarUrl`, `rating`, `deal` | `name`/`role`/`quote`/`deal` read (`TestimonialCarousel.tsx:21-25`); `id`, `avatarUrl`, `rating` ORPHAN |
| `UnitCategory` (`:526-532`) | `key`, `label`, `icon`, `count`, `imageUrl` | `key`, `count`, `imageUrl` read (`page.tsx:66-67`); `label` and `icon` ORPHAN — labels come from `typesPlural` messages (`page.tsx:125`) |
| `CityCount` (`:534-537`) | `city`, `count` | **Entire type ORPHAN** — only producer is the unused `contentApi.cities` |
| `BudgetRange` (`:539-546`) | `key`, `label`, `min`, `max`, `count`, `imageUrl` | `min`, `max`, `count`, `imageUrl` read (`page.tsx:73`); `key` and `label` ORPHAN — labels rebuilt locally (`page.tsx:77`, comment at `:70-71`) |

### 6.21 Other type declarations

- `SidebarFiltersValue` — `src/components/features/units/SidebarFilters.tsx:15-20`: `priceRange: [number, number]`, `type: string`, `minRating: number`, `amenities: string[]`. All UI-ONLY: the whole object is applied client-side in `units-page-client.tsx:85-93`; none of it reaches the API.
- `MapUnit` — `src/components/features/home/LocationMap.tsx:8-14`: `id`, `title`, `price`, `lat`, `lng`. UI-ONLY. `title` is declared and passed (`LocationExplorer.tsx:31`) but never rendered by the map.
- `LocationUnit` — `src/components/features/home/LocationExplorer.tsx:10-15`: extends `MapUnit` with `city`, `district`, `image`, `rating`. UI-ONLY.
- `PickCategory` — `src/components/features/home/pick-categories.ts:3-7`: `key`, `Icon`. UI-ONLY.
- `PriceBreakdownLabels` — `src/components/features/booking/PriceBreakdown.tsx:12-17`: `priceLine`, `taxes`, `total`. UI-ONLY.
- `EmailVerificationCardHandle` — `src/components/account/email-verification.tsx:31-34`: `reopen()`. UI-ONLY.
- `ToolDescriptor` / `ModelContextLike` — `src/components/agents/WebMcpTools.tsx:24-36`. UI-ONLY (WebMCP registration).
- `CardTokenInput` — `src/lib/payments/moyasar.ts:15-25`: `name`, `number`, `cvc`, `month`, `year`. All SENT-TO-API — but to `api.moyasar.com`, never to the Mamsa API (`moyasar.ts:44-51`).
- `AppLocale` — `src/i18n/request.ts:9`: `'ar' | 'en'`.
- `declare module '*.css'` — `src/types/css.d.ts:3`.

---

## 7. State Management

Four Zustand stores exist, all under `src/stores/`. React Query is installed and a `QueryClient` is provisioned (`src/components/shared/QueryProvider.tsx:9-17`, `staleTime: 60_000`, `refetchOnWindowFocus: false`, `retry: 1`) but **no component calls `useQuery` or `useMutation` anywhere** — every page fetches with `useEffect` + `useState`.

### 7.1 `useAuthStore` — `src/stores/auth.ts:25`

**State shape** (`src/stores/auth.ts:17-23`):

| Member | Type | Line |
|---|---|---|
| `user` | `User \| null` (initial `null`) | `:18`, `:28` |
| `isAuthenticated` | `boolean` (initial `false`) | `:19`, `:29` |
| `setSession(user, accessToken, refreshToken)` | action | `:20`, impl `:31-34` |
| `updateUser(patch: Partial<User>)` | action | `:21`, impl `:36-37` |
| `logout()` | action | `:22`, impl `:39-42` |

**Persistence** (`src/stores/auth.ts:44-48`): `persist` middleware, `name: 'mamsa.auth'`, `createJSONStorage(() => localStorage)`, `partialize` keeps only `{ user, isAuthenticated }`. Tokens are deliberately excluded — they live in `tokenManager` (`src/lib/auth/tokens.ts`).

**Consumers:**

| File:line | What it reads/calls |
|---|---|
| `src/components/shared/Header.tsx:36` | `{ user, isAuthenticated, logout }` |
| `src/components/features/auth/LoginDialog.tsx:32` | `setSession` |
| `src/components/features/auth/RegisterDialog.tsx:32` | `setSession` |
| `src/components/features/auth/RegisterDialog.tsx:33` | `updateUser` |
| `src/app/account/page.tsx:25` | `{ user, updateUser, logout }` |
| `src/app/account/phone/page.tsx:24` | `{ user, updateUser }` |
| `src/app/units/[id]/page.tsx:64` | `isAuthenticated` |
| `src/app/booking/[unitId]/checkout-page-client.tsx:39` | `user` |
| `src/app/booking/[unitId]/checkout-page-client.tsx:40` | `isAuthenticated` |
| `src/components/account/email-verification.tsx:45` | `{ user, updateUser }` |
| `src/components/shared/FavoritesSync.tsx:14` | `isAuthenticated` |
| `src/stores/favorites.ts:18` | `useAuthStore.getState().isAuthenticated` |
| `src/lib/api/client.ts:100-101` | dynamic import, calls `logout()` on an unrecoverable 401 |
| `src/components/account/email-verification.test.tsx:97` etc. | `useAuthStore.setState` in tests |
| `src/app/booking/[unitId]/checkout-page-client.test.tsx:63` etc. | `useAuthStore.setState` in tests |

### 7.2 `useFavoritesStore` — `src/stores/favorites.ts:20`

**State shape** (`src/stores/favorites.ts:8-16`):

| Member | Type | Line |
|---|---|---|
| `unitIds` | `string[]` (initial `[]`) | `:9`, `:23` |
| `has(unitId)` | selector returning `boolean` | `:10`, impl `:25` |
| `toggle(unitId)` | optimistic add/remove with server sync + rollback | `:11`, impl `:27-42` |
| `sync()` | merge local + server after login | `:13`, impl `:44-62` |
| `reset()` | clear on logout | `:15`, impl `:64` |

**Persistence** (`src/stores/favorites.ts:66`): `name: 'mamsa.favorites'`, `createJSONStorage(() => localStorage)`, **no `partialize`** — the whole state object is serialised.

**Notable behaviour:** `toggle` updates locally first (`:30-32`), skips the network entirely for guests (`:34`), and reverts on rejection (`:36-41`). `sync` pushes guest-only ids up, drops ids the server 404s (`:51-61`).

**Consumers:**

| File:line | What it reads/calls |
|---|---|
| `src/app/units/[id]/page.tsx:66` | `{ has, toggle }` |
| `src/components/features/units/UnitCard.tsx:22` | `{ has, toggle }` |
| `src/app/favorites/page.tsx:14` | `{ unitIds }` |
| `src/components/shared/FavoritesSync.tsx:15` | `sync` |
| `src/components/shared/FavoritesSync.tsx:16` | `reset` |

### 7.3 `useUiStore` — `src/stores/ui.ts:15`

**State shape** (`src/stores/ui.ts:7-13`):

| Member | Type | Line |
|---|---|---|
| `authDialog` | `'login' \| 'register' \| null` (initial `null`) | `:8`, `:16` |
| `prefillPhone` | `string` (initial `''`) | `:9`, `:17` |
| `openAuth(which, prefillPhone?)` | action | `:11`, impl `:18` |
| `closeAuth()` | action | `:12`, impl `:19` |

**Persistence:** none — plain `create()` (`src/stores/ui.ts:15`).

**Consumers:**

| File:line | What it reads/calls |
|---|---|
| `src/components/features/auth/LoginDialog.tsx:23` | `{ authDialog, openAuth, closeAuth, prefillPhone }` |
| `src/components/features/auth/RegisterDialog.tsx:24` | `{ authDialog, openAuth, closeAuth, prefillPhone }` |
| `src/components/shared/Header.tsx:37` | `openAuth` |
| `src/app/units/[id]/page.tsx:65` | `openAuth` |
| `src/app/booking/[unitId]/checkout-page-client.tsx:41` | `openAuth` |

### 7.4 `useToastStore` — `src/stores/toast.ts:16`

**State shape** (`src/stores/toast.ts:10-14`):

| Member | Type | Line |
|---|---|---|
| `message` | `string \| null` (initial `null`) | `:11`, `:17` |
| `show(message)` | action | `:12`, impl `:18` |
| `clear()` | action | `:13`, impl `:19` |

**Persistence:** none. A module-level helper `showToast` (`src/stores/toast.ts:22`) lets non-React code push a toast.

**Consumers:**

| File:line | What it reads/calls |
|---|---|
| `src/components/shared/ToastHost.tsx:8` | `{ message, clear }`; auto-clears after 4000 ms (`:12`) |
| `src/app/booking/[unitId]/checkout-page-client.tsx:185` | `showToast(...)` |
| `src/components/account/email-verification.tsx:114` | `showToast(...)` |
| `src/components/account/email-verification.tsx:135` | `showToast(...)` |

---

## 8. Forms & Validation

### 8.1 Zod schemas — `src/lib/validation/schemas.ts`

All schemas are factory functions taking a translator so error strings are locale-aware (`src/lib/validation/schemas.ts:4-9`).

| Schema | File:line | Field | Rule | Message key |
|---|---|---|---|---|
| `makePhoneSchema` | `:11-16` | (string) | `.min(1)` then `.refine(isValidSaudiPhone)` | `validation.phoneRequired`, `validation.phoneInvalid` |
| `makeOtpSchema` | `:18-25` | `code` | `.length(6)`, `.regex(/^\d{6}$/)` | `validation.otpLength`, `validation.otpDigitsOnly` |
| `makeLoginSchema` | `:27-31` | `phone` | `makePhoneSchema` | — |
| `makeRegisterSchema` | `:33-40` | `firstName` | `.min(2)` | `validation.firstNameShort` |
| | | `lastName` | `.min(2)` | `validation.lastNameShort` |
| | | `email` | `.email()` | `validation.emailInvalid` |
| | | `phone` | `makePhoneSchema` | — |
| `makeContactSchema` | `:42-49` | `name` | `.min(2)` | `validation.nameShort` |
| | | `phone` | `makePhoneSchema` | — |
| | | `email` | `.email()` | `validation.emailInvalid` |
| | | `message` | `.min(10)` | `validation.messageShort` |
| `makeReviewSchema` | `:51-56` | `rating` | `.number().min(1).max(5)` | `validation.ratingRequired` |
| | | `comment` | `.string().min(10).max(1000)` | `validation.commentShort` |
| `makeProfileUpdateSchema` | `:58-64` | `firstName` | `.min(2)` | none (no translator) |
| | | `lastName` | `.min(2)` | none |
| | | `email` | `.email()` | none |
| `makeChangePhoneSchema` | `:66-70` | `newPhone` | `makePhoneSchema` | — |

Inferred types are exported at `src/lib/validation/schemas.ts:72-77`.

### 8.2 Schema → API payload mapping and mismatches

| Schema | Used at | Maps to request | Mismatch |
|---|---|---|---|
| `makeLoginSchema` | `LoginDialog.tsx:33`, `:43` | `POST /auth/request-otp` `{ phone, intent }` | Schema validates the raw 9/10/12-digit input; the value actually sent is the `toSaudiLocal()` transform, not the schema output — `LoginDialog.tsx:68` |
| `makeRegisterSchema` | `RegisterDialog.tsx:34`, `:44` | `POST /auth/request-otp` `{ phone, intent: 'register' }` | **`firstName`, `lastName`, `email` are validated but never sent** by `authApi.register` (`client.ts:254-257`). They are sent later by a separate `completeProfile` call whose failure is swallowed (`RegisterDialog.tsx:107-109`) |
| `makeContactSchema` | `contact/page.tsx:41`, `:43` | `POST /contact` `{ name, phone, email, message }` | None; `phone` is transformed to `05…` before send (`contact/page.tsx:60`) |
| `makeReviewSchema` | `ReviewDialog.tsx:31`, `:33` | `POST /reviews` `{ booking_id, rating, comment }` | `rating` is held in **two** places — component state `rating` (`ReviewDialog.tsx:26`) and the form value set via `form.setValue('rating', n)` (`:68`). The star buttons are outside the form's register graph |
| `makeChangePhoneSchema` | `account/phone/page.tsx:32`, `:34` | `POST /user/change-phone` `{ new_phone }` | Field is named `newPhone` in the schema, `new_phone` on the wire (`client.ts:717`) — mapped explicitly, no defect |
| `makeOtpSchema` | — nowhere | — | **Declared but never used.** `OtpVerificationForm` validates by stripping non-digits per box (`OtpVerificationForm.tsx:110`) and requiring every box filled (`:143`) |
| `makeProfileUpdateSchema` | — nowhere | — | **Declared but never used.** `/account` saves with no validation at all (`account/page.tsx:42-57`) |

### 8.3 Forms that use no schema

| Form | File | Validation actually performed | API payload |
|---|---|---|---|
| Checkout guest details | `src/app/booking/[unitId]/checkout-page-client.tsx:143-148` | Hand-rolled `validate()`: non-empty first+last name, inline email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (`:145`), `agreed` checkbox (`:146`) | **None of these fields are sent.** `bookingsApi.create` posts only `unit_id`, `start_date`, `end_date`, `guests`, `notes` (`client.ts:469-474`) |
| Partner onboarding | `src/components/features/auth/OnboardingForm.tsx:52-55` | `name.trim().length >= 3`; `EMAIL_RE` (`:27`); `ID_RE = /^\d{10}$/` (`:28`) for national ID or CR; `isPhoneValid` passed in from `isValidSaudiPhone` (`partner-onboarding/page.tsx:101`) | `POST /auth/partner/register` — all fields sent (`client.ts:274-283`) |
| Account profile | `src/app/account/page.tsx:110-135` | none | `PUT /user/profile` sends `firstName`/`lastName` only (`account/page.tsx:47-50`); `email` is a declared parameter of `updateProfile` (`client.ts:699`) but this caller omits it |
| Email verification | `src/components/account/email-verification.tsx:73-76` | `isValidEmail` from `src/lib/utils/email.ts:3` | `POST /user/email` `{ email }` |
| Add card | `src/app/account/payment-methods/page.tsx:336` | name non-empty; exactly 16 digits; Luhn check (`:36-50`); `/^\d{3}$/` CVC | Either `POST https://api.moyasar.com/v1/tokens` then `{ token }`, or metadata-only `{ brand, last4, exp_month, exp_year }` (`payment-methods/page.tsx:345-361`) |
| Quick-pay CVC | `src/app/payment/[bookingId]/page.tsx:225`, `:231` | digits only, max 3, button disabled below 3 | `POST /payments/pay` `{ payment_id, saved_card_id, cvc }` |
| Cancel-booking reason | `src/components/features/booking/CancelBookingDialog.tsx:147-152` | none (free text, optional) | `POST /bookings/{id}/cancel` `{ reason }` |
| Contact-host message | `src/components/features/booking/ContactHostDialog.tsx:89-95` | non-empty (`:31`) | **No API call at all** — sets local `sent` state (`:32`) |
| Search / filter bar | `src/components/features/units/FilterBar.tsx:35-43` | none | Writes query params, does not call the API directly |

### 8.4 Duplicated validation logic

The same email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is written three times: `src/lib/utils/email.ts:1`, `src/app/booking/[unitId]/checkout-page-client.tsx:145`, `src/components/features/auth/OnboardingForm.tsx:27`.

---

## 9. Business Rules As Actually Coded

### 9.1 Extracted values

| Rule | Value(s) found in code | file:line |
|---|---|---|
| Currency code | `'SAR'` | `src/lib/constants/brand.ts:43` |
| Currency symbol (Arabic) | `'ر.س'` | `src/lib/constants/brand.ts:44` |
| Currency symbol (English) | `'SAR'` | `src/lib/constants/brand.ts:45` |
| Currency literal in MCP output | `'SAR'` hardcoded | `src/app/mcp/route.ts:36`, `src/components/agents/WebMcpTools.tsx:45` |
| Currency default in `paymentsApi.config` | `'SAR'` | `src/lib/api/client.ts:599`, `:629` |
| Currency in mock initiate | `'SAR'` | `src/lib/api/client.ts:596` (config mock `:595`), `:612` |
| Phone normalisation | 10 digits starting `05` → `+966`+rest; 9 digits starting `5` → `+966`+digits; 12 digits starting `9665` → `+`+digits; otherwise `null` | `src/lib/utils/phone.ts:8-19` |
| Phone wire format | local `0` + last 9 digits (`05XXXXXXXX`) | `src/lib/utils/phone.ts:27-30` |
| Phone display format | `+966 NN NNN NNNN` | `src/lib/utils/phone.ts:41-45` |
| Phone masking | first 7 chars + `' *** '` + last 4 | `src/lib/utils/phone.ts:33-38` (function never called) |
| Phone input max length | `10` (onboarding), unlimited elsewhere | `src/components/features/auth/OnboardingForm.tsx:142` |
| National ID / CR number | exactly 10 digits | `src/components/features/auth/OnboardingForm.tsx:28` |
| OTP length | `6` | `src/lib/constants/brand.ts:55`; schema `src/lib/validation/schemas.ts:21-23` |
| OTP expiry (declared) | `60` seconds | `src/lib/constants/brand.ts:56` |
| OTP max attempts (declared) | `3` | `src/lib/constants/brand.ts:57` |
| OTP resend cooldown (declared) | `30` seconds | `src/lib/constants/brand.ts:58` |
| Email OTP resend cooldown | `60` seconds | `src/components/account/email-verification.tsx:27`; mock `src/lib/api/mock/index.ts:33` |
| Email OTP max attempts | `5` | `src/lib/api/mock/index.ts:34` |
| VAT percentage (mock backend) | `15` | `src/lib/api/mock/index.ts:68` (`MOCK_TAX_PERCENT`) |
| VAT percentage (mock unit fixtures) | `15` on all 7 units | `src/data/mock/units.ts:43`, `:82`, `:123`, `:159`, `:194`, `:229`, `:264` |
| VAT percentage (real path) | not a client constant — comes from `pricing.tax_percent` on the availability quote | `src/lib/api/client.ts:355`, rendered `src/app/booking/[unitId]/checkout-page-client.tsx:341` |
| VAT percentage (agent skill doc) | `15%` | `public/.well-known/agent-skills/booking-policy/SKILL.md:14` |
| Cleaning fee | **None exists.** Explicitly stated absent | `src/lib/api/mock/index.ts:66-67`, `src/components/features/booking/PriceBreakdown.tsx:6-8`, `public/.well-known/agent-skills/booking-policy/SKILL.md:17` |
| Service fee | **None exists.** Same three sources | as above |
| Commission split | **Not present in this repo.** The only mention is a backend document: "net share (total − frozen 2% commission)" | `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:57` |
| Total price formula (mock backend, the only formula in this repo) | `subtotal = unit.pricePerNight * nights`; `taxes = Math.round(subtotal * (15 / 100) * 100) / 100`; `total = Math.round((subtotal + taxes) * 100) / 100` | `src/lib/api/mock/index.ts:80-82` |
| Total price (real path) | never computed client-side; `total` is taken verbatim from `pricing.total` (quote) or `booking.price.total` (frozen) | `src/lib/api/client.ts:356`, `src/app/booking/[unitId]/checkout-page-client.tsx:134-140` |
| Unit-page price estimate | `subtotal = unit.pricePerNight * nights` — **no tax, labelled an estimate** | `src/app/units/[id]/page.tsx:89`, note at `:358` |
| Nights calculation (UI preview) | `Math.max(0, Math.round((checkOut − checkIn) / 86400000))` | `src/app/units/[id]/page.tsx:84` |
| Nights calculation (shared util) | `Math.max(1, Math.round((end − start) / 86400000))` | `src/lib/utils/format.ts:51-55` |
| Refund amount | `roundMoney((booking.price.total * tier.refundPercent) / 100)` | `src/lib/cancellation/engine.ts:171` |
| Forfeited amount | `roundMoney(booking.price.total − refundAmount)` | `src/lib/cancellation/engine.ts:172` |
| Money rounding | `Math.round(value * 100) / 100` | `src/lib/cancellation/engine.ts:207-209`; duplicated at `src/lib/api/adapters.ts:408` |
| Halalas | never computed — `amount_halalas` is taken from the API and passed straight to Moyasar | `src/lib/api/client.ts:627`, `src/lib/payments/moyasar.ts:98` |
| Booking status enum | `pending_payment`, `confirmed`, `completed`, `cancelled` | `src/types/index.ts:118-122` |
| Booking status accepted inbound values | `pending`, `pending_payment`, `awaiting_payment`, `confirmed`, `paid`, `active`, `completed`, `cancelled`, `canceled` | `src/lib/api/adapters.ts:210-220` |
| Unit status enum | `draft`, `pending`, `approved`, `rejected` | `src/types/index.ts:34`; runtime list `src/lib/api/adapters.ts:271` |
| Refund status enum | **No dedicated refund-status enum exists.** The nearest is `Transaction.status` = `completed \| pending \| failed` | `src/types/index.ts:232` |
| Refund actor enum | `customer`, `partner`, `admin`, `system` | `src/types/index.ts:144`; runtime list `src/lib/api/adapters.ts:327` |
| Transaction type enum | `payment`, `refund`, `topup`, `reward` | `src/types/index.ts:223` |
| Payment method enum | `mada`, `visa`, `mastercard`, `applepay` | `src/types/index.ts:125` |
| Card brand enum | `visa`, `mastercard`, `mada` | `src/types/index.ts:212` |
| Cancellation — flexible | ≥7 d → 100%; ≥3 d → 75%; ≥0 d → 50% | `src/lib/constants/cancellation-policies.ts:13-17` |
| Cancellation — moderate | ≥7 d → 100%; ≥3 d → 50%; ≥0 d → 25% | `src/lib/constants/cancellation-policies.ts:25-29` |
| Cancellation — strict | ≥7 d → 75%; ≥3 d → 25%; ≥0 d → 0% | `src/lib/constants/cancellation-policies.ts:37-41` |
| Post-check-in behaviour | `'hidden'` on all three templates; cancellation blocked when `days <= 0` | `src/lib/constants/cancellation-policies.ts:18`, `:30`, `:42`; enforced `src/lib/cancellation/engine.ts:64`, `:157` |
| Tier fallback when nothing matches | `{ minDaysBeforeCheckIn: 0, refundPercent: 0, labelAr: 'بدون استرداد' }` | `src/lib/cancellation/engine.ts:89` |
| Day boundary for refunds | midnight **Asia/Riyadh**, fixed UTC+3, no DST | `src/lib/cancellation/engine.ts:32`, `:35-38` |
| Backend tier unit conversion | `min_hours_before_checkin / 24` | `src/lib/api/adapters.ts:238` |
| Date format (display) | `dd/MM/yyyy`, Gregorian | `src/lib/constants/brand.ts:49` |
| Date format (long) | `dd MMMM yyyy` with the `ar` date-fns locale | `src/lib/constants/brand.ts:50`, `src/lib/utils/format.ts:34` |
| Date format (ISO) | `yyyy-MM-dd` | `src/lib/constants/brand.ts:51` |
| Date validation at checkout | `/^\d{4}-\d{2}-\d{2}$/` on both dates and `checkIn < checkOut` | `src/app/booking/[unitId]/checkout-page-client.tsx:37-38` |
| Number formatting | `Intl.NumberFormat('en-US')` — Latin digits, a stated design decision | `src/lib/utils/format.ts:10`, `:18`, `:47`; comment `:5-7` |
| Cities list | `الرياض`, `جدة`, `مكة`, `المدينة`, `الدمام`, `أبها`, `العلا` | `src/components/features/units/FilterBar.tsx:11-19` |
| Cities in mock data | only `الرياض` (all 7 units) | `src/data/mock/units.ts:37`, `:76`, `:117`, `:153`, `:188`, `:224`, `:258` |
| Map bounds | `[[16.0, 34.0], [32.5, 56.0]]`, `maxBoundsViscosity: 1` | `src/components/features/home/LocationMap.tsx:17-20`, `:70-71` |
| Map default centre / zoom | `[24.71, 46.67]`, zoom 11, minZoom 5 | `src/components/features/home/LocationMap.tsx:67-69` |
| Unit types | `apartment`, `studio`, `villa` (+ `all` sentinel) | `src/types/index.ts:33`; UI lists `src/components/features/units/FilterBar.tsx:21`, `src/components/features/units/SidebarFilters.tsx:12` |
| Amenity vocabulary (15 slugs) | `wifi`, `pool`, `kitchen`, `parking`, `ac`, `garden`, `smart_tv`, `washer`, `security`, `self_checkin`, `family_friendly`, `bbq`, `elevator`, `private_beach`, `event_hall` | `src/lib/constants/brand.ts:76-92` |
| Amenities exposed in the sidebar | first 6 only | `src/components/features/units/SidebarFilters.tsx:113` |
| Price filter range | min 0, max 5000, step 50 | `src/lib/constants/brand.ts:66-68` |
| Pagination page size | `12` | `src/lib/constants/brand.ts:62` (never used) |
| Booking tab split | `daysUntilCheckIn > 14` → "upcoming", else "active" | `src/app/my-reservations/page.tsx:58` |
| Default check-in / check-out times | `'15:00'` / `'12:00'` | `src/lib/api/adapters.ts:313-314` |
| Mock API latency | `300` ms | `src/lib/api/client.ts:51` |
| MCP upstream timeout | `10_000` ms | `src/lib/mcp/units.ts:21` |
| Toast auto-dismiss | `4000` ms | `src/components/shared/ToastHost.tsx:12` |
| Testimonial autoplay | `6000` ms | `src/components/features/home/TestimonialCarousel.tsx:16` |
| React Query stale time | `60_000` ms | `src/components/shared/QueryProvider.tsx:13` |
| Locale cookie max-age | `31536000` s (1 year) | `src/components/shared/LanguageToggle.tsx:21` |
| Moyasar SDK version | `1.14.0` | `src/lib/payments/moyasar.ts:12` |
| Moyasar methods enabled | `['creditcard', 'applepay']`, Apple Pay country `SA`, label `Mamsa` | `src/lib/payments/moyasar.ts:104-109` |
| Moyasar `save_card` | `true` | `src/lib/payments/moyasar.ts:103` |
| Commercial registration number | `1010920108` | `src/lib/constants/brand.ts:24` |
| Brand phone | `+966 50 000 0000` | `src/lib/constants/brand.ts:20` |
| Brand email | `info@mamsaa.com` | `src/lib/constants/brand.ts:21` |
| Licence authority | `وزارة السياحة` | `src/lib/constants/brand.ts:22` |
| Domain verification token | `510bd1445bcfa63e566bc867cacdced1ea4f545bd92624b01a6be6831752074f` | `src/app/layout.tsx:36` |
| Content signals | `search=yes, ai-input=yes, ai-train=no` | `src/app/robots.txt/route.ts:30` |
| Robots disallow list | `/account`, `/favorites`, `/my-reservations`, `/booking`, `/payment` | `src/app/robots.txt/route.ts:33` |
| Any SLA hour values | **None found in this repo.** The only hour-based figures are the Riyadh UTC offset (`engine.ts:32`), the tier hour→day conversion (`adapters.ts:238`), and a display string `أمن 24 ساعة` (`brand.ts:85`). Backend documents mention a 24 h pre-check-in reminder at 10:00 Asia/Riyadh (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:58`, `:72`) and OTP validity 300 s (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:40`) — neither is coded here |

### 9.2 Values hardcoded instead of imported from a constants file

| Value | Hardcoded at | Constant that exists |
|---|---|---|
| Price-range floor/ceiling `[0, 5000]` | `src/app/units/units-page-client.tsx:19` | `PRICE_FILTER.min/max` — `src/lib/constants/brand.ts:66-67` |
| Price slider `min=0 max=5000 step=50` | `src/components/features/units/SidebarFilters.tsx:48-50` | `PRICE_FILTER` — `src/lib/constants/brand.ts:65-69` |
| Unit type list `['all','apartment','studio','villa']` | `src/components/features/units/FilterBar.tsx:21` and `src/components/features/units/SidebarFilters.tsx:12` | `UNIT_TYPE_LABELS_AR` keys — `src/lib/constants/brand.ts:94-99` |
| Unit type list `['apartment','studio','villa']` (homepage) | `src/app/page.tsx:30` | same |
| Unit type enum in MCP tool schema | `src/app/mcp/route.ts:99` | `UnitType` — `src/types/index.ts:33` |
| Unit type enum in WebMCP tool schema | `src/components/agents/WebMcpTools.tsx:72`, `:81` | same |
| Pick categories `villa/studio/apartment` | `src/components/features/home/pick-categories.ts:10-12` | same |
| VAT `15` | `src/lib/api/mock/index.ts:68`; 7× in `src/data/mock/units.ts` | none — no `VAT` constant exists |
| Currency string `'SAR'` | `src/app/mcp/route.ts:36`; `src/components/agents/WebMcpTools.tsx:45`; `src/lib/api/client.ts:595`, `:599`, `:612`, `:629`; `src/components/features/home/LocationMap.tsx:56` (default param) | `CURRENCY.code` — `src/lib/constants/brand.ts:43` |
| Currency label in the map/sidebar | `t('map.sar')` / `t('unitsPage.filters.sar')` message keys instead of `CURRENCY` | `src/components/features/home/LocationExplorer.tsx:71`, `src/components/features/units/SidebarFilters.tsx:57-61` |
| Email regex | `src/app/booking/[unitId]/checkout-page-client.tsx:145`; `src/components/features/auth/OnboardingForm.tsx:27` | `isValidEmail` — `src/lib/utils/email.ts:3` |
| Resend cooldown `60` | `src/components/account/email-verification.tsx:27`; `src/lib/api/mock/index.ts:33`; fallback defaults `src/lib/api/client.ts:742`, `:759` | `OTP_CONFIG.resendCooldownSeconds` (= 30) — `src/lib/constants/brand.ts:58` |
| Max attempts `5` | `src/lib/api/mock/index.ts:34` | `OTP_CONFIG.maxAttempts` (= 3) — `src/lib/constants/brand.ts:57` |
| Default check-in/out `'15:00'` / `'12:00'` | `src/lib/api/adapters.ts:313-314` | none |
| Country `'السعودية'` | `src/lib/api/adapters.ts:28` (module-local `DEFAULT_COUNTRY`) | none in `brand.ts` |
| Cities list | `src/components/features/units/FilterBar.tsx:11-19` | none in `brand.ts` |
| Booking tab threshold `14` days | `src/app/my-reservations/page.tsx:58` | none |
| Rating buckets `4.8 / 4.5 / 4` | `src/app/units/[id]/page.tsx:41-44` | none |
| Refund colour thresholds `75 / 25` | `src/components/features/booking/CancellationPolicyDisplay.tsx:59-61` | none |
| Production API base URL | `src/app/auth.md/route.ts:19`; `public/.well-known/api-catalog:7`, `:13` | `NEXT_PUBLIC_API_BASE_URL` |
| Site URL default | `src/lib/constants/brand.ts:11`; **duplicated** `src/app/mcp/route.ts:21` | `SITE_URL` — `src/lib/constants/brand.ts:11` |
| Moyasar version `1.14.0` | `src/lib/payments/moyasar.ts:12` (module-local constant) | none in `brand.ts` |
| Brand name `'Mamsa'` in the Apple Pay label | `src/lib/payments/moyasar.ts:106` | `BRAND.nameEn` — `src/lib/constants/brand.ts:18` |
| Loading string `'جاري التحميل...'` | `src/app/booking/[unitId]/page.tsx:6` (bypasses next-intl) | `common.loading` message key |
| Card brand display names | `src/app/account/payment-methods/page.tsx:14-18` | `SavedCard['brand']` union — `src/types/index.ts:212` |
| Payment method display names | `src/app/my-reservations/[bookingId]/page.tsx:21-26` | `PaymentInfo['method']` union — `src/types/index.ts:125` |

### 9.3 Drift between the constants file and usage sites

| Constant | Declared value | Conflicting value in use | Where |
|---|---|---|---|
| `OTP_CONFIG.resendCooldownSeconds` | `30` (`brand.ts:58`) | `60` | `src/components/account/email-verification.tsx:27`, `:219`; `src/lib/api/mock/index.ts:33`; API fallbacks `src/lib/api/client.ts:742`, `:759` |
| `OTP_CONFIG.maxAttempts` | `3` (`brand.ts:57`) | `5` | `src/lib/api/mock/index.ts:34`; backend contract also says 5 (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:41`) |
| `OTP_CONFIG.expirySeconds` | `60` (`brand.ts:56`) | `300` per the backend contract; nothing in code enforces either | `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:40` |
| `NEXT_PUBLIC_MOCK_OTP` fallback | `'111222'` (`mock/index.ts:27`) | `123456` | `.env.example:19` |
| `PRICE_FILTER` | `{min:0, max:5000, step:50}` (`brand.ts:65-69`) | same numbers, re-typed and never imported | `src/app/units/units-page-client.tsx:19`; `src/components/features/units/SidebarFilters.tsx:48-50` |
| `SITE_URL` | env-driven with a `https://www.mamsaa.com` default (`brand.ts:11`) | a second, independent copy of the same expression | `src/app/mcp/route.ts:21` |
| `CURRENCY.code` | `'SAR'` (`brand.ts:43`) | literal `'SAR'` re-typed in 7 places | see §9.2 |
| `AMENITIES_CATALOG` | 15 slugs (`brand.ts:76-92`) | the icon map in the unit page lists the same 15 independently | `src/app/units/[id]/page.tsx:33-38` |
| `AMENITIES_CATALOG` | 15 slugs | the mock fixtures use `pool`/`kitchen`/`ac`/`smart_tv`/`washer`/`bbq` with **different Arabic labels** than the catalogue (e.g. `مسبح خاص` vs `مسبح`, `تكييف مركزي` vs `تكييف`) | `src/data/mock/units.ts:6-22` vs `src/lib/constants/brand.ts:77-92` |
| `BRAND.licenseAuthority` = `وزارة السياحة` | `brand.ts:22` | Footer displays the **commercial registration** (`BRAND.crNumber`) instead; `licenseAuthority` is read only by the About page | `src/components/shared/Footer.tsx:94`; `src/app/about/page.tsx:36` |
| `DATE_FORMAT.displayLong` | `'dd MMMM yyyy'` (`brand.ts:50`) | used only by `formatDateLong`, which is never called | `src/lib/utils/format.ts:32-38` |
| `PAGINATION.pageSize` = 12 | `brand.ts:62` | no list is paginated anywhere; `/units` renders all results | `src/app/units/units-page-client.tsx:242-251` |
| Cancellation tiers | days-based (`cancellation-policies.ts:13-41`) | backend sends hours; converted at read time, and the two sets are only equal if the backend uses 168 h / 72 h | `src/lib/api/adapters.ts:238` |

---

## 10. UI Inventory & User Journey

### 10.1 Page → components → data source

| Page | Main components | Data source | file:line |
|---|---|---|---|
| `/` | `FilterBar`, `UnitCard`, `LocationExplorer`, `PicksSection`, `TestimonialCarousel`, local `SectionHeader`/`FeatureItem` | `contentApi.popular`, `contentApi.testimonials`, `contentApi.categories`, `contentApi.budgets` — each wrapped in a `safe()` fallback | `src/app/page.tsx:54-59`; `safe` at `:14-20` |
| `/` hero image | — | Hardcoded Unsplash URL | `src/app/page.tsx:92` |
| `/` category tiles | `Link` + `img` | Counts from API; **images hardcoded** per type, with a hardcoded fallback | `src/app/page.tsx:23-28`, `:65-68` |
| `/` budget tiles | `Link` + `img` | API `budgets`, else a hardcoded 4-band fallback | `src/app/page.tsx:32-37`, `:72-79` |
| `/units` | `FilterBar`, `SidebarFilters`, `UnitCard`, `LocationExplorer`, `Skeleton` | `unitsApi.list` (city/type/capacity only); price, rating and amenity filters applied client-side | `src/app/units/units-page-client.tsx:75-83`, `:85-93` |
| `/units/[id]` | `UnitGallery`, `CancellationPolicyDisplay`, `LoadError`, `Card`, `Badge`, `Button`, local `Stat`/`Divider`/`Row` | `unitsApi.getById` + `unitsApi.getReviews` | `src/app/units/[id]/page.tsx:73` |
| `/picks` | `PicksSection` | `unitsApi.list` filtered by pick category | `src/components/features/home/PicksSection.tsx:39-40` |
| `/booking/[unitId]` | `EmailVerificationCard`, `CancellationPolicyDisplay`, `PriceBreakdown`, `LoadError`, `PhoneInput`, `Checkbox` | `unitsApi.getById`, `unitsApi.checkAvailability`, `bookingsApi.create`, `bookingsApi.list` (conflict lookup) | `src/app/booking/[unitId]/checkout-page-client.tsx:72`, `:81`, `:168`, `:207` |
| `/payment/[bookingId]` | `PriceBreakdown`, Moyasar hosted form (`div.mysr-form`), local `SummaryRow` | `paymentsApi.initiate`, `accountApi.getCards`, `paymentsApi.pay` | `src/app/payment/[bookingId]/page.tsx:57`, `:74`, `:98`, `:121` |
| `/payment/callback` | local `CallbackHandler` | `paymentsApi.verify` | `src/app/payment/callback/page.tsx:53` |
| `/booking/confirmation/[bookingId]` | `Card`, `Button` | `bookingsApi.getById` | `src/app/booking/confirmation/[bookingId]/page.tsx:27` |
| `/my-reservations` | `Tabs`, `BookingCard`, `LoadError`, `Skeleton`, local `Section` | `bookingsApi.list` | `src/app/my-reservations/page.tsx:28` |
| `/my-reservations/[bookingId]` | `PriceBreakdown`, `CancelBookingDialog`, `ContactHostDialog`, `ReviewDialog`, local `Field` | `bookingsApi.getById`, `reviewsApi.getForBooking` | `src/app/my-reservations/[bookingId]/page.tsx:40-41` |
| `/favorites` | `UnitCard`, `Skeleton` | `unitsApi.list()` then client-side filter against the local store | `src/app/favorites/page.tsx:19-20` |
| `/account` | `EmailVerificationCard`, `Card`, `Input`, delete modal | `accountApi.me`, `accountApi.updateProfile`, `accountApi.deleteAccount` | `src/app/account/page.tsx:39`, `:47`, `:62` |
| `/account/phone` | `OtpVerificationForm`, `PhoneInput`, `Badge` | `accountApi.changePhone`, `accountApi.verifyChangePhone` | `src/app/account/phone/page.tsx:44`, `:56` |
| `/account/payment-methods` | local `CreditCardVisual`, `AddCardModal`, `ConfirmDeleteModal` | `accountApi.getCards`, `accountApi.getTransactions`, `paymentsApi.config`, `createCardToken`, `accountApi.saveCardFromToken`, `accountApi.deleteCard`, `accountApi.setDefaultCard` | `src/app/account/payment-methods/page.tsx:70`, `:81`, `:86`, `:330`, `:348`, `:355`, `:360` |
| `/contact` | `Input`, `PhoneInput`, `Textarea`, `Card`, success modal | `miscApi.contact`; contact details from `BRAND` constants; side image hardcoded Unsplash | `src/app/contact/page.tsx:60`, `:50-51`, `:176` |
| `/about` | `Card`, `Button` | **All content from `messages/*.json` + `BRAND`** — no API | `src/app/about/page.tsx:26-43`; hero image hardcoded `:53` |
| `/faq` | `<details>` accordions, `Button` | **All content from `messages/*.json`**; group item counts hardcoded | `src/app/faq/page.tsx:13-20` |
| `/host` | `<details>` accordions, `Button` | **All content from `messages/*.json`**; hero image hardcoded | `src/app/host/page.tsx:38-46`, `:56` |
| `/partner-onboarding` | `OnboardingForm`, `OtpVerificationForm`, `LanguageToggle`, local `SuccessPanel` | `authApi.requestOtp`, `authApi.partnerRegister`; hero image `/onboarding-hero.png` | `src/app/partner-onboarding/page.tsx:24`, `:43`, `:49` |
| `/policies/cancellation` | `PolicyPage`, `PolicySection`, `PolicyNote`, `CancellationPolicyDisplay` | `POLICY_REGISTRY` constants + messages | `src/app/policies/cancellation/page.tsx:15` |
| `/policies/house-rules` | `PolicyPage`, `PolicySection`, `PolicyNote` | messages only | `src/app/policies/house-rules/page.tsx:12` |
| `/policies/safety` | `PolicyPage`, `PolicySection`, `PolicyNote` | messages only | `src/app/policies/safety/page.tsx:12` |
| `/policies/privacy` | `PolicyPage`, `PolicySection`, `PolicyNote` | messages + `BRAND` | `src/app/policies/privacy/page.tsx:13` |
| `/policies/terms` | `PolicyPage`, `PolicySection`, `PolicyNote` | messages + `BRAND` | `src/app/policies/terms/page.tsx:13` |

### 10.2 Shared / reusable components

**Primitives — `src/components/ui/`:**

| File | Exports |
|---|---|
| `avatar.tsx` | `Avatar` (`:6`), `AvatarImage` (`:18`), `AvatarFallback` (`:26`) |
| `badge.tsx` | `BadgeProps` (`:23`), `Badge` (`:27`) |
| `button.tsx` | `ButtonProps` (`:31`), `Button` (`:37`), `buttonVariants` (`:44`) |
| `card.tsx` | `Card` (`:4`), `CardHeader` (`:15`), `CardTitle` (`:18`), `CardDescription` (`:21`), `CardContent` (`:24`), `CardFooter` (`:27`) |
| `checkbox.tsx` | `Checkbox` (`:7`) |
| `dialog.tsx` | `Dialog` (`:7`), `DialogTrigger` (`:8`), `DialogPortal` (`:9`), `DialogClose` (`:10`), `DialogOverlay` (`:12`), `DialogContent` (`:27`), `DialogHeader` (`:53`), `DialogTitle` (`:57`), `DialogDescription` (`:69`) |
| `dropdown-menu.tsx` | `DropdownMenu` (`:6`), `DropdownMenuTrigger` (`:7`), `DropdownMenuGroup` (`:8`), `DropdownMenuPortal` (`:9`), `DropdownMenuContent` (`:11`), `DropdownMenuItem` (`:29`), `DropdownMenuSeparator` (`:46`) |
| `input.tsx` | `Input` (`:5`) |
| `label.tsx` | `Label` (`:6`) |
| `phone-input.tsx` | `PhoneInput` (`:6`) |
| `separator.tsx` | `Separator` (`:6`), `Skeleton` (`:24`) |
| `slider.tsx` | `Slider` (`:6`) |
| `tabs.tsx` | `Tabs` (`:6`), `TabsList` (`:8`), `TabsTrigger` (`:23`), `TabsContent` (`:38`) |
| `textarea.tsx` | `Textarea` (`:5`) |

Unused primitives: `AvatarImage`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DropdownMenuGroup`, `DropdownMenuPortal`, `Separator` (only `Skeleton` from that file is imported). `@radix-ui/react-select` (`package.json:24`) and `@radix-ui/react-toast` (`:29`) are dependencies with no corresponding component file and no import anywhere.

**Shared — `src/components/shared/`:** `Header` (`Header.tsx:33`), `Footer` (`Footer.tsx:7`), `LanguageToggle` (`LanguageToggle.tsx:14`), `QueryProvider` (`QueryProvider.tsx:6`), `FavoritesSync` (`FavoritesSync.tsx:13`), `ToastHost` (`ToastHost.tsx:7`), `LoadError` (`LoadError.tsx:20`), `PolicyPage` + `PolicySection` + `PolicyNote` (`PolicyPage.tsx:19`, `:38`, `:52`).

**Feature — `src/components/features/`:** `LoginDialog`, `RegisterDialog`, `OtpVerificationForm`, `OnboardingForm`, `DebugOtpHint`; `BookingCard`, `CancelBookingDialog`, `CancellationPolicyDisplay`, `ContactHostDialog`, `PriceBreakdown`; `LocationExplorer`, `LocationMap`, `PicksSection`, `TestimonialCarousel`, `pick-categories`; `ReviewDialog`; `FilterBar`, `SidebarFilters`, `UnitCard`, `UnitGallery`.

**Other:** `EmailVerificationCard` (`src/components/account/email-verification.tsx:42`), `WebMcpTools` (`src/components/agents/WebMcpTools.tsx:112`).

### 10.3 Complete booking journey, end to end

| # | Step | Implementation | Status |
|---|---|---|---|
| 1 | Search from the homepage or `/units` hero bar | `FilterBar` writes `city`, `type`, `capacity`, `start`, `end` into the query string and pushes `/units?…` | `src/components/features/units/FilterBar.tsx:35-43` — **WIRED (partial: `start`/`end` are written but never read)** |
| 2 | Results list loads | `unitsApi.list({ city, type, capacity })` | `src/app/units/units-page-client.tsx:75-80` — **WIRED** |
| 3 | Refine with the sidebar | Price / rating / amenity filters applied **client-side** on the already-fetched array | `src/app/units/units-page-client.tsx:85-93` — **WIRED (client-side only; `min_price`/`max_price`/`min_rating`/`features[]` query support exists at `client.ts:367-369`, `:411-414` but is never exercised from this page)** |
| 4 | Sort | Client-side sort over 4 keys | `src/app/units/units-page-client.tsx:35-49`, `:95` — **WIRED (client-side)** |
| 5 | Open a unit | `Link` → `/units/{id}` | `src/components/features/units/UnitCard.tsx:52`, `:126` — **WIRED** |
| 6 | Unit details load | `unitsApi.getById` + `unitsApi.getReviews` | `src/app/units/[id]/page.tsx:73` — **WIRED** |
| 7 | Pick dates + guests | Local state; date inputs floored to today; `datesSelected` requires ≥1 night and a non-past check-in | `src/app/units/[id]/page.tsx:60-62`, `:94-99` — **WIRED (local)** |
| 8 | Price preview | `subtotal = pricePerNight × nights`, explicitly labelled an estimate, no tax | `src/app/units/[id]/page.tsx:89`, `:355-359` — **WIRED (client-side estimate by design)** |
| 9 | "Book now" | If not authenticated, opens the login dialog; otherwise pushes `/booking/{id}?checkIn&checkOut&guests` | `src/app/units/[id]/page.tsx:101-106` — **WIRED** |
| 10 | Checkout loads the unit | `unitsApi.getById` | `src/app/booking/[unitId]/checkout-page-client.tsx:72` — **WIRED** |
| 11 | Checkout gets the authoritative quote | `POST /units/{id}/availability` → `{ available, pricing }`; unavailable dates render a dead-end card with a link back | `src/app/booking/[unitId]/checkout-page-client.tsx:81`, `:120-129` — **WIRED** |
| 12 | Guest details prefilled | From the auth store, without clobbering typed values | `src/app/booking/[unitId]/checkout-page-client.tsx:87-93` — **WIRED** |
| 13 | Cancellation policy shown | Live unit policy (`cancellationPolicyDetails`, else the template fallback) | `src/app/booking/[unitId]/checkout-page-client.tsx:264-267` — **WIRED** |
| 14 | Email verification gate | `EmailVerificationCard` + disabled pay button | `src/app/booking/[unitId]/checkout-page-client.tsx:292`, `:315-320` — **WIRED** |
| 15 | Create the booking | `POST /bookings` `{ unit_id, start_date, end_date, guests, notes }` | `src/app/booking/[unitId]/checkout-page-client.tsx:168-175`; body at `src/lib/api/client.ts:469-474` — **WIRED** |
| 16 | Frozen price replaces the quote | `setFrozenPrice(booking.price)` | `src/app/booking/[unitId]/checkout-page-client.tsx:177` — **WIRED** |
| 17 | Conflict recovery | On failure, look for the user's own overlapping unpaid booking; same dates → straight to payment, otherwise offer pay/manage | `src/app/booking/[unitId]/checkout-page-client.tsx:193-199`, `:205-220` — **WIRED** |
| 18 | Navigate to payment | `router.push('/payment/{booking.id}')` | `src/app/booking/[unitId]/checkout-page-client.tsx:178` — **WIRED** |
| 19 | Initiate payment | `POST /payments/initiate` `{ booking_id }`; route param must be numeric | `src/app/payment/[bookingId]/page.tsx:52`, `:57` — **WIRED (real); MOCK path returns zeros and no key, `src/lib/api/client.ts:606-619`** |
| 20 | Render the payment UI | No publishable key → "simulate" button; key present → Moyasar hosted form + saved-card quick pay | `src/app/payment/[bookingId]/page.tsx:170-251` — **WIRED / MOCK-branch** |
| 21 | Load saved cards | `accountApi.getCards()`, filtered to `chargeable === true` | `src/app/payment/[bookingId]/page.tsx:74-79` — **WIRED** |
| 22 | Load the gateway SDK | Injects `moyasar.css` + `moyasar.js` from the CDN, then `Moyasar.init` | `src/lib/payments/moyasar.ts:60-79`, `:85-115` — **WIRED (third-party)** |
| 23 | Pay — hosted form | Moyasar charges directly and redirects to `${origin}/payment/callback?pid=…` | `src/lib/payments/moyasar.ts:94`, `:100` — **WIRED (third-party)** |
| 24 | Pay — saved card | `POST /payments/pay` `{ payment_id, saved_card_id, cvc }`; `paid` → confirmation, `transaction_url` (https only) → 3-DS redirect | `src/app/payment/[bookingId]/page.tsx:98-108` — **WIRED** |
| 25 | Pay — simulate | `POST /payments/pay` `{ payment_id }` | `src/app/payment/[bookingId]/page.tsx:121` — **WIRED (staging/mock only)** |
| 26 | Callback verification | Query string treated as a hint only; always `POST /payments/verify` `{ payment_id, moyasar_id }` | `src/app/payment/callback/page.tsx:40-59` — **WIRED** |
| 27 | Confirmation page | `bookingsApi.getById`; a fetch failure still shows a success state, never a payment failure | `src/app/booking/confirmation/[bookingId]/page.tsx:27`, `:35-55` — **WIRED** |
| 28 | My bookings list | `GET /user/bookings`, categorised into 4 tabs by status and a 14-day threshold | `src/app/my-reservations/page.tsx:28`, `:46-62` — **WIRED** |
| 29 | Booking detail | `bookingsApi.getById` + `reviewsApi.getForBooking` | `src/app/my-reservations/[bookingId]/page.tsx:40-41` — **WIRED / the review lookup is MOCK-ONLY (`src/lib/api/client.ts:691`)** |
| 30 | Cancel | `GET /bookings/{id}/cancellation-preview` then `POST /bookings/{id}/cancel` + a follow-up `GET /bookings/{id}` | `src/components/features/booking/CancelBookingDialog.tsx:44`, `:54`; `src/lib/api/client.ts:494-509` — **WIRED** |
| 31 | Review after completion | `POST /reviews` | `src/components/features/reviews/ReviewDialog.tsx:41` — **WIRED** |
| 32 | Download confirmation | Opens a new window with a generated HTML document and calls `window.print()` | `src/lib/utils/booking-confirmation.ts:88-92` — **WIRED (client-side only)** |
| 33 | Contact the host | Opens a dialog; pressing send sets local state | `src/components/features/booking/ContactHostDialog.tsx:30-33` — **NOT WIRED (no API call exists)** |

### 10.4 Production pages rendering hardcoded / placeholder data

| Page | What is hardcoded | file:line |
|---|---|---|
| `/` | Hero background image URL | `src/app/page.tsx:92` |
| `/` | Category tile images per unit type + fallback | `src/app/page.tsx:23-28` |
| `/` | Budget band fallback `[2000-3000, 1000-2000, 500-1000, 0-500]`, used whenever the API returns none | `src/app/page.tsx:32-37`, `:72-74` |
| `/` | Three "how it works" steps (icons hardcoded, copy from messages) | `src/app/page.tsx:43-47`, `:213-224` |
| `/` | Four trust items, copy from messages | `src/app/page.tsx:244-247` |
| `/` | Feature flag `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` hides "الأكثر طلبًا", "حسب الميزانية" and testimonials in production | `src/app/page.tsx:39-41`, `:137`, `:154`, `:252` |
| `/about` | Four stat figures + labels, entirely from message files (no API) | `src/app/about/page.tsx:26-31`; values in `messages/ar.json` `about.stats.*` |
| `/about` | Hero image URL | `src/app/about/page.tsx:53` |
| `/host` | Three partner testimonials (name/role/quote) from message files | `src/app/host/page.tsx:41-45` |
| `/host` | Six FAQ entries, six benefits, three steps — all from message files | `src/app/host/page.tsx:38-46` |
| `/host` | Hero image URL | `src/app/host/page.tsx:56` |
| `/faq` | Question counts per group hardcoded | `src/app/faq/page.tsx:14-20` |
| `/contact` | Phone `+966 50 000 0000`, email, location and hours strings | `src/lib/constants/brand.ts:20-21`; `src/app/contact/page.tsx:49-54` |
| `/contact` | Side panel image URL | `src/app/contact/page.tsx:176` |
| `/contact` | Social links pointing at `linkedin.com/company/mamsa`, `instagram.com/mamsa`, `twitter.com/mamsa`, `facebook.com/mamsa` | `src/lib/constants/brand.ts:35-40` |
| `/my-reservations/[bookingId]` | Four "what you can do" bullets + two notes, from message files, unrelated to the booking | `src/app/my-reservations/[bookingId]/page.tsx:192-203` |
| `/my-reservations/[bookingId]` | Check-in/check-out **times** rendered from message strings, not from the unit | `src/app/my-reservations/[bookingId]/page.tsx:164-165` (`t('checkInTime')` / `t('checkOutTime')`) |
| `ContactHostDialog` | Three canned quick messages + a "host responds in…" line | `src/components/features/booking/ContactHostDialog.tsx:20`, `:49` |
| `TestimonialCarousel` | Three fallback testimonials from message files when the API returns none | `src/components/features/home/TestimonialCarousel.tsx:17`, `:32-38` |
| `/payment/[bookingId]` | Test card number `4111 1111 1111 1111` shown when the key starts with `pk_test` | `src/app/payment/[bookingId]/page.tsx:242-245` |
| `/account/payment-methods` | Same test card hint | `src/app/account/payment-methods/page.tsx:388-391` |
| Mock fixtures (only reachable when `NEXT_PUBLIC_USE_MOCK !== 'false'`) | 7 units, 7 bookings, 2 reviews, 1 user, 2 saved cards, 5 transactions | `src/data/mock/units.ts:24`, `src/data/mock/bookings.ts:5`, `src/data/mock/reviews.ts:3`, `src/data/mock/users.ts:3`, `:14`, `:25` |

### 10.5 Cancellation policy on a booking — snapshot vs live

**A booking always displays the SNAPSHOT captured at booking/payment time, never the unit's live policy.** Evidence:

1. The `Booking` type carries `policySnapshot: CancellationPolicy` — `src/types/index.ts:171`, with the comment "نسخة مجمّدة من سياسة الإلغاء وقت الحجز (SRS FR-036)" at `:167-170`.
2. `mapBooking` fills it from the API's `policy_snapshot` field, falling back to the template registry **only** when the snapshot is absent (unpaid bookings have none): `policySnapshot: mapPolicyDetails(b.policy_snapshot) ?? getPolicyByTemplate(mapTemplate(unit?.cancellation_policy))` — `src/lib/api/adapters.ts:376-377`, with the rationale comment at `:374-375`.
3. The cancel dialog renders `booking.policySnapshot` — `src/components/features/booking/CancelBookingDialog.tsx:107` — and never touches `unit.cancellationPolicyDetails`.
4. The refund engine reads only the snapshot: `resolveTier(booking.policySnapshot, days)` — `src/lib/cancellation/engine.ts:170`. The file header states the rule explicitly at `src/lib/cancellation/engine.ts:9-10`.
5. A dedicated test asserts snapshot independence — `src/lib/cancellation/engine.test.ts:161-171`.
6. For an **unpaid** booking (`status === 'pending_payment'`) the dialog renders no policy block at all, showing a "no payment taken" note instead — `src/components/features/booking/CancelBookingDialog.tsx:96-103`.
7. By contrast, the **unit page** and **checkout page** show the LIVE policy: `unit.cancellationPolicyDetails ?? getPolicyByTemplate(unit.cancellationPolicy)` — `src/app/units/[id]/page.tsx:246-248` and `src/app/booking/[unitId]/checkout-page-client.tsx:264-266`.
8. The refund figures shown in the cancel dialog come from the server preview, not from local computation, when running against the real API — `src/lib/api/client.ts:482`, mapped at `src/lib/api/adapters.ts:399-428`. The local engine is used only in mock mode — `src/lib/api/mock/index.ts:236`.

---

## 11. Money & Financial Surface

### 11.1 Occurrences

| Concept | file:line | What it does | Real logic or display-only? |
|---|---|---|---|
| Nightly rate (type) | `src/types/index.ts:64` | `Unit.pricePerNight` | Data |
| Nightly rate (mapping) | `src/lib/api/adapters.ts:301` | `Number(u.price ?? 0)` | Data |
| Nightly rate (display) | `src/components/features/units/UnitCard.tsx:62` | Raw number, **no `formatSAR`** | Display-only |
| Nightly rate (display) | `src/components/features/units/UnitCard.tsx:130`, `src/app/units/[id]/page.tsx:308`, `:386` | `formatSAR(unit.pricePerNight)` | Display-only |
| Nightly rate (map pins) | `src/components/features/home/LocationMap.tsx:23`, `:26` | `price.toLocaleString('en-US')` + currency label | Display-only |
| Price estimate | `src/app/units/[id]/page.tsx:89` | `unit.pricePerNight * nights` | **Real arithmetic** (labelled an estimate at `:358`) |
| Quote request | `src/lib/api/client.ts:395-407` | `POST /units/{id}/availability` | Real |
| Quote mapping | `src/lib/api/client.ts:347-358` | `mapQuotePricing` — `nights`, `nightly_rate`, `subtotal`, `taxes`, `tax_percent`, `total` | Data |
| Subtotal (mock computation) | `src/lib/api/mock/index.ts:80` | `unit.pricePerNight * nights` | Real (mock backend role-play) |
| VAT / taxes (mock computation) | `src/lib/api/mock/index.ts:81` | `Math.round(subtotal * (15/100) * 100)/100` | Real (mock backend role-play) |
| Total (mock computation) | `src/lib/api/mock/index.ts:82` | `Math.round((subtotal + taxes) * 100)/100` | Real (mock backend role-play) |
| Tax percent label | `src/app/booking/[unitId]/checkout-page-client.tsx:341` | `t('taxesWithPercent', { percent: quotePricing.taxPercent })` → "الضرائب ({percent}٪)" | Display-only |
| Price breakdown component | `src/components/features/booking/PriceBreakdown.tsx:26-35` | Renders subtotal / tax / total rows | Display-only (explicit at `:4-5`) |
| Displayed price switch | `src/app/booking/[unitId]/checkout-page-client.tsx:134-140` | Frozen booking price wins over the live quote once created | Display-only |
| Frozen price capture | `src/app/booking/[unitId]/checkout-page-client.tsx:177` | `setFrozenPrice(booking.price)` | Real state transition |
| Booking price mapping | `src/lib/api/adapters.ts:367-373` | `pricePerNight`, `nights`, `subtotal`, `tax`, `total` from `pricing`, with `total_amount` as a fallback | Data |
| Booking total (display) | `src/components/features/booking/BookingCard.tsx:79`, `src/app/booking/confirmation/[bookingId]/page.tsx:76` | `formatSAR(booking.price.total)` | Display-only |
| Payment initiate | `src/lib/api/client.ts:602-636` | `POST /payments/initiate` → `amount`, `amountHalalas`, `currency`, `publishableKey` | Real |
| Halalas | `src/lib/api/client.ts:627`, `src/lib/payments/moyasar.ts:98` | Passed to `Moyasar.init` verbatim, never recomputed (comment at `:98`) | Display/pass-through |
| Payment amount (display) | `src/app/payment/[bookingId]/page.tsx:177`, `:286`, `:299` | `formatSAR(info.amount)` | Display-only |
| Payment execution | `src/lib/api/client.ts:638-653` | `POST /payments/pay` | Real |
| Payment verification | `src/lib/api/client.ts:659-669` | `POST /payments/verify` | Real |
| Payment config | `src/lib/api/client.ts:593-600` | `GET /payments/config` → publishable key, test mode, currency | Real |
| Moyasar tokenisation | `src/lib/payments/moyasar.ts:33-57` | Browser → `api.moyasar.com/v1/tokens`; PAN never reaches the Mamsa API | Real |
| Moyasar hosted form | `src/lib/payments/moyasar.ts:85-115` | `Moyasar.init` with amount, currency, callback, `save_card: true` | Real |
| Moyasar asset loading | `src/lib/payments/moyasar.ts:60-79` | Injects CSS/JS from `cdn.moyasar.com` | Real |
| Apple Pay | `src/lib/payments/moyasar.ts:104-109` | `methods: ['creditcard','applepay']`, country `SA` | Real |
| Apple Pay domain file | `public/.well-known/apple-developer-merchantid-domain-association`; served via `next.config.js:20-23` | Domain verification | Config |
| Refund preview (request) | `src/lib/api/client.ts:479-482` | `GET /bookings/{id}/cancellation-preview` | Real |
| Refund preview (mapping) | `src/lib/api/adapters.ts:399-428` | `refund_amount`, `refund_percent`, `forfeited_amount`, `total_amount` fallback | Data + arithmetic fallback (`:409-414`) |
| Refund computation (local) | `src/lib/cancellation/engine.ts:171-172` | `total × percent / 100`, forfeited = total − refund | **Real arithmetic** — used in mock mode and as the engine under test |
| Refund record builder | `src/lib/cancellation/engine.ts:189-202` | Builds `RefundRecord` from a preview | Real (mock path) |
| Refund execution | `src/lib/api/client.ts:491-509` | `POST /bookings/{id}/cancel` then re-fetch the booking; synthesises a `RefundRecord` from the response | Real |
| Refund display | `src/components/features/booking/CancelBookingDialog.tsx:123-137` | Total, percent, refunded, deducted | Display-only |
| Refund display | `src/components/features/booking/BookingCard.tsx:107`, `src/app/my-reservations/[bookingId]/page.tsx:146` | `formatSAR(refund.amount)` + percent | Display-only |
| Money rounding | `src/lib/cancellation/engine.ts:207-209` | `Math.round(v*100)/100` | Real |
| Money rounding (duplicate) | `src/lib/api/adapters.ts:408` | Local `round2` with a `Math.max(0, …)` floor | Real |
| Currency formatting | `src/lib/utils/format.ts:9-15` | `formatSAR` — `Intl.NumberFormat('en-US')` + "ر.س" | Display-only |
| Currency formatting | `src/lib/utils/format.ts:17-20` | `formatSARShort` — **never called** | Display-only, dead |
| Transactions (request) | `src/lib/api/client.ts:812-815` | `GET /user/transactions` | Real |
| Transactions (mapping) | `src/lib/api/adapters.ts:456-465` | `id`, `ref_code`, `type`, `amount`, `description`, `date`, `status` | Data |
| Transactions (display) | `src/app/account/payment-methods/page.tsx:164-197` | Signed amounts, `+`/`−` prefix chosen by `tx.amount > 0` (`:166`, `:190`) | Display-only |
| Transaction types incl. `topup` and `reward` | `src/types/index.ts:223`; fixtures `src/data/mock/users.ts:47`, `:57` | Type union + mock rows | Type + mock data only |
| Saved cards | `src/lib/api/client.ts:767-810` | List / create-from-token / delete / set-default | Real |
| Card Luhn validation | `src/app/account/payment-methods/page.tsx:36-50` | Client-side checksum before tokenisation | Real |
| Card brand detection | `src/app/account/payment-methods/page.tsx:25-29` | Leading-digit heuristic; anything not Visa/Mastercard is labelled `mada` | Real |
| Booking-confirmation PDF | `src/lib/utils/booking-confirmation.ts:74-76` | Prints subtotal, taxes, total into a printable HTML doc | Display-only |
| Price filter bounds | `src/components/features/units/SidebarFilters.tsx:48-50` | Slider 0–5000 SAR | Display/filter-only |
| Budget bands | `src/app/page.tsx:32-37`, `:77` | Links to `/units?minPrice&maxPrice` | Display-only (the target page ignores these params in its API call — `units-page-client.tsx:76-80`) |
| Commission | `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:57` | "net share (total − frozen 2% commission)" | Documentation only — **no code** |

### 11.2 Explicit answers

**Does a partner wallet / balance concept exist in this repo? — NO.**
Evidence: a case-insensitive repository-wide search of `src/` for `wallet|balance|ledger|settlement|payout|disbursement` yields exactly four matches, none of them a money concept: a `Wallet` lucide **icon** imported for the About page (`src/app/about/page.tsx:6`, used at `:19`) and two prose comments using "wallet" to mean a wallet *payment method* (`src/lib/api/adapters.ts:379`, `src/lib/api/client.ts:584`). `src/types/index.ts` declares no balance-bearing type. The only account-money surface is `Transaction[]` (`src/types/index.ts:225-233`), which is a flat history with no running balance field, rendered as a list at `src/app/account/payment-methods/page.tsx:164-197` with no total. `TransactionType` includes `'topup'` (`src/types/index.ts:223`) and a mock row labelled "إضافة رصيد" exists (`src/data/mock/users.ts:47-51`), but there is no top-up endpoint, no balance display, and no balance state anywhere.

**Does any payout / transfer-history concept exist? — NO.**
Evidence: no `payout`, `settlement`, or `disbursement` identifier exists in `src/`. The single `transfer` match is a privacy-policy section heading about cross-border **data** transfer (`src/app/policies/privacy/page.tsx:107-108`). The only outbound-money flow modelled is a customer refund (`RefundRecord`, `src/types/index.ts:138-145`; `POST /bookings/{id}/cancel`, `src/lib/api/client.ts:494`). Partner-side money appears only in a backend document (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:57`), never in code.

**Does any finance-scoped role or permission exist? — NO.**
Evidence: `UserRole` is `'user' | 'individual' | 'company' | 'super_admin'` (`src/types/index.ts:9`), derived at `src/lib/api/adapters.ts:468-472`. There is no `finance`, `accountant`, or `billing` role, no permission or scope type, and **no component branches on `user.role` at all** — a repository-wide search for `role ===` / `role !==` in `src/` returns zero matches, and the only reads of a `.role` property outside `mapRole`/`mapUserProfile` (`src/lib/api/adapters.ts:468-472`, `:500`) and `adapters.test.ts` belong to the unrelated `Testimonial.role` display field (`src/components/features/home/TestimonialCarousel.tsx:88`, `src/app/host/page.tsx:166`). `src/app/auth.md/route.ts:60` states the API has no scope model.

---

## 12. Cross-Repo Contract Surface

### 12.1 Types / enums / constants that must stay identical across repos, with exact literal values

| Item | Exact literal values | file:line |
|---|---|---|
| `UserRole` | `'user'`, `'individual'`, `'company'`, `'super_admin'` | `src/types/index.ts:9` |
| Role derivation inputs | `is_admin` → `super_admin`; `!is_partner` → `user`; `partner_type === 'company'` → `company`; else `individual` | `src/lib/api/adapters.ts:468-472` |
| `UnitType` | `'apartment'`, `'studio'`, `'villa'` | `src/types/index.ts:33` |
| `UnitStatus` | `'draft'`, `'pending'`, `'approved'`, `'rejected'` (source field: `approval_status`) | `src/types/index.ts:34`; `src/lib/api/adapters.ts:271`, `:294` |
| `BookingStatus` (frontend) | `'pending_payment'`, `'confirmed'`, `'completed'`, `'cancelled'` | `src/types/index.ts:118-122` |
| `BookingStatus` (accepted backend values) | `pending`→`pending_payment`; `pending_payment`→`pending_payment`; `awaiting_payment`→`pending_payment`; `confirmed`→`confirmed`; `paid`→`confirmed`; `active`→`confirmed`; `completed`→`completed`; `cancelled`→`cancelled`; `canceled`→`cancelled`; unknown→`confirmed` | `src/lib/api/adapters.ts:210-220`, `:362` |
| `CancellationTemplate` (frontend) | `'flexible'`, `'moderate'`, `'strict'` | `src/types/index.ts:97` |
| Cancellation template map (accepted backend keys) | `flexible`→flexible; `24_hours`→flexible; `48_hours`→moderate; `moderate`→moderate; `7_days`→strict; `strict`→strict; `non_refundable`→strict; unknown→moderate | `src/lib/api/adapters.ts:200-208`, `:223` |
| Flexible tiers | `7d→100%`, `3d→75%`, `0d→50%` | `src/lib/constants/cancellation-policies.ts:13-17` |
| Moderate tiers | `7d→100%`, `3d→50%`, `0d→25%` | `src/lib/constants/cancellation-policies.ts:25-29` |
| Strict tiers | `7d→75%`, `3d→25%`, `0d→0%` | `src/lib/constants/cancellation-policies.ts:37-41` |
| Tier wire unit | `min_hours_before_checkin`, divided by 24 on read | `src/lib/api/adapters.ts:238` |
| `RefundRecord.cancelledBy` closed set | `'customer'`, `'partner'`, `'admin'`, `'system'`; unknown→`customer` | `src/types/index.ts:144`; `src/lib/api/adapters.ts:327`, `:329-330` |
| `PaymentInfo.method` | `'mada'`, `'visa'`, `'mastercard'`, `'applepay'` | `src/types/index.ts:125` |
| `SavedCard.brand` | `'visa'`, `'mastercard'`, `'mada'` | `src/types/index.ts:212` |
| `TransactionType` | `'payment'`, `'refund'`, `'topup'`, `'reward'` | `src/types/index.ts:223` |
| `Transaction.status` | `'completed'`, `'pending'`, `'failed'` | `src/types/index.ts:232` |
| Amenity vocabulary (15 slugs) | `wifi`, `pool`, `kitchen`, `parking`, `ac`, `garden`, `smart_tv`, `washer`, `security`, `self_checkin`, `family_friendly`, `bbq`, `elevator`, `private_beach`, `event_hall` | `src/lib/constants/brand.ts:76-92` |
| Legacy Arabic-label→slug table | `واي فاي`→wifi; `واي-فاي`→wifi; `wifi`→wifi; `مطبخ`→kitchen; `مكيف`→ac; `تكييف`→ac; `موقف سيارات`→parking; `مسبح`→pool; `شاشة ذكية`→tv; `تلفزيون`→tv | `src/lib/api/adapters.ts:186-197` (note: emits `tv`, which is **not** in the 15-slug vocabulary — the icon map uses `smart_tv`, `src/app/units/[id]/page.tsx:35`) |
| Error codes branched on | `PHONE_NOT_REGISTERED`, `PHONE_ALREADY_REGISTERED`, `EMAIL_VERIFICATION_REQUIRED`, `RATE_LIMITED`, `OTP_INVALID`, `OTP_EXPIRED`, `OTP_MAX_ATTEMPTS`, `EMAIL_INVALID`, `EMAIL_ALREADY_IN_USE` | `LoginDialog.tsx:73`; `RegisterDialog.tsx:74`; `checkout-page-client.tsx:183`; `errors.ts:27-34`, `:39-41`; `email-verification.tsx:87`, `:108`, `:138` |
| Error envelope fields consumed | `message`, `code`, `errors` (flattened), `retry_after`, `remaining_attempts` | `src/lib/api/client.ts:144-155` |
| Success envelope | `{ …, data }` — unwrapped when a `data` key is present, otherwise the raw body | `src/lib/api/client.ts:176-179`; duplicated at `src/lib/mcp/units.ts:66-69` |
| `device` value on auth calls | `'web'` | `src/lib/api/client.ts:234`, `:282`, `:316`, `:78` |
| OTP intent values | `'login'`, `'register'` | `src/lib/api/client.ts:218` |
| Partner type values | `'individual'`, `'company'` | `src/lib/api/client.ts:264`, `:274` |
| Phone wire format | `05XXXXXXXX` (local, 10 digits) | `src/lib/utils/phone.ts:27-30` |
| Date wire format | `yyyy-MM-dd` | `src/lib/constants/brand.ts:51`; validated `src/app/booking/[unitId]/checkout-page-client.tsx:38` |
| Currency | `SAR` / `ر.س` | `src/lib/constants/brand.ts:42-46` |
| Callback URL shape (must not change) | `/payment/callback?pid={paymentId}`; Moyasar appends `id`, `status`, `message` | `src/lib/payments/moyasar.ts:94`; consumed `src/app/payment/callback/page.tsx:34-36`; constraint stated at `src/app/payment/callback/page.tsx:10-11` |
| `pid` / `bookingId` format constraint | must match `/^\d+$/` | `src/app/payment/callback/page.tsx:40`; `src/app/payment/[bookingId]/page.tsx:52` |
| Pay-result statuses branched on | `'paid'` (success), any `transaction_url` (3-DS) | `src/app/payment/[bookingId]/page.tsx:99`, `:103`; documented at `src/lib/api/client.ts:541` |
| MCP server identity | name `com.mamsaa.www`, version `1.0.0` | `src/app/mcp/route.ts:25-26`; must mirror `public/.well-known/mcp/server-card.json:2`, `:5`, `:8-9` |
| MCP tool names | `search_units`, `get_unit`, `list_featured_units`, `get_unit_reviews` | `src/app/mcp/route.ts:92`, `:115`, `:127`, `:138`; mirrored `public/.well-known/mcp/server-card.json:24`, `:29`, `:34`, `:39` |
| WebMCP tool names | `search_units`, `get_unit` | `src/components/agents/WebMcpTools.tsx:64`, `:89` |
| Agent-skill digests | `booking-policy` `sha256:9a76c9f0cbd9fa5d4412b9188c0b814ea2c3abab0292573d3483a471d4b40603`; `search-rentals` `sha256:f954940f9f3962117427ec9579d1643a067e8c3fdd19c57822771de0bfeccfe1` | `public/.well-known/agent-skills/index.json:9`, `:16` |
| Commercial registration | `1010920108` | `src/lib/constants/brand.ts:24` |
| Site domain-verification token | `510bd1445bcfa63e566bc867cacdced1ea4f545bd92624b01a6be6831752074f` | `src/app/layout.tsx:36` |

### 12.2 Deduped, sorted contract surface — every API path this repo calls

```
/auth/complete-profile
/auth/logout
/auth/me
/auth/partner/register
/auth/refresh
/auth/request-otp
/auth/resend-otp
/auth/verify-otp
/bookings
/bookings/{id}
/bookings/{id}/cancel
/bookings/{id}/cancellation-preview
/contact
/payments/config
/payments/initiate
/payments/pay
/payments/verify
/payments/{paymentId}
/reviews
/testimonials
/units
/units/budgets
/units/categories
/units/cities
/units/popular
/units/{id}
/units/{id}/availability
/units/{id}/reviews
/user/account
/user/bookings
/user/cards
/user/cards/from-token
/user/cards/{id}
/user/cards/{id}/default
/user/change-phone
/user/change-phone/verify
/user/email
/user/email/resend
/user/email/verify
/user/favorites
/user/favorites/{unitId}
/user/profile
/user/transactions
```

43 paths. Three of them are never exercised at runtime: `/auth/refresh` via `authApi.refresh` (the 401 path calls the same URL through a separate raw fetch, `src/lib/api/client.ts:75`), `/payments/{paymentId}`, and `/units/cities`.

### 12.3 `docs/backend/` — documented endpoints vs called endpoints

`docs/backend/` contains 7 markdown files. `SWITCH-TO-PRODUCTION.md` and `Mamsa-Switch-To-Production.md` are byte-identical duplicates (verified with `diff`).

| Documented endpoint | Documented in | Status |
|---|---|---|
| `POST /user/email` | `NEXTJS-EMAIL-VERIFICATION.md:25`; `-IMPLEMENTATION.md:56`; `NEXTJS-EMAIL-ACCOUNT-ALIASES.md:13` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:736` |
| `POST /user/email/verify` | `NEXTJS-EMAIL-VERIFICATION.md:31`; `-IMPLEMENTATION.md:59`; `ALIASES.md:14` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:749` |
| `POST /user/email/resend` | `NEXTJS-EMAIL-VERIFICATION.md:35`; `-IMPLEMENTATION.md:62`; `ALIASES.md:15` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:758` |
| `GET /auth/me` | `NEXTJS-EMAIL-VERIFICATION.md:18`, `:78`; `-IMPLEMENTATION.md:41`; `ALIASES.md:16`; `mamsa-unit-fields-backend-task.md:82` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:697` |
| `GET /user/profile` | `NEXTJS-EMAIL-VERIFICATION.md:18`; `mamsa-unit-fields-backend-task.md:82`; `mamsa-reply-decisions-and-amenity-filter.md:35` | **DOCUMENTED-NOT-CALLED** — only `PUT /user/profile` is called (`src/lib/api/client.ts:702`); no GET |
| `PUT /user/profile` | `NEXTJS-EMAIL-VERIFICATION.md:28`; `-IMPLEMENTATION.md:128-129`; `mamsa-reply-decisions-and-amenity-filter.md:34` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:702` |
| `POST /bookings` | `NEXTJS-EMAIL-VERIFICATION.md:47`; `-IMPLEMENTATION.md:29`, `:106` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:467` |
| `POST /auth/complete-profile` | `mamsa-reply-decisions-and-amenity-filter.md:34` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:298` |
| `GET /units` (+ `features[]` filter) | `mamsa-reply-decisions-and-amenity-filter.md:47-52`, `:61-62`, `:72` | **DOCUMENTED-AND-CALLED** — `src/lib/api/client.ts:377`; note the `features[]` filter is serialised (`:411-414`) but no caller ever populates `UnitsFilter.amenities` |
| `GET /account` (alias of `/auth/me`) | `NEXTJS-EMAIL-VERIFICATION.md:18`; `ALIASES.md:16`, `:26` | **DOCUMENTED-NOT-CALLED** — the repo uses the canonical `/auth/me` |
| `POST /account/email` (alias) | `ALIASES.md:13`, `:23` | **DOCUMENTED-NOT-CALLED** |
| `POST /account/email/verify` (alias) | `ALIASES.md:14` | **DOCUMENTED-NOT-CALLED** |
| `POST /account/email/resend` (alias) | `ALIASES.md:15` | **DOCUMENTED-NOT-CALLED** |

**CALLED-NOT-DOCUMENTED** (called by this repo, absent from every file in `docs/backend/`): `/auth/request-otp`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/logout`, `/auth/refresh`, `/auth/partner/register`, `/bookings/{id}`, `/bookings/{id}/cancel`, `/bookings/{id}/cancellation-preview`, `/contact`, `/payments/config`, `/payments/initiate`, `/payments/pay`, `/payments/verify`, `/payments/{paymentId}`, `/reviews`, `/testimonials`, `/units/budgets`, `/units/categories`, `/units/cities`, `/units/popular`, `/units/{id}`, `/units/{id}/availability`, `/units/{id}/reviews`, `/user/account`, `/user/bookings`, `/user/cards`, `/user/cards/from-token`, `/user/cards/{id}`, `/user/cards/{id}/default`, `/user/change-phone`, `/user/change-phone/verify`, `/user/favorites`, `/user/favorites/{unitId}`, `/user/transactions` — **35 of 43 paths**.

Note: `src/app/account/payment-methods/page.tsx:312` cites a document `NEXTJS-SAVED-CARDS.md §2.3` that is **not present** in `docs/backend/`.

### 12.4 Contents of `docs/backend/` — per-file summary

| File | Lines | Substance |
|---|---|---|
| `Mamsa-Switch-To-Production.md` | 163 | Runbook for pointing the Vercel builds at `https://api.mamsaa.com/api/v1`. States the env var must include `/api/v1` (`:41`); claims `next.config.js` already whitelists `api.mamsaa.com` in `images.remotePatterns` (`:47`) — **this is not true of the current file** (`next.config.js:10-13`). Lists pre-go-live blockers: SMS gateway IP not whitelisted, error E028 (`:148-151`); live Moyasar charges (`:152`) |
| `SWITCH-TO-PRODUCTION.md` | 163 | Byte-identical duplicate of the above |
| `NEXTJS-EMAIL-VERIFICATION.md` | 78 | The email-verification contract: endpoints, 300 s validity (`:40`), 5 attempts (`:41`), 60 s cooldown (`:42`), staging fixed code `111222` (`:43`), the `EMAIL_VERIFICATION_REQUIRED` booking gate ON staging / OFF prod (`:49-50`), the server-side email matrix (`:56-61`) including the partner "net share (total − frozen 2% commission)" line (`:57`) |
| `NEXTJS-EMAIL-VERIFICATION-IMPLEMENTATION.md` | 145 | Build guide: type sketches, per-code UX table (`:95-101`), the retry-after-verify pattern (`:108-119`), and the instruction to refetch `/auth/me` after verification (`:100`) |
| `NEXTJS-EMAIL-ACCOUNT-ALIASES.md` | 33 | Confirms `/account/*` aliases exist alongside `/user/email*`; advises picking one form (`:32`) |
| `mamsa-reply-decisions-and-amenity-filter.md` | 92 | Decisions: no discounts (`:13`), add `first_name`/`last_name` (`:21`); reports the `features[]` filter matching Arabic labels instead of slugs and returning zero results for every amenity checkbox (`:42-54`), with the 15-slug vocabulary at `:80-82` |
| `mamsa-unit-fields-backend-task.md` | 156 | Field-gap request list: `beds`, `owner.type`/`avatar_url`/`is_verified`, structured `amenities`, `total_amount` + `forfeited_amount` on cancellation-preview, `first_name`/`last_name`, `guests: {adults, children}`, `guest_name`, `user_id`, `approval_status` + `rejection_reason`, `is_featured`, plus documentation asks for `cancelled_by` values, the `review` shape, and a structured `tier` |

### 12.5 References to the other frontends / shared packages

| Reference | file:line | Nature |
|---|---|---|
| `NEXT_PUBLIC_DASHBOARD_URL` → `DASHBOARD_URL` | `src/lib/constants/brand.ts:31` | Env-driven base URL for the **partner dashboard** (a separate app). Comment at `:28-30` |
| `DASHBOARD_LOGIN_URL` | `src/lib/constants/brand.ts:33` | Derived `${DASHBOARD_URL}/login`. **Never imported anywhere** |
| `.env.local:6-7` | `.env.local` | Comment "Partner dashboard (separate app)"; value currently empty |
| Partner dashboard surface note | `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:11` | States root-mounted + cookie session is the partner-dashboard surface only; the user app speaks Bearer to `/api/v1` |
| Partner net share / dashboard parity | `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:57` | Partner email shows "the same number the dashboard shows" |
| Repo/app inventory table | `docs/backend/Mamsa-Switch-To-Production.md:30-32` | Names `vego-group/mamsa-frontend` (consumer), a separate partner repo (`partner.mamsaa.com`), a separate admin repo (`admin.mamsaa.com`) |
| Partner repo instructions | `docs/backend/Mamsa-Switch-To-Production.md:52-56`, `:92` | Tells the reader to repeat the env switch inside the partner repo |
| CORS origins | `docs/backend/Mamsa-Switch-To-Production.md:131-132` | Production API reflects CORS for `https://www.mamsaa.com` and `https://partner.mamsaa.com` |
| Partner-facing UI in this repo | `src/app/host/page.tsx:28`, `src/app/partner-onboarding/page.tsx` | The host landing page and partner sign-up live **in this repo**; approval and the dashboard link are said to arrive by email (`src/app/partner-onboarding/page.tsx:8`) |
| Partner-only unit fields | `src/types/index.ts:34`, `:91` (`UnitStatus`, `rejectionReason`) | Declared here, mapped here, never rendered here — `docs/backend/mamsa-unit-fields-backend-task.md:72` says the partner dashboard needs them |
| Shared packages | — | **None.** `package.json` declares no workspace, no `file:`/`workspace:` dependency, and no monorepo config exists. There is no shared types package; the contract is duplicated by hand across repos |

---

## 13. Gaps & Disconnects

### 13.1 Type fields missing from the corresponding form

| Type field | Form that should collect it | Evidence |
|---|---|---|
| `Booking.guests.children` | Checkout has no children input; it hardcodes `children: 0` | `src/app/booking/[unitId]/checkout-page-client.tsx:172`; type at `src/types/index.ts:164` |
| `CreateBookingInput.notes` | No notes/requests field exists in any form; always sent as `''` | `src/lib/api/client.ts:450`, `:473` |
| `User.avatarUrl` | No avatar upload anywhere; account page renders initials | `src/types/index.ts:20`; `src/app/account/page.tsx:81-83` |
| `User.email` on the profile form | `/account` has first/last name inputs only, though `updateProfile` accepts `email` | `src/app/account/page.tsx:115-124` vs `src/lib/api/client.ts:699` |
| `UnitsFilter.startDate` / `endDate` | `FilterBar` collects dates and writes `start`/`end` params, but `units-page-client` never reads them into the filter | `src/components/features/units/FilterBar.tsx:40-41` vs `src/app/units/units-page-client.tsx:76-80` |
| `UnitsFilter.amenities` | The sidebar collects amenity slugs but they are never put into the API filter | `src/components/features/units/SidebarFilters.tsx:33-38` vs `src/app/units/units-page-client.tsx:76-80` |
| `UnitsFilter.minPrice` / `maxPrice` / `minRating` | The sidebar collects all three; none reaches the API | `src/components/features/units/SidebarFilters.tsx:47-53`, `:70-87` vs `src/app/units/units-page-client.tsx:76-80` |
| `UnitsFilter.sort` | `/units` has a sort dropdown whose keys (`recommended`) do not match the API union, and it never sends `sort` | `src/app/units/units-page-client.tsx:16`, `:27` vs `src/types/index.ts:205` |
| `Review` rating half-steps | N/A — integer stars only | `src/components/features/reviews/ReviewDialog.tsx:62` |

### 13.2 Form fields never included in the outgoing payload

| Field | Form | Evidence |
|---|---|---|
| `firstName`, `lastName`, `email` | Register dialog | Validated at `src/lib/validation/schemas.ts:35-37`; `authApi.register` sends only `{ phone, intent }` — `src/lib/api/client.ts:256` |
| `firstName`, `lastName`, `email`, `phone` | Checkout "معلوماتك الشخصية" card | Collected at `src/app/booking/[unitId]/checkout-page-client.tsx:64-67`, `:235-259`; validated at `:143-148`; **none appears in the `POST /bookings` body** — `src/lib/api/client.ts:469-474` |
| `paymentMethod` | Checkout (hardcoded `'visa'`) | Passed at `src/app/booking/[unitId]/checkout-page-client.tsx:173`; declared at `src/lib/api/client.ts:449`; **not serialised** — `src/lib/api/client.ts:469-474` |
| `agreed` (terms checkbox) | Checkout | `src/app/booking/[unitId]/checkout-page-client.tsx:56`, `:272`; gates submission only, never sent |
| Message body | Contact-host dialog | `src/components/features/booking/ContactHostDialog.tsx:90`; no request is made |
| Card `name` (cardholder) in simulate mode | Add-card modal | Collected `src/app/account/payment-methods/page.tsx:396-402`; the simulate branch sends only `brand`/`last4`/`expMonth`/`expYear` — `:348-353` |
| `cvc` in simulate mode | Add-card modal | Collected `:445-455`, validated `:336`; not sent in the simulate branch `:348-353` |
| Search dates `start` / `end` | FilterBar | `src/components/features/units/FilterBar.tsx:40-41`; never reach any request |

### 13.3 API functions never called

| Function | file:line |
|---|---|
| `authApi.refresh` | `src/lib/api/client.ts:313` |
| `unitsApi.getFeatured` | `src/lib/api/client.ts:384` |
| `contentApi.cities` | `src/lib/api/client.ts:429` |
| `paymentsApi.getById` | `src/lib/api/client.ts:671` |

Other exported-but-unused symbols:

| Symbol | file:line |
|---|---|
| `mapOffer` + the `Offer` interface | `src/lib/api/adapters.ts:569`, `:506` |
| `maskPhone` | `src/lib/utils/phone.ts:33` |
| `formatSARShort` | `src/lib/utils/format.ts:17` |
| `formatDateLong` | `src/lib/utils/format.ts:32` |
| `formatDateRange` | `src/lib/utils/format.ts:41` |
| `getReviewsForUnit` | `src/data/mock/reviews.ts:28` |
| `makeOtpSchema` | `src/lib/validation/schemas.ts:18` |
| `makeProfileUpdateSchema` / `ProfileUpdateValues` | `src/lib/validation/schemas.ts:58`, `:76` |
| `DASHBOARD_LOGIN_URL` | `src/lib/constants/brand.ts:33` |
| `PAGINATION` | `src/lib/constants/brand.ts:61` |
| `PRICE_FILTER` | `src/lib/constants/brand.ts:65` |
| `UNIT_TYPE_LABELS_AR` | `src/lib/constants/brand.ts:94` |
| `AuthSession` | `src/types/index.ts:24` |
| `CityCount` | `src/lib/api/adapters.ts:534` |
| `mockApi.units.getById` duplicate-id hazard | see §13.6 |
| UI primitives listed in §10.2 | `src/components/ui/*` |

### 13.4 Buttons / actions with no handler or no API call behind them

| Control | file:line | Behaviour |
|---|---|---|
| "مشاركة" (Share) on the unit page | `src/app/units/[id]/page.tsx:156-158` | `<Button>` with **no `onClick`** — does nothing |
| Contact-host "إرسال الرسالة" | `src/components/features/booking/ContactHostDialog.tsx:97-103` → `send()` `:30-33` | Sets `sent = true`; no request is ever made |
| Contact-host quick-message chips | `src/components/features/booking/ContactHostDialog.tsx:78-86` | Fill the textarea only |
| "التواصل مع المضيف" on the booking detail page | `src/app/my-reservations/[bookingId]/page.tsx:93-95` | Opens the above dialog |
| "تحميل التأكيد" | `src/app/my-reservations/[bookingId]/page.tsx:96-98` → `src/lib/utils/booking-confirmation.ts:88-92` | Opens a print window; silently no-ops if the popup is blocked (`:89`) |
| Budget-band links on the homepage | `src/app/page.tsx:162` | Navigate to `/units?minPrice&maxPrice`; the destination reads both into local slider state (`units-page-client.tsx:65-68`) but never sends them to the API |
| `/units` sort dropdown | `src/app/units/units-page-client.tsx:171-180` | Sorts client-side only |
| `/units` amenity checkboxes | `src/components/features/units/SidebarFilters.tsx:113-121` | Filter client-side only |
| "استمرار التسجيل" on `/host` | `src/app/host/page.tsx:95-97` | Links to the same `/partner-onboarding` page as "ابدأ الآن" — no resume mechanism exists |
| `LocationExplorer` "title" on map pins | `src/components/features/home/LocationMap.tsx:26` | Only the price is rendered in the pin; `title` is passed but unused |

### 13.5 TODO / FIXME / HACK / `@ts-ignore` / `eslint-disable` inventory

There are **zero** `TODO`, `FIXME`, `HACK`, `XXX`, and `@ts-ignore` occurrences in `src/`.

| Marker | file:line | Text |
|---|---|---|
| `@ts-expect-error` | `src/components/agents/WebMcpTools.test.tsx:47` | `// @ts-expect-error — removing the stub between cases` |
| `eslint-disable-next-line` | `src/app/units/[id]/page.tsx:183` | `@next/next/no-img-element` — avatar host not in `images.remotePatterns` |
| `eslint-disable-line` | `src/components/features/booking/CancelBookingDialog.tsx:48` | `react-hooks/exhaustive-deps` |
| `eslint-disable-line` | `src/app/payment/callback/page.tsx:67` | `react-hooks/exhaustive-deps` |
| `eslint-disable-line` | `src/components/features/auth/LoginDialog.tsx:50` | `react-hooks/exhaustive-deps` |
| `eslint-disable-line` | `src/components/features/auth/RegisterDialog.tsx:51` | `react-hooks/exhaustive-deps` |
| Rule disabled repo-wide | `.eslintrc.json:4` | `react/no-unescaped-entities: off` |
| Rule disabled repo-wide | `.eslintrc.json:5` | `@next/next/no-img-element: off` |

A prominent inline caveat, not a TODO marker: `src/app/page.tsx:39-41` — "⚠️ TEMPORARY (pre-launch): hides … until go-live. Flip to true to bring them all back." (`SHOW_PRELAUNCH_HIDDEN_SECTIONS = false`).

### 13.6 Every `any` in domain code

**Zero.** A repository-wide search of `src/` for `: any`, `<any>`, `as any` and `any[]` returns exactly one hit, and it is the English word "any" inside a comment: `src/app/api/md/route.ts:12` — "Fail-safe by design: any problem falls back…". `tsconfig.json:7` sets `"strict": true` and `:21` sets `"noUncheckedIndexedAccess": true`.

### 13.7 Flows that work only against mocks (and would break on the real API)

| Flow | Why it is mock-bound | Evidence |
|---|---|---|
| "Already reviewed?" lookup on a booking | The non-mock branch of `reviewsApi.getForBooking` performs **no request** and always resolves `null`. On the real API the UI relies solely on `booking.isReviewed` | `src/lib/api/client.ts:689-691`; consumed `src/app/my-reservations/[bookingId]/page.tsx:41`, `:47`, `:222` |
| Payment page in mock mode | `paymentsApi.initiate` returns `paymentId: 0`, `amount: 0`, `publishableKey: ''`, so the page shows a "simulate" button and a `0 ر.س` total | `src/lib/api/client.ts:606-619`; rendered `src/app/payment/[bookingId]/page.tsx:170-179` |
| Reaching the payment page at all in mock mode | The route rejects any `bookingId` that is not purely numeric, but mock booking ids are `BK-XXXXXXXX` (`genId('BK')`) | Guard `src/app/payment/[bookingId]/page.tsx:52`; id format `src/lib/api/mock/index.ts:54-56`, `:201` |
| Booking creation in mock mode | Requires `currentUser.emailVerified`, but `currentUser` is `null` until a mock OTP verify happens in the same page session; a fresh reload therefore returns `EMAIL_VERIFICATION_REQUIRED` | `src/lib/api/mock/index.ts:40`, `:193` |
| Homepage content sections | `testimonials`, `categories`, `budgets` have **no** mock implementation — they return `[]`, so mock mode always shows the hardcoded fallbacks | `src/lib/api/client.ts:421`, `:426`, `:433`; fallbacks `src/app/page.tsx:32-37`, `src/components/features/home/TestimonialCarousel.tsx:32-38` |
| Favourites in mock mode | `favoritesApi.list/add/remove` are no-ops, so favourites live only in `localStorage` and `sync()` merges against an empty server list | `src/lib/api/client.ts:824`, `:829`, `:835` |
| Phone change in mock mode | `verifyChangePhone` resolves `{ ok: true }` **without checking the code** | `src/lib/api/client.ts:723` |
| MCP tools in mock mode | Deliberately throw rather than serve mock data | `src/lib/mcp/units.ts:29-36` |
| Mock unit catalogue integrity | Two different units both use `id: 'U-002'`; `findUnitById` returns the first, so the second is unreachable by id while still appearing in lists | `src/data/mock/units.ts:65` and `src/data/mock/units.ts:106`; lookup `src/data/mock/units.ts:285-287` |
| Mock saved cards | `MOCK_SAVED_CARDS` entries have no `chargeable` field, so the payment page's `chargeable === true` filter yields none | `src/data/mock/users.ts:15-16` vs `src/app/payment/[bookingId]/page.tsx:76` |
| Mock card expiry | `C-001` expires `12/2025`, already in the past relative to the audit date | `src/data/mock/users.ts:15` |
| Booking status after mock creation | Mock `create` returns `status: 'confirmed'` immediately, skipping `pending_payment` entirely, so the pending-payment UI paths are unreachable in mock mode | `src/lib/api/mock/index.ts:213` |
| Cancellation preview in mock mode | Computed by the local engine from `policySnapshot`; against the real API it comes from the server and `tier` may be `null` | `src/lib/api/mock/index.ts:236` vs `src/lib/api/adapters.ts:420` |

### 13.8 Missing loading / error / empty states, per page

| Page | Loading | Error | Empty | Gaps |
|---|---|---|---|---|
| `/` | Suspense fallback for `FilterBar` only (`page.tsx:104`) | `safe()` swallows every failure into `[]` (`:14-20`) | Category tiles hide zero counts (`:129`); `LocationExplorer` has an empty state (`LocationExplorer.tsx:35-42`) | **No error surface at all** — a total API outage renders a page that looks normal but empty |
| `/units` | Skeletons (`units-page-client.tsx:223-228`) | **None** — `unitsApi.list` has no `.catch`, so a rejection leaves `loading=false` with an empty list shown as "no results" | Empty state + clear-filters (`:229-237`) | Missing error state |
| `/units/[id]` | Text "loading" (`:117`) | `LoadError` + retry (`:108-113`) | "no reviews" (`:272`) | — |
| `/picks` | Pulse placeholders (`PicksSection.tsx:99-103`) | Failure caught → sets `[]` (`:44-46`), rendering the empty state | Empty text (`:105`) | Error is indistinguishable from empty |
| `/booking/[unitId]` | Text "loading" ×2 (`:103`, `:118`) | `LoadError` + retry (`:95-101`); invalid dates card (`:107-116`); unavailable card (`:120-129`) | n/a | — |
| `/payment/[bookingId]` | Spinner (`:133-139`) | Full error card + retry + link out (`:141-161`); inline `errorMsg` (`:254`) | n/a | A non-numeric route param silently produces the same generic error card (`:52-55`) |
| `/payment/callback` | Spinner + "verifying" copy (`:95-101`) | Failure card with retry/reservations/browse (`:69-92`) | n/a | — |
| `/booking/confirmation/[bookingId]` | Text "loading" (`:57`) | Reassuring success-with-retry card (`:35-55`) | n/a | — |
| `/my-reservations` | Skeletons (`:80-84`) | `LoadError` + retry (`:85-88`) | Per-tab empty state + browse CTA (`:123-133`) | — |
| `/my-reservations/[bookingId]` | Text "loading" (`:44`) | **None** — `bookingsApi.getById(...).then(setBooking)` has no `.catch`, so a failure renders "loading" forever | n/a | Missing error state |
| `/favorites` | Skeletons (`:35-40`) | **None** — `unitsApi.list(...)` has no `.catch`; on failure `loading` never clears, leaving skeletons forever | Empty card (`:41-45`) | Missing error state |
| `/account` | Text "loading" (`:71`) | `accountApi.me().catch(() => {})` swallows silently (`:39`); if there is no stored user, the page shows "loading" forever | n/a | Missing error state; `handleSave` has no `catch`, so a failed save shows nothing |
| `/account/phone` | Text "loading" when `!user` (`:62`) | Inline error (`:113`) | n/a | `onVerify` (`:55-60`) has no local catch — errors surface via `OtpVerificationForm`'s own handler |
| `/account/payment-methods` | Text "loading" (`:90`) | **None** for the initial `Promise.all` (`:70-72`); `deleteCard`/`setDefaultCard` (`:80-88`) have no error handling | "no cards" (`:109-111`), "no transactions" (`:162`) | Missing error states |
| `/contact` | Button disabled while submitting (`:165`) | Inline error (`:163`) | n/a | — |
| `/partner-onboarding` | Spinner inside the submit buttons (`OnboardingForm.tsx:201`, `OtpVerificationForm.tsx:204`) | `serverError` inline (`OnboardingForm.tsx:59`); OTP errors inline | n/a | — |
| `/about`, `/faq`, `/host`, `/policies/*` | n/a (static) | n/a | n/a | — |

Additional gap: no `error.tsx`, `loading.tsx`, `not-found.tsx`, or `global-error.tsx` file exists anywhere under `src/app/` — the only `_not-found` route in the build output is the Next.js default.

---

## 14. Tests

### 14.1 Test files and coverage

| File | Tests | What it covers |
|---|---|---|
| `src/lib/cancellation/engine.test.ts` | 20 | Riyadh-midnight day boundary (`:42-57`); cutoff flip at the exact boundary instant (`:59-78`); `resolveTier` for all three templates (`:80-108`); `isBookingCancellable` across statuses and dates (`:110-127`); `previewCancellation` refund amounts (`:129-182`); snapshot independence from a later policy change (`:161-171`); `roundMoney` (`:184-189`) |
| `src/lib/api/adapters.test.ts` | 17 | `mapCancellationPreview` forfeited-amount logic incl. the 0 % regression (`:28-73`); guests split fallbacks (`:75-91`); `cancelledBy` closed set + fallback (`:93-103`); `user_id`/`guest_name` (`:105-111`); `mapUser` name-part handling incl. compound Arabic names (`:113-135`); `mapUser` role derivation (`:137-153`) |
| `src/lib/api/mock/index.test.ts` | 1 | Mock quote and mock booking creation produce identical subtotal/tax/total (`:15-36`) |
| `src/lib/utils/email.test.ts` | 2 | `isValidEmail` accept/reject cases (`:4-19`) |
| `src/lib/api/agent-skills.test.ts` | 8 | The committed `/.well-known/agent-skills/index.json` matches the SKILL.md files on disk (`:13-15`); schema URL (`:17-19`); non-empty (`:21-23`); required fields (`:25-27`); name/type/url/digest well-formedness (`:29-40`) |
| `src/components/features/booking/PriceBreakdown.test.tsx` | 1 | Subtotal/tax/total rows render, no cleaning or service fee row (`:15-31`) |
| `src/components/account/email-verification.test.tsx` | 6 | Settings first-time save + verify updates the store (`:96-119`); checkout starts at the form (`:121-128`); checkout renders nothing when already verified (`:130-137`); unverified badge (`:139-145`); verified badge (`:147-156`); 60 s resend countdown (`:159-178`) |
| `src/components/agents/WebMcpTools.test.tsx` | 6 | No-WebMCP no-throw (`:53-55`); registration via both API shapes (`:57-67`); every tool is read-only (`:71-75`); `search_units` output shape and absolute URL (`:77-92`); abort on unmount (`:94-105`) |
| `src/app/booking/[unitId]/checkout-page-client.test.tsx` | 5 | Pay button gated by `emailVerified` (`:61-81`); `EMAIL_VERIFICATION_REQUIRED` recovery preserves typed data (`:83-116`); quote renders verbatim with no client math (`:151-161`); frozen booking price replaces the quote (`:163-201`) |
| `src/app/units/[id]/page.test.tsx` | 2 (1 failing) | Subtotal-only estimate with no service fee (`:42-59`) — **FAILING**; nothing rendered before dates are picked (`:61-67`) |

Totals: 10 files, 76 tests, 75 passing. No coverage tool is configured (no `@vitest/coverage-*` dependency, no `coverage` script). No test setup file is configured (`vitest.config.ts` has no `setupFiles`), and no assertion-matcher extension such as `@testing-library/jest-dom` is installed — tests use `toBeTruthy()` / `toBeNull()`.

### 14.2 Critical paths with zero test coverage

| Path | Nothing covers |
|---|---|
| `http()` request wrapper | Header assembly, `{data}` unwrapping, 204/empty-body handling, error-envelope parsing, the 429→`RATE_LIMITED` normalisation — `src/lib/api/client.ts:109-180` |
| Silent token refresh | The whole 401 → refresh → replay → force-logout path, including the shared `refreshInFlight` de-duplication — `src/lib/api/client.ts:67-102`, `:132-137` |
| `tokenManager` | No test of storage, retrieval, or clearing — `src/lib/auth/tokens.ts` |
| Login flow | `LoginDialog` has no test: intent handling, `PHONE_NOT_REGISTERED` branch, `needsProfile` refusal, cooldown parsing — `src/components/features/auth/LoginDialog.tsx` |
| Registration flow | `RegisterDialog` has no test, including the swallowed `completeProfile` failure — `src/components/features/auth/RegisterDialog.tsx` |
| `OtpVerificationForm` | Auto-submit, paste handling, backspace navigation, resend cooldown, both variants — only exercised indirectly through the email-verification test |
| Partner onboarding | No test for `OnboardingForm` validation or `partnerRegister` — `src/app/partner-onboarding/page.tsx` |
| Payment page | `initiate`, saved-card quick pay, 3-DS redirect, simulate path, numeric-id guard — `src/app/payment/[bookingId]/page.tsx` |
| Payment callback | Verification, tampered-`pid` rejection, declined-status handling — `src/app/payment/callback/page.tsx` |
| Moyasar integration | `createCardToken`, `loadMoyasarAssets`, `initMoyasarForm` — `src/lib/payments/moyasar.ts` |
| Cancel-booking dialog | Preview fetch, not-allowed rendering, confirm + state propagation — `src/components/features/booking/CancelBookingDialog.tsx` |
| Booking list categorisation | The 4-tab split and the 14-day threshold — `src/app/my-reservations/page.tsx:46-62` |
| Favourites store | Optimistic toggle, rollback on failure, login merge, 404-stale pruning — `src/stores/favorites.ts` |
| Auth store | `setSession` / `updateUser` / `logout` and persistence — `src/stores/auth.ts` |
| Phone utilities | `normalizeSaudiPhone`, `toSaudiLocal`, `formatPhoneDisplay`, `maskPhone` — `src/lib/utils/phone.ts` |
| Format utilities | `formatSAR`, `formatDate`, `diffNights` — `src/lib/utils/format.ts` |
| Zod schemas | None of the seven schemas is tested — `src/lib/validation/schemas.ts` |
| `mapUnit` | The largest mapper is untested: image sorting, amenity fallback, status coercion, policy-details mapping — `src/lib/api/adapters.ts:282-319` |
| `mapPolicyDetails` | Hours→days conversion and tier sorting — `src/lib/api/adapters.ts:243-255` |
| Units listing page | Client-side filtering and sorting — `src/app/units/units-page-client.tsx:35-49`, `:85-95` |
| MCP server + data layer | Tool registration, the mock-mode refusal, timeout handling — `src/app/mcp/route.ts`, `src/lib/mcp/units.ts` |
| Markdown-for-agents | Middleware negotiation and the renderer's fallbacks — `src/middleware.ts`, `src/app/api/md/route.ts` |
| `robots.txt` / `sitemap.xml` / `auth.md` | Output shape — `src/app/robots.txt/route.ts`, `src/app/sitemap.ts`, `src/app/auth.md/route.ts` |
| Booking-confirmation document | HTML generation and the blocked-popup path — `src/lib/utils/booking-confirmation.ts` |
| i18n | No test asserts `ar`/`en` key parity (both files currently hold 958 leaf keys with no diff in either direction) |

---

## 15. Open Questions For Backend

Every item below is an assumption this repo makes that no file in `docs/backend/` confirms.

1. **`POST /bookings` ignores guest identity.** Checkout collects first name, last name, email and phone and sends none of them (`src/lib/api/client.ts:469-474`). Does the backend derive the guest from the Bearer token, and is `guest_name` (`src/lib/api/adapters.ts:112`) ever populated for bookings created this way?
2. **`guests` is sent as a single integer** (`adults + children`, `src/lib/api/client.ts:473`) while the response is read back as `guests_detail: { adults, children }` (`src/lib/api/adapters.ts:118`, `:337-342`). Is there a request-side field for the split? Requested at `docs/backend/mamsa-unit-fields-backend-task.md:89`, never answered.
3. **`paymentMethod` is accepted by `CreateBookingInput` but never sent** (`src/lib/api/client.ts:449` vs `:469-474`). Does `POST /bookings` accept a method, or is it decided entirely at `/payments/*` time?
4. **`notes` is always sent as an empty string** (`src/lib/api/client.ts:473`). Is the field required, and is there a maximum length?
5. **`POST /auth/request-otp` is reused as the registration trigger** (`src/lib/api/client.ts:254`). Is `intent: 'register'` sufficient to create the user row, or must `complete-profile` follow within a window?
6. **`complete-profile` failure is swallowed** (`src/components/features/auth/RegisterDialog.tsx:107-109`). What is the server state of an account that verified an OTP but never completed a profile — does `needs_profile` stay `true` indefinitely?
7. **`needs_profile` on the verify response** (`src/lib/api/client.ts:197`, `:239`) is documented nowhere. Confirm the field name and semantics.
8. **`PHONE_NOT_REGISTERED` / `PHONE_ALREADY_REGISTERED` codes** are branched on at `src/components/features/auth/LoginDialog.tsx:73` and `src/components/features/auth/RegisterDialog.tsx:74`. Neither appears in any backend document. Confirm the exact strings and the HTTP status.
9. **Rate-limit copy is parsed out of free text.** The login and register dialogs regex the Arabic/English error message for a seconds value (`src/components/features/auth/LoginDialog.tsx:80`, `src/components/features/auth/RegisterDialog.tsx:80`) instead of reading `retry_after`. Is `retry_after` always present on OTP throttles?
10. **`debug_otp`** is assumed to be present only in non-production environments (`src/lib/api/client.ts:200-203`). Confirm it can never appear in a production response.
11. **Phone wire format** is assumed to be local `05XXXXXXXX` on every endpoint (`src/lib/utils/phone.ts:27-30`). Confirm E.164 is not required anywhere.
12. **`POST /auth/partner/register` returns a token pair that this app discards** (`src/app/partner-onboarding/page.tsx:49-58`). Is issuing that session a side effect with server-side consequences?
13. **Partner `national_id` / `cr_number` are sent as `null` for the non-applicable type** (`src/lib/api/client.ts:280-281`). Is `null` accepted, or must the key be omitted?
14. **`POST /units/{id}/availability` response shape.** `pricing.tax_percent` (`src/lib/api/client.ts:355`) and the `available` boolean (`:404`) are assumed. Does an unavailable range return 200 with `available: false`, or an error status?
15. **Frozen-price guarantee.** Checkout assumes `booking.price` from `POST /bookings` is authoritative and immutable (`src/app/booking/[unitId]/checkout-page-client.tsx:53-54`, `:177`). Confirm it cannot change between booking creation and `/payments/initiate`.
16. **`/payments/initiate` idempotency.** The comment at `src/app/booking/[unitId]/checkout-page-client.tsx:165-167` asserts it is idempotent per booking. Confirm.
17. **`amount_halalas`** is passed straight to `Moyasar.init` with no validation (`src/lib/api/client.ts:627`, `src/lib/payments/moyasar.ts:98`). Confirm it is always exactly `amount × 100`.
18. **`callback_url` from `/payments/initiate` is ignored**; the app builds its own from `window.location.origin` (`src/lib/payments/moyasar.ts:94`). Does the backend validate the callback origin it receives from Moyasar?
19. **`/payments/pay` accepts exactly three body shapes** (`src/lib/api/client.ts:556-560`). Confirm, and confirm the tokenless simulate shape is rejected in production.
20. **`transaction_url` for 3-DS** is assumed to always be `https://` (the app refuses anything else, `src/app/payment/[bookingId]/page.tsx:103`). Confirm.
21. **`/payments/verify` idempotency** is assumed (`src/lib/api/client.ts:656-658`). Confirm repeated calls with the same `moyasar_id` are safe.
22. **Payment id types.** `pid` and `bookingId` are required to be purely numeric (`src/app/payment/callback/page.tsx:40`, `src/app/payment/[bookingId]/page.tsx:52`). Confirm booking and payment ids are always integers and never prefixed strings.
23. **`POST /bookings/{id}/cancel` returns a cancellation result, not the updated booking**, forcing a second `GET /bookings/{id}` (`src/lib/api/client.ts:494-509`). Confirm this is intended and that the follow-up read is consistent.
24. **`RefundRecord` after cancel is synthesised client-side** from the preview response plus `booking.cancelledAt` (`src/lib/api/client.ts:500-507`). Does the cancel response carry the authoritative refund record?
25. **`cancellation-preview` structured `tier`** (`src/lib/api/adapters.ts:177`) — requested at `docs/backend/mamsa-unit-fields-backend-task.md:116`; is it shipped? The app still keeps `tier_label` as a fallback (`src/lib/api/adapters.ts:421-422`).
26. **`total_amount` / `forfeited_amount` on the preview** (`src/lib/api/adapters.ts:172-176`) — requested at `docs/backend/mamsa-unit-fields-backend-task.md:110`; confirm both are now always present, since the reverse-division fallback is gone.
27. **`policy_snapshot` is `null` for unpaid bookings** (`src/lib/api/adapters.ts:141-144`, relied on at `src/components/features/booking/CancelBookingDialog.tsx:96-103`). Confirm the exact moment the snapshot is frozen — payment confirmation, not booking creation.
28. **Policy tier units.** The app divides `min_hours_before_checkin` by 24 and expects the three templates to land on 7/3/0 days (`src/lib/api/adapters.ts:238`). Confirm the backend uses 168/72/0 hours and not, say, 144.
29. **Refund day boundary.** The client computes eligibility against midnight Asia/Riyadh, UTC+3 (`src/lib/cancellation/engine.ts:32`). Confirm the server's refund engine uses the same boundary, or client and server will disagree at the edges.
30. **Legacy `cancellation_policy` enum removal.** The app still uses it as the pre-payment fallback (`src/lib/api/adapters.ts:315`, `:377`). `docs/backend/mamsa-unit-fields-backend-task.md:132` asks for advance notice; no timeline has been given.
31. **`features[]` filter accepts slugs.** `src/lib/api/client.ts:411-414` serialises slugs; `docs/backend/mamsa-reply-decisions-and-amenity-filter.md:42-54` reports that the backend matched Arabic labels and returned zero results. Has this been fixed? (No caller currently populates the field, so the bug is latent, not visible.)
32. **Amenity slug `tv`.** The legacy label table emits `tv` (`src/lib/api/adapters.ts:194-196`) which is absent from both the 15-slug vocabulary (`src/lib/constants/brand.ts:76-92`) and the icon map (`src/app/units/[id]/page.tsx:33-38`). Which is canonical, `tv` or `smart_tv`?
33. **`GET /units` query parameter names** (`city`, `type`, `capacity`, `start_date`, `end_date`, `min_price`, `max_price`, `min_rating`, `sort`) are assumed (`src/lib/api/client.ts:361-370`). Only `city`, `type`, `capacity` and `features[]` appear in any backend document.
34. **`sort` accepted values** `price_asc | price_desc | rating | newest` (`src/types/index.ts:205`) are undocumented.
35. **`/units/categories`, `/units/budgets`, `/units/cities`, `/testimonials`** and their field names (`image_url`, `discount_percent`, `valid_until_label`, `deal`, …) are assumed at `src/lib/api/adapters.ts:548-591`. None appears in any backend document. `/units/cities` is never called; `mapOffer` implies an `/offers` endpoint that this repo never calls.
36. **`GET /units/popular` semantics.** Is "popular" the same set as `is_featured`? The mock treats them as identical (`src/lib/api/mock/index.ts:165`).
37. **Review resource shape.** `mapReview` reads `user_name`, falling back to `name` (`src/lib/api/adapters.ts:436`), and `user_avatar_url` (`:437`). `docs/backend/mamsa-unit-fields-backend-task.md:92-93` asked for both to be pinned down; no answer exists.
38. **`booking.review` presence flag.** The app only checks truthiness (`src/lib/api/adapters.ts:378`) and the real `getForBooking` is a stub (`src/lib/api/client.ts:691`). Is there an endpoint to fetch a booking's review, and what is its exact shape?
39. **`GET /user/bookings` vs `GET /bookings/{id}`.** The list is under `/user/` but the detail is not (`src/lib/api/client.ts:457` vs `:462`). Confirm both, and whether the list is paginated (the app assumes a bare array).
40. **All list endpoints are assumed to return bare arrays**, not paginated envelopes — `http()` unwraps only a single `data` key (`src/lib/api/client.ts:176-178`). Confirm no endpoint returns `{ data: { data: [], meta: {} } }`.
41. **`/user/favorites` returns objects with an `id`** (`src/lib/api/client.ts:825`). Confirm the shape, and confirm `POST`/`DELETE /user/favorites/{unitId}` return 404 for a stale id — `src/stores/favorites.ts:57` prunes on exactly that status.
42. **Saved cards.** `chargeable` (`src/lib/api/adapters.ts:452`) gates quick pay and appears in no document. Confirm the field exists and when it is true.
43. **`POST /user/cards/from-token` metadata-only mode** (`src/lib/api/client.ts:795-799`) is assumed available whenever `test_mode` is true. Confirm.
44. **`GET /user/transactions`** field names `ref_code`, `type`, `amount` (signed), `date`, `status` (`src/lib/api/adapters.ts:456-465`) are assumed. Confirm the sign convention — the UI keys "incoming" purely off `amount > 0` (`src/app/account/payment-methods/page.tsx:166`).
45. **`POST /contact` body** is sent verbatim as `{ name, phone, email, message }` with no snake_case mapping (`src/lib/api/client.ts:849`) — unlike every other endpoint. Confirm the field names.
46. **`DELETE /user/account`** (`src/lib/api/client.ts:765`) is undocumented. Is deletion immediate or a soft delete, and are the tokens revoked server-side?
47. **`PUT /user/profile` and email.** `updateProfile` can send `email` (`src/lib/api/client.ts:707`), and `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:28` says that resets `verified` to false. The account page never sends it, so the app never observes the reset — confirm the behaviour still holds.
48. **Email verification: no `/auth/me` refetch.** The app mutates the local store instead (`src/components/account/email-verification.tsx:123`), contrary to `docs/backend/NEXTJS-EMAIL-VERIFICATION-IMPLEMENTATION.md:100`. Is the local flag guaranteed to match the server?
49. **`EMAIL_VERIFICATION_REQUIRED` in production.** `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:50` says the gate is OFF in production until the frontend ships the screen. The screen has shipped — has the flag been flipped?
50. **`/account/*` aliases.** `docs/backend/NEXTJS-EMAIL-ACCOUNT-ALIASES.md:32` asks the frontend to pick one form; this repo uses `/user/*` exclusively. Confirm the aliases are permanent and that no code path should be switched.
51. **OTP validity and attempts.** `OTP_CONFIG` declares 60 s expiry and 3 attempts (`src/lib/constants/brand.ts:56-57`); the backend contract states 300 s and 5 attempts for email (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:40-41`). Which applies to the **phone** OTP?
52. **`NEXT_PUBLIC_MOCK_OTP` default drift.** Code falls back to `111222` (`src/lib/api/mock/index.ts:27`); `.env.example:19` says `123456`. Which matches staging's `OTP_FIXED_CODE`?
53. **Commission.** `docs/backend/NEXTJS-EMAIL-VERIFICATION.md:57` mentions a frozen 2 % commission. Will any consumer-facing surface ever need to display it? Nothing in this repo models it.
54. **Image host.** The API is expected to serve unit images from `api.mamsaa.com/storage/...` (`docs/backend/Mamsa-Switch-To-Production.md:47`), but `next.config.js:10-13` whitelists only the two Unsplash hosts, and the app uses plain `<img>` tags for unit images rather than `next/image`. Confirm the intended host so the whitelist can be assessed.
55. **Owner avatar host.** `unit.owner.avatar_url` is rendered with a lint-suppressed `<img>` because the host is unknown (`src/app/units/[id]/page.tsx:183-188`). What host serves it?
56. **`GET /auth/me` vs `GET /user/profile`.** Both are documented as returning `email` + `email_verified` (`docs/backend/NEXTJS-EMAIL-VERIFICATION.md:18`). This repo only calls `/auth/me`; confirm `first_name`/`last_name`/`avatar_url` are on it too.
57. **Error envelope on non-JSON failures.** `http()` falls back to `res.statusText` when the body is not JSON (`src/lib/api/client.ts:157-159`). Do gateway/proxy errors (502/504) return HTML?
58. **Refresh token rotation.** `tokenManager.setTokens` treats the refresh token as optional on refresh (`src/lib/auth/tokens.ts:29-33`). Does `/auth/refresh` always return a new refresh token, or only sometimes?
59. **Access-token lifetime.** `src/lib/api/client.ts:63` asserts `expires_in: 3600`. Confirm, and confirm whether the refresh token has its own expiry the client should surface.
60. **CORS and credentials.** No request sets `credentials` (`src/lib/api/client.ts:111-126`), so the app is pure Bearer. Confirm no cookie is required for any user-app endpoint.
