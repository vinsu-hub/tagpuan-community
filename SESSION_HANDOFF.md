# Session handoff — Tagpuan Supabase/Vercel migration + QA

_Last updated: 2026-08-29_

## Where things stand

**Live:** https://tagpuan-final.vercel.app — public site + `/admin` panel, fully working end-to-end.
**Repo:** https://github.com/vinsu-hub/tagpuan-final — `main` @ `b23b8da`.
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
