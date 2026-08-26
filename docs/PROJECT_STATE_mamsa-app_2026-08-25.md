---
repo: mamsa-app
repo_remote: https://github.com/vego-group/mamsa-frontend.git
branch: main
last_commit_sha: 7e5d14c2c0018b7554a16cfc32ac2d8ea098ef5d
last_commit_date: 2026-08-17T02:57:30+03:00
generated_at: 2026-08-25
working_tree: clean
counts:
  routes: 31            # 25 page routes + 4 route handlers + sitemap.ts + Next built-in /_not-found
  pages: 25
  components: 43        # non-test files under src/components (ui 14, shared 8, features 19, account+agents 2)
  zustand_stores: 4
  api_functions: 48     # exported members across authApi/unitsApi/contentApi/bookingsApi/paymentsApi/reviewsApi/accountApi/favoritesApi/miscApi
  endpoints_total: 46   # 45 Mamsa API paths + 1 third-party (Moyasar tokens)
  endpoints_wired_to_real_backend: 45
  endpoints_mock_only: 0            # see 9b — 1 API *function* is mock-only with no endpoint behind it
  endpoints_missing_from_backend: 6 # see 9c
  test_files: 15
  todos_found: 0        # zero TODO/FIXME/HACK/@ts-ignore in src/
  build_status: pass
  lint_status: pass
  test_status: pass     # 15 files / 138 tests, 0 failed
---

# PROJECT STATE — `mamsa-app`

Read-only audit of the Mamsa user-facing website. Every claim carries a `path:line`.
Nothing in this repository was modified; this file is the only artefact created.

**Repo note.** The `REPO:` placeholder in the audit request was left unfilled
(`<<< اكتب هنا واحد من: … >>>`). The working directory is
`c:\Users\user\Documents\Websites\mamsa-app\mamsa-app`, whose `package.json:2`
declares `"name": "mamsa-app"`, so this audit targets **mamsa-app**.

**Live-API verification.** Section 9 carries a "verified against live API?"
column. Verification was performed on 2026-08-25 with **unauthenticated,
read-only `GET`/quote requests only** against `https://api.mamsaa.com/api/v1`
(the value of `NEXT_PUBLIC_API_BASE_URL` in `.env.local`). No write endpoint was
called, no OTP was dispatched, no booking, payment, contact message or account
was created. Endpoints requiring a session are marked `no — needs auth`.

---

## 1. Repo identity & stack

### 1.1 package.json identity

| Field | Value | Source |
|---|---|---|
| `name` | `mamsa-app` | `package.json:2` |
| `version` | `1.0.0` | `package.json:3` |
| `private` | `true` | `package.json:4` |
| `description` | `Mamsa Platform — User Website (Next.js 14, TypeScript, TailwindCSS, shadcn/ui)` | `package.json:5` |
| Package manager | **pnpm** (lockfile `pnpm-lock.yaml`, 257,495 bytes) | repo root |
| `packageManager` field | ⚠️ **absent** — no pinned pnpm version | `package.json` |
| `engines` field | ⚠️ **absent** — no Node version constraint in `package.json` | `package.json` |
| Node version (documented only) | `Node.js 18.18+ (يُنصح بـ 20+)` | `README.md:16` |
| `.nvmrc` / `.node-version` | ⚠️ **absent** | repo root |

### 1.2 Dependencies (exact versions as declared)

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
| `leaflet` | `1.9.4` (pinned) | `package.json:34` |
| `lucide-react` | `^0.445.0` | `package.json:35` |
| `mcp-handler` | `^1.1.0` | `package.json:36` |
| `next` | `14.2.13` (pinned) | `package.json:37` |
| `next-intl` | `^4.13.1` | `package.json:38` |
| `node-html-markdown` | `^2.0.0` | `package.json:39` |
| `qrcode.react` | `^4.2.0` | `package.json:40` |
| `react` | `^18.3.1` | `package.json:41` |
| `react-dom` | `^18.3.1` | `package.json:42` |
| `react-hook-form` | `^7.53.0` | `package.json:43` |
| `react-leaflet` | `4.2.1` (pinned) | `package.json:44` |
| `tailwind-merge` | `^2.5.2` | `package.json:45` |
| `tailwindcss-animate` | `^1.0.7` | `package.json:46` |
| `zod` | `^3.23.8` | `package.json:47` |
| `zustand` | `^4.5.5` | `package.json:48` |

**Dependencies with zero import anywhere in `src/`:**

| Package | Evidence |
|---|---|
| `@radix-ui/react-select` | `grep -rl "@radix-ui/react-select" src/` → no matches. No `src/components/ui/select.tsx` exists. |
| `@radix-ui/react-toast` | `grep -rl "@radix-ui/react-toast" src/` → no matches. Toasts are hand-rolled in `src/stores/toast.ts` + `src/components/shared/ToastHost.tsx`. |
| `@modelcontextprotocol/sdk` | No direct import in `src/`; reached transitively through `mcp-handler` (`src/app/mcp/route.ts:14`). Declaring it directly is defensible (peer of `mcp-handler`) but this repo's own code never imports it. |
| `@tanstack/react-query` | Imported **only** by `src/components/shared/QueryProvider.tsx:3`. `grep -rn "useQuery\|useMutation\|useQueryClient\|useInfiniteQuery" src/` → **no matches**. The provider is mounted at `src/app/layout.tsx:53` but no component consumes it — every page fetches with raw `useEffect` + `useState`. |

### 1.3 devDependencies

| Package | Version | Line |
|---|---|---|
| `@testing-library/react` | `^16.0.1` | `package.json:51` |
| `@types/leaflet` | `^1.9.21` | `package.json:52` |
| `@types/node` | `^22.5.5` | `package.json:53` |
| `@types/react` | `^18.3.7` | `package.json:54` |
| `@types/react-dom` | `^18.3.0` | `package.json:55` |
| `@vitejs/plugin-react` | `^4.3.1` | `package.json:56` |
| `autoprefixer` | `^10.4.20` | `package.json:57` |
| `eslint` | `^8.57.1` | `package.json:58` |
| `eslint-config-next` | `14.2.13` (pinned) | `package.json:59` |
| `happy-dom` | `^15.7.4` | `package.json:60` |
| `postcss` | `^8.4.47` | `package.json:61` |
| `prettier` | `^3.3.3` | `package.json:62` |
| `prettier-plugin-tailwindcss` | `^0.6.6` | `package.json:63` |
| `tailwindcss` | `^3.4.12` | `package.json:64` |
| `typescript` | `^5.6.2` | `package.json:65` |
| `vitest` | `^2.1.1` | `package.json:66` |

⚠️ `@testing-library/jest-dom` is **not** installed. Tests assert with
`toBeTruthy()` / `toBeNull()` rather than `toBeInTheDocument()`.

### 1.4 npm scripts

| Script | Command | What it does | Line |
|---|---|---|---|
| `dev` | `next dev` | Dev server on :3000 | `package.json:7` |
| `build` | `next build` | Production build | `package.json:8` |
| `start` | `next start` | Serves the production build | `package.json:9` |
| `lint` | `next lint` | ESLint via `eslint-config-next` | `package.json:10` |
| `type-check` | `tsc --noEmit` | Type-only check, emits nothing | `package.json:11` |
| `test` | `vitest run` | One-shot test run | `package.json:12` |
| `test:watch` | `vitest` | Watch-mode tests | `package.json:13` |
| `skills:index` | `node scripts/build-agent-skills-index.mjs` | Regenerates `public/.well-known/agent-skills/index.json` with SHA-256 digests of each `SKILL.md` | `package.json:14` |

⚠️ No `format` script despite Prettier + `prettier-plugin-tailwindcss` being
installed (`package.json:62-63`, `.prettierrc`). No CI configuration exists in
the repo (no `.github/`, no `vercel.json`).

### 1.5 Framework & router

| Aspect | Value | Source |
|---|---|---|
| Framework | Next.js **14.2.13** | `package.json:37` |
| Router | **App Router** (`src/app/`, `layout.tsx` + `page.tsx` convention) | `src/app/layout.tsx:42` |
| Pages Router | Not present — no `src/pages/` directory | filesystem |
| React | 18.3.1, `reactStrictMode: true` | `next.config.js:9` |
| i18n plugin | `next-intl/plugin` pointed at `./src/i18n/request.ts` | `next.config.js:1-4` |
| Server/client split | 12 of 25 pages are Server Components; 57 files carry `'use client'` | see §6 |
| Rendering | 26 routes `ƒ (Dynamic)`, 4 `○ (Static)` (`/auth.md`, `/robots.txt`, `/sitemap.xml`, `/_not-found`) | `next build` output, §17 |

### 1.6 TypeScript strictness (`tsconfig.json`)

| Flag | Value | Line |
|---|---|---|
| `target` | `ES2022` | `tsconfig.json:3` |
| `lib` | `["dom","dom.iterable","esnext"]` | `tsconfig.json:4` |
| `allowJs` | `false` | `tsconfig.json:5` |
| `skipLibCheck` | `true` | `tsconfig.json:6` |
| **`strict`** | **`true`** | `tsconfig.json:7` |
| `noEmit` | `true` | `tsconfig.json:8` |
| `esModuleInterop` | `true` | `tsconfig.json:9` |
| `module` / `moduleResolution` | `esnext` / `bundler` | `tsconfig.json:10-11` |
| `resolveJsonModule` | `true` | `tsconfig.json:12` |
| `isolatedModules` | `true` | `tsconfig.json:13` |
| `jsx` | `preserve` | `tsconfig.json:14` |
| `incremental` | `true` | `tsconfig.json:15` |
| `paths` | `{"@/*": ["./src/*"]}` | `tsconfig.json:17-19` |
| `forceConsistentCasingInFileNames` | `true` | `tsconfig.json:21` |
| **`noUncheckedIndexedAccess`** | **`true`** | `tsconfig.json:22` |

Flags **not** enabled: `noUnusedLocals`, `noUnusedParameters`,
`exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
`verbatimModuleSyntax`. `strict` + `noUncheckedIndexedAccess` together are
already stricter than most Next.js projects. `tsconfig.tsbuildinfo` (283 KB)
sits at the repo root but is git-ignored (`.gitignore:11`).

### 1.7 Tailwind config highlights (`tailwind.config.ts`)

| Item | Value | Line |
|---|---|---|
| `darkMode` | `['class']` — declared but **no dark styles exist** (`grep "dark:" src/` → 0 hits) | `tailwind.config.ts:4` |
| `content` | `['./src/**/*.{ts,tsx}']` | `tailwind.config.ts:5` |
| `container` | centered, `padding: 1rem`, `2xl: 1400px` | `tailwind.config.ts:7` |
| Brand palette | `primary #2E5339`, `primaryDark #244229`, `primaryLight #3E6B4D`, `sage #A8B89E`, `sageDark #8FA384`, `cream #F5F1E8`, `surface #F7F7F4`, `ink #1F2A24`, `muted #6B7A70`, `border #E5E0D5` | `tailwind.config.ts:10-21` |
| Status palette | `success #2F855A`, `warning #D69E2E`, `danger #C53030`, `info #3182CE` | `tailwind.config.ts:22-27` |
| shadcn tokens | `background/foreground/primary/secondary/destructive/muted/accent/popover/card/border/input/ring` → `hsl(var(--…))` | `tailwind.config.ts:29-43` |
| `borderRadius` | `lg 14px`, `md 10px`, `sm 8px` | `tailwind.config.ts:45` |
| `fontFamily` | `sans/arabic/latin` from `--font-arabic` (IBM Plex Sans Arabic) and `--font-latin` (Inter) | `tailwind.config.ts:46-50` |
| Plugins | `tailwindcss-animate` only | `tailwind.config.ts:63` |
| HSL token values | `src/app/globals.css:6-37` |

`brand.surface` (`#F7F7F4`) and `status.info` (`#3182CE`) are defined but never
referenced in `src/` — dashboard-oriented leftovers.

### 1.8 shadcn/ui components installed

There is **no `components.json`** — the primitives were hand-placed rather than
generated by the shadcn CLI. Fourteen files under `src/components/ui/`:

| File | Exports | Radix primitive | Consumers (prod) |
|---|---|---|---|
| `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` | `@radix-ui/react-avatar` | 1 (`Header.tsx`) — `AvatarImage` **unused** |
| `badge.tsx` | `Badge`, `BadgeProps` | none (CVA only) | 6 |
| `button.tsx` | `Button`, `ButtonProps`, `buttonVariants` | `@radix-ui/react-slot` | 25 — `buttonVariants` **unused outside `ui/`** |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | none | 15 — only `Card` used; 5 sub-components **unused** |
| `checkbox.tsx` | `Checkbox` | `@radix-ui/react-checkbox` | 2 |
| `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` | `@radix-ui/react-dialog` | 4 — `DialogTrigger`/`DialogPortal`/`DialogClose` **unused** |
| `dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` | `@radix-ui/react-dropdown-menu` | 1 — `Group`/`Portal` **unused** |
| `input.tsx` | `Input` | none | 6 |
| `label.tsx` | `Label` | `@radix-ui/react-label` | 10 |
| `phone-input.tsx` | `PhoneInput` | none (custom: strips `05`/`966`, caps at 9 digits) | 5 |
| `separator.tsx` | `Separator`, `Skeleton` | `@radix-ui/react-separator` | 3 — **only `Skeleton` imported**; `Separator` unused |
| `slider.tsx` | `Slider` | `@radix-ui/react-slider` | 1 |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@radix-ui/react-tabs` | 1 |
| `textarea.tsx` | `Textarea` | none | 3 |

`Skeleton` living inside `separator.tsx` (`src/components/ui/separator.tsx:24`)
is a filing oddity: three pages import a skeleton from a module named
"separator".

---

## 2. Directory map

```
mamsa-app/
├── docs/                                  # written docs, not shipped
│   ├── audit/                             #   previous project-state audit (2026-08-12)
│   └── backend/                           #   9 backend hand-off / contract notes
├── messages/                              # next-intl catalogues (ar.json 87 KB, en.json 69 KB, 1019 keys each)
├── public/                                # static assets served at the domain root
│   └── .well-known/                       #   agent + payment discovery documents
│       ├── agent-skills/                  #     Agent Skills Discovery RFC v0.2.0 index + 2 SKILL.md
│       └── mcp/                           #     MCP Server Card (SEP-1649)
├── scripts/                               # build-time node scripts (agent-skills index generator)
└── src/
    ├── app/                               # Next.js App Router — every route lives here
    │   ├── about/                         #   static marketing page (server)
    │   ├── account/                       #   profile settings (client)
    │   │   ├── payment-methods/           #     saved cards + transaction history
    │   │   └── phone/                     #     phone-change OTP flow
    │   ├── api/md/                        #   Markdown-for-agents renderer (route handler)
    │   ├── auth.md/                       #   agent auth-policy document (route handler)
    │   ├── booking/                       #   checkout
    │   │   ├── [unitId]/                  #     Suspense shell + client checkout form
    │   │   └── confirmation/[bookingId]/  #     post-payment success screen
    │   ├── contact/                       #   public contact form (client)
    │   ├── faq/                           #   static FAQ (server)
    │   ├── favorites/                     #   saved units (client)
    │   ├── host/                          #   partner marketing landing (server)
    │   ├── mcp/                           #   MCP Streamable-HTTP server (route handler)
    │   ├── my-reservations/               #   booking list (4 tabs)
    │   │   └── [bookingId]/               #     booking detail
    │   │       └── invoice/               #       ZATCA tax invoice (print-optimised)
    │   ├── partner-onboarding/            #   3-step partner sign-up (full-screen)
    │   ├── payment/                       #   Moyasar payment
    │   │   ├── [bookingId]/               #     hosted form / quick-pay / simulate
    │   │   └── callback/                  #     server-verified payment return
    │   ├── picks/                         #   curated listings by category (server shell)
    │   ├── policies/                      #   5 legal pages, one shared shell
    │   ├── robots.txt/                    #   robots.txt with Content-Signal (route handler)
    │   ├── units/                         #   search results
    │   │   └── [id]/                      #     unit detail + booking widget
    │   ├── layout.tsx                     #   RTL/LTR root shell, fonts, providers, header/footer
    │   ├── sitemap.ts                     #   sitemap.xml (13 static routes)
    │   ├── globals.css                    #   Tailwind layers, CSS tokens, Leaflet pins, print CSS
    │   └── favicon.ico
    ├── components/
    │   ├── account/                       #   EmailVerificationCard (checkout + settings)
    │   ├── agents/                        #   WebMCP in-browser tool registration
    │   ├── features/                      #   domain components
    │   │   ├── auth/                      #     login/register dialogs, OTP form, onboarding form
    │   │   ├── booking/                   #     booking card, cancel dialog, price breakdown, policy display
    │   │   ├── home/                      #     map explorer, picks, testimonials
    │   │   ├── reviews/                   #     review dialog
    │   │   └── units/                     #     unit card, filter bar, sidebar filters, gallery
    │   ├── shared/                        #   header, footer, providers, toast host, policy shell
    │   └── ui/                            #   14 shadcn-style primitives
    ├── data/mock/                         # fixtures: units, bookings, reviews, users
    ├── i18n/                              # cookie-based locale resolution (next-intl)
    ├── lib/
    │   ├── api/                           #   the entire API layer + mock implementation
    │   │   └── mock/                      #     in-memory backend role-play
    │   ├── auth/                          #   TokenManager (sole owner of localStorage tokens)
    │   ├── cancellation/                  #   pure refund/tier engine
    │   ├── constants/                     #   brand + cancellation-policy presets
    │   ├── mcp/                           #   server-side data access for the MCP route
    │   ├── payments/                      #   Moyasar hosted-form + tokenisation helpers
    │   ├── utils/                         #   formatting, phone, email, cn, print-confirmation
    │   ├── validation/                    #   Zod schema factories (locale-aware)
    │   └── pricing.ts                     #   the only module allowed to do VAT arithmetic
    ├── stores/                            # 4 Zustand stores
    ├── types/                             # domain contract types + css module shim
    └── middleware.ts                      # Accept: text/markdown content negotiation
```

---

## 3. Environment variables

### 3.1 Every `process.env` read in the repo

| VAR_NAME | Required? | Default in code | Where read (file:line) | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** for real mode | `''` | `src/lib/api/client.ts:49`; `src/lib/mcp/units.ts:17` | Laravel API base, includes `/api/v1`. Empty ⇒ every real `fetch` targets a relative path and 404s; the MCP route throws `McpDataError` instead (`src/lib/mcp/units.ts:30-32`). |
| `NEXT_PUBLIC_USE_MOCK` | No | `undefined` ⇒ mock ON | `src/lib/api/client.ts:48`; `src/lib/mcp/units.ts:18` | The single mock/real switch. `!== 'false'` ⇒ **mock is the default when unset**. |
| `NEXT_PUBLIC_SITE_URL` | No | `'https://www.mamsaa.com'` | `src/lib/constants/brand.ts:11`; `src/app/mcp/route.ts:21` | Canonical public origin for `robots.txt`, `sitemap.xml`, `auth.md`, MCP unit URLs. Trailing slashes stripped in `brand.ts`. |
| `NEXT_PUBLIC_MOCK_OTP` | No | `'111222'` | `src/lib/api/mock/index.ts:28` | Fixed OTP accepted by the mock auth layer (phone **and** email). |
| `NEXT_PUBLIC_DASHBOARD_URL` | No | `''` | `src/lib/constants/brand.ts:31` | Partner dashboard origin. ⚠️ **Consumed nowhere** — `DASHBOARD_URL` / `DASHBOARD_LOGIN_URL` (`brand.ts:31,33`) have zero importers in `src/`. |
| `NODE_ENV` | Set by Next | — | `src/components/features/auth/DebugOtpHint.tsx:16` | Second line of defence hiding the backend's `debug_otp` in production builds. |

### 3.2 `.env.example` — full contents (no secret values are present in this file)

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

### 3.3 `.env.local` — present, untracked (`.gitignore:4`), applied to the build

The file holds only URLs and a boolean — **no token, key or credential of any
kind**, so nothing here requires masking:

```
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com/api/v1
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_DASHBOARD_URL=            # empty
```

`next build` confirms it is loaded: `- Environments: .env.local` (§17).

### 3.4 Drift between `.env.example`, `.env.local` and the code

| Variable | In `.env.example` | In `.env.local` | Read in code | Verdict |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | ✅ | ✅ | consistent |
| `NEXT_PUBLIC_USE_MOCK` | ✅ | ✅ | ✅ | consistent |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ❌ **missing** | ✅ | Falls back to `https://www.mamsaa.com` (`brand.ts:11`). Harmless in production, wrong locally: `sitemap.xml`/`robots.txt` served from `localhost:3000` advertise the production domain. |
| `NEXT_PUBLIC_MOCK_OTP` | ✅ (`123456`) | ❌ **missing** | ✅ | Code default is `'111222'` (`mock/index.ts:28`) — **the template and the code default disagree**. With no `.env.local` entry the working code is `111222`, not the documented `123456`. |
| `NEXT_PUBLIC_DASHBOARD_URL` | ❌ **missing from `.env.example`** | ✅ (empty) | ✅ (never consumed) | Undocumented and dead. Either wire it up or delete `brand.ts:28-33`. |

---

## 4. Route map (exhaustive)

There is **no route-based auth in this application.** `src/middleware.ts` does
content negotiation only; nothing redirects an unauthenticated visitor. The
"auth required?" column means *"this page's data fetch 401s without a session"*,
not *"the router blocks you"*. See §12.

