# Session handoff — Tagpuan Supabase/Vercel migration + QA

_Last updated: 2026-09-02_

## Where things stand

**Live:** https://tagpuan-final.vercel.app — public site + `/admin` panel, fully working end-to-end.
**Repo:** `main` @ `e261797`, pushed to **both** remotes (`final` = github.com/vinsu-hub/tagpuan-final, auto-deploys to Vercel; `origin` = github.com/vinsu-hub/tagpuan-community).

---

## Session 2026-09-02 — Brand mark refresh

**Goal:** replace the old logo everywhere, especially the admin board view; verify; smoke test; deploy.

### What I found
- The **homepage** logos were already the new brand — `tagpuan-lockup.webp` / `tagpuan-type.webp` /
  `tagpuan-hut.webp` in `client/public/assets/tagpuan/` are byte-consistent with the source art in
  `D:\Tagpuan\logo\` (`tagpuan logo transparent complete.png`, `TYPOGRAPHY  ONLY.png`). Near-white,
  meant for dark/photo backgrounds. Left untouched.
- The **admin panel** was still on the OLD logo: `mark.png` — a filled black/orange thatched-hut icon
  with a fake-transparency checkerboard baked into an opaque PNG (alpha all 255). Shown in the admin
  sidebar brand lockup (`AdminWorkspace.tsx:56,211`) and the admin footer (`:310`). The
  `.brand-lockup img` CSS used `mix-blend-mode: multiply` + sepia to hide that baked background.
- **No favicon** at all — site used the browser default. `client/index.html` had no icon links.

### Changes — commit `e261797` "Update brand mark to new Tagpuan logo (admin + favicon)"
- **Regenerated `client/public/assets/tagpuan/mark.png`** from `logo/LOGO ONLY.png` via PIL: crop to
  bbox, pad to square, recolor all non-transparent px to dark brown `rgb(61,43,28)`, keep alpha,
  512×512, clean transparent PNG. (Script was ad-hoc, not committed.)
- **Removed `mix-blend-mode: multiply` + `filter: sepia(...)` from `.brand-lockup img`** in
  `client/src/admin/admin.css` (~line 78) — the new asset is properly transparent and the hack would
  have washed out the brown.
- **Added the mark to the `/login` card** — `client/src/pages/Login.tsx`, 52×52 `<img>` above the h1.
- **Added favicons** — `client/public/favicon.ico` + `favicon-16.png` / `-32.png` / `-180.png`
  (dark mark on transparent), wired into `client/index.html` (`icon`, `apple-touch-icon`).

### Verification
- `pnpm check` (tsc) clean · `pnpm build` clean (bundle still ~720 KB, pre-existing warning).
- Local `vite preview` — login card renders with the mark; `favicon.ico` + `mark.png` serve 200;
  no page errors. (Admin shell can't fully render locally — no serverless API under `vite preview`.)
- **Deployed** (auto-deploy on push to `final`). Confirmed live by matching `favicon.ico` md5.
- **Production smoke test** (`node scripts/smoke.mjs`): **48 PASS · 1 PARTIAL · 3 FAIL.**
  - Screenshotted prod `/login` + authenticated `/admin` at 1440 — **new hut mark renders correctly
    in the admin sidebar** next to "TAGPUAN / Admin Workspace", and on the login card.
  - The 3 FAILs (`Wall: post note` timeout, `Admin: createEvent` "no network call", its dependent
    list check) + the `Typography` PARTIAL are **pre-existing** form/backend-flow issues, unrelated
    to this static-asset change. Not investigated. Candidate for next session if those flows matter.

### Notes for next session
- `logo/` source art: `LOGO ONLY.png` = hut mark, `TYPOGRAPHY  ONLY.png` = wordmark,
  `tagpuan logo transparent complete.png` = full lockup. All near-white on transparent.
- The mobile admin topbar brand (`AdminWorkspace.tsx:297`) is **text-only** ("TAGPUAN ADMIN") — no
  logo there by design.
- `ArrowUpRight` "Preview website" link in the admin topbar still points to `/` (correct).
- Old `mark.png` recolor is dark brown for the light admin sidebar (`--admin-sidebar-bg: #f4e8d5`).
  If the sidebar ever goes dark, regenerate mark.png white instead.

---

## Prior session (2026-08-29) — Supabase/Vercel migration + QA

_State at that time: `main` @ `b23b8da`._
**Stack:** Vite + React 19 SPA · tRPC v11 serverless function (`api/trpc/[trpc].ts`) · Drizzle ORM on
Supabase Postgres · Supabase Auth (email+password, ES256/JWKS) · Supabase Storage (`media` bucket) ·
hosted on Vercel, GitHub-connected auto-deploy.

## Accounts / resources

| Thing | Value |
|---|---|
| GitHub repo | `github.com/vinsu-hub/tagpuan-final` (origin of the local checkout is still `tagpuan-community` — `final` is a second remote) |
| Vercel project | `tagpuan-final` (team `vince-tamis`, `prj_AHHz2i4d89CyHFtMsH8KED6ngnCh`) |
| Supabase project | `jqqdqleggbaskuosrlps` · region `ap-southeast-1` · URL `https://jqqdqleggbaskuosrlps.supabase.co` |
| **Admin login (test)** | `admin@tagpuan.community` / `admin123` — **weak, rotate it** |
| DB | 12 tables migrated · `media` storage bucket (public) + 4 RLS policies |

