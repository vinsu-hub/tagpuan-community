import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  events,
  eventRegistrations,
  InsertEvent,
  InsertEventRegistration,
  InsertNewsletterSubscriber,
  InsertProjectUpdate,
  InsertUser,
  InsertWallNote,
  memberSpotlights,
  moderationReports,
  newsletterSubscribers,
  projectUpdates,
  recapPhotos,
  users,
  venuePins,
  wallNotes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
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

export async function listAdminEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.startsAt));
}

export async function insertEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(events).values(event);
  return result[0]?.insertId;
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
  const result = await db.insert(wallNotes).values(note);
  return result[0]?.insertId;
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
  const result = await db.insert(projectUpdates).values(update);
  return result[0]?.insertId;
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
  const result = await db.insert(eventRegistrations).values(registration);
  return result[0]?.insertId;
}

export async function subscribeNewsletter(
  subscriber: InsertNewsletterSubscriber
) {
  const db = await getDb();
  if (!db) return false;
  await db
    .insert(newsletterSubscribers)
    .values(subscriber)
    .onDuplicateKeyUpdate({
      set: { status: "subscribed", updatedAt: Date.now() },
    });
  return true;
}