| Route path | File path | Layout | Auth required? | Role | Dynamic params | Data source | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | root | No | — | — | **Real API** (SSR): `/units/popular`, `/testimonials`, `/units/categories`, `/units/budgets` | partial | 3 sections hidden behind `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` (`page.tsx:41`). Category & hero images hardcoded to Unsplash (`page.tsx:23-27, 92`). |
| `/units` | `src/app/units/page.tsx` → `units-page-client.tsx` | root | No | — | — | **Real API** `GET /units` | partial | **No error state**, **no pagination** — §5.2. |
| `/units/[id]` | `src/app/units/[id]/page.tsx` | root | No | — | `id` | **Real API** `GET /units/{id}`, `GET /units/{id}/reviews` | complete | Share button has no handler (`page.tsx:157-159`). |
| `/picks` | `src/app/picks/page.tsx` | root | No | — | `?cat=` | **Real API** `GET /units?type=…` | complete | Metadata is hardcoded Arabic, not from `messages/` (`picks/page.tsx:4-7`). |
| `/booking/[unitId]` | `src/app/booking/[unitId]/page.tsx` → `checkout-page-client.tsx` | root | **Yes** | user | `unitId`, `?checkIn/checkOut/guests` | **Real API** `GET /units/{id}`, `POST /units/{id}/availability`, `POST /bookings`, `GET /user/bookings` | complete | 4 collected guest fields are never sent — §5.5. |
| `/booking/confirmation/[bookingId]` | `src/app/booking/confirmation/[bookingId]/page.tsx` | root | **Yes** | user | `bookingId` | **Real API** `GET /bookings/{id}` | complete | Reassuring fallback card when the fetch fails after a verified payment. |
| `/payment/[bookingId]` | `src/app/payment/[bookingId]/page.tsx` | root | **Yes** | user | `bookingId` | **Real API** `POST /payments/initiate`, `GET /user/cards`, `POST /payments/pay` + Moyasar CDN | complete | Route param must be `^\d+$` (`page.tsx:54`). |
| `/payment/callback` | `src/app/payment/callback/page.tsx` | root | **Yes** | user | `?pid&id&status&message` | **Real API** `POST /payments/verify` | complete | Path is load-bearing — the backend's `FRONTEND_URL` redirect targets it (`page.tsx:11`). |
| `/my-reservations` | `src/app/my-reservations/page.tsx` | root | **Yes** | user | — | **Real API** `GET /user/bookings` | complete | 4 tabs, 14-day upcoming/active split (`page.tsx:58`). |
| `/my-reservations/[bookingId]` | `src/app/my-reservations/[bookingId]/page.tsx` | root | **Yes** | user | `bookingId` | **Real API** `GET /bookings/{id}`; `reviewsApi.getForBooking` → **always `null` in real mode** | partial | **No error state** — a failed fetch hangs on "loading" forever (`page.tsx:41-45`). |
| `/my-reservations/[bookingId]/invoice` | `src/app/my-reservations/[bookingId]/invoice/page.tsx` | root | **Yes** | user | `bookingId` | **Real API** `GET /bookings/{id}`, `GET /bookings/{id}/invoice` | partial | ZATCA QR renders a placeholder until the backend supplies `qr_code` (`page.tsx:218-224`). |
| `/favorites` | `src/app/favorites/page.tsx` | root | No (list) / Yes (sync) | user | — | **Real API** `GET /units`, filtered client-side by the local store | partial | **No error state — infinite spinner on failure** (`page.tsx:18-23`). |
| `/account` | `src/app/account/page.tsx` | root | **Yes** | user | — | **Real API** `GET /auth/me`, `PUT /user/profile`, `DELETE /user/account` | partial | Save/delete failures are silent (`page.tsx:42-69`). |
| `/account/phone` | `src/app/account/phone/page.tsx` | root | **Yes** | user | — | **Real API** `POST /user/change-phone`, `POST /user/change-phone/verify` | complete | — |
| `/account/payment-methods` | `src/app/account/payment-methods/page.tsx` | root | **Yes** | user | — | **Real API** `GET /user/cards`, `GET /user/transactions`, `GET /payments/config`, `POST /user/cards/from-token`, `DELETE /user/cards/{id}`, `POST /user/cards/{id}/default` + Moyasar tokens | partial | **No error state** on load or on any mutation (`page.tsx:69-88`). |
| `/partner-onboarding` | `src/app/partner-onboarding/page.tsx` | root (visually overridden by `fixed inset-0`) | No | — | — | **Real API only** `POST /auth/request-otp`, `POST /auth/partner/register` | complete | ⚠️ **No mock branch** — broken when `NEXT_PUBLIC_USE_MOCK` is not `false`. |
| `/host` | `src/app/host/page.tsx` | root | No | — | — | Static (`messages/*.json`) | complete | Hero image hardcoded to Unsplash (`page.tsx:56`). |
| `/about` | `src/app/about/page.tsx` | root | No | — | — | Static + `BRAND` constants | complete | Stats band values are message-file copy, not live data (`page.tsx:26-31`). |
| `/contact` | `src/app/contact/page.tsx` | root | No | — | — | **Real API** `POST /contact` | complete | Side image hardcoded to Unsplash (`page.tsx:176`). |
| `/faq` | `src/app/faq/page.tsx` | root | No | — | — | Static; item counts hardcoded (`page.tsx:14-20`) | complete | Adding an FAQ entry to `messages/` without bumping `GROUP_ITEM_COUNT` silently drops it. |
| `/policies/cancellation` | `src/app/policies/cancellation/page.tsx` | root | No | — | — | Static + `POLICY_REGISTRY` | complete | Renders the same presets checkout uses (`page.tsx:15`). |
| `/policies/safety` | `src/app/policies/safety/page.tsx` | root | No | — | — | Static | complete | — |
| `/policies/house-rules` | `src/app/policies/house-rules/page.tsx` | root | No | — | — | Static | complete | — |
| `/policies/privacy` | `src/app/policies/privacy/page.tsx` | root | No | — | — | Static + `BRAND` | complete | — |
| `/policies/terms` | `src/app/policies/terms/page.tsx` | root | No | — | — | Static + `BRAND` | complete | — |
| `/api/md` | `src/app/api/md/route.ts` (GET) | — | No | — | `?path=` | Self-fetches its own origin, converts HTML→Markdown | complete | `runtime: 'nodejs'`, `dynamic: 'force-dynamic'`. Rejects non-`/` and `//` paths (`route.ts:31-33`). |
| `/auth.md` | `src/app/auth.md/route.ts` (GET) | — | No | — | — | Static string | complete | `dynamic: 'force-static'`. Hardcodes `API_BASE` (`route.ts:19`) instead of reading the env var. |
| `/mcp` | `src/app/mcp/route.ts` (GET/POST/DELETE) | — | No | — | — | **Real API only** via `src/lib/mcp/units.ts` | complete | Refuses to serve mock data (`units.ts:29-36`). SSE disabled, stateless. |
| `/robots.txt` | `src/app/robots.txt/route.ts` (GET) | — | No | — | — | Static string built from `SITE_URL` | complete | Emits an RFC-draft `Content-Signal` line that `MetadataRoute.Robots` cannot express (`route.ts:5-9`). |
| `/sitemap.xml` | `src/app/sitemap.ts` | — | No | — | — | Static list of 13 routes | partial | Unit detail pages are **not** enumerated (`sitemap.ts:10-12`). |
| `/_not-found` | — | root | No | — | — | Next.js built-in | stub | ⚠️ **No custom `not-found.tsx` exists.** |

### 4.1 `middleware.ts` behaviour

`src/middleware.ts:14-33`. For every request:

