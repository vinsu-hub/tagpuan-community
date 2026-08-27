import {
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing the existing Manus auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    dateLabel: varchar("dateLabel", { length: 80 }).notNull(),
    startsAt: bigint("startsAt", { mode: "number" }).notNull(),
    endsAt: bigint("endsAt", { mode: "number" }),
    venue: varchar("venue", { length: 160 }).notNull(),
    venueAddress: text("venueAddress"),
    timeLabel: varchar("timeLabel", { length: 80 }).notNull(),
    rsvpUrl: text("rsvpUrl").notNull(),
    attendeeCount: int("attendeeCount").default(0).notNull(),
    capacity: int("capacity"),
    imageUrl: text("imageUrl"),
    imageAlt: text("imageAlt"),
    description: text("description").notNull(),
    activities: text("activities").notNull(),
    isPublished: int("isPublished").default(1).notNull(),
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

export const eventRegistrations = mysqlTable(
  "eventRegistrations",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: int("eventId"),
    eventSlug: varchar("eventSlug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    background: text("background").notNull(),
    currentInterests: text("currentInterests").notNull(),
    topInterests: varchar("topInterests", { length: 500 }).notNull(),
    heardFrom: varchar("heardFrom", { length: 120 }).notNull(),
    hotTake: text("hotTake"),
    nightSuggestion: text("nightSuggestion"),
    photoConsent: int("photoConsent").default(1).notNull(),
    sessionHash: varchar("sessionHash", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["confirmed", "cancelled"])
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

export const wallNotes = mysqlTable(
  "wallNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    body: varchar("body", { length: 140 }).notNull(),
    authorName: varchar("authorName", { length: 100 }),
    tone: mysqlEnum("tone", ["mustard", "sage", "rose", "bone"])
      .default("mustard")
      .notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    pinCount: int("pinCount").default(0).notNull(),
    reportCount: int("reportCount").default(0).notNull(),
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

export const projectUpdates = mysqlTable(
  "projectUpdates",
  {
    id: int("id").autoincrement().primaryKey(),
    body: varchar("body", { length: 120 }).notNull(),
    authorName: varchar("authorName", { length: 100 }),
    tag: mysqlEnum("tag", [
      "Art",
      "Tech",
      "Writing",
      "Music",
      "Research",
      "Other",
    ])
      .default("Other")
      .notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    reportCount: int("reportCount").default(0).notNull(),
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

export const moderationReports = mysqlTable(
  "moderationReports",
  {
    id: int("id").autoincrement().primaryKey(),
    targetType: mysqlEnum("targetType", ["wall", "project"]).notNull(),
    targetId: int("targetId").notNull(),
    reporterSessionHash: varchar("reporterSessionHash", {
      length: 128,
    }).notNull(),
    reason: varchar("reason", { length: 240 }),
    status: mysqlEnum("status", ["open", "reviewed", "dismissed"])
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

export const memberSpotlights = mysqlTable("memberSpotlights", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 180 }).notNull(),
  quote: text("quote").notNull(),
  photoUrl: text("photoUrl"),
  photoAlt: text("photoAlt"),
  eventTag: varchar("eventTag", { length: 180 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type MemberSpotlight = typeof memberSpotlights.$inferSelect;
export type InsertMemberSpotlight = typeof memberSpotlights.$inferInsert;

export const recapPhotos = mysqlTable("recapPhotos", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId"),
  imageUrl: text("imageUrl").notNull(),
  imageAlt: text("imageAlt").notNull(),
  caption: text("caption"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type RecapPhoto = typeof recapPhotos.$inferSelect;
export type InsertRecapPhoto = typeof recapPhotos.$inferInsert;

export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: mysqlEnum("status", ["subscribed", "unsubscribed"])
    .default("subscribed")
    .notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber =
  typeof newsletterSubscribers.$inferInsert;

export const venuePins = mysqlTable("venuePins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  mapUrl: text("mapUrl").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type VenuePin = typeof venuePins.$inferSelect;
export type InsertVenuePin = typeof venuePins.$inferInsert;
