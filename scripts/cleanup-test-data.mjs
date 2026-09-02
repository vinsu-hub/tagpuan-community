// Remove smoke-/probe-test rows from the database and test uploads from the
// `media` Storage bucket. Pattern-based and idempotent — it never matches the
// real seeded content (slug "the-social-room", the "Work Session…" / "Sunday
// Sessions…" recaps).
//
// Usage: node scripts/cleanup-test-data.mjs [--dry]
// Needs DATABASE_URL_DIRECT (or DATABASE_URL) in .env.
import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_DIRECT (or DATABASE_URL) is required — check .env");
  process.exit(2);
}
const dry = process.argv.includes("--dry");
const sql = postgres(url, { prepare: false });

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
  [
    "storage.objects (media)",
    sql`select count(*)::int n from storage.objects where bucket_id = 'media' and (name like 'events/%' or name like 'recaps/%' or name like 'uploads/%' or name like 'spotlights/%' or name not like '%/%')`,
    sql`delete from storage.objects where bucket_id = 'media' and (name like 'events/%' or name like 'recaps/%' or name like 'uploads/%' or name like 'spotlights/%' or name not like '%/%')`,
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
  console.log(`\n${dry ? "would remove" : "removed"} ${total} row(s)`);
} finally {
  await sql.end();
}