1. Read the `Accept` header (`:15`).
2. If it does **not** contain `text/markdown` → `NextResponse.next()` (`:18-20`). Browsers always take this path, so the middleware is inert for human traffic.
3. If the request carries `x-md-render` (the renderer's own self-fetch) → `next()` (`:23-25`), preventing a loop.
4. Otherwise **rewrite** (URL unchanged for the client) to `/api/md?path=<original path+query>` (`:29-33`).

Matcher (`:45`): `/((?!api|mcp|_next/static|_next/image|.*\..*).*)` — excludes
`/api/*`, `/mcp`, Next internals, and anything with a file extension (so
`robots.txt`, `sitemap.xml`, `/.well-known/*` are untouched). Build reports the
middleware at **26.5 kB**.

### 4.2 Redirects, 404, error and loading files

| Convention | Present? | Evidence |
|---|---|---|
| `next.config.js` `redirects()` | ❌ none | `next.config.js` defines only `images` + `headers` |
| `next.config.js` `rewrites()` | ❌ none | ibid. |
| `not-found.tsx` | ❌ **none anywhere** | `find src/app -name 'not-found.tsx'` → 0 |
| `error.tsx` | ❌ **none anywhere** | `find src/app -name 'error.tsx'` → 0 |
| `global-error.tsx` | ❌ none | ibid. |
| `loading.tsx` | ❌ **none anywhere** | `find src/app -name 'loading.tsx'` → 0 |
| `template.tsx` | ❌ none | ibid. |
| `layout.tsx` | 1 only (root) | `src/app/layout.tsx` |
| Route groups `(…)` | ❌ none used | filesystem |
| In-page Suspense | 4 sites | `src/app/page.tsx:104`, `src/app/units/page.tsx:6`, `src/app/booking/[unitId]/page.tsx:6`, `src/app/payment/callback/page.tsx:107` |

**Consequence:** an uncaught render error anywhere produces Next's unstyled
default error screen — no branded boundary, no Arabic copy, no RTL.

### 4.3 Response headers (`next.config.js:20-73`)

| Path | Header | Value |
|---|---|---|
| `/.well-known/apple-developer-merchantid-domain-association` | `Content-Type` | `application/octet-stream` |
| `/.well-known/api-catalog` | `Content-Type` | `application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"` |
| `/:path*` | `X-Content-Type-Options` | `nosniff` |
| `/:path*` | `X-Frame-Options` | `SAMEORIGIN` |
| `/:path*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `/:path*` | `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `/:path*` | `Link` | `</.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card"` |

⚠️ **No `Content-Security-Policy` and no `Strict-Transport-Security`.** The CSP
omission is deliberate and documented (`next.config.js:41-44`): moyasar.js
injects inline styles/scripts and `data:` images, so a CSP must ship in
Report-Only first. HSTS is simply absent with no stated reason.

---

## 5. Page-by-page detail

Legend for states: ✅ handled · ❌ **missing** · n/a not applicable.

### 5.1 `/` — `src/app/page.tsx` (Server Component)

- **Purpose:** marketing home — hero search, category tiles, map explorer, curated picks, how-it-works, trust band.
- **Components:** `FilterBar` (`components/features/units/FilterBar.tsx`), `UnitCard`, `TestimonialCarousel`, `PicksSection`, `LocationExplorer`, plus local `SectionHeader` (`:259`) and `FeatureItem` (`:277`).
- **Data:** `contentApi.popular()` → `GET /units/popular`; `contentApi.testimonials()` → `GET /testimonials`; `contentApi.categories()` → `GET /units/categories`; `contentApi.budgets()` → `GET /units/budgets`. All four wrapped in `safe()` (`:14-20`) which swallows the error and substitutes `[]`.
- **Actions:** category tile → `/units?type=…` (`:122`); budget tile → `/units?minPrice&maxPrice` (`:162`); "view all" → `/units`; `FilterBar` submit → `/units?…`.
- **States:** loading ✅ (Suspense on FilterBar only, `:104`) · empty ✅ (counts hidden when 0, `:129`) · error ❌ **swallowed by `safe()` — a total backend outage renders an empty but "successful" homepage** · unauthorized n/a.
- **Forms:** `FilterBar` — no schema, plain `useState` (§13).
- **Hardcoded that should come from the API:** `CATEGORY_IMAGES` three Unsplash URLs (`:23-27`); hero background Unsplash URL (`:92`); `BUDGET_FALLBACK` four ranges (`:32-37`); `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` (`:41`) hides *الأكثر طلبًا*, *حسب الميزانية*, *تعليقات النزلاء*.

### 5.2 `/units` — `src/app/units/page.tsx` + `units-page-client.tsx` (Client)

- **Purpose:** search results with sidebar filters, three view modes (list / grid / map).
- **Components:** `FilterBar`, `SidebarFilters`, `UnitCard`, `LocationExplorer`, `Skeleton`.
- **Data:** `unitsApi.list({city, type, capacity})` → `GET /units?...` (`:75-83`).
- **Actions:** sort select (`:171`) — **client-side only**; view toggle (`:185`); filter chips remove (`:207`); mobile filter drawer (`:264`); clear-all (`:120`).
- **States:** loading ✅ skeletons (`:223-228`) · empty ✅ (`:229-237`) · **error ❌** — the promise chain has `.then().finally()` and **no `.catch()`** (`:81-82`): a rejected request leaves `units` empty and shows the *"no results"* copy, indistinguishable from a genuine zero-result search, plus an unhandled promise rejection · unauthorized n/a.
- **Forms:** none with a schema.
- **Hardcoded / mismatched:**
  - `DEFAULT_PRICE = [0, 5000]` (`:19`) duplicates `PRICE_FILTER` in `brand.ts:93-97`, which is **never imported**.
  - Slider `min=0 max=5000 step=50` re-hardcoded again at `SidebarFilters.tsx:48-50`.
  - **Price, rating and amenity filters are applied client-side** (`:85-93`) over only the units already fetched.
  - **No pagination.** The live API paginates at `per_page: 12` (§9, verified) and `http()` discards `meta`/`links` (`client.ts:145-147`), so the page can never show more than the first 12 results and offers no way to reach page 2.

### 5.3 `/units/[id]` — `src/app/units/[id]/page.tsx` (Client)

- **Purpose:** unit detail + date/guest picker + booking CTA.
- **Components:** `UnitGallery`, `CancellationPolicyDisplay`, `LoadError`, `Badge`, `Card`, `Button`, local `Stat`/`Divider`/`Row` (`:407-428`).
- **Data:** `unitsApi.getById(id)` → `GET /units/{id}`; `unitsApi.getReviews(id)` → `GET /units/{id}/reviews` (best-effort, `.catch(() => [])` at `:75`).
- **Actions:** favourite toggle → `useFavoritesStore.toggle` (`:160`); book → auth gate then `/booking/{id}?checkIn&checkOut&guests` (`:102-107`); mobile CTA scrolls to the booking card (`:397-399`); review anchor `#reviews`.
- **States:** loading ✅ (`:117`) · error ✅ `LoadError` + retry via `attempt` counter (`:109-115`) · empty ✅ no-reviews copy (`:272`) · unauthorized ✅ opens the login dialog instead of 401ing (`:104`).
- **Forms:** date inputs floored at `todayStr` (`:95-98`), guest `<select>` capped at `unit.capacity` (`:352`). No Zod schema — validation is the `datesSelected` boolean (`:100`).
- **Hardcoded / gaps:**
  - **The Share button has no `onClick`** — `src/app/units/[id]/page.tsx:157-159` renders a button that does nothing.
  - `AMENITY_ICONS` (`:34-39`) must be kept in sync by hand with `AMENITIES_CATALOG` (`brand.ts:104-120`) and the `amenities` message namespace — three places, no shared source.
  - `ratingKey` thresholds `4.8 / 4.5 / 4` inline (`:41-46`).
  - Host block renders `unit.ownerName`; the **live `GET /units` list response carries no `owner` object** (verified §9), so any surface fed from the list has an empty host name. `GET /units/{id}` does include it, so this page is fine.

### 5.4 `/picks` — `src/app/picks/page.tsx` (Server shell) + `PicksSection` (Client)

- **Purpose:** curated listings filtered by category chips.
- **Components:** `PicksSection` → `UnitCard`, `PICK_CATEGORIES` (`components/features/home/pick-categories.ts`).
- **Data:** `unitsApi.list(categoryToFilter(active))` → `GET /units?type=…` (`PicksSection.tsx:39-49`).
- **Actions:** category chip → refetch (`:81`); "view all" → `/picks`.
- **States:** loading ✅ pulse cards (`:99-103`) · empty ✅ (`:105`) · **error ⚠️ degraded** — `.catch(() => setUnits([]))` (`:44-46`) renders the empty-state copy on failure · unauthorized n/a.
- **Hardcoded:** page `metadata` is literal Arabic (`picks/page.tsx:4-7`) rather than `messages/` — the only page whose `<title>` does not follow the locale.

### 5.5 `/booking/[unitId]` — `checkout-page-client.tsx` (Client)

- **Purpose:** collect guest details, show the server quote, create the pending booking, hand off to payment.
- **Components:** `CancellationPolicyDisplay`, `PriceBreakdown`, `LoadError`, `EmailVerificationCard`, `PhoneInput`, `Checkbox`, `Card`, `Button`, `Input`, `Label`.
- **Data:** `unitsApi.getById` (`:73`); `unitsApi.checkAvailability` → `POST /units/{id}/availability` (`:82-85`); `bookingsApi.create` → `POST /bookings` (`:170`); `bookingsApi.list` → `GET /user/bookings` for the pending-conflict recovery (`:209`).
- **Actions:** confirm → create booking → `router.push('/payment/{id}')` (`:180`); pay/manage an existing pending booking (`:307-312`); policy links open in new tabs (`:278-288`).
- **States:** loading ✅ (`:105`, `:120`) · error ✅ `LoadError` + retry (`:97-103`), inline `error` text (`:296`), toast on stale email state (`:187`) · empty ✅ unavailable-unit branch (`:122-131`) · unauthorized ✅ opens login dialog (`:155-159`) · invalid dates ✅ (`:109-118`).
- **Forms:** guest details — **no Zod schema**; hand-rolled `validate()` (`:145-150`) with an **inline email regex** duplicating `isValidEmail` (`lib/utils/email.ts:1`).
- **Gaps:**
  - **Four collected fields are never sent.** `firstName`, `lastName`, `email`, `phone` (`:66-69`) are validated and then discarded — `bookingsApi.create` only transmits `unit_id`, `start_date`, `end_date`, `guests`, `notes` (`client.ts:626-632`).
  - `paymentMethod: 'visa'` is hardcoded at the call site (`:175`) and then dropped by the adapter.
  - `children: 0` is hardcoded (`:174`) — the UI has no children picker, yet `Booking.guests` models the split.

### 5.6 `/booking/confirmation/[bookingId]`

- **Purpose:** post-payment success screen.
- **Components:** `Card`, `Button`, `CheckCircle2`.
- **Data:** `bookingsApi.getById` → `GET /bookings/{id}` (`:27-30`).
- **Actions:** → `/my-reservations`, → `/my-reservations/{id}`.
- **States:** loading ✅ (`:58`) · **error ✅ excellent** — a fetch failure still leads with "paid" so it can never read as a failed payment (`:36-56`), with retry · empty n/a · unauthorized ❌ (surfaces as the generic error card).

### 5.7 `/payment/[bookingId]`

- **Purpose:** Moyasar hosted card/Apple-Pay form, saved-card quick pay, or test-mode simulate.
- **Components:** `PriceBreakdown`, `Card`, `Button`, `Input`, `Label`, `.mysr-form` mount point (`:250`).
- **Data:** `paymentsApi.initiate` (`:58-62`), `accountApi.getCards` (`:75-82`), `paymentsApi.pay` (`:100`, `:123`); Moyasar assets from `cdn.moyasar.com` (`lib/payments/moyasar.ts:68,73`).
- **Actions:** quick-pay with CVC (`:232`); 3-DS redirect via `window.location.assign` guarded by `^https://` (`:105-107`); simulate pay (`:178`); retry / go to reservations (`:153-158`).
- **States:** loading ✅ spinner (`:135-141`) · error ✅ dedicated card with retry (`:143-163`) + inline `errorMsg` with `dir="auto"` (`:256`) · empty ✅ (no saved cards → hosted form only) · unauthorized ❌ (a 401 lands in the generic load-failed card).
- **Notes:** `initiated`/`formInited` refs guard React 18 StrictMode double-runs (`:46-47`). `info.amount` is rendered rather than any locally derived figure (`:289`).

### 5.8 `/payment/callback`

- **Purpose:** verify the Moyasar return server-side before treating a booking as paid.
- **Data:** `paymentsApi.verify` → `POST /payments/verify` (`:53`).
- **Actions:** on `paid` → `/booking/confirmation/{id}` or `/my-reservations` (`:55-57`); on failure → retry payment / reservations / browse (`:79-89`).
- **States:** loading ✅ (`:95-101`) · error ✅ (`:69-92`) · missing/tampered `pid` ✅ (`:40-43`) · unauthorized ❌.
- **Note:** the query string is explicitly never trusted (`:8-11`, `:45-49`) — the server verdict wins.

### 5.9 `/my-reservations`

- **Purpose:** bookings in four tabs.
- **Components:** `Tabs*`, `BookingCard`, `LoadError`, `Skeleton`, local `Section` (`:110`).
- **Data:** `bookingsApi.list` → `GET /user/bookings` (`:27-31`).
- **Actions:** tab switch; per-card view/cancel/re-book; cancellation updates state in place (`:36-37`).
- **States:** loading ✅ (`:79-84`) · error ✅ `LoadError` + retry (`:85-88`) · empty ✅ per tab (`:123-133`) · unauthorized ❌ — a guest sees the generic error card, not a sign-in prompt.
- **Business rule inline:** the 14-day upcoming/active boundary is the literal `14` at `:58` — documented in the comment at `:39-45` but not a named constant.

### 5.10 `/my-reservations/[bookingId]`

- **Purpose:** booking detail with cancel, review, invoice, contact-host and print actions.
- **Components:** `CancelBookingDialog`, `PriceBreakdown`, `ContactHostDialog`, `ReviewDialog`, `Badge`, `Card`, `Button`, local `Field` (`:244`).
- **Data:** `bookingsApi.getById` (`:43`); `reviewsApi.getForBooking` (`:44`) — **returns `Promise.resolve(null)` in real mode** (`client.ts:868`), so `hasReview` depends entirely on the backend's `isReviewed` flag.
- **Actions:** contact host (`:100`) — **fake, see below**; download confirmation → `window.open` + `print()` (`:103`); invoice link (`:110`); complete payment (`:118`); cancel (`:126`); write review (`:132`); book again (`:142`).
- **States:** loading ✅ (`:47`) · **error ❌ — `bookingsApi.getById(bookingId).then(setBooking)` has no `.catch()` (`:43`), so any failure leaves the page on "جاري التحميل" forever** · empty n/a · unauthorized ❌ (same infinite-loading path).
- **Hardcoded:** `PAYMENT_LABELS` map (`:22-27`) — brand names inline rather than in `messages/`.

### 5.11 `/my-reservations/[bookingId]/invoice`

- **Purpose:** ZATCA tax invoice, A4 print-optimised.
- **Components:** `QRCodeSVG` (`qrcode.react`), `LoadError`, `Card`, `Button`, local `FieldLabel`/`MetaLine`/`Th`/`TotalRow` (`:232-278`).
- **Data:** `bookingsApi.getById` then `bookingsApi.getInvoice` (`:56-77`); the booking's status gates the invoice request (`:61`).
- **Actions:** `window.print()` (`:127`); back to booking.
- **States:** loading ✅ (`:84-90`) · error ✅ (`:92-98`) · **409 `INVOICE_NOT_AVAILABLE` correctly treated as a state, not a failure** (`:66-74`) · unpaid ✅ calm "unavailable" card (`:101-113`) · unauthorized ❌.
- **Notes:** `INVOICEABLE = ['confirmed','completed']` (`:37`). QR renders a dashed placeholder while `qr_code` is `null` (`:220-224`) — correct, since the payload is signed server-side. `MetaLine` omits empty registration rows (`:247-249`).

### 5.12 `/favorites`

- **Purpose:** saved units.
- **Components:** `UnitCard`, `Skeleton`.
- **Data:** `unitsApi.list()` then client-side filter by `unitIds` (`:19-22`).
- **States:** loading ✅ · empty ✅ (`:41-46`) · **error ❌ CRITICAL — no `.catch()` and `setLoading(false)` lives inside `.then` (`src/app/favorites/page.tsx:19-22`), so a rejected request leaves the page on skeletons permanently** · unauthorized n/a (guests keep local favourites).
- **Design gap:** fetches the full (paginated, 12-item) unit list to resolve favourites instead of a by-id endpoint — a favourite outside page 1 simply never appears. See §9c.

### 5.13 `/account`

- **Purpose:** profile summary, quick links, name editing, email verification, phone link, account deletion.
- **Components:** `EmailVerificationCard`, `Card`, `Button`, `Input`, `Label`.
- **Data:** `accountApi.me` (`:39`); `accountApi.updateProfile` (`:47`); `accountApi.deleteAccount` + `authApi.logout` (`:62-63`).
- **Actions:** save name; delete account (modal-confirmed, `:170-199`); quick links.
- **States:** loading ✅ (`:71`) · **error ❌ three times over** — `me()` uses `.catch(() => {})` (`:39`, silent); `handleSave` has `try/finally` with **no `catch`** (`:46-56`); `handleDelete` likewise (`:61-68`). A failed save shows nothing at all, and a failed deletion silently leaves the user signed in · unauthorized ❌.
- **Note:** the email field is intentionally read-only here — `EmailVerificationCard` owns it (`:138`). `firstName`/`lastName` are sent but the API also accepts `email` (`client.ts:879-886`), which this page never supplies.

### 5.14 `/account/phone`

- **Purpose:** two-step phone change (request OTP → verify).
- **Components:** `OtpVerificationForm`, `PhoneInput`, `Card`, `Badge`, `Button`, `Label`.
- **Data:** `accountApi.changePhone` (`:44`), `accountApi.verifyChangePhone` (`:56`).
- **States:** loading ✅ (`:62`) · error ✅ inline (`:113`) · success ✅ banner (`:72-76`) · unauthorized ✅ falls back to the loading text when `user` is null.
- **Forms:** ✅ Zod — `makeChangePhoneSchema` (`lib/validation/schemas.ts:66-70`), locale-aware messages.

### 5.15 `/account/payment-methods`

- **Purpose:** saved cards + transaction history + add-card modal.
- **Components:** `Card`, local `CreditCardVisual` (`:270`), `AddCardModal` (`:318`), `ConfirmDeleteModal` (`:227`).
- **Data:** `accountApi.getCards`, `accountApi.getTransactions` (`:70-72`); `paymentsApi.config` (`:330`); `accountApi.saveCardFromToken` (`:348`, `:360`); `createCardToken` → `https://api.moyasar.com/v1/tokens` (`:355`); `deleteCard` (`:81`); `setDefaultCard` (`:86`).
- **States:** loading ✅ (`:90`) · empty ✅ both lists (`:108-112`, `:161-162`) · **error ❌ everywhere** — the load `Promise.all` has `.then().finally()` and no `.catch()` (`:70-72`); `deleteCard`/`setDefaultCard`/`refreshCards` (`:75-88`) are bare `await`s with no handler. Only the add-card modal handles errors (`:363-366`) · unauthorized ❌.
- **Forms:** add-card — **no Zod**; hand-rolled Luhn (`:36-50`), brand detection (`:25-29`), `valid` boolean (`:336`).
- **PCI note:** correct by design — the PAN goes browser→Moyasar and only the token id reaches the Mamsa API (`:355-360`, `moyasar.ts:33-57`).

### 5.16 `/partner-onboarding`

- **Purpose:** three-step partner sign-up (form → OTP → success).
- **Components:** `OnboardingForm`, `OtpVerificationForm`, `LanguageToggle`, local `StepBar` (`:189`), `SuccessPanel` (`:232`).
- **Data:** `authApi.requestOtp(phone05)` (`:50`); `authApi.partnerRegister(...)` multipart (`:57-67`); `authApi.resendOtp` (`:154`).
- **Actions:** partner-type toggle; document upload with drag-and-drop; submit; resend.
- **States:** loading ✅ spinners (`OnboardingForm.tsx:280`) · error ✅ per-field + server 422 carried back from the OTP step to the file input (`:68-81`) · success ✅ (`:158`) · unauthorized n/a.
- **Forms:** **no Zod** — hand-rolled `EMAIL_RE` and `ID_RE` (`OnboardingForm.tsx:44-45`), file-type/size guards (`:49-57`).
- **Gap:** ⚠️ `authApi.partnerRegister` (`client.ts:239-277`) has **no mock branch**. In mock mode it issues a real `fetch` against an empty `BASE_URL`, so the whole flow fails.

### 5.17–5.21 Static pages

| Page | Purpose | Data | States | Hardcoded |
|---|---|---|---|---|
| `/host` (`src/app/host/page.tsx`) | Partner marketing landing | `messages/host.*` only | n/a | Unsplash hero (`:56`); `SIGNUP = '/partner-onboarding'` (`:28`); benefit/step/testimonial/FAQ counts fixed at 6/3/3/6 (`:38-46`) |
| `/about` (`src/app/about/page.tsx`) | Company page | `messages/about.*` + `BRAND` | n/a | Unsplash hero (`:53`); the 4 stats are message strings (`:26-31`), not live numbers |
| `/contact` (`src/app/contact/page.tsx`) | Contact form | `miscApi.contact` → `POST /contact` | loading ✅ (`:167`) · error ✅ (`:163`) · success ✅ modal (`:222-238`) | Unsplash side image (`:176`); `BRAND.phone` is the placeholder `+966 50 000 0000` (`brand.ts:21`) |
| `/faq` (`src/app/faq/page.tsx`) | FAQ accordion | `messages/faq.*` | n/a | `GROUP_ITEM_COUNT` `{booking:4, payment:3, cancellation:3, account:2, hosts:1}` (`:14-20`) must be updated by hand alongside `messages/` |
| `/policies/*` (5 pages) | Legal | `messages/policies.*`, `BRAND`, `POLICY_REGISTRY` | n/a | Cancellation page renders `POLICY_REGISTRY` (`cancellation/page.tsx:15`), so tier numbers stay in sync with checkout |

---

## 6. Component inventory

`components` count = 43 non-test files. Every one is reachable — no orphan
component files exist.

### 6.1 UI primitives (`src/components/ui/`, 14 files)

| Component | Path | Type | Used by (count) | Props summary | Client/Server | Notes |
|---|---|---|---|---|---|---|
| `Avatar` / `AvatarImage` / `AvatarFallback` | `ui/avatar.tsx` | ui | 1 (`Header`) | Radix Avatar props | client | `AvatarImage` unused |
| `Badge` | `ui/badge.tsx` | ui | 6 | `variant`: default/sage/warning/success/danger/outline/cream | **server-safe** (no `'use client'`) | — |
| `Button` | `ui/button.tsx` | ui | 25 | `variant` ×7, `size` ×4, `asChild` | client | Most-reused component in the repo |
| `Card` + 5 sub-parts | `ui/card.tsx` | ui | 15 | `HTMLAttributes<HTMLDivElement>` | **server-safe** | 5 sub-parts unused |
| `Checkbox` | `ui/checkbox.tsx` | ui | 2 | Radix Checkbox props | client | — |
| `Dialog` + 8 parts | `ui/dialog.tsx` | ui | 4 | Radix Dialog props | client | 3 parts unused |
| `DropdownMenu` + 6 parts | `ui/dropdown-menu.tsx` | ui | 1 | Radix props + `danger` on `Item` | client | 2 parts unused |
| `Input` | `ui/input.tsx` | ui | 6 | `InputHTMLAttributes` | client | — |
| `Label` | `ui/label.tsx` | ui | 10 | Radix Label props | client | — |
| `PhoneInput` | `ui/phone-input.tsx` | ui | 5 | `InputHTMLAttributes`; normalises input | client | Strips `05`/`966`, caps 9 digits |
| `Separator` / `Skeleton` | `ui/separator.tsx` | ui | 3 | — | client | **`Separator` unused**; only `Skeleton` imported |
| `Slider` | `ui/slider.tsx` | ui | 1 | Radix Slider props | client | — |
| `Tabs` + 3 parts | `ui/tabs.tsx` | ui | 1 | Radix Tabs props | client | — |
| `Textarea` | `ui/textarea.tsx` | ui | 3 | `TextareaHTMLAttributes` | client | — |

### 6.2 Shared (`src/components/shared/`, 8 files)

| Component | Path | Used by | Props | Client/Server | Notes |
|---|---|---|---|---|---|
| `Header` | `shared/Header.tsx` | `layout.tsx` | none | client | `mounted` guard against hydration mismatch (`:41-42`); mobile drawer portalled to `<body>` (`:170`) |
| `Footer` | `shared/Footer.tsx` | `layout.tsx` | none | **server (async)** | Renders `BRAND.crNumber` (`:94`) |
| `LanguageToggle` | `shared/LanguageToggle.tsx` | `Header`, `partner-onboarding` | `className?` | client | Writes `NEXT_LOCALE` cookie + `router.refresh()` (`:21-22`) |
| `LoadError` | `shared/LoadError.tsx` | 4 pages | `onRetry`, `message?` | client | The repo's standard failed-fetch card |
| `PolicyPage` / `PolicySection` / `PolicyNote` | `shared/PolicyPage.tsx` | 5 policy pages | `icon`, `title`, `subtitle`, `lastUpdatedLabel`, `children` | **server-safe** | RTL accent bar uses `border-s-4` (`:43`) |
| `QueryProvider` | `shared/QueryProvider.tsx` | `layout.tsx` | `children` | client | ⚠️ **No consumer uses a query hook** — see §7.3 |
| `ToastHost` | `shared/ToastHost.tsx` | `layout.tsx` | none | client | 4 s auto-dismiss (`:12`), `role="status"` + `aria-live="polite"` |
| `FavoritesSync` | `shared/FavoritesSync.tsx` | `layout.tsx` | none | client | Renders `null`; bridges auth → favourites |

### 6.3 Feature components (`src/components/features/`, 19 files + 1 in `account/`, 1 in `agents/`)

| Component | Path | Used by | Props summary | Client/Server | Notes |
|---|---|---|---|---|---|
| `LoginDialog` | `features/auth/LoginDialog.tsx` | `layout.tsx` | none (driven by `useUiStore`) | client | 3 steps: phone / otp / not-registered |
| `RegisterDialog` | `features/auth/RegisterDialog.tsx` | `layout.tsx` | none | client | 3 steps: form / otp / already-registered |
| `OtpVerificationForm` | `features/auth/OtpVerificationForm.tsx` | 5 sites | `displayPhone`, `debugOtp?`, `onSubmit`, `onResend`, `onBack?`, `variant`, `length`, `cooldownSeconds`, `initialCooldownSeconds?`, `title?`, `description?`, `backLabel?`, `resendCooldownText?` | client | **The single OTP component** — used for phone login, register, phone-change, partner onboarding *and* email verification |
| `DebugOtpHint` | `features/auth/DebugOtpHint.tsx` | `OtpVerificationForm` | `code?` | client | Hidden when `NODE_ENV === 'production'` (`:16`) |
| `OnboardingForm` | `features/auth/OnboardingForm.tsx` | `partner-onboarding` | 18 props (controlled) | client | Contains `DocumentUpload` (`:293`) and `Field` (`:431`) |
| `BookingCard` | `features/booking/BookingCard.tsx` | `my-reservations` | `booking`, `tabContext`, `onCancelled?` | client | Status beats tab for the badge (`:31-40`) — prevents an unpaid booking reading as paid |
| `CancelBookingDialog` | `features/booking/CancelBookingDialog.tsx` | 2 sites | `booking`, `open`, `onClose`, `onCancelled?` | client | Fetches the refund preview on open (`:38-48`) |
| `CancellationPolicyDisplay` | `features/booking/CancellationPolicyDisplay.tsx` | 4 sites | `policy`, `showHeader?`, `className?` | client | Derives window labels from tier numbers (`:44-52`) |
| `ContactHostDialog` | `features/booking/ContactHostDialog.tsx` | booking detail | `open`, `onClose`, `hostName` | client | ⚠️ **Entirely non-functional** — `send()` sets `sent = true` and calls no API (`:30-33`) |
| `PriceBreakdown` | `features/booking/PriceBreakdown.tsx` | 3 pages | `price`, `labels`, `format` | **server-safe** (pure) | Total always equals `gross`; tax split inside a closed `<details>` |
| `LocationExplorer` | `features/home/LocationExplorer.tsx` | 2 pages | `units: LocationUnit[]` | client | Dynamic-imports the map with `ssr:false` (`:18-25`) |
| `LocationMap` | `features/home/LocationMap.tsx` | `LocationExplorer` | `units`, `activeId`, `onSelect`, `currencyLabel?` | client | Leaflet + OSM tiles; bounds locked to Saudi Arabia (`:17-20`) |
| `PicksSection` | `features/home/PicksSection.tsx` | `/`, `/picks` | `initialCategory?`, `limit?`, `showViewAll?` | client | — |
| `pick-categories.ts` | `features/home/pick-categories.ts` | `PicksSection` | `PICK_CATEGORIES`, `DEFAULT_PICK_CATEGORY`, `isValidPickCategory` | module | — |
| `TestimonialCarousel` | `features/home/TestimonialCarousel.tsx` | `/` | `items?: Testimonial[]` | client | Falls back to 3 message-file quotes when the API returns none (`:32-40`) |
| `ReviewDialog` | `features/reviews/ReviewDialog.tsx` | booking detail | `bookingId`, `open`, `onClose`, `onSubmitted?` | client | ✅ Zod-validated |
| `UnitCard` | `features/units/UnitCard.tsx` | 4 sites | `unit`, `variant?: 'list'\|'grid'` | client | Only `wifi` gets an inline icon (`:122`) |
| `FilterBar` | `features/units/FilterBar.tsx` | `/`, `/units` | `compact?` | client | **`CITIES` list hardcoded** (`:11-19`) |
| `SidebarFilters` | `features/units/SidebarFilters.tsx` | `/units` | `value`, `onChange` | client | Shows only `AMENITIES_CATALOG.slice(0, 6)` (`:113`) — 9 of 15 amenities are unreachable |
| `UnitGallery` | `features/units/UnitGallery.tsx` | unit detail | `images`, `title` | client | Lightbox with Esc/arrow keys + scroll lock (`:26-40`) |
| `EmailVerificationCard` | `account/email-verification.tsx` | `/account`, checkout | `context: 'checkout'\|'settings'`, `className?`, ref → `reopen()` | client | 4 states: idle/form/otp/verified |
| `WebMcpTools` | `agents/WebMcpTools.tsx` | `layout.tsx` | none | client | Feature-detected; inert in every shipping browser today |

### 6.4 Flags

| Flag | Component(s) | Detail |
|---|---|---|
| **Unused components** | none | Every file under `src/components/` has at least one production importer. |
| **Unused named exports** | `Separator`, `AvatarImage`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `DialogTrigger`, `DialogClose`, `DialogPortal`, `DropdownMenuGroup`, `DropdownMenuPortal`, `buttonVariants` | 13 exports with zero importers outside `src/components/ui/`. |
| **Duplicated components** | `Row` helper | Defined three times with near-identical bodies: `src/app/units/[id]/page.tsx:421`, `src/app/booking/[unitId]/checkout-page-client.tsx:363`, and as `SummaryRow` in `src/app/payment/[bookingId]/page.tsx:317`. |
| **Duplicated components** | `Field` helper | `src/app/my-reservations/[bookingId]/page.tsx:244` and `src/components/features/auth/OnboardingForm.tsx:431` — different shapes, same name and role. |
| **Duplicated modal shell** | Hand-rolled `fixed inset-0 … bg-black/40` overlays | 5 places (`account/page.tsx:170`, `payment-methods/page.tsx:239,373`, `contact/page.tsx:223`, `ContactHostDialog.tsx:38`, `units-page-client.tsx:265`) instead of the `Dialog` primitive that already exists. |
| **Hardcoded data in components** | `FilterBar.tsx:11-19` | 7 Saudi cities hardcoded, while `GET /units/cities` exists and `contentApi.cities()` is implemented but **never called**. |
| **Hardcoded data in components** | `TestimonialCarousel.tsx:32-38` | 3 fallback testimonials from message files. |
| **Hardcoded data in components** | `pick-categories.ts:9-13` | 3 categories fixed client-side, while `GET /units/categories` exists. |

---

## 7. State management

### 7.1 Zustand stores (4)

| Store | Path | State shape | Actions | Persistence | Consumers |
|---|---|---|---|---|---|
| `useAuthStore` | `src/stores/auth.ts:25` | `{ user: User \| null, isAuthenticated: boolean }` | `setSession(user, accessToken, refreshToken)` (`:31`), `updateUser(patch)` (`:36`), `logout()` (`:39`) | ✅ `localStorage` key **`mamsa.auth`**, `partialize` to `{user, isAuthenticated}` only (`:45-47`) — **tokens are deliberately excluded** | `Header.tsx:36`, `account/page.tsx:25`, `account/phone/page.tsx:24`, `units/[id]/page.tsx:66`, `checkout-page-client.tsx:41-42`, `email-verification.tsx:45`, `LoginDialog.tsx:32`, `RegisterDialog.tsx:32-33`, `FavoritesSync.tsx:14`, `favorites.ts:18`, `client.ts:54` (dynamic import) |
| `useFavoritesStore` | `src/stores/favorites.ts:20` | `{ unitIds: string[] }` | `has(id)` (`:25`), `toggle(id)` (`:27`), `sync()` (`:44`), `reset()` (`:64`) | ✅ `localStorage` key **`mamsa.favorites`**, whole state (`:66`) | `units/[id]/page.tsx:68`, `favorites/page.tsx:14`, `UnitCard.tsx:23`, `FavoritesSync.tsx:15-16` |
| `useUiStore` | `src/stores/ui.ts:15` | `{ authDialog: 'login'\|'register'\|null, prefillPhone: string }` | `openAuth(which, prefillPhone?)` (`:18`), `closeAuth()` (`:19`) | ❌ in-memory only | `Header.tsx:37`, `units/[id]/page.tsx:67`, `checkout-page-client.tsx:43`, `LoginDialog.tsx:23`, `RegisterDialog.tsx:24` |
| `useToastStore` | `src/stores/toast.ts:16` | `{ message: string \| null }` | `show(message)` (`:18`), `clear()` (`:19`); module helper `showToast()` (`:22`) | ❌ in-memory only | `ToastHost.tsx:8`, `checkout-page-client.tsx:19`, `email-verification.tsx:22` |

`useFavoritesStore.toggle` is optimistic with rollback (`favorites.ts:27-42`);
`sync()` merges guest favourites into the account and drops ids the backend 404s
so they are not re-pushed on every login (`:44-62`).

### 7.2 React Context

Only third-party providers, all mounted in `src/app/layout.tsx:52-65`:

| Provider | Source | Line |
|---|---|---|
| `NextIntlClientProvider` | `next-intl` | `layout.tsx:52` |
| `QueryClientProvider` | `@tanstack/react-query` via `QueryProvider` | `layout.tsx:53` |

**No application-defined `createContext` exists anywhere in `src/`.**

### 7.3 Server-state caching

| Mechanism | Status |
|---|---|
| TanStack Query | ⚠️ **Configured but unused.** `QueryProvider` sets `staleTime: 60_000`, `refetchOnWindowFocus: false`, `retry: 1` (`QueryProvider.tsx:10-16`), but `grep -rn "useQuery\|useMutation\|useQueryClient\|useInfiniteQuery" src/` returns **zero matches**. Every client page hand-rolls `useEffect` + `useState` + `loading`/`error` booleans. |
| Next.js `fetch` cache | Explicitly **disabled** — `http()` sets `cache: 'no-store'` (`client.ts:83`) so Server Component fetches never serve a stale API snapshot. `src/lib/mcp/units.ts:49` does the same. |
| `revalidate` / ISR | Not used anywhere. |
| Retry / dedup | Only the 401-refresh single-flight guard (`client.ts:68-95`). No general retry. |

The practical effect: the same unit list is re-fetched from scratch on every
navigation, and there is no cross-page cache. The dependency is paid for and not
used.

---

## 8. API layer architecture

### 8.1 Files

| File | Role | Lines |
|---|---|---|
| `src/lib/api/client.ts` | The whole public API surface — 9 namespaces, the `http()` wrapper, the mock switch, and view-model mappers | 1032 |
| `src/lib/api/adapters.ts` | snake_case → camelCase domain mappers + raw backend interfaces | 625 |
| `src/lib/api/errors.ts` | `ApiError` class + Arabic copy keyed by error code | 53 |
| `src/lib/api/mock/index.ts` | In-memory backend role-play | 391 |
| `src/lib/mcp/units.ts` | A **separate**, server-only fetcher for the MCP route (deliberately not `client.ts`) | 100 |

### 8.2 Base URL construction

`src/lib/api/client.ts:49`

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
```

Requests are `fetch(\`${BASE_URL}${path}\`)` (`:78`, `:125`). There is no path
joining, no trailing-slash normalisation and no runtime validation — the env var
must already include `/api/v1` and must not end in `/`. If it is unset, every
real-mode call silently becomes a same-origin relative request.

### 8.3 Auth mechanism

| Aspect | Value | Source |
|---|---|---|
| Transport | **`Authorization: Bearer <token>` header** | `client.ts:90` |
| Cookie session | **Never** — `credentials` is left at its default (`same-origin`), so no cookie reaches the API's separate origin | `client.ts:63-71` (documented rationale) |
| Token storage | `localStorage`, keys `mamsa.accessToken` / `mamsa.refreshToken` | `src/lib/auth/tokens.ts:13-14` |
| Sole owner | `tokenManager` — nothing else touches those keys | `tokens.ts:1-11` |
| Why localStorage | The Moyasar 3-DS redirect leaves the app entirely; the session must survive that cross-site round trip | `tokens.ts:9-11`, `client.ts:64-67` |
| Domain scope | localStorage is origin-scoped; the API lives on a different origin, so nothing is shared with `api.mamsaa.com` | by construction |
| Extra header | `ngrok-skip-browser-warning: '1'` on every request | `client.ts:89` — a dev-tunnel leftover now sent to production |

### 8.4 Interceptors, retry, timeout, error normalisation

| Concern | Implementation |
|---|---|
| **401 refresh** | On a 401 that is not already a retry, has a token, and is not `/auth/refresh` itself: exchange the refresh token, then replay the request once (`client.ts:99-104`). A module-level `refreshInFlight` promise (`:70`) collapses a burst of concurrent 401s into **one** refresh round trip. |
| **Forced logout** | If the refresh fails: `forceLogout()` dynamically imports the auth store and clears it, then throws `ApiError(401, 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى.')` (`:100-103`). Dynamic import keeps the `'use client'` store out of the server module graph (`:53-56`). |
| **Retry (general)** | ❌ none. Only the single 401 replay. |
| **Timeout** | ❌ **none in `client.ts`** — a hung backend hangs the request indefinitely. `src/lib/mcp/units.ts:50` *does* use `AbortSignal.timeout(10_000)`. |
| **Envelope unwrap** | `{ success, message, data }` → `data`; raw payloads pass through (`:145-147`). |
| **Empty bodies** | `204` → `undefined`; a `200` with an empty body is handled before `JSON.parse` (`:138-142`). |
| **Error normalisation** | Parses `message`, `code`, `errors` (per-field bag), `retry_after`, `remaining_attempts` into `ApiError` (`:106-135`). A bare `429` with no `code` is normalised to `RATE_LIMITED` with `Retry-After` (`:131-134`). |
| **Multipart** | When the body is `FormData`, `Content-Type` is omitted so the browser can set the boundary (`:77`, `:87`). |
| **Cache** | `cache: 'no-store'` by default, overridable per call (`:83`). |

### 8.5 The mock/real swap point — exact location

**`src/lib/api/client.ts:48`**

```ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
```

- The comparison is `!== 'false'`, so **anything other than the exact string `false` — including unset — turns mocks ON.** This is fail-safe for a demo and fail-dangerous for a deployment: forget the env var on a new environment and the site quietly serves fixtures.
- The flag is then branched on **inline at every single API function** (`USE_MOCK ? withLatency(mockApi.…) : http(…)`) — 44 ternaries across `client.ts:190-1027`. There is no adapter/strategy indirection, so mock and real wiring must be kept in step by hand.
- `withLatency` (`:55-58`) adds a 300 ms artificial delay in mock mode only (`MOCK_LATENCY_MS`, `:52`).
- A **second, independent** copy of the switch lives at `src/lib/mcp/units.ts:18`, where it is inverted into a hard refusal: the MCP server throws rather than serve mock data to an agent (`units.ts:29-36`).

**Functions that ignore the switch entirely** (real-only, so they break in mock mode): `authApi.partnerRegister` (`:239`), `authApi.refresh` (`:302`), `paymentsApi.getById` (`:848`).

### 8.6 How errors reach the UI

| Channel | Where | Used by |
|---|---|---|
| Inline `error` state under the form/section | most pages | checkout (`:296`), contact (`:163`), login/register dialogs (`:131`), phone change (`:113`), review dialog (`:88`), payment (`:256`), add-card (`:458`) |
| `LoadError` card + retry | `components/shared/LoadError.tsx` | unit detail, checkout, my-reservations, invoice |
| Global toast | `showToast()` → `ToastHost` | checkout stale-email recovery (`:187`), email-verification resend/send failures (`:114`, `:135`) |
| Code→Arabic lookup | `resolveErrorMessage()` (`errors.ts:43-53`) | email verification, checkout |
| **Silent swallow** | `.catch(() => {})` / no `.catch()` | `/account` (3 sites), `/account/payment-methods` (4 sites), `/favorites`, `/units`, `/my-reservations/[bookingId]` — see §19 |
| **Error boundary** | ❌ **none** — no `error.tsx` anywhere | — |

`ERROR_CODE_MESSAGES` (`errors.ts:33-40`) maps 6 codes to fixed Arabic copy:
`EMAIL_INVALID`, `EMAIL_ALREADY_IN_USE`, `OTP_INVALID`, `OTP_EXPIRED`,
`OTP_MAX_ATTEMPTS`, `EMAIL_VERIFICATION_REQUIRED`. `RATE_LIMITED` and
`OTP_INVALID`-with-attempts are special-cased with interpolation (`:45-48`).

⚠️ These strings are **hardcoded Arabic outside the `messages/` catalogues**, so
they do not switch to English with the locale.

---

## 9. Endpoint inventory

45 Mamsa API paths + 1 third-party. "Verified" = probed live on 2026-08-25,
unauthenticated and read-only (see the note at the top of this document).

| METHOD | Path | API function + file | Called from | Request shape | Response shape used by UI | MOCK EXISTS? | REAL WIRED? | Verified live? | Notes / mismatches |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/auth/request-otp` | `authApi.requestOtp` `client.ts:190` | `LoginDialog.tsx:68`, `partner-onboarding/page.tsx:50` | `{phone, intent?}` | `{debug_otp?}` → `{sent, debugOtp}` | ✅ | ✅ | no — would send a real SMS | `intent: 'login'` makes the backend reject unregistered numbers before dispatch |
| POST | `/auth/request-otp` | `authApi.register` `client.ts:220` | `RegisterDialog.tsx:69` | `{phone, intent:'register'}` | same | ✅ | ✅ | no — real SMS | ⚠️ **`firstName`/`lastName`/`email` are accepted by the function signature and never transmitted** — the profile is completed afterwards |
| POST | `/auth/verify-otp` | `authApi.verifyOtp` `client.ts:198` | `LoginDialog.tsx:89`, `RegisterDialog.tsx:97` | `{phone, code, device:'web'}` | `{access_token, refresh_token, user, needs_profile?}` | ✅ | ✅ | no — needs a live code | — |
| POST | `/auth/resend-otp` | `authApi.resendOtp` `client.ts:211` | `LoginDialog.tsx:161`, `RegisterDialog.tsx:189`, `partner-onboarding/page.tsx:154` | `{phone, intent?}` | `{debug_otp?}` | ✅ | ✅ | no — real SMS | — |
| POST | `/auth/partner/register` | `authApi.partnerRegister` `client.ts:239` | `partner-onboarding/page.tsx:57` | **multipart**: `type,name,phone,code,email,device` + `national_id`/`national_id_file` or `cr_number`/`cr_file` | `{access_token, refresh_token, user}` | ❌ **none** | ✅ | no — creates a real account | ⚠️ **Real-only; breaks in mock mode.** Files ≤5 MB, jpg/jpeg/png/pdf (`OnboardingForm.tsx:49-52`) |
| POST | `/auth/complete-profile` | `authApi.completeProfile` `client.ts:284` | `RegisterDialog.tsx:101` | `{first_name, last_name, email}` | `RawUser` | ✅ | ✅ | no — needs auth | Sends the name as two parts so compound Arabic names survive |
| POST | `/auth/logout` | `authApi.logout` `client.ts:296` | `Header.tsx:57`, `account/page.tsx:63` | `{}` | ignored | ✅ | ✅ | no — needs auth | Failure is swallowed at `Header.tsx:57` and the local session is cleared anyway |
| POST | `/auth/refresh` | `authApi.refresh` `client.ts:302` **+ inline `refreshAccessToken` `client.ts:76`** | ⚠️ **`authApi.refresh` has no callers**; the inline copy at `:76` is what actually runs | `{refresh_token, device:'web'}` | `{access_token, refresh_token}` | ❌ none | ✅ | no — needs a token | **Duplicated logic** — see §19 |
| GET | `/auth/me` | `accountApi.me` `client.ts:874` | `account/page.tsx:39` | — | `RawUser` | ✅ | ✅ | no — needs auth | — |
| GET | `/units` | `unitsApi.list` `client.ts:426` | `units-page-client.tsx:75`, `favorites/page.tsx:19`, `PicksSection.tsx:39`, `WebMcpTools.tsx:79` | query: `city,type,capacity,start_date,end_date,min_price,max_price,min_rating,sort` + repeatable `features[]` | `RawUnit[]` → `Unit[]` | ✅ | ✅ | ✅ **200** | ⚠️ **Response is `{data, links, meta}` with `per_page: 12` — `meta`/`links` are discarded** (`client.ts:145-147`). ⚠️ **`?city=` returns 0 rows for a value the API itself emits** — see 9d |
| GET | `/units/{id}` | `unitsApi.getById` `client.ts:433` | `units/[id]/page.tsx:75`, `checkout-page-client.tsx:74`, `WebMcpTools.tsx:100` | — | `RawUnit` → `Unit` | ✅ | ✅ | ✅ **200** | Detail response **includes `owner`**; the list response does **not** |
| GET | `/units/popular` | `unitsApi.getFeatured` `client.ts:436` **and** `contentApi.popular` `client.ts:488` | `page.tsx:55` (via `contentApi.popular`) | — | `RawUnit[]` | ✅ | ✅ | ✅ **200** | ⚠️ **Two identical functions for one endpoint**; `unitsApi.getFeatured` has no callers |
| GET | `/units/{id}/reviews` | `unitsApi.getReviews` `client.ts:441` | `units/[id]/page.tsx:75` | — | `Record[]` → `Review[]` | ✅ | ✅ | ✅ **200** | Returns a **bare array**, not a `{data}` envelope — `http()` handles both (`:145-148`) |
| POST | `/units/{id}/availability` | `unitsApi.checkAvailability` `client.ts:447` | `checkout-page-client.tsx:83` | `{start_date, end_date}` | `{available, pricing:{nights,nightly_rate,gross,net_base,vat,vat_rate}}` | ✅ | ✅ | ✅ **200, no auth required** | ⚠️ Live response already carries **both** the new VAT-inclusive keys and the legacy trio; `nightly_rate × nights === gross` **holds today** — the comment at `client.ts:339-350` claiming otherwise is **stale** |
| GET | `/units/categories` | `contentApi.categories` `client.ts:476` | `page.tsx:57` | — | `{key,label,icon,count,image_url}[]` | ⚠️ returns `[]` | ✅ | ✅ **200** | Mock returns an empty array rather than fixtures |
| GET | `/units/cities` | `contentApi.cities` `client.ts:481` | ⚠️ **no callers** | — | `{city,count}[]` | ⚠️ returns `[]` | ✅ | ✅ **200** (`الرياض: 2`) | `FilterBar.tsx:11-19` hardcodes 7 cities instead |
| GET | `/units/budgets` | `contentApi.budgets` `client.ts:483` | `page.tsx:58` | — | `{key,label,min,max,count,image_url}[]` | ⚠️ returns `[]` | ✅ | ✅ **200** | Homepage rebuilds labels locally from `min`/`max` so the locale is respected (`page.tsx:72-79`) |
| GET | `/testimonials` | `contentApi.testimonials` `client.ts:471` | `page.tsx:56` | — | `{id,name,role,quote,avatar_url,rating,deal}[]` | ⚠️ returns `[]` | ✅ | ✅ **200** | Section is hidden behind `SHOW_PRELAUNCH_HIDDEN_SECTIONS = false` |
| GET | `/user/bookings` | `bookingsApi.list` `client.ts:611` | `my-reservations/page.tsx:28`, `checkout-page-client.tsx:209` | — | `RawBooking[]` → `Booking[]` | ✅ | ✅ | ✅ **401 guard confirmed** (`{"message":"Unauthenticated."}`) | 401 body carries **no `code`** field |
| GET | `/bookings/{id}` | `bookingsApi.getById` `client.ts:616` | 3 pages + inside `bookingsApi.cancel` (`:662`) | — | `RawBooking` → `Booking` | ✅ | ✅ | no — needs auth | — |
| POST | `/bookings` | `bookingsApi.create` `client.ts:621` | `checkout-page-client.tsx:170` | `{unit_id, start_date, end_date, guests:<number>, notes}` | `RawBooking` | ✅ | ✅ | no — creates a real booking | ⚠️ **`guests` is flattened to a single integer** (`:630`), losing the adults/children split the `Booking` type models. ⚠️ Guest name/email/phone never sent |
| GET | `/bookings/{id}/invoice` | `bookingsApi.getInvoice` `client.ts:636` | `invoice/page.tsx:63` | — | `TaxInvoice` (`client.ts:528-547`) | ✅ | ✅ | no — needs auth | `qr_code` expected `null` today; 409 `INVOICE_NOT_AVAILABLE` treated as a state |
| GET | `/bookings/{id}/cancellation-preview` | `bookingsApi.previewCancellation` `client.ts:642` | `CancelBookingDialog.tsx:44` | — | `RawCancellationPreview` → `RefundPreview` | ✅ | ✅ | no — needs auth | — |
| POST | `/bookings/{id}/cancel` | `bookingsApi.cancel` `client.ts:654` | `CancelBookingDialog.tsx:54` | `{reason}` | cancellation result, **then a second `GET /bookings/{id}`** | ✅ | ✅ | no — destructive | ⚠️ **Two round trips** because `cancel` returns the result object, not the updated booking (`:647-672`) |
| GET | `/payments/config` | `paymentsApi.config` `client.ts:769` | `payment-methods/page.tsx:330,345` | — | `{publishable_key, test_mode, currency}` | ⚠️ returns `{publishableKey:'', testMode:true, currency:'SAR'}` | ✅ | ✅ **401 guard confirmed** | — |
| POST | `/payments/initiate` | `paymentsApi.initiate` `client.ts:778` | `payment/[bookingId]/page.tsx:59` | `{booking_id:<number>}` | `InitiatePaymentResult` (`:692-712`) | ⚠️ returns a zeroed stub | ✅ | no — needs auth | `callback_url` is mapped but **deliberately unused** (`:701-709`) |
| POST | `/payments/pay` | `paymentsApi.pay` `client.ts:815` | `payment/[bookingId]/page.tsx:100,123` | `{payment_id}` \| `{payment_id, saved_card_id, cvc}` \| `{payment_id, token}` | `{status, payment_id, transaction_url?, message?}` | ⚠️ always `{status:'paid'}` | ✅ | no — takes a real charge | — |
| POST | `/payments/verify` | `paymentsApi.verify` `client.ts:836` | `payment/callback/page.tsx:53` | `{payment_id, moyasar_id}` | `{status, booking_id, message?}` | ⚠️ always `{status:'paid', bookingId:null}` | ✅ | no — needs auth | Idempotent by contract (`:832-835`) |
| GET | `/payments/{paymentId}` | `paymentsApi.getById` `client.ts:848` | ⚠️ **no callers** | — | `unknown` | ❌ none | ✅ | no | Dead + untyped + no mock branch |
| POST | `/reviews` | `reviewsApi.add` `client.ts:854` | `ReviewDialog.tsx:41` | `{booking_id, rating, comment}` | `Review` | ✅ | ✅ | no — creates a real review | — |
| — | *(no endpoint)* | `reviewsApi.getForBooking` `client.ts:866` | `my-reservations/[bookingId]/page.tsx:44` | — | `Review \| null` | ✅ | ❌ **returns `Promise.resolve(null)`** | n/a | See 9b — the only mock-only function |
| PUT | `/user/profile` | `accountApi.updateProfile` `client.ts:876` | `account/page.tsx:47` | `{first_name, last_name, email}` | `RawUser` → `Omit<User,'role'>` | ✅ | ✅ | no — needs auth | `mapUserProfile` strips `role` so a shallow merge can't downgrade an admin (`adapters.ts:527-536`) |
| POST | `/user/change-phone` | `accountApi.changePhone` `client.ts:889` | `account/phone/page.tsx:44,123` | `{new_phone}` | `{debug_otp?}` | ✅ | ✅ | no — real SMS | Sends the local `05XXXXXXXX` form |
| POST | `/user/change-phone/verify` | `accountApi.verifyChangePhone` `client.ts:898` | `account/phone/page.tsx:56` | `{new_phone, code}` | ignored → `{ok:true}` | ⚠️ always `{ok:true}` | ✅ | no — needs auth | — |
| POST | `/user/email` | `accountApi.requestEmailVerification` `client.ts:910` | `email-verification.tsx:80,103` | `{email}` | `{email, verified, resend_available_in}` | ✅ | ✅ | no — needs auth | — |
| POST | `/user/email/verify` | `accountApi.verifyEmail` `client.ts:923` | `email-verification.tsx:122` | `{code}` | `{email}` → `{email, verified:true}` | ✅ | ✅ | no — needs auth | — |
| POST | `/user/email/resend` | `accountApi.resendEmailVerification` `client.ts:932` | `email-verification.tsx:132` | `{}` | `{resend_available_in}` | ✅ | ✅ | no — needs auth | — |
| DELETE | `/user/account` | `accountApi.deleteAccount` `client.ts:939` | `account/page.tsx:62` | — | ignored → `{ok:true}` | ✅ | ✅ | no — destructive | ⚠️ **Return-shape mismatch**: mock resolves `{deleted:true}` (`mock/index.ts:388`), real resolves `{ok:true}` (`client.ts:942`). No caller reads either |
| GET | `/user/cards` | `accountApi.getCards` `client.ts:944` | `payment-methods/page.tsx:70,76`, `payment/[bookingId]/page.tsx:76` | — | `Record[]` → `SavedCard[]` | ✅ | ✅ | no — needs auth | ⚠️ `MOCK_SAVED_CARDS` carry no `chargeable`, so quick-pay shows zero cards in mock mode (`users.ts:14-17` vs `payment/page.tsx:78`) |
| POST | `/user/cards/from-token` | `accountApi.saveCardFromToken` `client.ts:955` | `payment-methods/page.tsx:348,360` | `{token}` \| `{brand,last4,exp_month,exp_year}` | `Record` → `SavedCard` | ✅ | ✅ | no — needs auth | PAN never reaches the Mamsa API |
| DELETE | `/user/cards/{id}` | `accountApi.deleteCard` `client.ts:979` | `payment-methods/page.tsx:81` | — | ignored → `{ok:true}` | ⚠️ always `{ok:true}` | ✅ | no — destructive | — |
| POST | `/user/cards/{id}/default` | `accountApi.setDefaultCard` `client.ts:984` | `payment-methods/page.tsx:86` | `{}` | ignored → `{ok:true}` | ⚠️ always `{ok:true}` | ✅ | no — needs auth | — |
| GET | `/user/transactions` | `accountApi.getTransactions` `client.ts:989` | `payment-methods/page.tsx:70` | — | `Record[]` → `Transaction[]` | ✅ | ✅ | no — needs auth | — |
| GET | `/user/favorites` | `favoritesApi.list` `client.ts:999` | `stores/favorites.ts:47` | — | `Record[]` → `string[]` (ids only) | ⚠️ returns `[]` | ✅ | no — needs auth | Only `id` is read; the rest of each row is dropped |
| POST | `/user/favorites/{unitId}` | `favoritesApi.add` `client.ts:1004` | `stores/favorites.ts:35,56` | `{}` | ignored | ⚠️ no-op | ✅ | no — needs auth | Empty object sent deliberately — a bare empty body trips Laravel's JSON middleware (`:1007-1008`) |
| DELETE | `/user/favorites/{unitId}` | `favoritesApi.remove` `client.ts:1011` | `stores/favorites.ts:35` | — | ignored | ⚠️ no-op | ✅ | no — needs auth | — |
| POST | `/contact` | `miscApi.contact` `client.ts:1021` | `contact/page.tsx:60` | `{name, phone, email, message}` | ignored → `{ok:true}` | ⚠️ always `{ok:true}` | ✅ | no — creates a real ticket | Phone converted to `05XXXXXXXX` first |
| POST | `https://api.moyasar.com/v1/tokens` | `createCardToken` `lib/payments/moyasar.ts:33` | `payment-methods/page.tsx:355` | `{name, number, cvc, month, year, callback_url}` + Basic auth with the publishable key | `{id}` | n/a | ✅ third-party | no | Browser → Moyasar directly; the PAN never touches the Mamsa API |

### 9a. Endpoints fully wired to the real backend and confirmed working

Verified live, unauthenticated, on 2026-08-25 — all HTTP 200 with the shape the
adapters expect:

1. `GET /units` — 2 units, paginated envelope
2. `GET /units/{id}` — includes `owner`
3. `GET /units/popular`
4. `GET /units/{id}/reviews` — bare array
5. `POST /units/{id}/availability` — full VAT-inclusive pricing block, no auth needed
6. `GET /units/categories`
7. `GET /units/cities`
8. `GET /units/budgets`
9. `GET /testimonials`

Confirmed to exist and be correctly guarded (401 `{"message":"Unauthenticated."}`):

10. `GET /user/bookings`
11. `GET /payments/config`

The remaining 34 paths are wired in code with a real `http()` branch but could
not be verified without an authenticated session or without creating real
records (OTP dispatch, bookings, payments, contact tickets, account deletion).

### 9b. Endpoints that exist in code but are MOCK-ONLY

**Exactly one API function has no real endpoint behind it:**

| Function | File:line | Real-mode behaviour | Impact |
|---|---|---|---|
| `reviewsApi.getForBooking` | `src/lib/api/client.ts:866-868` | `Promise.resolve<Review \| null>(null)` — no HTTP call at all | The booking-detail page (`my-reservations/[bookingId]/page.tsx:44,50`) falls back entirely to the backend's `isReviewed` flag on the booking resource. The comment at `:867` states the booking detail embeds its review, but `mapBooking` only records **presence** (`adapters.ts:412`) and the shape is marked "TBD" (`adapters.ts:151`). A guest can therefore never re-read their own review text. |

Additionally, **6 functions return empty/stub data in mock mode while the real
endpoint exists and works** — mock coverage gaps rather than missing endpoints:
`contentApi.testimonials`, `contentApi.categories`, `contentApi.cities`,
`contentApi.budgets` (`client.ts:471-486`, all `Promise.resolve([])`),
`favoritesApi.list/add/remove` (`:997-1015`, no-ops), and `paymentsApi.initiate`
(`:782-795`, a zeroed stub).

And **3 functions have no mock branch at all** and issue a real `fetch` even in
mock mode: `authApi.partnerRegister` (`:239`), `authApi.refresh` (`:302`),
`paymentsApi.getById` (`:848`).

### 9c. Endpoints the UI needs but that do NOT exist anywhere yet

| # | Need | Where the gap shows | Suggested endpoint | Exact shape the frontend expects |
|---|---|---|---|---|
| 1 | **Paginated unit search the UI can page through** | `units-page-client.tsx:75-83` fetches once and shows ≤12 results with no "next page" control; `http()` throws away the `meta` the API already sends | Keep `GET /units` — the frontend must stop discarding the envelope | `{ data: RawUnit[], meta: { current_page, last_page, per_page, total } }`. The frontend needs `http()` to expose `meta`, plus a `?page=` param. |
| 2 | **Fetch units by id list** | `favorites/page.tsx:19-22` fetches the whole (12-item) list and filters client-side, so a favourite outside page 1 is invisible | `GET /units?ids[]=34&ids[]=35` **or** `GET /user/favorites` returning full unit resources instead of bare ids | `RawUnit[]` — same resource as `/units` |
| 3 | **Guest-to-host messaging** | `ContactHostDialog.tsx:30-33` — the send button sets local state and calls nothing | `POST /bookings/{id}/messages` | Request `{ message: string }`; response `{ id, message, created_at, sender: 'customer'\|'partner' }`. A `GET` counterpart is needed to render a thread. |
| 4 | **Read back a guest's own review** | `reviewsApi.getForBooking` returns `null` in real mode (`client.ts:868`) | `GET /bookings/{id}/review` | `{ id, booking_id, unit_id, user_id, user_name, user_avatar_url, rating, comment, created_at }` — i.e. the shape `mapReview` already parses (`adapters.ts:464-476`) |
| 5 | **Unit ids for the sitemap** | `sitemap.ts:10-12` explicitly cannot enumerate unit pages | `GET /units/sitemap` (ids + `updated_at` only, unpaginated) | `{ id: number, updated_at: string }[]` |
| 6 | **`created_at` on the unit resource** | `mapUnit` synthesises `new Date().toISOString()` when it is absent (`adapters.ts:335`) — verified absent on both `/units` and `/units/{id}` | Add `created_at` to the unit resource | ISO 8601 string |

### 9d. Live-API defects found during verification

These are **backend** issues, evidenced by probes run today. They are listed
here because the frontend depends on them.

| # | Finding | Evidence |
|---|---|---|
| 1 | **`?city=` filter matches nothing.** Every other filter works. | `GET /units` → `meta.total = 2`, both rows `"city":"الرياض"` (codepoints `627 644 631 64a 627 636` — plain Arabic). `GET /units?city=الرياض` → `meta.total = 0`. Partial (`الري`) also 0. Controls: `type=studio`, `capacity=2`, `min_price=100`, `max_price=5000`, `min_rating=0`, `features[]=wifi` each return `total = 2`. **This breaks the homepage `FilterBar` city search, which is the primary search entry point** (`FilterBar.tsx:37`). |
| 2 | **`cancellation_policy` returns `"no_cancel"`, a value the frontend does not know.** `TEMPLATE_MAP` (`adapters.ts:205-213`) covers `flexible, 24_hours, 48_hours, moderate, 7_days, strict, non_refundable` — `"no_cancel"` falls through to the `'moderate'` default (`:239`). Harmless on the unit page (the structured `cancellation_policy_details` wins), but `mapBooking` uses this legacy enum as its pre-payment fallback (`adapters.ts:410-411`), so an unpaid booking on a no-cancel unit displays *moderate* refund tiers. | `GET /units/34` → `"cancellation_policy": "no_cancel"` alongside `"cancellation_policy_details": {template: "moderate", …}` |
| 3 | **`created_at` is absent** from both the list and detail unit resources. | keys returned: `id, name, type, code, price, capacity, bedrooms, beds, bathrooms, area, city, district, lat, lng, description, checkin_time, checkout_time, cancellation_policy, cancellation_policy_details, status, is_featured, tax_percent, approval_status, images, features, amenities, avg_rating, reviews_count, owner` |
| 4 | **`owner` is present on `/units/{id}` but absent on `/units`.** Anything rendered from the list has `ownerName: ''` and `ownerVerified: false` (`adapters.ts:302-306`). | compared key sets, above |
| 5 | **404 bodies leak internals.** `GET /units/999999` → `{"message":"No query results for model [App\\Models\\Unit] 999999"}`. `http()` copies `message` straight into `ApiError` (`client.ts:120`), and several screens render `e.message` verbatim. | live probe |
| 6 | **Listing coordinates look wrong.** Unit 34 is `حي النرجس, الرياض` but reports `lat 23.854463, lng 47.658672` — roughly 120 km south-east of Riyadh (≈24.77 N, 46.72 E). The homepage map plots exactly these values (`page.tsx:82`, `LocationMap.tsx:82-88`). | `GET /units/34` |
| 7 | **`is_featured: false` on a unit returned by `/units/popular`.** "Popular" and "featured" are evidently different server-side concepts; the frontend's `Unit.isFeatured` drives the *"مميز"* badge (`UnitCard.tsx:48`) and the default sort (`units-page-client.tsx:45-47`). | `GET /units/popular` row 1 |

---

## 10. Mock vs Real feature matrix

`NEXT_PUBLIC_USE_MOCK=false` is already the committed setting in `.env.local`,
so the "what breaks today" column describes **the current production
configuration**, not a hypothetical switch.

| Feature | Mock behaviour | Real behaviour | Gap | What breaks with `NEXT_PUBLIC_USE_MOCK=false` today |
|---|---|---|---|---|
| Unit search | 6 fixtures filtered/sorted **fully in memory**, including price, rating and amenities (`mock/index.ts:138-168`) | Server filters by `city/type/capacity/min_price/max_price/min_rating/features[]/sort`, paginated at 12 | Mock is unpaginated and ignores dates | **City filter returns nothing** (§9d-1); results capped at 12 with no pager |
| Unit detail | `findUnitById` over fixtures (`mock/index.ts:170-174`) | `GET /units/{id}` | — | Works. ⚠️ `MOCK_UNITS` contains a **duplicate id `U-002`** (`data/mock/units.ts:64` and `:104`), so the second fixture is unreachable in mock mode |
| Reviews | 2 fixtures (`data/mock/reviews.ts:3-26`) | `GET /units/{id}/reviews` | — | Works (returns `[]` today) |
| Availability + quote | `computeMockPricing` mirrors the backend formula exactly (`mock/index.ts:92-102`) | `POST /units/{id}/availability` | — | Works, and the identity `nightly_rate × nights === gross` now holds server-side too |
| Homepage content | `testimonials/categories/cities/budgets` all return `[]` | 4 real endpoints, all 200 | **Mock renders an empty homepage** | Works better than mock |
| Login / register OTP | Fixed code `111222`; any phone accepted (`mock/index.ts:110-118`) | Real SMS + `intent` pre-checks | Mock has no `PHONE_NOT_REGISTERED` / `PHONE_ALREADY_REGISTERED` branch, so those two dialog states (`LoginDialog.tsx:166`, `RegisterDialog.tsx:194`) are unreachable in mock | Works |
| **Partner onboarding** | ❌ **no mock branch** (`client.ts:239`) | `POST /auth/partner/register` multipart | Total | Works only in real mode — **the flow is broken whenever mocks are on** |
| Email verification | Full state machine: pending email, 5 attempts, 60 s cooldown, `taken@mamsaa.com` sentinel (`mock/index.ts:340-380`) | 3 real endpoints | Mock is the more complete of the two | Works |
| Booking creation | Enforces `emailVerified` first (`mock/index.ts:238`), snapshots the policy, returns a full `Booking` | `POST /bookings` returns the server's booking | Mock invents `payment.last4` (`:269`) | Works. ⚠️ adults/children split and all 4 guest fields are dropped |
| Payment | No gateway; `initiate` returns a zeroed stub with `testMode:true`, `pay` always succeeds (`client.ts:782-795`, `:817`) | Moyasar hosted form / quick pay / 3-DS / server verify | Mock cannot exercise 3-DS, declines, or Apple Pay | Works |
| Saved cards | 2 fixtures **without `chargeable`** (`data/mock/users.ts:14-17`) | `GET /user/cards` | Quick-pay filters on `chargeable === true` (`payment/page.tsx:78`), so **mock shows no quick-pay cards at all** | Works |
| Transactions | 5 fixtures (`data/mock/users.ts:25-71`) | `GET /user/transactions` | — | Works |
| Favourites | Local-only; `list/add/remove` are no-ops (`client.ts:999-1014`) | 3 real endpoints + login merge | Mock never exercises the merge path | Works. ⚠️ Only page-1 favourites are resolvable (§9c-2) |
| Cancellation | Local pure engine computes the refund (`mock/index.ts:278-299`) | Server preview + server refund; the frontend renders the server's numbers | Mock is the *only* consumer of `previewCancellation`/`buildRefundRecord` from `lib/cancellation/engine.ts` | Works |
| Tax invoice | `getInvoice` builds from the fixture booking, `qrCode: null` (`mock/index.ts:203-229`) | `GET /bookings/{id}/invoice` | — | Works; QR shows the placeholder until the backend ships the payload |
| Contact form | Always `{ok:true}` | `POST /contact` | Mock cannot fail | Works |
| Account deletion | Clears `currentUser`, returns `{deleted:true}` | `DELETE /user/account`, returns `{ok:true}` | **Return shapes disagree** | Works (no caller inspects the value) |
| MCP server | ❌ **refuses to run** — throws `McpDataError` if `USE_MOCK` (`lib/mcp/units.ts:33-35`) | Real API only | By design | Works |

---

## 11. Business rules encoded in the code

| Rule | Value found | Where defined | Duplicated elsewhere? |
|---|---|---|---|
| **Pricing formula** | `gross = pricePerNight × nights`; `netBase = gross / (1 + VAT_RATE)`; `vat = gross − netBase` (by **subtraction**, so `netBase + vat === gross` exactly after rounding) | `src/lib/pricing.ts:41-64` (`splitGross`, `quoteFromNightly`) | ⚠️ Re-implemented in the mock backend at `src/lib/api/mock/index.ts:92-102` — but it *calls* `quoteFromNightly`, so there is one arithmetic source. The **server** also computes it independently (verified live). |
| **VAT %** | `VAT_RATE = 0.15`; `VAT_PERCENT_LABEL = 15` | `src/lib/constants/brand.ts:57`, `:59` | Read in 4 modules (`pricing.ts:19`, `client.ts:46`, `adapters.ts` via `client`, `mock/index.ts:10`). ⚠️ The server also sends `vat_rate`/`tax_percent`; `vatPercentLabel()` prefers the server's when available (`pricing.ts:28-30`), falls back to the constant on frozen bookings. |
| **Cleaning fee** | **Absent — correctly.** No occurrence of any cleaning-fee concept in `src/`. | — | Explicitly asserted by tests: `PriceBreakdown.test.tsx:39` ("never renders a figure larger than the payable total"), `units/[id]/page.test.tsx:53` ("renders no service fee row"). |
| **Service fee** | **Absent — correctly.** | — | Same tests as above; the intent is stated at `mock/index.ts:75-76` and `PriceBreakdown.tsx:6`. |
| **Commission %** | **Absent from this repo — correctly.** No `commission`, `partnerShare`, `platformFee` or `margin` anywhere in `src/`. | — | Guarded by a test: `src/app/units/[id]/price-parity.test.tsx:90-91` — *"Guest surfaces never receive platform margin"*. |
| **Commission split function** | Not present. | — | Belongs to the partner/admin repos. |
| **Currency** | `{code:'SAR', symbolAr:'ر.س', symbolEn:'SAR'}` | `src/lib/constants/brand.ts:42-46` | ⚠️ `'SAR'` is hardcoded as a literal in **7** places: `client.ts:330,408,539,602,775` (type + fallbacks), `app/mcp/route.ts:41`, `components/agents/WebMcpTools.tsx:45`. `ر.س` also appears literally in `lib/utils/booking-confirmation.ts:74`. |
| **Phone format** | Accepts `05XXXXXXXX` (10), `5XXXXXXXX` (9), `9665XXXXXXXX` (12); normalises to E.164 `+9665XXXXXXXX`; `toSaudiLocal` converts back to `05…` for the backend | `src/lib/utils/phone.ts:5-30` | ⚠️ `PhoneInput` re-implements prefix-stripping independently (`ui/phone-input.tsx:10-24`), and `OnboardingForm.tsx:189-198` builds its own `+966` input rather than using `PhoneInput`. |
| **OTP length** | `6` | `src/lib/constants/brand.ts:83` (`OTP_CONFIG.length`) | ⚠️ Hardcoded **again** in the Zod schema: `.length(6, …)` and `/^\d{6}$/` at `src/lib/validation/schemas.ts:22-23`. |
| **OTP expiry** | `expirySeconds: 60` | `brand.ts:84` | ⚠️ **Never read anywhere** — the UI displays no expiry countdown. |
| **OTP max attempts** | `maxAttempts: 3` | `brand.ts:85` | ⚠️ **Never read.** The mock enforces a *different* number — `EMAIL_MAX_ATTEMPTS = 5` (`mock/index.ts:35`) — and the real limit is the server's. Three different answers. |
| **OTP resend cooldown** | `resendCooldownSeconds: 30` | `brand.ts:86` | ⚠️ Contradicted twice: `OtpVerificationForm` defaults to it (`:66`) but `email-verification.tsx:27` defines `RESEND_COOLDOWN_SECONDS = 60`, and the mock uses `EMAIL_RESEND_COOLDOWN_SECONDS = 60` (`mock/index.ts:34`). The server's `resend_available_in` overrides all of them when present (`OtpVerificationForm.tsx:139`). |
| **Mock OTP code** | `'111222'` (code default) vs `123456` (`.env.example`) | `src/lib/api/mock/index.ts:28` | ⚠️ Disagrees with `.env.example` — see §3.4. |
| **Booking statuses enum** | `'pending_payment' \| 'confirmed' \| 'completed' \| 'cancelled'` | `src/types/index.ts:118-122` | Backend aliases mapped in `BOOKING_STATUS_MAP` (`adapters.ts:226-236`): `pending`, `pending_payment`, `awaiting_payment` → `pending_payment`; `confirmed`, `paid`, `active` → `confirmed`; `completed`; `cancelled`, `canceled`. Fallback is `'confirmed'` with a documented warning that neither default is safe (`adapters.ts:380-392`). |
| **Unit lifecycle statuses enum** | `'draft' \| 'pending' \| 'approved' \| 'rejected'` | `src/types/index.ts:34`; validated list at `adapters.ts:287` | Mapped from the API's **`approval_status`**, not `status` (`adapters.ts:310`). ⚠️ The live API also sends `status: "available"`, which the frontend ignores entirely. |
| **Refund statuses** | No dedicated enum. `RefundRecord` carries `{amount, percent, tierLabel, refundedAt, reason?, cancelledBy}` | `src/types/index.ts:147-154` | `cancelledBy` closed set `['customer','partner','admin','system']` at `adapters.ts:345`, default `'customer'` (`:348`). `Transaction.status` is a separate union `'completed'\|'pending'\|'failed'` (`types/index.ts:241`). |
| **Cancellation policy presets + percentages + tiers** | **flexible**: ≥7 d → 100%, ≥3 d → 75%, ≥0 d → 50%. **moderate**: ≥7 d → 100%, ≥3 d → 50%, ≥0 d → 25%. **strict**: ≥7 d → 75%, ≥3 d → 25%, ≥0 d → 0%. All `postCheckInBehavior: 'hidden'` | `src/lib/constants/cancellation-policies.ts:9-43` | ⚠️ **Duplicated in three more places**: (a) the published agent skill `public/.well-known/agent-skills/booking-policy/SKILL.md` restates the whole table by hand; (b) the backend's own refund engine, whose tiers arrive as `cancellation_policy_details` and are preferred at render time (`adapters.ts:259-271`); (c) the test fixtures. Live probe confirms the backend's `moderate` matches (168 h → 100%, 72 h → 50%, 0 h → 25%). |
| **Tier day/hour conversion** | Backend counts **hours** before check-in; the frontend engine and UI work in **days** — `minDaysBeforeCheckIn = min_hours_before_checkin / 24` | `adapters.ts:253-257` | The literal `24` also appears in `engine.ts:21` (`MS_PER_DAY`) and `adapters.ts:459` (`Math.floor(hours / 24)`). |
| **Check-in day boundary** | Midnight **Asia/Riyadh**, fixed UTC+3, no DST — `PROPERTY_UTC_OFFSET_HOURS = 3` | `src/lib/cancellation/engine.ts:32` | Single source; four tests pin the exact boundary instant (`engine.test.ts:53,59-78`). |
| **Booking-tab boundary** | `14` days separates *upcoming* from *active* | `src/app/my-reservations/page.tsx:58` | ⚠️ **Inline magic number**, no constant. Documented only in the comment at `:39-45`. |
| **Payout minimum + frequency** | ⚠️ **UNKNOWN — not present in this repo.** No `payout`, `minimumPayout`, `settlement` or `withdraw` symbol exists in `src/`. | — | Partner/admin concern; this repo has no guest-facing surface for it. |
| **Review SLA hours** | ⚠️ **UNKNOWN — not present in this repo.** No SLA constant. `ContactHostDialog` shows a `hostRespondsIn` string from `messages/` (`ContactHostDialog.tsx:49`) but nothing enforces or computes it. | — | — |
| **Review eligibility** | Mock requires `status === 'completed'` and no existing review (`mock/index.ts:306-307`). Real mode relies on `booking.isReviewed` (`adapters.ts:412`) and the server. UI gates on `status === 'completed' && !hasReview` (`my-reservations/[bookingId]/page.tsx:131`) | split | Rating 1–5, comment 10–1000 chars (`schemas.ts:51-56`). |
| **Date format** | `display: 'dd/MM/yyyy'`, `displayLong: 'dd MMMM yyyy'`, `iso: 'yyyy-MM-dd'` — **Gregorian only, a signed-off decision** | `src/lib/constants/brand.ts:76-80` | ⚠️ Numerals are forced Latin via `Intl.NumberFormat('en-US')` (`format.ts:10,18,47`), a documented design decision (`format.ts:6-8`). Long dates use the `ar` date-fns locale unconditionally (`format.ts:34`) — **even when the UI is in English**. |
| **Ledger table/field names** | ⚠️ **UNKNOWN — not present in this repo.** The closest thing is the read-only `Transaction` view model `{id, refCode, type, amount, description, date, status}` (`types/index.ts:234-242`) mapped from `ref_code`/`amount`/`date` (`adapters.ts:490-500`). No ledger, journal or double-entry concept exists frontend-side. | — | — |
| **Admin roles + permissions** | `UserRole = 'user' \| 'individual' \| 'company' \| 'super_admin'` | `src/types/index.ts:9` | Derived in `mapRole` (`adapters.ts:502-506`): `is_admin` → `super_admin`; `!is_partner` → `user`; else `partner_type === 'company' ? 'company' : 'individual'`. ⚠️ **`role` is stored and never used for a single decision** — `grep "role ===\|role !==" src/` returns nothing. There is no permission model in this repo. |
| **Invoice seller of record** | `{name:'شركة ممسى للتقنية', vatNumber:'310456370500003', crNumber:'1010456370', address:'الرياض، المملكة العربية السعودية'}` | `src/lib/constants/brand.ts:69-74` | Used only as a last resort — the server's `seller` block wins whole (`client.ts:578-587`). ⚠️ **`INVOICE_SELLER.crNumber` (`1010456370`) contradicts `BRAND.crNumber` (`1010920108`, `brand.ts:24`)**, and the footer renders the latter (`Footer.tsx:94`). Two different CR numbers ship in the same build. |
| **Pagination page size** | `PAGINATION.pageSize = 12` | `src/lib/constants/brand.ts:89-91` | ⚠️ **Never imported.** Coincidentally equals the server's `per_page: 12`, but nothing connects them. |
| **Price filter bounds** | `PRICE_FILTER = {min:0, max:5000, step:50}` | `src/lib/constants/brand.ts:93-97` | ⚠️ **Never imported.** The same three numbers are hardcoded at `units-page-client.tsx:19` and again at `SidebarFilters.tsx:48-50`. |
| **Amenity vocabulary** | 15 keys: `wifi, pool, kitchen, parking, ac, garden, smart_tv, washer, security, self_checkin, family_friendly, bbq, elevator, private_beach, event_hall` | `src/lib/constants/brand.ts:104-120` | ⚠️ **Triplicated**: `AMENITY_ICONS` (`units/[id]/page.tsx:34-39`), the `amenities` message namespace, and the legacy Arabic-label map `FEATURE_KEYS` (`adapters.ts:191-202`). The sidebar exposes only the **first 6** (`SidebarFilters.tsx:113`). |
| **Unit type labels** | `UNIT_TYPE_LABELS_AR = {apartment:'شقة', studio:'استديو', villa:'فيلا', all:'الكل'}` | `src/lib/constants/brand.ts:122-127` | ⚠️ **Never imported** — superseded by the `types` message namespace. Dead constant. |
| **Cities list** | 7 hardcoded: `الرياض, جدة, مكة, المدينة, الدمام, أبها, العلا` | `src/components/features/units/FilterBar.tsx:11-19` | ⚠️ Should come from `GET /units/cities`, which exists, works, and whose client function is never called. |
| **Moyasar version** | `1.14.0` | `src/lib/payments/moyasar.ts:12` | Also `methods: ['creditcard','applepay']`, `apple_pay.country: 'SA'`, `label: 'Mamsa'`, `save_card: true` (`:103-109`). |
| **Card brand detection** | visa `^4`; mastercard `^5[1-5]|^2[2-7]`; else mada | `src/app/account/payment-methods/page.tsx:25-29` | Inline in the page, not in `lib/`. |
| **Document upload limits** | 5 MB; `jpg/jpeg/png/pdf` | `src/components/features/auth/OnboardingForm.tsx:49-52` | Mirrors an unstated backend rule; duplicated in the comment at `client.ts:247`. |
| **National ID / CR format** | `/^\d{10}$/` for both | `src/components/features/auth/OnboardingForm.tsx:45` | Placeholders imply different prefixes (`1XXXXXXXXX` for ID, `7XXXXXXXXX` for CR, `:225`,`:251`) but the regex does not enforce them. |
| **Toast duration** | 4000 ms | `src/components/shared/ToastHost.tsx:12` | Inline. |
| **Mock latency** | 300 ms | `src/lib/api/client.ts:52` | Inline constant, mock-mode only. |
| **MCP upstream timeout** | 10 000 ms | `src/lib/mcp/units.ts:21` | ⚠️ The main API client has **no timeout at all**. |

### 11.1 Magic numbers and strings that should be constants

| Value | Location | Why it matters |
|---|---|---|
| `14` (upcoming/active tab split) | `src/app/my-reservations/page.tsx:58` | A product rule with no name |
| `[0, 5000]` / `step 50` | `units-page-client.tsx:19`, `SidebarFilters.tsx:48-50` | `PRICE_FILTER` exists and is unused |
| `6` (OTP length) | `src/lib/validation/schemas.ts:22-23` | `OTP_CONFIG.length` exists |
| `60` (email resend cooldown) | `email-verification.tsx:27`, `mock/index.ts:34` | Contradicts `OTP_CONFIG.resendCooldownSeconds = 30` |
| `5` (email max attempts) | `mock/index.ts:35` | Contradicts `OTP_CONFIG.maxAttempts = 3` |
| `4.8 / 4.5 / 4` (rating labels) | `units/[id]/page.tsx:42-45` | Unnamed product thresholds |
| `75 / 25` (refund badge colours) | `CancellationPolicyDisplay.tsx:59-61` | Colour thresholds duplicated from tier percentages |
| `'SAR'` | 7 sites (see the Currency row) | `CURRENCY.code` exists |
| `'CURRENT_USER'` | `adapters.ts:378,469`, `mock/index.ts:189,256,312`, `data/mock/*` | A sentinel user id leaking into the real-mode adapter (`adapters.ts:378`) |
| `86400000` | `units/[id]/page.tsx:86` | Raw ms-per-day; `MS_PER_DAY` exists at `engine.ts:21` |
| `'ngrok-skip-browser-warning'` | `client.ts:89`, `lib/mcp/units.ts:47` | Dev-tunnel leftover shipped to production |
| `'510bd1445bcfa63e…'` (domain verification) | `layout.tsx:37` | Verification token inline in the layout |
| `'SHVHY2xMRXY2L1MxOEQ0c0tYbmdSZz09'` (SBC seal token) | `layout.tsx:68` | Third-party widget token inline |
| Unsplash URLs ×6 | `page.tsx:24-26,92`, `about/page.tsx:53`, `contact/page.tsx:76,176`, `host/page.tsx:56` | Production marketing imagery on a third-party CDN |

---

## 12. Auth & session

### 12.1 Login flow (phone OTP), step by step

1. `Header.tsx:150` or any auth-gated action calls `useUiStore.openAuth('login')` (`stores/ui.ts:18`).
2. `LoginDialog` opens at step `phone` (`LoginDialog.tsx:25`).
3. Submit → Zod `makeLoginSchema` validates the phone (`schemas.ts:27-31`, `LoginDialog.tsx:43`).
4. `normalizeSaudiPhone` → E.164 (`phone.ts:5-20`), then `toSaudiLocal` → `05XXXXXXXX` (`phone.ts:27-30`).
5. `authApi.requestOtp(local, 'login')` → `POST /auth/request-otp` (`client.ts:190`).
6. `422 PHONE_NOT_REGISTERED` → step `not-registered`, offering sign-up with the number prefilled (`LoginDialog.tsx:73-77`, `:101-106`).
7. A rate-limit message containing "N ثانية/seconds" is parsed into a live countdown (`LoginDialog.tsx:80-81`).
8. Otherwise step `otp`; `OtpVerificationForm` renders 6 boxes, auto-advances, handles paste, auto-submits on completion (`OtpVerificationForm.tsx:109-131`).
9. `authApi.verifyOtp(local, code)` → `POST /auth/verify-otp` (`client.ts:198`).
10. If `needs_profile` is true the dialog refuses to start a session and routes to sign-up instead (`LoginDialog.tsx:93-96`).
11. `useAuthStore.setSession(user, accessToken, refreshToken)` (`stores/auth.ts:31-34`) → `tokenManager.setTokens` writes both tokens to `localStorage`; the store keeps **user data only**.
12. `FavoritesSync` observes `isAuthenticated` and merges guest favourites into the account (`FavoritesSync.tsx:20-24` → `favorites.ts:44-62`).

### 12.2 Registration flow

`RegisterDialog.tsx` — Zod-validated form (first/last/email/phone,
`schemas.ts:33-40`) → `authApi.register` which sends **only the phone** with
`intent: 'register'` (`client.ts:220-226`) → `422 PHONE_ALREADY_REGISTERED`
routes to login (`:74-78`) → OTP verify → `setSession` → **then**
`authApi.completeProfile` persists the name and email best-effort; a failure is
swallowed because the session already exists (`RegisterDialog.tsx:100-109`).

### 12.3 Partner registration flow

`partner-onboarding/page.tsx` — form → `authApi.requestOtp(phone05)` **with no
`intent`** (deliberate: the phone may already be a customer account,
`client.ts:184-185`) → OTP → `authApi.partnerRegister` multipart with the
identity/CR document (`:57-67`). A 422 on a file field is carried back to the
form and shown under the file input (`:68-81`). **No session is started** — the
partner is told approval arrives by email (`:5-8`, `SuccessPanel` `:232`).

### 12.4 Email verification (a contact channel, never a login factor)

`components/account/email-verification.tsx` — four steps (`idle` → `form` →
`otp` → `verified`, `:29`). `POST /user/email` → `POST /user/email/verify` →
`POST /user/email/resend`. A `RATE_LIMITED` on step 1 is treated as "a code is
already live" and opens the OTP step seeded with the server's `retry_after`
rather than stranding the user (`:87-92`). At checkout an unverified email
**disables the pay button** (`checkout-page-client.tsx:321`) and a stale
`EMAIL_VERIFICATION_REQUIRED` from the server reopens the card without losing
typed data (`:185-190`).

### 12.5 Phone-change flow

`account/phone/page.tsx` — Zod-validated new phone → `POST /user/change-phone`
(`:44`) → OTP → `POST /user/change-phone/verify` (`:56`) →
`updateUser({phone})` (`:57`). The token pair is **not** rotated.

### 12.6 Token storage, expiry, refresh, logout

| Aspect | Detail | Source |
|---|---|---|
| Storage | `localStorage`: `mamsa.accessToken`, `mamsa.refreshToken` | `lib/auth/tokens.ts:13-14` |
| Sole owner | `tokenManager` — the auth store holds **no** token copy, precisely so a refresh cannot leave a stale duplicate | `tokens.ts:1-11`, `stores/auth.ts:4-8` |
| Persisted user | `localStorage` key `mamsa.auth`, `partialize` to `{user, isAuthenticated}` | `stores/auth.ts:45-47` |
| Access-token lifetime | ~1 hour (`expires_in: 3600`) per the comment | `client.ts:63-65` |
| Client-side expiry check | ❌ **none** — no `exp` is decoded; expiry is discovered by receiving a 401 | — |
| Refresh trigger | A 401 on any request that has a token, is not a retry, and is not `/auth/refresh` | `client.ts:99` |
| Refresh single-flight | `refreshInFlight` collapses concurrent 401s into one call | `client.ts:70`, `:75-95` |
| Replay | Exactly **one** retry per request | `client.ts:101` |
| Logout (explicit) | `authApi.logout()` (errors swallowed) then `useAuthStore.logout()` → `tokenManager.clear()` + reset | `Header.tsx:56-59`, `stores/auth.ts:39-42` |
| Logout (forced) | `forceLogout()` on a failed refresh — dynamic-imports the store to keep it out of the server graph | `client.ts:52-56`, `:102` |
| Post-logout redirect | ❌ **none** — the user stays on the page they were on; `/account` and `/my-reservations` then render their loading/error states rather than a sign-in prompt | — |

### 12.7 Route protection — where it is (and is not) enforced

| Layer | Present? | Detail |
|---|---|---|
| `middleware.ts` guard | ❌ **No.** The middleware handles `Accept: text/markdown` only (`middleware.ts:14-33`). It performs **zero** auth work. |
| Server-side layout guard | ❌ No — the single `layout.tsx` reads no session. |
| Component guard | ⚠️ Partial. Two places gate an **action**, not a route: `units/[id]/page.tsx:104` (book → opens the login dialog) and `checkout-page-client.tsx:155-159` (confirm → opens the login dialog). |
| API-level | ✅ The only real enforcement — the backend 401s and `http()` refreshes-or-logs-out (`client.ts:99-104`). Verified live: `GET /user/bookings` and `GET /payments/config` both return `401 {"message":"Unauthenticated."}`. |

**Consequence:** every "private" route is directly reachable by a signed-out
visitor. `/account`, `/my-reservations`, `/my-reservations/[id]`,
`/my-reservations/[id]/invoice`, `/account/phone`, `/account/payment-methods`,
`/payment/[id]`, `/booking/[unitId]` all render, fire their fetch, receive a 401,
and then show whatever that page's failure path is — which for
`/my-reservations/[id]` and `/favorites` is **an infinite loading state** (§5.10,
§5.12). No page shows a "please sign in" prompt.

`robots.txt` disallows these paths from indexing (`robots.txt/route.ts:33`),
which is a privacy mitigation, not access control.

### 12.8 Role / permission checks

`User.role` is computed (`adapters.ts:502-506`) and persisted, and
`mapUserProfile` carefully strips it so a profile edit cannot downgrade an admin
(`adapters.ts:527-536`). But **no code branches on it**: `grep "role ===\|role
!==\|isAdmin\|super_admin" src/` finds only the type definition and the mapper.
This repo has no role-gated surface — by design, since partners and admins use
separate applications.

### 12.9 What happens on 401 / 403

| Status | Behaviour | Source |
|---|---|---|
| `401`, token present, first attempt | Silent refresh + one replay | `client.ts:99-101` |
| `401`, refresh fails | `forceLogout()` then `ApiError(401, 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى.')` | `client.ts:102-103` |
| `401`, no token (guest) | Falls through to normal error handling — the raw server message (`"Unauthenticated."`, English) reaches the UI | `client.ts:99` (condition fails) |
| `401` on `/auth/refresh` itself | Excluded from the retry to avoid a loop | `client.ts:99` |
| **`403`** | ⚠️ **No special handling whatsoever** — treated as a generic error; the server's message is surfaced verbatim | `client.ts:106-135` |
| `429` | Normalised to `code: 'RATE_LIMITED'` with `retry_after`; rendered as a live countdown in the OTP dialogs | `client.ts:131-134`, `errors.ts:45` |
| `422` | `errors` bag preserved on `ApiError.fields` so a form can attach the message to the offending input | `client.ts:125`, used at `partner-onboarding/page.tsx:71-79` |

---

## 13. Forms & validation

### 13.1 Zod-validated forms (6 of 12)

Schemas are **factories taking a translator**, so messages follow the active
locale — Zod cannot read React context (`schemas.ts:4-9`).

| Form | Page/component | Fields | Schema | Rules | Submit handler | Success / error | Arabic messages? |
|---|---|---|---|---|---|---|---|
| Login | `LoginDialog.tsx:42` | `phone` | `makeLoginSchema` `schemas.ts:27` | required + `isValidSaudiPhone` | `onSubmitPhone` `:61` | step → `otp`; inline error `:131`; live cooldown `:132` | ✅ via `validation` namespace |
| Register | `RegisterDialog.tsx:43` | `firstName, lastName, email, phone` | `makeRegisterSchema` `schemas.ts:33` | names ≥2, `.email()`, phone rule | `onSubmitForm` `:62` | step → `otp`; inline `:159` | ✅ |
| OTP | `OtpVerificationForm.tsx` | 6 digit boxes | `makeOtpSchema` `schemas.ts:18` **— ⚠️ defined but never imported**; the component validates by "all boxes filled" (`:143`) | length 6, digits only | `submit` `:94` | inline error, boxes cleared + refocused `:101-103` | ✅ |
| Contact | `contact/page.tsx:42` | `name, phone, email, message` | `makeContactSchema` `schemas.ts:42` | name ≥2, phone, email, message ≥10 | `onSubmit` `:56` | success modal `:222`; inline error `:163`; `form.reset()` | ✅ |
| Review | `ReviewDialog.tsx:32` | `rating, comment` | `makeReviewSchema` `schemas.ts:51` | rating 1–5, comment 10–1000 | `onSubmit` `:37` | closes + `onSubmitted`; inline `:88` | ✅ |
| Change phone | `account/phone/page.tsx:33` | `newPhone` | `makeChangePhoneSchema` `schemas.ts:66` | phone rule | `onSubmit` `:38` | step → `otp`; success banner `:72` | ✅ |

`makeProfileUpdateSchema` (`schemas.ts:58-64`) is exported, takes **no
translator** (so its messages would be Zod's English defaults), and is
**imported nowhere**.

### 13.2 Forms with no schema (6)

| Form | Location | Fields | Validation actually used | Error handling | Arabic? |
|---|---|---|---|---|---|
| Checkout guest details | `checkout-page-client.tsx:236-261` | `firstName, lastName, email, phone` | Hand-rolled `validate()` `:145-150` with an **inline email regex** duplicating `isValidEmail` | Single inline line `:296` | ✅ from `checkout.errors.*` |
| Partner onboarding | `OnboardingForm.tsx:132` | `partnerType, name, email, phone, nationalId\|crNumber, file` | `EMAIL_RE` `:44`, `ID_RE` `:45`, `nameValid` ≥3 `:98`, file type/size `:49-57` | Per-field via `Field` `:431`; server 422 carried back from the OTP step | ✅ from `partnerOnboarding.form.*` |
| Add card | `payment-methods/page.tsx:375` | `name, number, month, year, cvc` | Luhn `:36-50`, 16 digits, `^\d{3}$` CVC `:336` | Inline `:458`, per-field `:421` | ✅ (Moyasar's own messages arrive in English, handled with `dir="auto"`) |
| Email verification | `email-verification.tsx:186` | `email` | `isValidEmail` `:73` | Inline `:196` + toast | ✅ from `ERROR_CODE_MESSAGES` (hardcoded, not in `messages/`) |
| Search / FilterBar | `FilterBar.tsx` | `city, type, capacity, start, end` | **none** — no date-order check | none | n/a |
| Sidebar filters | `SidebarFilters.tsx` | price range, rating, type, amenities | none needed | none | n/a |
| Cancel reason | `CancelBookingDialog.tsx:147` | `reason` | none (optional) | inline `:88` | ✅ |
| Contact host | `ContactHostDialog.tsx:89` | `message` | non-empty only `:31` | none | ✅ |

### 13.3 Validation duplicated across the codebase

| Rule | Canonical | Duplicates |
|---|---|---|
| Email | `isValidEmail` (`lib/utils/email.ts:1`) | `checkout-page-client.tsx:147` (inline regex), `OnboardingForm.tsx:44` (`EMAIL_RE`), `schemas.ts:37,47,62` (Zod `.email()`) — **4 different implementations** |
| Phone | `isValidSaudiPhone` (`lib/utils/phone.ts:22`) | `PhoneInput` prefix-stripping (`ui/phone-input.tsx:10-24`), `OnboardingForm.tsx:191` (`replace(/[^\d]/g,'')` + `maxLength=10`) |
| OTP length | `OTP_CONFIG.length = 6` (`brand.ts:83`) | `schemas.ts:22-23`, `OtpVerificationForm.tsx:65` (default param) |

---

## 14. i18n / RTL / content

### 14.1 Setup

| Aspect | Detail | Source |
|---|---|---|
| Library | `next-intl` 4.13.1 | `package.json:38` |
| Strategy | **Cookie-based, no URL prefix** — the whole site flips in place | `src/i18n/request.ts:4-6` |
| Locales | `['ar', 'en']`, default `ar` | `i18n/request.ts:8-10` |
| Cookie | `NEXT_LOCALE`, `path=/`, `max-age=31536000`, `SameSite=Lax` | `i18n/request.ts:11`, written at `LanguageToggle.tsx:21` |
| Message loading | Explicit static imports so webpack does not scan the directory | `i18n/request.ts:19-22` |
| Catalogues | `messages/ar.json` (87 KB), `messages/en.json` (69 KB) | — |
| **Key parity** | ✅ **Exact — 1019 keys each, zero keys unique to either file** (verified by flattening both trees and diffing) | — |
| Namespaces | 41: `meta, pricing, invoice, common, nav, footer, filter, cities, types, typesPlural, amenities, card, unitsPage, unit, gallery, map, picks, cancellationPolicy, home, testimonials, auth, validation, partnerOnboarding, emailVerification, checkout, payment, bookingConfirmation, paymentCallback, cancelBooking, bookingCard, contactHost, myReservations, bookingDetails, account, paymentMethods, favorites, contact, review, about, host, faq, policies` | — |
| Toggle UX | Rewrites the cookie then `router.refresh()` inside a transition | `LanguageToggle.tsx:20-23` |

### 14.2 RTL handling

| Mechanism | Detail | Source |
|---|---|---|
| Document direction | `<html dir={isArabic ? 'rtl' : 'ltr'}>` | `layout.tsx:48` |
| Font swap | `font-arabic` (IBM Plex Sans Arabic) vs `font-latin` (Inter) on `<body>` | `layout.tsx:50` |
| Logical properties | Used consistently — `ps-/pe-`, `ms-/me-`, `start-/end-`, `border-s-4` | e.g. `PolicyPage.tsx:43`, `UnitCard.tsx:43`, `page.tsx:127` |
| Directional icon flips | `ltr:rotate-180` / `rtl:rotate-0` on arrows | `host/page.tsx:69`, `my-reservations/[bookingId]/page.tsx:61`, `account/page.tsx:150` |
| Mobile drawer side | Chosen from the locale at runtime | `Header.tsx:176` |
| LTR islands | `dir="ltr"` on phone/email/card/OTP inputs and numeric displays | `phone-input.tsx:29`, `LoginDialog.tsx:123`, `payment/[bookingId]/page.tsx:206` |
| `dir="auto"` for gateway text | Keeps English Moyasar messages punctuated correctly inside RTL | `payment/[bookingId]/page.tsx:256`, `payment/callback/page.tsx:77`, `ToastHost.tsx:23`, `checkout-page-client.tsx:296` |
| Focus ring | Custom `:focus-visible` outline, RTL-safe | `globals.css:50-54` |

⚠️ **`UnitGallery` hardcodes `dir="rtl"` on the lightbox** (`UnitGallery.tsx:99`)
and its arrow keys assume RTL (`:30-31`) — the gallery navigates backwards in
English.

### 14.3 Hardcoded strings vs the message files

**Arabic strings living outside `messages/`:**

| String(s) | Location | Severity |
|---|---|---|
| 6 error messages (`ERROR_CODE_MESSAGES`) | `src/lib/api/errors.ts:34-39` | High — user-facing, never translated |
| `'حاول مرة أخرى بعد N ثانية'`, `'الرمز غير صحيح، متبقي N محاولات'` | `src/lib/api/errors.ts:45-47` | High |
| `'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى.'` | `src/lib/api/client.ts:103` | High |
| `'بيانات البطاقة غير صحيحة'` | `src/lib/payments/moyasar.ts:55` | High |
| `'فشل تحميل بوابة الدفع'` | `src/lib/payments/moyasar.ts:76` | Medium — has an English branch |
| `'جاري التحميل...'` | `src/app/booking/[unitId]/page.tsx:6` | Low — Suspense fallback |
| The entire print document (~15 Arabic strings) | `src/lib/utils/booking-confirmation.ts:14-86` | Medium — the PDF is Arabic-only regardless of locale |
| Mock error strings (`'الوحدة غير موجودة'`, `'الحجز غير موجود'`, …) | `src/lib/api/mock/index.ts:111,172,193,240,280,286,289,306-307` | Low — mock only |
| Page metadata | `src/app/picks/page.tsx:5-6` | Low |
| Initials fallback `'؟'` | `units/[id]/page.tsx:122`, `Header.tsx:62`, `ContactHostDialog.tsx:35` | Low |
| `DEFAULT_COUNTRY = 'السعودية'` | `src/lib/api/adapters.ts:28` | Medium — the mock fixtures say `'المملكة العربية السعودية'` instead (`data/mock/units.ts:38`), so the country label differs between mock and real |
| `FEATURE_KEYS` Arabic label map | `src/lib/api/adapters.ts:191-202` | Low — legacy fallback |
| Cancellation preset labels (`'مرنة'`, `'استرداد كامل'`, …) | `src/lib/constants/cancellation-policies.ts:11-42` | Medium — mitigated: the UI derives its labels from the tier *numbers* (`CancellationPolicyDisplay.tsx:44-64`) |
| `BRAND` copy (`nameAr`, `tagline`, `licenseAuthority`) | `src/lib/constants/brand.ts:17-24` | Low — intentional brand constants |

### 14.4 English text leaking into the Arabic UI

| Text | Location | Note |
|---|---|---|
| `"Unauthenticated."` | server 401 body, rendered verbatim when a guest hits a protected page | Verified live |
| `"No query results for model [App\Models\Unit] 999999"` | server 404 body | Verified live |
| Moyasar gateway messages | hosted form + `createCardToken` | Mitigated with `dir="auto"` |
| `CVC` | `payment/[bookingId]/page.tsx:219`, `payment-methods/page.tsx:444` | Deliberate — an industry term |
| `Mada` / `Visa` / `Mastercard` / `Apple Pay` | `my-reservations/[bookingId]/page.tsx:22-27`, `payment-methods/page.tsx:14-18` | Brand names |
| `EN` / `عربي` | `LanguageToggle.tsx:37` | The toggle itself |

### 14.5 Number / date / currency formatting

| Helper | Behaviour | Source |
|---|---|---|
| `formatSAR` | `Intl.NumberFormat('en-US')` + `' ر.س'`; 0 decimals for whole numbers, 2 otherwise | `lib/utils/format.ts:9-15` |
| `formatSARShort` | Rounds to a whole number + `' ر.س'` | `format.ts:17-20` |
| `formatDate` | `dd/MM/yyyy`, Gregorian; returns the raw string on a parse failure | `format.ts:22-29` |
| `formatDateLong` | `dd MMMM yyyy` with the **`ar` date-fns locale unconditionally** | `format.ts:31-38` |
| `formatDateRange` | `from → to` | `format.ts:40-43` |
| `formatNumber` | `Intl.NumberFormat('en-US')` | `format.ts:45-48` |
| `diffNights` | `Math.max(1, round(diff / 86400000))` | `format.ts:50-55` |

⚠️ Three issues: (a) **Latin numerals are forced in both locales** — a signed-off
decision, documented at `format.ts:6-8`; (b) the **currency symbol `ر.س` is
Arabic-only**, so English pages show `1,200 ر.س`; `CURRENCY.symbolEn` exists
(`brand.ts:45`) and is never used; (c) `formatDateLong` always renders Arabic
month names. `formatSARShort` and `formatDateRange` have **no callers**.

---

## 15. Assets, SEO, metadata

### 15.1 Assets in `public/`

| File | Size/use | Referenced from |
|---|---|---|
| `Mamsa_logo.png` | Header + onboarding logo, 668×375 | `Header.tsx:237`, `partner-onboarding/page.tsx:100` |
| `Mamsa_logo.jpg` | Footer logo, 668×375 | `Footer.tsx:16` |
| `Mamsa_logo.ico` | ⚠️ present but **never referenced** — the favicon is `src/app/favicon.ico` (App Router convention) | — |
| `onboarding-hero.png` | Partner onboarding side panel | `partner-onboarding/page.tsx:27,179` |
| `.well-known/apple-developer-merchantid-domain-association` | 9,122 bytes; Apple Pay domain verification | header pinned at `next.config.js:24-27` |
| `.well-known/api-catalog` | RFC 9727 linkset pointing at `https://api.mamsaa.com/api/v1` + `/up` health | `next.config.js:29-37`, advertised via `Link` header |
| `.well-known/mcp/server-card.json` | SEP-1649 card describing 4 tools | must mirror `src/app/mcp/route.ts:91-146` |
| `.well-known/agent-skills/index.json` | Agent Skills Discovery RFC v0.2.0, 2 skills with SHA-256 digests | generated by `scripts/build-agent-skills-index.mjs`; pinned by `src/lib/api/agent-skills.test.ts` |
| `.well-known/agent-skills/booking-policy/SKILL.md` | Pricing + cancellation rules for agents | ⚠️ restates the refund tables by hand — see §11 |
| `.well-known/agent-skills/search-rentals/SKILL.md` | Search guidance for agents | — |

### 15.2 `next/image` usage

Only **4 `<Image>` instances**, all local files: `Header.tsx:236`,
`Footer.tsx:15`, `partner-onboarding/page.tsx:99` and `:179`.

⚠️ **Every remote image on the site uses a plain `<img>`** — unit photos, unit
galleries, booking cards, avatars, review avatars, category tiles, marketing
heroes. `@next/next/no-img-element` is switched off globally
(`.eslintrc.json:5`). Consequences: no width/height optimisation, no responsive
`srcset`, no lazy-loading defaults, no LCP prioritisation, and a CLS risk on the
gallery. `next.config.js:11-14` whitelists `images.unsplash.com` and
`plus.unsplash.com` in `remotePatterns` — but since nothing routes through
`next/image`, **that whitelist is inert**, and the live API's own image host
(`api.mamsaa.com/storage/...`, verified §9) is not listed at all.

### 15.3 Metadata per route

| Route | Metadata | Source |
|---|---|---|
| root layout | `generateMetadata` from the `meta` namespace + `domain-verification` meta tag | `layout.tsx:30-40` |
| `/about` | `generateMetadata` — title from messages, description from `BRAND.tagline` | `about/page.tsx:12-16` |
| `/host` | `generateMetadata` from messages | `host/page.tsx:22-26` |
| `/faq` | `generateMetadata` from messages | `faq/page.tsx:7-11` |
| `/policies/*` (×5) | `generateMetadata` from messages | e.g. `policies/terms/page.tsx:7-11` |
| `/picks` | ⚠️ **static, hardcoded Arabic** | `picks/page.tsx:4-7` |
| **All other 16 pages** | ❌ **none** — they inherit the root title | — |

**Missing entirely:** no `openGraph`, no `twitter` card, no `alternates.canonical`,
no `robots` directives per route, no JSON-LD structured data. For a booking
site, the absence of `Product`/`Offer`/`AggregateRating` schema on
`/units/[id]` and of OG tags on every shareable page is a substantial SEO gap.

### 15.4 robots.txt & sitemap.xml

`/robots.txt` (`src/app/robots.txt/route.ts`, `force-static`):

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /account
Disallow: /favorites
Disallow: /my-reservations
Disallow: /booking
Disallow: /payment
Host: https://www.mamsaa.com
Sitemap: https://www.mamsaa.com/sitemap.xml
```

`/sitemap.xml` (`src/app/sitemap.ts:17-31`) — 13 static routes with priorities
1.0 → 0.4. ⚠️ `lastModified: new Date()` (`:15`) means **every URL reports "just
modified" on every request**, which devalues the signal. Unit detail pages are
absent (§9c-5). `/partner-onboarding` is listed at priority 0.7 (`:25`) although
it is a full-screen application form rather than indexable content.

---

## 16. Tests

### 16.1 Executed result

```
Test Files  15 passed (15)
     Tests  138 passed (138)
  Duration  116.78s
```

Command: `npx vitest run`. Environment `happy-dom`, globals on
(`vitest.config.ts:7-9`).

⚠️ The run emits repeated `IntlError: MISSING_MESSAGE: Could not resolve
'auth.debugOtp' in messages for locale 'ar'` from `DebugOtpHint.tsx:14`. This is
a **test-harness artefact, not a product defect** — the key exists in both
catalogues (verified: `ar.auth.debugOtp` and `en.auth.debugOtp` are both
present); the affected tests supply a partial message set. It is noise that
masks real failures and should be silenced.

### 16.2 Test files and what each covers

| File | Tests | Covers |
|---|---|---|
| `src/lib/cancellation/engine.test.ts` | 20 | `daysUntilCheckIn` at the Riyadh-midnight boundary (incl. viewer-timezone independence), tier cutoffs flipping at the exact instant, `resolveTier` for all 3 templates, `isBookingCancellable`, `previewCancellation`, **snapshot independence** (editing a policy after booking does not change the refund), `roundMoney` |
| `src/lib/pricing.test.ts` | 6 | `round2`; `splitGross` — VAT comes **out of** the total; `quoteFromNightly` — the gross rate is multiplied, never marked up; zero-night edge case |
| `src/lib/api/adapters.test.ts` | 18 | `mapCancellationPreview` (explicit/absent/negative forfeited, hours→days, null tier), `mapBooking` guests split, `cancelledBy` closed set, identity fields, `mapUser` compound-name handling, `mapRole` precedence |
| `src/lib/api/mock/index.test.ts` | 1 | Booking creation produces the exact same breakdown as `checkAvailability` for the same unit + dates |
| `src/lib/api/agent-skills.test.ts` | 9 | The committed `index.json` matches the `SKILL.md` bytes on disk; RFC v0.2.0 schema; well-formed names/types/urls/digests |
| `src/lib/utils/email.test.ts` | 2 | `isValidEmail` accept/reject |
| `src/app/units/[id]/page.test.tsx` | 2 | Booking widget shows the final VAT-inclusive price; no service-fee row; nothing shown before dates are picked |
| `src/app/units/[id]/price-parity.test.tsx` | 3 | **Quote, booking and invoice all report the same gross**; the unit page renders that same gross; **no commission/`partnerShare` on any guest payload** |
| `src/app/booking/[unitId]/checkout-page-client.test.tsx` | 5 | Pay button gated by `email_verified`; `EMAIL_VERIFICATION_REQUIRED` recovery keeps typed data; breakdown renders the server quote exactly; post-booking switch to the frozen price |
| `src/app/my-reservations/[bookingId]/invoice/page.test.tsx` | 10 | Mamsa is the seller of record; totals reconcile; QR placeholder vs real payload; one layout for pre- and post-conversion bookings; empty registration rows omitted; server name beats the constant; 409 is a state not a failure; genuine faults still error; invoice only for paid bookings |
| `src/app/partner-onboarding/page.test.tsx` | 9 | Individual blocked until a scan is attached; wrong-type/oversized files rejected client-side; multipart with browser-set `Content-Type`; 422 on a document returns to the form; companies never asked for an identity scan; `cr_file` optional; oversized CR rejected; 422 on `cr_file` |
| `src/components/account/email-verification.test.tsx` | 6 | All four card states across both contexts; store update on verify; 60 s cooldown countdown |
| `src/components/features/booking/BookingCard.test.tsx` | 3 | **An unpaid booking is never badged as paid** in either tab; a genuinely confirmed booking still is |
| `src/components/features/booking/PriceBreakdown.test.tsx` | 9 | Total equals gross; VAT-inclusive caption; no figure exceeds the total; split sums back; disclosure closed by default and positioned below the total |
| `src/components/agents/WebMcpTools.test.tsx` | 6 | No-op without WebMCP; registration via both API shapes; every tool read-only; summarised listings with absolute URLs; unregister on unmount |

The suite is unusually well-targeted: it pins the **money invariants** and the
**refund-policy invariants**, which are the two places a silent regression would
cost real money.

### 16.3 What is NOT covered

| Area | Gap |
|---|---|
| `src/lib/api/client.ts` (1032 lines) | **No test at all.** The `http()` wrapper, the envelope unwrap, the 401-refresh single-flight, `forceLogout`, the 429 normalisation and all 44 mock/real ternaries are untested. |
| Auth flows | `LoginDialog`, `RegisterDialog`, `OtpVerificationForm` — zero tests. No coverage of `PHONE_NOT_REGISTERED`, `PHONE_ALREADY_REGISTERED`, `needsProfile`, or the cooldown parsing. |
| Payment | `payment/[bookingId]` and `payment/callback` — zero tests. The 3-DS redirect, the `^https://` guard, simulate mode and quick-pay are unverified. |
| Zustand stores | All four untested — including the optimistic favourite toggle with rollback and the login merge (`favorites.ts:27-62`). |
| `TokenManager` | Untested. |
| Cancel flow | `CancelBookingDialog` untested; `bookingsApi.cancel`'s two-request dance untested. |
| Search & filters | `units-page-client`, `FilterBar`, `SidebarFilters` untested — including the client-side filtering that silently applies to only page 1. |
| Adapters | `mapUnit`, `mapReview`, `mapCard`, `mapTransaction`, `mapCategory`, `mapBudget`, `mapTestimonial`, `mapOffer`, `mapPolicyDetails`, `mapAmenities` — untested (only `mapBooking`, `mapUser`, `mapCancellationPreview` are). |
| i18n | No test asserts ar/en key parity, even though parity currently holds. |
| Error states | No test covers any of the missing-`.catch()` paths in §19. |
| Route handlers | `/api/md`, `/mcp`, `/robots.txt`, `/sitemap.xml`, `/auth.md` — untested. |
| E2E | None. No Playwright/Cypress; the booking→payment→confirmation journey is never exercised end to end. |
| Coverage tooling | No `--coverage` config, no threshold, no reporter. |

---

## 17. Build health

Run in order on 2026-08-25. **Nothing was fixed.**

### 17.1 `npx tsc --noEmit`

**PASS.** Exit code 0, no output, no errors.

### 17.2 `npx next lint`

**PASS.** `✔ No ESLint warnings or errors`, exit code 0.

Note the config disables two rules globally (`.eslintrc.json:3-6`):
`react/no-unescaped-entities` and `@next/next/no-img-element`. The second is why
§15.2's `<img>` usage passes silently.

### 17.3 `npx next build`

**PASS.** `✓ Compiled successfully`, `✓ Generating static pages (26/26)`, exit 0.

```
Route (app)                               Size     First Load JS
┌ ƒ /                                     7.62 kB         146 kB
├ ƒ /_not-found                           874 B          88.6 kB
├ ƒ /about                                2.13 kB         103 kB
├ ƒ /account                              4.71 kB         145 kB
├ ƒ /account/payment-methods              5.35 kB         139 kB
├ ƒ /account/phone                        6.59 kB         165 kB
├ ƒ /api/md                               0 B                0 B
├ ○ /auth.md                              0 B                0 B
├ ƒ /booking/[unitId]                     6.42 kB         151 kB
├ ƒ /booking/confirmation/[bookingId]     3.04 kB         137 kB
├ ƒ /contact                              6.32 kB         156 kB
├ ƒ /faq                                  2.13 kB         103 kB
├ ƒ /favorites                            3.34 kB         142 kB
├ ƒ /host                                 2.13 kB         103 kB
├ ƒ /mcp                                  0 B                0 B
├ ƒ /my-reservations                      6.29 kB         157 kB
├ ƒ /my-reservations/[bookingId]          7.1 kB          180 kB
├ ƒ /my-reservations/[bookingId]/invoice  10.5 kB         144 kB
├ ƒ /partner-onboarding                   8.14 kB         147 kB
├ ƒ /payment/[bookingId]                  6.15 kB         140 kB
├ ƒ /payment/callback                     3.11 kB         137 kB
├ ƒ /picks                                3.52 kB         142 kB
├ ƒ /policies/cancellation                1.06 kB         108 kB
├ ƒ /policies/house-rules                 154 B          87.8 kB
├ ƒ /policies/privacy                     154 B          87.8 kB
├ ƒ /policies/safety                      154 B          87.8 kB
├ ƒ /policies/terms                       154 B          87.8 kB
├ ○ /robots.txt                           0 B                0 B
├ ○ /sitemap.xml                          0 B                0 B
├ ƒ /units                                12.6 kB         156 kB
└ ƒ /units/[id]                           11.2 kB         147 kB
+ First Load JS shared by all             87.7 kB
ƒ Middleware                              26.5 kB
```

Observation: `/my-reservations/[bookingId]` is the heaviest route at **180 kB**
first-load JS — it pulls in three dialogs plus the print-document builder.
`/units` at 156 kB carries Leaflet.

### 17.4 Summary

| Command | Status | Errors | First 20 errors |
|---|---|---|---|
| `npx tsc --noEmit` | **PASS** | 0 | — |
| `npx next lint` | **PASS** | 0 | — |
| `npx vitest run` | **PASS** | 0 failed / 138 passed | — (see §16.1 for the `MISSING_MESSAGE` noise) |
| `npx next build` | **PASS** | 0 | — |

All four gates are green. Every problem in this report is a **runtime,
contract or design** issue, not a compile-time one.

---

## 18. Git state

### 18.1 Branch & remote

| Field | Value |
|---|---|
| Current branch | `main` |
| Remote | `origin` → `https://github.com/vego-group/mamsa-frontend.git` |
| HEAD | `7e5d14c2c0018b7554a16cfc32ac2d8ea098ef5d` |
| HEAD date | 2026-08-17 02:57:30 +0300 |
| Working tree | **clean** (`git status --porcelain` → empty) |
| Tags | **none** (`git tag -l` → 0). No release has ever been tagged. |

### 18.2 Commit history (all 28 commits — the repo is younger than 30)

| # | SHA | Date | Message |
|---|---|---|---|
| 1 | `7e5d14c` | 2026-08-17 | feat(onboarding): attach identity documents to partner sign-up |
| 2 | `c34cdad` | 2026-08-16 | feat(trust): add Saudi Business Center verified-store seal |
| 3 | `81ea9ee` | 2026-08-15 | feat(pricing): switch to VAT-inclusive gross pricing, add ZATCA tax invoice |
| 4 | `f45ef5a` | 2026-08-11 | fix(policies): anchor section accent bar to the text start in RTL |
| 5 | `8d9db2c` | 2026-08-11 | chore(legal): rename house rules page to سياسات الإقامة |
| 6 | `0fb29af` | 2026-08-11 | feat(legal): add privacy policy and terms & conditions pages |
| 7 | `0c4754e` | 2026-08-11 | fix(cancellation): show each refund tier's actual day window |
| 8 | `bcfe348` | 2026-08-11 | fix(footer): replace placeholder tourism license with commercial registration |
| 9 | `affa055` | 2026-08-11 | chore(legal): display commercial registration number in footer |
| 10 | `0cb1f98` | 2026-08-10 | chore(seo): add domain-verification meta tag for Saudi Business Center |
| 11 | `48ce3a9` | 2026-07-22 | feat(agents): read-only WebMCP catalogue tools |
| 12 | `0e8d709` | 2026-07-22 | feat(agents): publish agent-skills discovery index with two skills |
| 13 | `f2efa5b` | 2026-07-22 | feat: adopt new backend fields + MCP server for agent discovery |
| 14 | `481ca92` | 2026-07-21 | feat(seo): publish robots.txt + sitemap.xml with crawl rules |
| 15 | `48ba199` | 2026-07-19 | fix(email,cards): reconcile email verification contract + card form validation |
| 16 | `6ddc6ae` | 2026-07-19 | Set Mamsa_logo.ico as the site favicon |
| 17 | `d1d7de5` | 2026-07-18 | feat(checkout): server-computed pricing + email verification gate |
| 18 | `263406c` | 2026-07-16 | Remove categories section text |
| 19 | `f35d82f` | 2026-07-16 | remove text: Explore your destination |
| 20 | `b181ce3` | 2026-07-15 | refactor(auth,payments): consolidate tokens, unify OTP, fix cancellation timezone |
| 21 | `35853d4` | 2026-07-10 | feat(payments): saved-cards flow + security hardening pass |
| 22 | `6913d23` | 2026-07-09 | updates in payment |
| 23 | `8ada15f` | 2026-07-09 | update base url |
| 24 | `04de147` | 2026-07-08 | feat(payments): Moyasar hosted form integration + Apple Pay domain file |
| 25 | `a5dbc06` | 2026-07-06 | merge with endpoints |
| 26 | `d8cbfac` | 2026-06-30 | new updates |
| 27 | `6eae00b` | 2026-06-28 | maintenance |
| 28 | `c5fbc40` | 2026-06-28 | Initial commit: Mamsa frontend (Next.js 14) |

Six early commits (#18, #19, #22, #23, #26, #27) have non-descriptive messages;
everything from #20 onward follows Conventional Commits.

### 18.3 Uncommitted / untracked files

**None.** The working tree is clean at audit time.

> Note for the record: the git status captured when this session began listed
> `M src/app/units/[id]/page.tsx`, `M src/components/features/units/UnitGallery.tsx`,
> `M src/data/mock/units.ts` and several untracked files
> (`docs/backend/mamsa-unit-description-formatting.md`,
> `docs/backend/mamsa-unit-images-backend-task.md`,
> `src/components/shared/RichText.tsx`, `src/lib/utils/rich-text.ts`,
> `src/lib/utils/rich-text.test.ts`). **None of those files or modifications
> exist in the working tree now** — `git status --porcelain` is empty and
> `src/components/shared/RichText.tsx`, `src/lib/utils/rich-text.ts` and
> `src/lib/utils/rich-text.test.ts` are absent from the filesystem. This audit
> describes the tree as it actually is at `7e5d14c`. If that in-progress
> rich-text work was expected to be present, it has been reverted or stashed
> outside this session.

### 18.4 CHANGED SINCE LAST REPORT

No file matching `docs/PROJECT_STATE_*.md` existed before this one. There **is**
a prior audit at a different path — **`docs/audit/PROJECT-STATE-mamsa-app.md`**
(1,821 lines), dated **2026-08-12** at HEAD **`f45ef5a`**. The comparison below
is against that document.

**Commits added since the previous report:** 3 — `81ea9ee`, `c34cdad`, `7e5d14c`.
**Diff `f45ef5a..HEAD`:** 50 files changed, 4,563 insertions, 366 deletions.

#### New since the last report

| Item | Evidence |
|---|---|
| **VAT-inclusive pricing model** — `src/lib/pricing.ts` (65 lines) is a brand-new module and the only place allowed to do VAT arithmetic | `+65` in the diff |
| **ZATCA tax invoice** — `src/app/my-reservations/[bookingId]/invoice/page.tsx` (279 lines) and its 251-line test | new files |
| **`qrcode.react`** dependency added | `package.json:40`, `+1` line |
| **`PriceBreakdown` rewritten** — the tax split moved into a closed `<details>` **below** the total, so no figure ever exceeds the payable amount | `PriceBreakdown.tsx` `+69/-…` |
| **Partner identity documents** — `DocumentUpload` with drag-and-drop, type/size guards, and multipart registration | `OnboardingForm.tsx` `+356`, `client.ts` partnerRegister |
| **Saudi Business Center seal + `domain-verification` meta** | `layout.tsx:37,67-72` (`+7`) |
| **New tests** — `pricing.test.ts` (98), `price-parity.test.tsx` (102), `invoice/page.test.tsx` (251), `partner-onboarding/page.test.tsx` (315), `BookingCard.test.tsx` (93) | 5 new test files |
| **New constants** — `VAT_RATE`, `VAT_PERCENT_LABEL`, `INVOICE_SELLER` | `brand.ts` `+28` |
| **New docs** — `docs/backend/Mamsa-Switch-To-Production.md`, `SWITCH-TO-PRODUCTION.md`, `mamsa-cors-localhost-task.md` | new files |
| **Print CSS** — A4 invoice sheet, tabular numerals, `.no-print` | `globals.css` `+53` |

#### Changed

| Item | Evidence |
|---|---|
| `PriceBreakdown` type: `subtotal`/`total` replaced by `gross`/`netBase`/`vat` | `types/index.ts` `+19/-…`, documented at `:130-136` |
| `client.ts` grew by **233 lines** — `TaxInvoice` types + mappers, `mapQuotePricing`, `mapBookingSummary`, `mapSeller` | diff |
| `adapters.ts` `+42` — VAT-inclusive keys read first with a legacy fallback | `adapters.ts:397-407` |
| `mock/index.ts` `+95` — mock pricing rewritten to split VAT downward | `mock/index.ts:86-102` |
| `engine.ts` `+10` — refund maths switched from `subtotal+taxes` to `price.gross` | `engine.ts:137,171-172` |
| `messages/ar.json` and `en.json` `+73` each — `pricing.*` and `invoice.*` namespaces | diff |
| Both `SKILL.md` files rewritten for the new pricing model | `+33`, `+12` |
| `data/mock/bookings.ts` `+98` — fixtures rebuilt on gross rates | diff |
| `data/mock/units.ts` `-7` — a discount field removed | diff |

#### Removed

| Item | Evidence |
|---|---|
| Unit-level discount concept | `types/index.ts:88-89` now documents its deliberate absence |
| `subtotal`/`total` vocabulary from `PriceBreakdown` | replaced by `gross`/`netBase`/`vat` |

#### Findings from the previous report that are now RESOLVED

| Previous finding | Status |
|---|---|
| **1 failing test** (`units/[id]/page.test.tsx` — "Unable to find 4,800 ر.س", caused by hardcoded past dates colliding with the `min={todayStr}` floor) | ✅ **Fixed.** The suite is now 138/138 green, and the test count rose from 76 to 138. |
| Service-fee row on the booking widget | ✅ Removed; now pinned by two tests. |

#### Findings from the previous report that PERSIST

Carried forward unchanged: no route-level auth, no `error.tsx`/`not-found.tsx`/`loading.tsx`,
missing `.catch()` on `/favorites` / `/units` / `/my-reservations/[id]` / `/account` /
`/account/payment-methods`, `ContactHostDialog` being non-functional, the dead Share button,
`FilterBar`'s hardcoded city list, TanStack Query mounted but unused, and the
`PAGINATION`/`PRICE_FILTER`/`UNIT_TYPE_LABELS_AR` dead constants.

---

## 19. Debt & risk register

| # | Item | Severity | File path | Why it matters |
|---|---|---|---|---|
| 1 | **`?city=` filter returns zero rows against the live API** | **HIGH** | `src/components/features/units/FilterBar.tsx:37` → `src/lib/api/client.ts:414` | Verified live (§9d-1). The homepage search bar is the primary entry point to the catalogue; picking a city today returns "no results" for a catalogue that does contain that city. A backend fix, but the frontend has no fallback. |
| 2 | **Pagination `meta` silently discarded — the catalogue is capped at 12 units** | **HIGH** | `src/lib/api/client.ts:145-147`; `src/app/units/units-page-client.tsx:73-83` | The API paginates at `per_page: 12` (verified). `http()` returns `json.data` and drops `meta`/`links`; no page has a pager. Unit 13 onward is unreachable through the UI, and `/favorites` cannot resolve a favourite outside page 1. |
| 3 | **`/favorites` hangs forever on a failed fetch** | **HIGH** | `src/app/favorites/page.tsx:18-23` | No `.catch()`, and `setLoading(false)` lives inside `.then`. A rejected request leaves skeletons on screen permanently, plus an unhandled promise rejection. |
| 4 | **`/my-reservations/[bookingId]` hangs forever on a failed fetch** | **HIGH** | `src/app/my-reservations/[bookingId]/page.tsx:41-45` | `bookingsApi.getById(...).then(setBooking)` with no `.catch()`. A 401 or a 500 leaves the page on "جاري التحميل" with no recovery. |
| 5 | **No route protection at all** | **HIGH** | `src/middleware.ts:14-46` | Every private route renders for a signed-out visitor and then fails in whatever way its fetch fails — for #3 and #4 that is an infinite spinner. No page offers a sign-in prompt. |
| 6 | **No error boundary, no custom 404** | **HIGH** | `src/app/` (no `error.tsx`, `global-error.tsx`, `not-found.tsx`) | Any uncaught render error shows Next's unstyled English LTR default. On an Arabic RTL booking site, that is a broken-looking site. |
| 7 | **Two different commercial registration numbers ship in one build** | **HIGH** | `src/lib/constants/brand.ts:24` (`1010920108`) vs `:71` (`1010456370`) | The footer prints one (`Footer.tsx:94`) and the tax-invoice fallback the other. These are legal registration identifiers on customer-facing documents. |
| 8 | **`/account` save and delete fail silently** | **HIGH** | `src/app/account/page.tsx:46-56`, `:61-68` | `try/finally` with **no `catch`**. A failed profile save shows nothing; a failed account deletion also shows nothing and leaves the user signed in believing it worked. |
| 9 | **`/account/payment-methods` has no error handling anywhere** | **HIGH** | `src/app/account/payment-methods/page.tsx:69-88` | Load, delete-card, and set-default all lack handlers. A failed load renders "no cards / no transactions" — indistinguishable from a genuinely empty wallet. |
| 10 | **`/units` failure is indistinguishable from an empty result** | **MED** | `src/app/units/units-page-client.tsx:81-82` | `.then().finally()` with no `.catch()`. A backend outage renders "no units match your search". |
| 11 | **Partner onboarding is broken whenever mocks are on** | **MED** | `src/lib/api/client.ts:239-277` | `authApi.partnerRegister` has no mock branch and fetches an empty `BASE_URL`. Since `USE_MOCK` defaults to **on** when unset, a fresh environment silently breaks the partner funnel. |
| 12 | **`ContactHostDialog` is a non-functional prop** | **MED** | `src/components/features/booking/ContactHostDialog.tsx:30-33` | `send()` sets `sent = true` and calls no API. The guest sees "message sent" and a host response time; **no message is ever transmitted**. This is a user-visible falsehood, not merely dead code. |
| 13 | **Share button with no handler** | **MED** | `src/app/units/[id]/page.tsx:157-159` | A visible, enabled control that does nothing on the site's most important page. |
| 14 | **`USE_MOCK` fails open** | **MED** | `src/lib/api/client.ts:48` | `!== 'false'` means unset ⇒ mocks ON. A deploy that forgets the env var serves six fixture units and a fake booking flow with no visible signal. |
| 15 | **No request timeout in the API client** | **MED** | `src/lib/api/client.ts:78-93` | A hung backend hangs the tab indefinitely. `src/lib/mcp/units.ts:50` shows the right pattern (`AbortSignal.timeout(10_000)`) but `client.ts` never adopted it. |
| 16 | **Raw backend error text reaches users** | **MED** | `src/lib/api/client.ts:120`; live 404 body | `"No query results for model [App\Models\Unit] 999999"` and `"Unauthenticated."` are surfaced verbatim — English, and internally revealing. |
| 17 | **Error copy hardcoded in Arabic outside `messages/`** | **MED** | `src/lib/api/errors.ts:33-48`; `client.ts:103`; `moyasar.ts:55,76` | ~10 user-facing strings never translate to English. |
| 18 | **No `next/image` for any remote image** | **MED** | site-wide; `.eslintrc.json:5` disables the rule | No optimisation, no `srcset`, no lazy defaults, CLS risk in the gallery. `next.config.js:11-14`'s `remotePatterns` whitelist is inert, and the live image host `api.mamsaa.com` is not in it. |
| 19 | **Guest details collected at checkout and discarded** | **MED** | `src/app/booking/[unitId]/checkout-page-client.tsx:66-69,145-150` vs `client.ts:626-632` | Four fields are validated then thrown away. Either the API needs them or the form should not ask. |
| 20 | **Adults/children split collapsed to one integer** | **MED** | `src/lib/api/client.ts:630`; `checkout-page-client.tsx:174` | `Booking.guests` models the split, the UI hardcodes `children: 0`, and the payload sends a sum. The type promises something the wire cannot carry. |
| 21 | **`cancellation_policy: "no_cancel"` is unmapped** | **MED** | `src/lib/api/adapters.ts:205-213,239` | Verified live. Falls through to `'moderate'`, so an **unpaid** booking on a no-cancel unit displays moderate refund tiers (`adapters.ts:410-411`). |
| 22 | **Duplicated refresh-token logic** | **MED** | `src/lib/api/client.ts:76-95` vs `:302-310` | Two implementations of the same exchange; only the inline one runs. They can drift. |
| 23 | **Two functions for one endpoint** | **LOW** | `unitsApi.getFeatured` `client.ts:436` and `contentApi.popular` `client.ts:488` | Byte-identical bodies calling `GET /units/popular`. `getFeatured` has no callers. |
| 24 | **Dead API functions** | **LOW** | `authApi.refresh` `:302`, `unitsApi.getFeatured` `:436`, `contentApi.cities` `:481`, `paymentsApi.getById` `:848` | Four exported functions with zero production callers. `contentApi.cities` is the painful one — `FilterBar` hardcodes cities instead. |
| 25 | **Dead constants** | **LOW** | `brand.ts:89-91` (`PAGINATION`), `:93-97` (`PRICE_FILTER`), `:122-127` (`UNIT_TYPE_LABELS_AR`), `:31-33` (`DASHBOARD_URL`/`DASHBOARD_LOGIN_URL`) | Four exported constants with no importers; their values are re-hardcoded at the use sites. |
| 26 | **Dead dependencies** | **LOW** | `package.json:24,29` | `@radix-ui/react-select` and `@radix-ui/react-toast` are installed and never imported. |
| 27 | **TanStack Query paid for and unused** | **LOW** | `src/components/shared/QueryProvider.tsx` | A provider with tuned defaults and zero consumers; every page hand-rolls fetching state. |
| 28 | **Duplicated `Row`/`Field`/modal-shell helpers** | **LOW** | 3 × `Row`, 2 × `Field`, 6 hand-rolled modal overlays (see §6.4) | The `Dialog` primitive already exists and is bypassed six times. |
| 29 | **Four email validators** | **LOW** | `email.ts:1`, `checkout-page-client.tsx:147`, `OnboardingForm.tsx:44`, `schemas.ts:37` | Four different notions of a valid address. |
| 30 | **Duplicate id in mock fixtures** | **LOW** | `src/data/mock/units.ts:64` and `:104` both `id: 'U-002'` | `findUnitById` returns the first, so "استراحة الجبل الأخضر" is unreachable in mock mode. |
| 31 | **Mock/real return-shape mismatch** | **LOW** | `mock/index.ts:388` `{deleted:true}` vs `client.ts:942` `{ok:true}` | No caller reads either today; a future one would break on the switch. |
| 32 | **Mock saved cards lack `chargeable`** | **LOW** | `data/mock/users.ts:14-17` vs `payment/[bookingId]/page.tsx:78` | Quick-pay can never be exercised in mock mode. |
| 33 | **`ngrok-skip-browser-warning` header in production** | **LOW** | `client.ts:89`, `lib/mcp/units.ts:47` | A dev-tunnel artefact sent on every request to the production API. |
| 34 | **`sitemap.lastModified` is always "now"** | **LOW** | `src/app/sitemap.ts:15` | Every URL claims to have just changed, devaluing the signal. |
| 35 | **`.env.example` documents the wrong mock OTP** | **LOW** | `.env.example` (`123456`) vs `mock/index.ts:28` (`'111222'`) | A new developer following the template gets a code that does not work. |
| 36 | **`darkMode: ['class']` with no dark styles** | **LOW** | `tailwind.config.ts:4` | Implies a capability that does not exist. |
| 37 | **`Skeleton` exported from `separator.tsx`** | **LOW** | `src/components/ui/separator.tsx:24` | Three pages import a skeleton from a module named "separator". |
| 38 | **13 unused UI exports** | **LOW** | see §6.4 | `Separator`, `AvatarImage`, 5 `Card*` parts, 3 `Dialog*` parts, 2 `DropdownMenu*` parts, `buttonVariants`. |
| 39 | **README references a component that no longer exists** | **LOW** | `README.md` (`OtpStep`) | Renamed to `OtpVerificationForm` in commit `b181ce3`; the docs never followed. |
| 40 | **Test noise masks real failures** | **LOW** | `DebugOtpHint.tsx:14` via several test files | Repeated `IntlError: MISSING_MESSAGE` on every run. The key exists; the tests supply partial messages. |

### 19.1 Accessibility gaps

| Gap | Location | Impact |
|---|---|---|
| Six hand-rolled modals bypass Radix `Dialog` | `account/page.tsx:170`, `payment-methods/page.tsx:239,373`, `contact/page.tsx:223`, `ContactHostDialog.tsx:38`, `units-page-client.tsx:265` | **No focus trap, no focus restore, no Escape-to-close, no `role="dialog"`, no `aria-modal`.** Keyboard and screen-reader users can tab out of the dialog into the inert page behind it. |
| OTP inputs have no labels | `OtpVerificationForm.tsx:148-170` | Six unlabelled boxes; a screen reader announces nothing useful. No `aria-label`, no `autoComplete="one-time-code"` (so iOS/Android SMS autofill does not fire). |
| Form errors not associated with inputs | every form | No `aria-describedby`/`aria-invalid`; errors are visually adjacent `<p>` elements only. |
| `<img>` with empty or missing `alt` | `checkout-page-client.tsx:335`, `my-reservations/[bookingId]/page.tsx:151`, `units/[id]/page.tsx:280`, `UnitGallery.tsx:152` | Decorative in some cases, genuinely missing in others (the booking hero image). |
| Star rating is not an input | `ReviewDialog.tsx:62-77` | Five unlabelled buttons with no `role="radiogroup"`, no `aria-checked`, no keyboard arrow handling. |
| `<details>`-based accordions | `faq/page.tsx:46`, `host/page.tsx:182`, `PriceBreakdown.tsx:57` | Native and keyboard-operable — acceptable, though no `aria-expanded` on the summary. |
| Lightbox has no focus management | `UnitGallery.tsx:98-158` | Escape works (`:29`) but focus is neither trapped nor restored. |
| Colour-only status signalling | `CancellationPolicyDisplay.tsx:56-62` | Refund tiers are green/yellow/red pills; the percentage text carries the meaning too, so this is mitigated. |
| No skip-to-content link | `layout.tsx:54-55` | Keyboard users tab through the full header on every page. |

### 19.2 What will break on real data

| Risk | Evidence |
|---|---|
| **A catalogue larger than 12 units** | Pagination discarded (#2). Verified: the API already returns `meta.per_page: 12`. |
| **Any city search** | Returns zero rows (#1). Verified live. |
| **Units without `owner` in list responses** | `ownerName: ''` → the unit-detail host block renders an empty name and the initials fall back to `'؟'` (`units/[id]/page.tsx:122`). Verified: `/units` omits `owner`. |
| **Units without `created_at`** | `mapUnit` stamps `new Date()` (`adapters.ts:335`), so any `createdAt` ordering is meaningless. Verified absent. |
| **A fifth booking status** | `BOOKING_STATUS_MAP` defaults to `'confirmed'` (`adapters.ts:392`), which would render an **unpaid** booking as paid. The code documents that neither default is safe. |
| **A `cancellation_policy` value outside the map** | Already happening — `"no_cancel"` (#21). |
| **An amenity slug not in `AMENITY_ICONS`** | Degrades to a generic icon (`units/[id]/page.tsx:220`) — handled correctly. |
| **A unit with zero images** | `UnitGallery` renders a blank placeholder (`:42-44`) — handled. But `checkout-page-client.tsx:335` does `unit.imageUrls[0]` unguarded → a broken `<img>`. |
| **Long Arabic unit titles** | `line-clamp-1` on cards (`UnitCard.tsx:54`) — handled; unclamped on the detail `<h1>`. |
| **Slow or hung backend** | No timeout (#15) — the tab hangs. |
| **Backend down at checkout** | Handled well — `LoadError` + retry. |
| **Backend down on the homepage** | `safe()` swallows everything (`page.tsx:14-20`) → an empty but apparently successful page. |

---

## 20. Open questions for the backend team

1. **`GET /units?city=…` returns zero results for a city the API itself reports.** `GET /units/cities` returns `{"city":"الرياض","count":2}` and both units in `GET /units` carry `"city":"الرياض"`, yet `GET /units?city=الرياض` returns `meta.total: 0`. Every other filter parameter works. Is the city filter matching against a different column, a normalised slug, or an id? What exact value should the frontend send?

2. **Is `GET /units` intended to stay paginated at `per_page: 12`, and is there a `?page=` parameter?** The frontend currently discards `meta`/`links` entirely. Please confirm the pagination contract (parameter name, max `per_page`) so we can wire a pager.

3. **Why does `owner` appear on `GET /units/{id}` but not on `GET /units`?** Can the list resource include at least `owner.name` and `owner.is_verified`? Anything rendered from the list currently shows an empty host name.

4. **`created_at` is absent from both unit resources.** Can it be added? The frontend synthesises `new Date()` today, which makes any recency ordering meaningless.

5. **What is the complete enum for `cancellation_policy`?** We are receiving `"no_cancel"`, which is not in the set we were given (`flexible`, `24_hours`, `48_hours`, `moderate`, `7_days`, `strict`, `non_refundable`). It currently falls back to `moderate`, so an unpaid booking on a no-cancel unit shows the wrong refund tiers.

6. **What is the complete enum for the booking `status` field?** We map `pending`, `pending_payment`, `awaiting_payment`, `confirmed`, `paid`, `active`, `completed`, `cancelled`, `canceled`. An unlisted value would render an unpaid booking as paid — please confirm the closed set and tell us before adding to it.

7. **What is the difference between `status` and `approval_status` on a unit?** We read `approval_status` (`approved`) and ignore `status` (`available`). Which one gates public visibility?

8. **Does `/units/popular` use `is_featured`?** The first row of `GET /units/popular` has `"is_featured": false`. If "popular" and "featured" are different concepts, what drives the `مميز` badge?

9. **Does the booking resource embed the guest's review, and in what shape?** `reviewsApi.getForBooking` returns `null` in real mode. We only check `review` for presence. Is there a `GET /bookings/{id}/review`, or does the booking payload carry the full object?

10. **Can `POST /bookings` accept the guest's name, email and phone, and an adults/children split?** The checkout form collects `firstName`, `lastName`, `email`, `phone` and we currently discard all four; we also flatten guests to a single integer.

11. **When will `qr_code` be populated on `GET /bookings/{id}/invoice`?** The invoice page renders a placeholder until it arrives. Confirming that the ZATCA TLV payload is generated and signed **server-side** — this repo must never contain an encoder.

12. **Has the VAT-inclusive refactor shipped everywhere, or only on `/units/{id}/availability`?** That endpoint already returns `gross`/`net_base`/`vat`/`vat_rate` with `nightly_rate × nights === gross`. Do `GET /bookings/{id}` and `GET /bookings/{id}/invoice` do the same, or do they still send the VAT-exclusive trio?

13. **Is there an endpoint to fetch units by a list of ids?** `/favorites` currently fetches page 1 of the catalogue and filters client-side, so a favourite outside the first 12 results is invisible. Either `GET /units?ids[]=…` or having `GET /user/favorites` return full unit resources would fix it.

14. **Is guest↔host messaging planned?** `ContactHostDialog` currently pretends to send. We would need `POST /bookings/{id}/messages` and a `GET` counterpart, or we should remove the feature.

15. **Can we get a lightweight unit list for the sitemap?** Something like `GET /units/sitemap` returning `{id, updated_at}[]` unpaginated, so `/units/[id]` pages become indexable.

16. **Error-body contract:** 404s currently return `"No query results for model [App\\Models\\Unit] 999999"` and 401s return `"Unauthenticated."` — both English and internally revealing. Can errors carry a stable machine-readable `code` (as `EMAIL_INVALID`, `OTP_EXPIRED` etc. already do) plus a localisable message, so the frontend never renders raw server text?

17. **Does `POST /auth/logout` invalidate the refresh token server-side?** The client clears localStorage and swallows any error from this call.

18. **Does the phone-change flow rotate the token pair?** We keep the existing tokens after `POST /user/change-phone/verify`.

19. **What are the authoritative OTP parameters** — code length, expiry, max attempts, resend cooldown? The frontend carries three different sets of numbers (`OTP_CONFIG` says 6/60s/3/30s; the email flow uses 60s/5). We would rather read the server's values.

20. **Is `POST /units/{id}/availability` intentionally unauthenticated?** It responds 200 with full pricing and no token. If so, confirm it is rate-limited — it is a cheap endpoint to scrape a full price book from.

21. **Listing coordinates look wrong.** Unit 34 is `حي النرجس, الرياض` but reports `lat 23.854463, lng 47.658672`, roughly 120 km south-east of Riyadh. Is `lat`/`lng` validated on write? The homepage map plots these values directly.

22. **`PUT /me/company-docs` and `POST /uploads/presign`** are referenced in code comments (`client.ts:234-237`) but never called. Do they exist, and should the partner document-replacement flow live in this app or only in the dashboard?

23. **What is the correct commercial registration number for Mamsa?** The footer shows `1010920108` and the tax-invoice seller fallback shows `1010456370`. Which is authoritative, and can the invoice `seller` block always be server-supplied so the frontend constant becomes unnecessary?

---

## 21. Executive summary

`mamsa-app` is a **mature, unusually disciplined frontend that is materially
further along than its bug list suggests.** All four quality gates are green —
`tsc --noEmit`, `next lint`, 138/138 tests and `next build` all pass — with zero
`TODO`/`FIXME`/`HACK` comments, zero `any` types, zero stray `console.*`, and
exact 1019-key parity between the Arabic and English catalogues. The domain core
is genuinely well-built: the VAT-inclusive pricing model lives in a single module
that derives VAT by subtraction so `netBase + vat === gross` holds exactly, the
cancellation engine is pure and timezone-correct at the Asia/Riyadh midnight
boundary, and both are pinned by tests that assert the invariants that actually
cost money — price parity from search to tax invoice, no platform margin on any
guest payload, and an unpaid booking never rendering as paid. The API layer is
thoughtfully commented, the payment integration is PCI-correct (the PAN goes
browser→Moyasar and only a token id reaches the Mamsa API), and the agent-facing
surface (MCP server, WebMCP tools, `auth.md`, agent skills, Markdown content
negotiation) is more considered than most production sites ship. What holds it
back is not the core but the **edges**: the unhappy paths, the contract with a
backend that has drifted, and the absence of the plumbing that turns a working
app into an operable one.

**Top 5 blockers to production readiness:**

1. **The catalogue is functionally capped at 12 units and city search returns nothing.** Verified live: `GET /units` paginates at `per_page: 12` and `http()` (`client.ts:145-147`) discards `meta`/`links`, while `?city=الرياض` returns `total: 0` for a city the API itself reports. Together these break both the primary search path and any catalogue beyond one page — the single most urgent item, and it needs a fix on both sides.
2. **Failure paths are missing or silently swallowed on five screens.** `/favorites` (`page.tsx:18-23`) and `/my-reservations/[bookingId]` (`page.tsx:41-45`) spin forever on any error; `/units` and `/account/payment-methods` render "empty" instead of "failed"; `/account` save and delete fail with no feedback at all. Add `.catch()` plus the existing `LoadError` component to each.
3. **No route protection, no error boundary, no custom 404.** Every private route renders for a signed-out visitor and then dies in whatever way its fetch dies — for two of them, an infinite spinner. There is no `error.tsx`, `not-found.tsx` or `loading.tsx` anywhere, so any uncaught error shows Next's unstyled English LTR default on an Arabic RTL site.
4. **Two customer-facing correctness defects.** The footer and the tax-invoice fallback ship **two different commercial registration numbers** (`brand.ts:24` vs `:71`) — a legal identifier on financial documents. And `ContactHostDialog.send()` (`:30-33`) tells the guest their message was sent while transmitting nothing.
5. **The mock switch fails open and the mock/real split is unenforced.** `USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'` (`client.ts:48`) means an unset variable serves fixtures with no visible signal; three functions (`partnerRegister`, `refresh`, `paymentsApi.getById`) have no mock branch at all, so partner sign-up silently breaks in mock mode. Invert the default to fail closed and add a visible mock-mode banner.

Beyond those, the highest-leverage cleanups are adopting the already-installed
TanStack Query (a paid-for dependency with zero consumers, which would eliminate
most of the hand-rolled fetching state that causes blocker #2), replacing the six
hand-rolled modals with the `Dialog` primitive that already exists (fixing the
most serious accessibility gaps in one change), and settling the ~23 open
contract questions in §20 with the backend team.