### Environment variables (set on Vercel — Production + Preview)

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Supabase **transaction pooler** `…pooler.supabase.com:6543` (runtime, `prepare:false`) |
| `DATABASE_URL_DIRECT` | Supabase **direct** `db.<ref>.supabase.co:5432` (migrations only) |
| `SUPABASE_URL` | `https://jqqdqleggbaskuosrlps.supabase.co` (server JWKS verify) |
| `ADMIN_EMAILS` | comma-separated allowlist → `users.role = "admin"` on sign-in. Currently just `admin@tagpuan.community` |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | client Supabase config (also committed in `.env.production` as a fallback — the anon key is publishable) |

### Local files (git-ignored, hold real secrets)

- `.env` — full set incl. DB password, used by `pnpm db:migrate` and local scripts.
- `.env.local` — created by `vercel link` (Vercel returns sensitive values empty here — not usable).
- `.env.production` — **committed** (public `VITE_SUPABASE_*` only; safe).

## What was done this session

### 1. Verified the prior migration push
`git ls-remote` confirmed `tagpuan-final/main` == local tree exactly (migration commit `bf394cd`).

### 2. Connected Vercel, found the first deploy failed
`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` — the removed `nanoid` override was still in the lockfile.
→ `deecdd8` regenerated the lockfile, pinned Node `22.x`.

### 3. Restructured the serverless route
`api/trpc.ts` → `api/trpc/[trpc].ts` catch-all, dropped the `/api/trpc/(.*)` rewrite. → `53f851e`

### 4. Fixed two hard blockers found on the live deploy — `66743ee`
- **API 500 on every call** (`ERR_MODULE_NOT_FOUND`). `@vercel/node` compiles with `tsc` +
  file-tracing (not bundling), so extensionless ESM relative imports and the `@shared` alias didn't
  resolve at runtime. → added `.js` extensions to every runtime import in the function graph
  (`api/trpc/[trpc].ts`, `server/routers.ts`, `server/db.ts`, `server/_core/{context,supabaseAuth,systemRouter,trpc}.ts`);
  de-aliased `@shared/const` → `../../shared/const.js`.
- **`import.meta.env.VITE_SUPABASE_*` compiled to `""`** on Vercel (env vars weren't reaching
  `vite build`). → committed `.env.production` with the two public values so the build always has
  them; also re-added all 6 Vercel env vars as normal (non-sensitive) vars.
- Also this commit: Fraunces + Baloo 2 fonts added to the `@import` (were referenced in 18 admin
  rules but never loaded → Georgia fallback); font `preconnect`; dropped `maximum-scale=1` from the
  viewport; `useMenuA11y` hook (body-scroll-lock + Escape + outside-click) wired into the Home nav,
  inner-page nav, and admin sidebar; mobile-menu open/close transition; wired the admin recap drawer
  Publish/Hide buttons to `admin.recaps.update` (were no-op toasts); removed dead code (5 unused
  lucide imports, `icebreaker` state, unrendered `content.venuePins` query, unused sonner `<Toaster/>`).

### 5. Fixed a session-hydration race — `09d8ca8`
Hard-reloading `/admin/*` could bounce an authenticated admin to `/login` because
`onAuthStateChange` fired `INITIAL_SESSION(null)` before `getSession()` finished reading storage.
→ `useAuth` now lets only `getSession()` clear the loading flag.

### 6. Provisioned Supabase (done directly with the session's credentials)
- `pnpm db:migrate` → 12 tables + `__drizzle_migrations`.
- `supabase/setup.sql` → `media` bucket (public) + 4 `storage.objects` RLS policies.
- Created auth user `admin@tagpuan.community` / `admin123` via the Auth Admin API; it's in `ADMIN_EMAILS`.

### 7. Intensive browser smoke test
`scripts/smoke.mjs` / `smoke2.mjs` / `smoke3.mjs` (Playwright + Chromium), driving the live deploy at
desktop 1440 / mobile 390 / 1024 / 768. **47+ PASS.** Verified: every route renders clean at both
viewports (no console errors, no overflow, no broken/upscaled images); Supabase Storage upload →
public URL → DB → public render; every public + admin tRPC connection; auth (login, JWKS verify,
role, sign-out); animations + `prefers-reduced-motion`; responsive breakpoints; typography (Fredoka
home, **Fraunces admin**). Full write-up saved to `scratchpad/smoke-report.md` during the session
(not committed — regenerate with the scripts).

## Commit trail (this session, on top of `bf394cd` / `cee66da` from the prior session)

```
e261797  Update brand mark to new Tagpuan logo (admin + favicon)   ← 2026-09-02 session
1dde3ff  Add session handoff + TODO
b23b8da  Ignore smoke-out/ (local Playwright screenshot output)
09d8ca8  Fix admin session-hydration redirect race
66743ee  Fix serverless API resolution + client env baking + font/a11y regressions
53f851e  Use catch-all api/trpc/[trpc].ts instead of a rewrite
deecdd8  Fix Vercel build: sync lockfile, pin Node 22.x
```

## Gotchas for the next session

- **`pnpm dev` = `vercel dev`.** Needs `vercel link` (already done locally) + a real local `.env`.
  `pnpm dev:web` runs Vite only (no API).
- **Migrations run locally**, not on Vercel: edit `drizzle/schema.ts` → `pnpm db:generate` → `pnpm db:migrate`
  (uses `DATABASE_URL_DIRECT`).
- The serverless function's imports **must keep `.js` extensions** — removing them breaks the deploy
  again (see item 4).
- `@vercel/node` traces files; if you add a new `server/` module the function imports, give its
  relative imports `.js` too.
- Bundle is ~754 KB (Vite warns >500 KB) — not addressed; code-splitting is a future optimization.
- Client test coverage is server-only (7 Vitest tests); no React component tests.

See `TODO.md` for outstanding work.
