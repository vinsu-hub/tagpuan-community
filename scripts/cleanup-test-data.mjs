// Remove smoke-/probe-test rows from the database and test uploads from the
// `media` Storage bucket. Pattern-based and idempotent — it never matches the
// real seeded content (slug "the-social-room", the "Work Session…" / "Sunday
// Sessions…" recaps).
//
// Usage: node scripts/cleanup-test-data.mjs [--dry]
// Needs DATABASE_URL_DIRECT (or DATABASE_URL) in .env. The Storage sweep also
// needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (skipped with a note if absent).
import "dotenv/config";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_DIRECT (or DATABASE_URL) is required — check .env");
  process.exit(2);
}
const dry = process.argv.includes("--dry");
const sql = postgres(url, { prepare: false });

const supaUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supaKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

async function sweepStorage() {
  if (!supaUrl || !supaKey) {
    console.log(
      "storage (media)            skipped — set SUPABASE_SERVICE_ROLE_KEY in .env to sweep test uploads"
    );
    return;
  }
  const store = createClient(supaUrl, supaKey, {
    auth: { persistSession: false },
  }).storage.from("media");
  const prefixes = ["events", "recaps", "uploads", "spotlights", ""];
  let removed = 0;
  for (const prefix of prefixes) {
    const { data, error } = await store.list(prefix, { limit: 1000 });
    if (error) {
      console.log(`storage (media/${prefix})   list error: ${error.message}`);
      continue;
    }
    const files = (data ?? [])
      .filter(o => o.id) // folders have null id
      .map(o => (prefix ? `${prefix}/${o.name}` : o.name));
    if (!files.length) continue;
    if (dry) {
      console.log(
        `storage (media/${prefix || "root"})     ${files.length}  (dry-run)`
      );
      removed += files.length;
      continue;
    }
    const { error: delErr } = await store.remove(files);
    if (delErr) {
      console.log(`storage (media/${prefix})   delete error: ${delErr.message}`);
      continue;
    }
    console.log(
      `storage (media/${prefix || "root"})     ${files.length}  deleted`
    );
    removed += files.length;
  }
  if (removed === 0) console.log("storage (media)            0");
}

// [label, count-query, delete-query]
const targets = [
  [
    "eventRegistrations",
    sql`select count(*)::int n from "eventRegistrations" where email ilike 'smoke%@example.com' or name ilike 'Smoke %'`,
    sql`delete from "eventRegistrations" where email ilike 'smoke%@example.com' or name ilike 'Smoke %'`,
  ],
  [
    "events",
    sql`select count(*)::int n from events where slug ilike 'smoke-%' or slug ilike 'probe-%' or title ilike 'Smoke %' or title ilike 'Probe %'`,
    sql`delete from events where slug ilike 'smoke-%' or slug ilike 'probe-%' or title ilike 'Smoke %' or title ilike 'Probe %'`,
  ],
  [
    "recapPhotos",
    sql`select count(*)::int n from "recapPhotos" where "imageAlt" ilike 'Smoke %'`,
    sql`delete from "recapPhotos" where "imageAlt" ilike 'Smoke %'`,
  ],
  [
    "wallNotes",
    sql`select count(*)::int n from "wallNotes" where body ilike '%smoke%' or body ilike '%mod seed%' or body ilike '%moderation seed%'`,
    sql`delete from "wallNotes" where body ilike '%smoke%' or body ilike '%mod seed%' or body ilike '%moderation seed%'`,
  ],
  [
    "projectUpdates",
    sql`select count(*)::int n from "projectUpdates" where body ilike '%smoke%'`,
    sql`delete from "projectUpdates" where body ilike '%smoke%'`,
  ],
  [
    "newsletterSubscribers",
    sql`select count(*)::int n from "newsletterSubscribers" where email ilike 'smoke%@example.com'`,
    sql`delete from "newsletterSubscribers" where email ilike 'smoke%@example.com'`,
  ],
  [
    "newsletterCampaigns",
    sql`select count(*)::int n from "newsletterCampaigns" where status = 'draft' and subject = 'A little room for good things'`,
    sql`delete from "newsletterCampaigns" where status = 'draft' and subject = 'A little room for good things'`,
  ],
];

try {
  let total = 0;
  for (const [label, countQ, deleteQ] of targets) {
    const [{ n }] = await countQ;
    total += n;
    if (n === 0) {
      console.log(`${label.padEnd(26)} 0`);
      continue;
    }
    if (dry) {
      console.log(`${label.padEnd(26)} ${n}  (dry-run, not deleted)`);
    } else {
      await deleteQ;
      console.log(`${label.padEnd(26)} ${n}  deleted`);
    }
  }
  await sweepStorage();
  console.log(`\n${dry ? "would remove" : "removed"} ${total} db row(s)`);
} finally {
  await sql.end();
}
