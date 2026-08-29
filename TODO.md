# TODO — Tagpuan

Status of the Supabase/Vercel deployment. See `SESSION_HANDOFF.md` for full context.

## 🔴 Do before real launch (security)

- [ ] **Change the admin password.** `admin@tagpuan.community` / `admin123` was a throwaway test
      credential. Supabase dashboard → Authentication → Users → reset password (or delete this user and
      create your own).
- [ ] **Set `ADMIN_EMAILS` to the real owner address(es).** Currently only `admin@tagpuan.community`.
      Vercel → Project → Settings → Environment Variables (Production + Preview), then redeploy.
- [ ] **Rotate the Supabase secret key and DB password.** Both were shared in chat and used to
      provision the project (migration, bucket, admin user). Supabase → Settings → Database (reset
      password) and Settings → API Keys (roll the `sb_secret_…` key). After rotating the DB password,
      update `DATABASE_URL` + `DATABASE_URL_DIRECT` on Vercel and in the local `.env`.
- [ ] Confirm **"Enable email signups" is OFF** in Supabase → Authentication → Providers → Email
      (so `/login` is sign-in only — there is no public sign-up flow in the app).

## 🟡 Should do

- [ ] **Custom domain.** Site is on `tagpuan-final.vercel.app`. Add the real domain in Vercel →
      Domains. No code change needed (all API calls are same-origin relative).
- [ ] **Clear 3 orphaned test files** from Supabase Storage → `media` bucket → `events/` and `recaps/`
      (tiny 2×2 PNGs from the smoke test; nothing references them).
- [ ] Decide whether to keep **Deployment Protection OFF** (it is now — correct for a public site;
      it was blocking every URL behind Vercel SSO earlier).
- [ ] `pnpm test` is **server-only** (7 tests). Add React component / integration tests if you want
      client coverage, or wire the Playwright `scripts/smoke*.mjs` into CI against Preview deploys.

## 🟢 Nice to have / known limitations

- [ ] **CSS de-duplication.** `client/src/index.css` still has ~470 lines of dead `.admin-shell` /
      `.admin-tabs` / `.admin-denied` / `.admin-next-*` / `.admin-event-row` rules from the removed old
      admin page, plus a few multiply-defined properties (`.hero-surface` `min-height` set 4×,
      `.site-nav` width 4×, the verbatim logo block at ~`477` repeated at ~`1724`). These match **no
      live elements** — zero visual/functional effect, ~2 KB gzipped. Clean with screenshot diffing;
      keep every `.registration-*` rule (used by `/register`).
- [ ] **Bundle size** — one 754 KB JS chunk (Vite warns >500 KB). Add route-level `lazy()` /
      `manualChunks` to split the admin panel from the public site.
- [ ] **`#join` (last homepage section)** relies on the `[data-reveal]` IntersectionObserver to fade
      in; it can briefly show blank if the observer is slow. Intended per the pulled design (has a
      no-JS fallback), but could be made more robust.
- [ ] **Admin procedures with no UI:** `admin.updateEvent` (edit an existing event — only create
      exists), `admin.reports.list` / `admin.reports.updateStatus` (moderation reports queue),
      `admin.spotlights.create` (spotlights can only be published/unpublished, not created in-app).
      Build UI for these if the workflows are needed.
- [ ] **Admin drawer no-op buttons** that are intentionally cosmetic: EventsPage row menu, "Open
      filters", "Export list", "Review reports", "Sort by", "View guidelines", NewsletterPage "Save
      draft". Wire or remove per product intent.
- [ ] `logo/` folder at repo root (3 raw brand PNGs) isn't referenced by anything — the app uses the
      WebP derivatives in `client/public/assets/tagpuan/`. Keep as source art or move out.
- [ ] Local `.env` / `.env.local` hold real credentials (git-ignored). Delete them if this checkout is
      shared.

## ✅ Done this session

- [x] Fixed Vercel build failure (lockfile mismatch, Node pin) — `deecdd8`
- [x] Serverless route → catch-all `api/trpc/[trpc].ts` — `53f851e`
- [x] **Fixed API 500** (`ERR_MODULE_NOT_FOUND`) — `.js` import extensions + de-aliased `@shared` — `66743ee`
- [x] **Fixed client Supabase config** not compiling into the bundle — `.env.production` + Vercel vars — `66743ee`
- [x] Added missing **Fraunces + Baloo 2** fonts; preconnect; re-enabled pinch-zoom — `66743ee`
- [x] Mobile-menu a11y (`useMenuA11y`: scroll-lock, Escape, outside-click) + transition — `66743ee`
- [x] Wired admin recap drawer Publish/Hide → `admin.recaps.update` — `66743ee`
- [x] Removed dead code (unused icons, `icebreaker`, `content.venuePins`, `<Toaster/>`) — `66743ee`
- [x] **Fixed session-hydration race** bouncing authed admins to `/login` on reload — `09d8ca8`
- [x] **Provisioned Supabase**: 12 tables migrated, `media` bucket + RLS, admin user created
- [x] **Intensive Playwright smoke test** — 47+ PASS across routes / images / tRPC / auth / animations /
      responsive; report in `scratchpad/smoke-report.md`
- [x] Cleaned smoke-test data from the DB (site back to 0 events / notes / RSVPs)
