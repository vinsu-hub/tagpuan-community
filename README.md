# Tagpuan Community

Community website + admin panel for Tagpuan events, wall notes, passion
projects, spotlights, recaps and newsletter. One deployment: a Vite + React SPA,
a tRPC API running as a Vercel function, and Drizzle ORM on Supabase Postgres.

- **Public site** — `/`, `/about`, `/events`, `/wall`, `/projects`, `/people`, `/join`, `/register`
- **Admin panel** — `/admin` (sign in at `/login`, admin role required)

## Stack

| Concern  | Tech                                                               |
| -------- | ------------------------------------------------------------------ |
| Frontend | Vite, React 19, wouter, Tailwind v4                                |
| API      | tRPC v11 via `@trpc/server/adapters/fetch` at `api/trpc.ts`        |
| DB       | Supabase Postgres, Drizzle ORM (`postgres-js`, transaction pooler) |
| Auth     | Supabase Auth (email + password); admin = `ADMIN_EMAILS` allowlist |
| Storage  | Supabase Storage bucket `media` (admin image uploads)              |
| Hosting  | Vercel (static SPA + serverless function), GitHub-connected        |

## First-time setup

### 1. Supabase

1. In the project, run the Drizzle migration (see step 3) to create the tables.
2. Run `supabase/setup.sql` in the SQL editor to create the `media` storage
   bucket and its policies.
3. Authentication → Providers: keep **Email** enabled, turn **"Enable email
   signups" off** (sign-in only).
4. Authentication → Users → **Add user**: your email + a password.

### 2. Environment

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Supabase → Connect → _Transaction pooler_ (port 6543), `?pgbouncer=true`
- `DATABASE_URL_DIRECT` — Supabase → Connect → _Direct connection_ (port 5432); local migrations only
- `SUPABASE_URL`, `VITE_SUPABASE_URL` — `https://<ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` — the publishable (`sb_publishable_…`) key
- `ADMIN_EMAILS` — comma-separated emails that get the admin role on sign-in

### 3. Migrate the database

```bash
pnpm install
pnpm db:migrate        # applies drizzle/*.sql to DATABASE_URL_DIRECT
```

When the schema changes: edit `drizzle/schema.ts`, then `pnpm db:generate` and
`pnpm db:migrate`.

### 4. Local development

```bash
pnpm install
npx vercel link        # once, to connect the project
pnpm dev               # vercel dev — serves the SPA + /api/trpc on one origin
```

`pnpm dev:web` runs just the Vite client (no API) for pure UI work.

## Deploy

1. Push to GitHub (`https://github.com/vinsu-hub/tagpuan-final`).
2. Import the repo in Vercel. It reads `vercel.json` (build `pnpm build`,
   output `dist/public`, `/api/trpc` → the function).
3. Add every variable from `.env` to Vercel (Production + Preview). Vercel sets
   `NODE_ENV`; `DATABASE_URL_DIRECT` is not needed there.
4. Deploy, smoke-test the preview, promote.

## Scripts

| Script                                 | Does                         |
| -------------------------------------- | ---------------------------- |
| `pnpm dev`                             | `vercel dev` (SPA + API)     |
| `pnpm dev:web`                         | Vite client only             |
| `pnpm build`                           | `vite build` → `dist/public` |
| `pnpm check`                           | `tsc --noEmit`               |
| `pnpm test`                            | Vitest (server)              |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle migrations           |
