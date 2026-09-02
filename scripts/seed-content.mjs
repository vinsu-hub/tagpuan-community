// Seed the real launch content: one upcoming event ("The Social Room") and two
// past-event recap photos. Idempotent — safe to run repeatedly.
//
// Usage: node scripts/seed-content.mjs
// Needs DATABASE_URL_DIRECT (or DATABASE_URL) in .env — same as drizzle.
import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_DIRECT (or DATABASE_URL) is required — check .env");
  process.exit(2);
}
const sql = postgres(url, { prepare: false });

const now = Date.now();

const event = {
  slug: "the-social-room",
  title: "The Social Room",
  dateLabel: "Sep 5, 2026 · Saturday",
  startsAt: new Date("2026-09-05T19:00:00+08:00").getTime(),
  endsAt: null,
  venue: "The Den — By Danielitos",
  venueAddress: "Agapita Rd., Los Baños, Laguna",
  timeLabel: "7:00 PM",
  rsvpUrl: "https://luma.com/ldmushnq",
  attendeeCount: 0,
  capacity: null,
  imageUrl: "/assets/tagpuan/social-room-catalysts.webp",
  imageAlt: "Meet the Catalysts — The Social Room poster",
  description:
    "They've built companies, led teams, and shaped industries — and taken very " +
    "different paths to get there. Come curious, meet someone new, start a " +
    "conversation, and see where it takes you. Different paths, remarkable " +
    "stories, one room full of possibilities. (Rescheduled from Aug 29 to Sep 5.)",
  activities: JSON.stringify([
    "Catalyst stories",
    "Speed Friending",
    "Hear Me Out",
    "Open conversations",
  ]),
  isPublished: 1,
};

const recaps = [
  {
    imageUrl: "/assets/tagpuan/recap-work-session.webp",
    imageAlt: "Tagpuan work session at The Den by Danielitos",
    caption: "Work Session Round 3 · The Den by Danielitos · July 25",
    sortOrder: 10,
  },
  {
    imageUrl: "/assets/tagpuan/recap-sunday-run.webp",
    imageAlt: "Malaya's Cafe x Tagpuan Sunday social run",
    caption: "Sunday Sessions social run with Malaya's Cafe · Aug 2",
    sortOrder: 11,
  },
];

try {
  await sql`
    insert into events (
      slug, title, "dateLabel", "startsAt", "endsAt", venue, "venueAddress",
      "timeLabel", "rsvpUrl", "attendeeCount", capacity, "imageUrl", "imageAlt",
      description, activities, "isPublished", "createdAt", "updatedAt"
    ) values (
      ${event.slug}, ${event.title}, ${event.dateLabel}, ${event.startsAt},
      ${event.endsAt}, ${event.venue}, ${event.venueAddress}, ${event.timeLabel},
      ${event.rsvpUrl}, ${event.attendeeCount}, ${event.capacity}, ${event.imageUrl},
      ${event.imageAlt}, ${event.description}, ${event.activities}, ${event.isPublished},
      ${now}, ${now}
    )
    on conflict (slug) do update set
      title = excluded.title, "dateLabel" = excluded."dateLabel",
      "startsAt" = excluded."startsAt", "endsAt" = excluded."endsAt",
      venue = excluded.venue, "venueAddress" = excluded."venueAddress",
      "timeLabel" = excluded."timeLabel", "rsvpUrl" = excluded."rsvpUrl",
      capacity = excluded.capacity, "imageUrl" = excluded."imageUrl",
      "imageAlt" = excluded."imageAlt", description = excluded.description,
      activities = excluded.activities, "isPublished" = excluded."isPublished",
      "updatedAt" = ${now}
  `;
  console.log(`event  ✓  ${event.slug} (${event.dateLabel})`);

  for (const r of recaps) {
    const existing = await sql`
      select id from "recapPhotos" where "imageUrl" = ${r.imageUrl} limit 1
    `;
    if (existing.length) {
      await sql`
        update "recapPhotos" set
          "imageAlt" = ${r.imageAlt}, caption = ${r.caption},
          "sortOrder" = ${r.sortOrder}, "isPublished" = 1, "updatedAt" = ${now}
        where id = ${existing[0].id}
      `;
      console.log(`recap  ✓  updated  ${r.caption}`);
    } else {
      await sql`
        insert into "recapPhotos" (
          "eventId", "imageUrl", "imageAlt", caption, "sortOrder",
          "isPublished", "createdAt", "updatedAt"
        ) values (
          null, ${r.imageUrl}, ${r.imageAlt}, ${r.caption}, ${r.sortOrder},
          1, ${now}, ${now}
        )
      `;
      console.log(`recap  ✓  inserted  ${r.caption}`);
    }
  }

  const [{ n: eventCount }] = await sql`select count(*)::int n from events`;
  const [{ n: recapCount }] = await sql`select count(*)::int n from "recapPhotos"`;
  console.log(`\nnow: ${eventCount} event(s), ${recapCount} recap(s)`);
} finally {
  await sql.end();
}
