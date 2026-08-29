import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  events,
  eventRegistrations,
  hearMeOutSubmissions,
  InsertEvent,
  InsertEventRegistration,
  InsertHearMeOutSubmission,
  InsertMemberSpotlight,
  InsertNewsletterCampaign,
  InsertNewsletterSubscriber,
  InsertProjectUpdate,
  InsertRecapPhoto,
  InsertUser,
  InsertWallNote,
  memberSpotlights,
  moderationReports,
  newsletterCampaigns,
  newsletterSubscribers,
  projectUpdates,
  recapPhotos,
  users,
  venuePins,
  wallNotes,
} from "../drizzle/schema.js";
import { isAdminEmail } from "./_core/env.js";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // `prepare: false` is required for the Supabase transaction pooler (pgBouncer).
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  const effectiveRole =
    user.role ?? (isAdminEmail(user.email) ? "admin" : undefined);
  if (effectiveRole !== undefined) {
    values.role = effectiveRole;
    updateSet.role = effectiveRole;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

const APPROVED = "approved" as const;
const PENDING = "pending" as const;

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db)
    return {
      upcomingEvents: 0,
      totalRsvps: 0,
      pendingApplicants: 0,
      wallNotes: 0,
      passionProjects: 0,
      newsletterSubscribers: 0,
      openReports: 0,
      unpublishedSpotlights: 0,
      missingRecapPhotos: 0,
    };
  const [
    upcoming,
    rsvps,
    applicants,
    notes,
    projects,
    subscribers,
    reports,
    spotlights,
    missingRecaps,
  ] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)` })
      .from(events)
      .where(and(eq(events.isPublished, 1), gt(events.startsAt, Date.now()))),
    db
      .select({ total: sql<number>`count(*)` })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.status, "confirmed")),
    db.select({ total: sql<number>`count(*)` }).from(eventRegistrations),
    db.select({ total: sql<number>`count(*)` }).from(wallNotes),
    db.select({ total: sql<number>`count(*)` }).from(projectUpdates),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "subscribed")),
    db
      .select({ total: sql<number>`count(*)` })
      .from(moderationReports)
      .where(eq(moderationReports.status, "open")),
    db
      .select({ total: sql<number>`count(*)` })
      .from(memberSpotlights)
      .where(eq(memberSpotlights.isPublished, 0)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(recapPhotos)
      .where(eq(recapPhotos.imageUrl, "")),
  ]);
  return {
    upcomingEvents: Number(upcoming[0]?.total ?? 0),
    totalRsvps: Number(rsvps[0]?.total ?? 0),
    pendingApplicants: Number(applicants[0]?.total ?? 0),
    wallNotes: Number(notes[0]?.total ?? 0),
    passionProjects: Number(projects[0]?.total ?? 0),
    newsletterSubscribers: Number(subscribers[0]?.total ?? 0),
    openReports: Number(reports[0]?.total ?? 0),
    unpublishedSpotlights: Number(spotlights[0]?.total ?? 0),
    missingRecapPhotos: Number(missingRecaps[0]?.total ?? 0),
  };
}

export async function listAdminEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.startsAt));
}

export async function insertEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(events)
    .values(event)
    .returning({ id: events.id });
  return result[0]?.id;
}

export async function updateEvent(id: number, event: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) return;
  await db.update(events).set(event).where(eq(events.id, id));
}

export async function listEventRegistrations() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(eventRegistrations)
    .orderBy(desc(eventRegistrations.createdAt));
}

export async function updateEventRegistrationStatus(
  id: number,
  status: "confirmed" | "cancelled"
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(eventRegistrations)
    .set({ status, updatedAt: Date.now() })
    .where(eq(eventRegistrations.id, id));
}

export async function listPublicEvents() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.isPublished, 1),
        gt(events.startsAt, Date.now() - 86_400_000)
      )
    )
    .orderBy(asc(events.startsAt));
}

export async function getNextPublicEvent() {
  const rows = await listPublicEvents();
  return rows[0];
}

export async function listWallNotes(
  limit: number,
  offset: number,
  includeArchive = false
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const cutoff = Date.now() - 14 * 86_400_000;
  const visibility = includeArchive
    ? and(eq(wallNotes.status, APPROVED), lt(wallNotes.createdAt, cutoff))
    : and(eq(wallNotes.status, APPROVED), gt(wallNotes.createdAt, cutoff));
  const [items, totals] = await Promise.all([
    db
      .select()
      .from(wallNotes)
      .where(visibility)
      .orderBy(desc(wallNotes.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(wallNotes)
      .where(visibility),
  ]);
  return { items, total: Number(totals[0]?.total ?? 0) };
}

export async function countRecentBySession(
  table: "wall" | "project",
  sessionHash: string
) {
  const db = await getDb();
  if (!db) return 0;
  const cutoff = Date.now() - 60 * 60 * 1000;
  if (table === "wall") {
    const result = await db
      .select({ total: sql<number>`count(*)` })
      .from(wallNotes)
      .where(
        and(
          eq(wallNotes.sessionHash, sessionHash),
          gt(wallNotes.createdAt, cutoff)
        )
      );
    return Number(result[0]?.total ?? 0);
  }
  const result = await db
    .select({ total: sql<number>`count(*)` })
    .from(projectUpdates)
    .where(
      and(
        eq(projectUpdates.sessionHash, sessionHash),
        gt(projectUpdates.createdAt, cutoff)
      )
    );
  return Number(result[0]?.total ?? 0);
}

export async function insertWallNote(note: InsertWallNote) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(wallNotes)
    .values(note)
    .returning({ id: wallNotes.id });
  return result[0]?.id;
}

export async function incrementWallPin(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(wallNotes)
    .set({ pinCount: sql`${wallNotes.pinCount} + 1`, updatedAt: Date.now() })
    .where(eq(wallNotes.id, id));
}

export async function createReport(
  targetType: "wall" | "project",
  targetId: number,
  reporterSessionHash: string,
  reason?: string
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(moderationReports).values({
    targetType,
    targetId,
    reporterSessionHash,
    reason,
    createdAt: Date.now(),
  });
  if (targetType === "wall")
    await db
      .update(wallNotes)
      .set({
        reportCount: sql`${wallNotes.reportCount} + 1`,
        updatedAt: Date.now(),
      })
      .where(eq(wallNotes.id, targetId));
  else
    await db
      .update(projectUpdates)
      .set({
        reportCount: sql`${projectUpdates.reportCount} + 1`,
        updatedAt: Date.now(),
      })
      .where(eq(projectUpdates.id, targetId));
}

export async function listProjectUpdates(limit: number, offset: number) {
  const db = await getDb();
  if (!db) return { items: [], total: 0, tagCounts: [] };
  const [items, totals, tagCounts] = await Promise.all([
    db
      .select()
      .from(projectUpdates)
      .where(eq(projectUpdates.status, APPROVED))
      .orderBy(desc(projectUpdates.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(projectUpdates)
      .where(eq(projectUpdates.status, APPROVED)),
    db
      .select({ tag: projectUpdates.tag, total: sql<number>`count(*)` })
      .from(projectUpdates)
      .where(
        and(
          eq(projectUpdates.status, APPROVED),
          gt(projectUpdates.createdAt, Date.now() - 7 * 86_400_000)
        )
      )
      .groupBy(projectUpdates.tag)
      .orderBy(desc(sql`count(*)`)),
  ]);
  return { items, total: Number(totals[0]?.total ?? 0), tagCounts };
}

export async function insertProjectUpdate(update: InsertProjectUpdate) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(projectUpdates)
    .values(update)
    .returning({ id: projectUpdates.id });
  return result[0]?.id;
}

export async function listSpotlights() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memberSpotlights)
    .where(eq(memberSpotlights.isPublished, 1))
    .orderBy(asc(memberSpotlights.sortOrder));
}

export async function listRecapPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(recapPhotos)
    .where(eq(recapPhotos.isPublished, 1))
    .orderBy(asc(recapPhotos.sortOrder));
}

export async function listVenuePins() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(venuePins)
    .where(eq(venuePins.isPublished, 1))
    .orderBy(asc(venuePins.sortOrder));
}

export async function incrementEventAttendeeCount(eventId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(events)
    .set({
      attendeeCount: sql`${events.attendeeCount} + 1`,
      updatedAt: Date.now(),
    })
    .where(eq(events.id, eventId));
}

export async function findEventRegistration(eventSlug: string, email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventSlug, eventSlug),
        eq(eventRegistrations.email, email),
        eq(eventRegistrations.status, "confirmed")
      )
    )
    .limit(1);
  return result[0];
}

export async function countRecentEventRegistrations(sessionHash: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`count(*)` })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.sessionHash, sessionHash),
        gt(eventRegistrations.createdAt, Date.now() - 60 * 60 * 1000),
        eq(eventRegistrations.status, "confirmed")
      )
    );
  return Number(result[0]?.total ?? 0);
}

export async function insertEventRegistration(
  registration: InsertEventRegistration
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(eventRegistrations)
    .values(registration)
    .returning({ id: eventRegistrations.id });
  return result[0]?.id;
}

export async function subscribeNewsletter(
  subscriber: InsertNewsletterSubscriber
) {
  const db = await getDb();
  if (!db) return false;
  await db
    .insert(newsletterSubscribers)
    .values(subscriber)
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { status: "subscribed", updatedAt: Date.now() },
    });
  return true;
}

type WallStatus = "pending" | "approved" | "rejected";
type ProjectStatus = "pending" | "approved" | "rejected";
type ReportStatus = "open" | "reviewed" | "dismissed";
type SpotlightStatus = boolean;
type HearMeOutStatus = "new" | "in_review" | "published" | "archived";

export async function listWallNotesForModeration() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wallNotes).orderBy(desc(wallNotes.createdAt));
}

export async function updateWallNoteStatus(id: number, status: WallStatus) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(wallNotes)
    .set({ status, updatedAt: Date.now() })
    .where(eq(wallNotes.id, id));
}

export async function listProjectUpdatesForModeration() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectUpdates)
    .orderBy(desc(projectUpdates.createdAt));
}

export async function updateProjectUpdateStatus(
  id: number,
  status: ProjectStatus
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(projectUpdates)
    .set({ status, updatedAt: Date.now() })
    .where(eq(projectUpdates.id, id));
}

export async function listModerationReports() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moderationReports)
    .orderBy(desc(moderationReports.createdAt));
}

export async function updateModerationReportStatus(
  id: number,
  status: ReportStatus
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(moderationReports)
    .set({ status })
    .where(eq(moderationReports.id, id));
}

export async function listAllSpotlights() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memberSpotlights)
    .orderBy(asc(memberSpotlights.sortOrder));
}

export async function insertSpotlight(insert: InsertMemberSpotlight) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(memberSpotlights)
    .values(insert)
    .returning({ id: memberSpotlights.id });
  return result[0]?.id;
}

export async function updateSpotlight(
  id: number,
  changes: Partial<InsertMemberSpotlight>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(memberSpotlights)
    .set({ ...changes, updatedAt: Date.now() })
    .where(eq(memberSpotlights.id, id));
}

export async function listRecapPhotosForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recapPhotos).orderBy(desc(recapPhotos.createdAt));
}

export async function updateRecapPhoto(
  id: number,
  changes: Partial<InsertRecapPhoto>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(recapPhotos)
    .set({ ...changes, updatedAt: Date.now() })
    .where(eq(recapPhotos.id, id));
}

export async function listNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt));
}

export async function listNewsletterCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(newsletterCampaigns)
    .orderBy(desc(newsletterCampaigns.createdAt));
}

export async function createNewsletterCampaign(
  campaign: InsertNewsletterCampaign
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(newsletterCampaigns)
    .values(campaign)
    .returning({ id: newsletterCampaigns.id });
  return result[0]?.id;
}

export async function listHearMeOutSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(hearMeOutSubmissions)
    .orderBy(desc(hearMeOutSubmissions.createdAt));
}

export async function insertHearMeOutSubmission(
  submission: InsertHearMeOutSubmission
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(hearMeOutSubmissions)
    .values(submission)
    .returning({ id: hearMeOutSubmissions.id });
  return result[0]?.id;
}

export async function updateHearMeOutSubmissionStatus(
  id: number,
  status: HearMeOutStatus
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(hearMeOutSubmissions)
    .set({ status, updatedAt: Date.now() })
    .where(eq(hearMeOutSubmissions.id, id));
}

export async function listAdminMedia() {
  const db = await getDb();
  if (!db) return { photos: [], eventImages: [] };
  const [photos, eventImages] = await Promise.all([
    db.select().from(recapPhotos).orderBy(desc(recapPhotos.createdAt)),
    db
      .select({
        id: events.id,
        imageUrl: events.imageUrl,
        imageAlt: events.imageAlt,
        title: events.title,
      })
      .from(events),
  ]);
  return { photos, eventImages };
}

export async function insertRecapPhoto(photo: InsertRecapPhoto) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .insert(recapPhotos)
    .values(photo)
    .returning({ id: recapPhotos.id });
  return result[0]?.id;
}

export async function getAdminActivityFeed() {
  const db = await getDb();
  if (!db) return { registrations: [], wall: [], projects: [] };
  const [registrations, wall, projects] = await Promise.all([
    db
      .select()
      .from(eventRegistrations)
      .orderBy(desc(eventRegistrations.createdAt))
      .limit(8),
    db.select().from(wallNotes).orderBy(desc(wallNotes.createdAt)).limit(8),
    db
      .select()
      .from(projectUpdates)
      .orderBy(desc(projectUpdates.createdAt))
      .limit(8),
  ]);
  return { registrations, wall, projects };
}

export type AdminActivityFeed = Awaited<
  ReturnType<typeof getAdminActivityFeed>
>;
