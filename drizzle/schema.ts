import {
  bigint,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Core user table. `openId` holds the Supabase Auth user id (JWT `sub`). */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 })
    .$type<"user" | "admin">()
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    dateLabel: varchar("dateLabel", { length: 80 }).notNull(),
    startsAt: bigint("startsAt", { mode: "number" }).notNull(),
    endsAt: bigint("endsAt", { mode: "number" }),
    venue: varchar("venue", { length: 160 }).notNull(),
    venueAddress: text("venueAddress"),
    timeLabel: varchar("timeLabel", { length: 80 }).notNull(),
    rsvpUrl: text("rsvpUrl").notNull(),
    attendeeCount: integer("attendeeCount").default(0).notNull(),
    capacity: integer("capacity"),
    imageUrl: text("imageUrl"),
    imageAlt: text("imageAlt"),
    description: text("description").notNull(),
    activities: text("activities").notNull(),
    isPublished: integer("isPublished").default(1).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    startsAtIdx: index("events_startsAt_idx").on(table.startsAt),
    publishedIdx: index("events_published_idx").on(table.isPublished),
  })
);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventRegistrations = pgTable(
  "eventRegistrations",
  {
    id: serial("id").primaryKey(),
    eventId: integer("eventId"),
    eventSlug: varchar("eventSlug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    background: text("background").notNull(),
    currentInterests: text("currentInterests").notNull(),
    topInterests: varchar("topInterests", { length: 500 }).notNull(),
    heardFrom: varchar("heardFrom", { length: 120 }).notNull(),
    hotTake: text("hotTake"),
    nightSuggestion: text("nightSuggestion"),
    photoConsent: integer("photoConsent").default(1).notNull(),
    sessionHash: varchar("sessionHash", { length: 64 }).notNull(),
    status: varchar("status", { length: 16 })
      .$type<"confirmed" | "cancelled">()
      .default("confirmed")
      .notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    eventIdx: index("eventRegistrations_event_idx").on(table.eventId),
    emailIdx: index("eventRegistrations_email_idx").on(table.email),
    sessionIdx: index("eventRegistrations_session_idx").on(table.sessionHash),
  })
);
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

export const wallNotes = pgTable(
  "wallNotes",
  {
    id: serial("id").primaryKey(),
    body: varchar("body", { length: 140 }).notNull(),
    authorName: varchar("authorName", { length: 100 }),
    tone: varchar("tone", { length: 16 })
      .$type<"mustard" | "sage" | "rose" | "bone">()
      .default("mustard")
      .notNull(),
    status: varchar("status", { length: 16 })
      .$type<"pending" | "approved" | "rejected">()
      .default("pending")
      .notNull(),
    pinCount: integer("pinCount").default(0).notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    sessionHash: varchar("sessionHash", { length: 128 }).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    chronologyIdx: index("wallNotes_status_createdAt_idx").on(
      table.status,
      table.createdAt
    ),
    sessionIdx: index("wallNotes_sessionHash_idx").on(table.sessionHash),
  })
);

export type WallNote = typeof wallNotes.$inferSelect;
export type InsertWallNote = typeof wallNotes.$inferInsert;

export const projectUpdates = pgTable(
  "projectUpdates",
  {
    id: serial("id").primaryKey(),
    body: varchar("body", { length: 120 }).notNull(),
    authorName: varchar("authorName", { length: 100 }),
    tag: varchar("tag", { length: 16 })
      .$type<"Art" | "Tech" | "Writing" | "Music" | "Research" | "Other">()
      .default("Other")
      .notNull(),
    status: varchar("status", { length: 16 })
      .$type<"pending" | "approved" | "rejected">()
      .default("pending")
      .notNull(),
    reportCount: integer("reportCount").default(0).notNull(),
    sessionHash: varchar("sessionHash", { length: 128 }).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
    updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  },
  table => ({
    chronologyIdx: index("projectUpdates_status_createdAt_idx").on(
      table.status,
      table.createdAt
    ),
    tagIdx: index("projectUpdates_tag_idx").on(table.tag),
  })
);

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

export const moderationReports = pgTable(
  "moderationReports",
  {
    id: serial("id").primaryKey(),
    targetType: varchar("targetType", { length: 16 })
      .$type<"wall" | "project">()
      .notNull(),
    targetId: integer("targetId").notNull(),
    reporterSessionHash: varchar("reporterSessionHash", {
      length: 128,
    }).notNull(),
    reason: varchar("reason", { length: 240 }),
    status: varchar("status", { length: 16 })
      .$type<"open" | "reviewed" | "dismissed">()
      .default("open")
      .notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  table => ({
    targetIdx: index("moderationReports_target_idx").on(
      table.targetType,
      table.targetId
    ),
  })
);

export type ModerationReport = typeof moderationReports.$inferSelect;
export type InsertModerationReport = typeof moderationReports.$inferInsert;

export const memberSpotlights = pgTable("memberSpotlights", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 180 }).notNull(),
  quote: text("quote").notNull(),
  photoUrl: text("photoUrl"),
  photoAlt: text("photoAlt"),
  eventTag: varchar("eventTag", { length: 180 }),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isPublished: integer("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type MemberSpotlight = typeof memberSpotlights.$inferSelect;
export type InsertMemberSpotlight = typeof memberSpotlights.$inferInsert;

export const recapPhotos = pgTable("recapPhotos", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId"),
  imageUrl: text("imageUrl").notNull(),
  imageAlt: text("imageAlt").notNull(),
  caption: text("caption"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isPublished: integer("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type RecapPhoto = typeof recapPhotos.$inferSelect;
export type InsertRecapPhoto = typeof recapPhotos.$inferInsert;

export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: varchar("status", { length: 16 })
    .$type<"subscribed" | "unsubscribed">()
    .default("subscribed")
    .notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber =
  typeof newsletterSubscribers.$inferInsert;

export const venuePins = pgTable("venuePins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  mapUrl: text("mapUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isPublished: integer("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type VenuePin = typeof venuePins.$inferSelect;
export type InsertVenuePin = typeof venuePins.$inferInsert;

/** "Hear Me Out" submissions — community voice channel managed from the admin panel. */
export const hearMeOutSubmissions = pgTable("hearMeOutSubmissions", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 240 }).notNull(),
  sender: varchar("sender", { length: 120 }),
  category: varchar("category", { length: 24 })
    .$type<"Suggestion" | "Appreciation" | "Idea" | "Ask">()
    .default("Suggestion")
    .notNull(),
  excerpt: text("excerpt"),
  status: varchar("status", { length: 16 })
    .$type<"new" | "in_review" | "published" | "archived">()
    .default("new")
    .notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type HearMeOutSubmission = typeof hearMeOutSubmissions.$inferSelect;
export type InsertHearMeOutSubmission =
  typeof hearMeOutSubmissions.$inferInsert;

/** Newsletter campaigns — sent + draft notes managed from the admin panel. */
export const newsletterCampaigns = pgTable("newsletterCampaigns", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 240 }).notNull(),
  audience: varchar("audience", { length: 120 }).default("All subscribers"),
  recipients: integer("recipients").default(0).notNull(),
  body: text("body"),
  status: varchar("status", { length: 16 })
    .$type<"draft" | "sent">()
    .default("draft")
    .notNull(),
  sentAt: bigint("sentAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;
export type InsertNewsletterCampaign = typeof newsletterCampaigns.$inferInsert;
