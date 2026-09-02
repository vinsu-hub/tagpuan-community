import { createHash, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter.js";
import { supabaseAdmin } from "./_core/supabaseAdmin.js";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import {
  countRecentBySession,
  countRecentEventRegistrations,
  countRecentHearMeOutBySession,
  countRecentNewsletterBySession,
  countRecentReportsBySession,
  createReport,
  createNewsletterCampaign,
  getAdminActivityFeed,
  getAdminDashboardStats,
  getNextPublicEvent,
  incrementEventAttendeeCount,
  incrementWallPin,
  insertEvent,
  insertEventRegistration,
  insertHearMeOutSubmission,
  insertProjectUpdate,
  insertRecapPhoto,
  insertSpotlight,
  insertWallNote,
  findEventRegistration,
  listAdminEvents,
  listAdminMedia,
  listAllSpotlights,
  listEventRegistrations,
  listHearMeOutSubmissions,
  listModerationReports,
  listNewsletterCampaigns,
  listNewsletterSubscribers,
  listProjectUpdates,
  listProjectUpdatesForModeration,
  listPublicEvents,
  listRecapPhotosForAdmin,
  listRecapPhotos,
  listSpotlights,
  listVenuePins,
  listWallNotes,
  listWallNotesForModeration,
  subscribeNewsletter,
  updateEvent,
  updateEventRegistrationStatus,
  updateHearMeOutSubmissionStatus,
  updateModerationReportStatus,
  updateProjectUpdateStatus,
  updateRecapPhoto,
  updateSpotlight,
  updateWallNoteStatus,
} from "./db.js";

const wallSchema = z.object({
  body: z.string().trim().min(1).max(140),
  authorName: z.string().trim().max(100).optional(),
  tone: z.enum(["mustard", "sage", "rose", "bone"]).default("mustard"),
});
const projectSchema = z.object({
  body: z.string().trim().min(1).max(120),
  authorName: z.string().trim().max(100).optional(),
  tag: z.enum(["Art", "Tech", "Writing", "Music", "Research", "Other"]),
});
const eventRegistrationSchema = z.object({
  eventSlug: z.string().trim().min(1).max(120),
  eventId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  background: z.string().trim().min(10).max(1000),
  currentInterests: z.string().trim().min(10).max(1000),
  topInterests: z.array(z.string().trim().min(1).max(80)).min(1).max(3),
  heardFrom: z.string().trim().min(1).max(120),
  hotTake: z.string().trim().max(500).optional(),
  nightSuggestion: z.string().trim().max(500).optional(),
  photoConsent: z.literal(true),
});
const reportSchema = z.object({
  targetType: z.enum(["wall", "project"]),
  targetId: z.number().int().positive(),
  reason: z.string().trim().max(240).optional(),
});
const blockedTerms = [/\bslur\b/i, /\bspam\b/i, /\bscam\b/i];

function containsBlockedLanguage(value: string) {
  const normalized = value.toLowerCase();
  return blockedTerms.some(term => term.test(normalized));
}

function sessionHash(ctx: { clientIp: string; userAgent: string }) {
  return createHash("sha256")
    .update(`${ctx.clientIp}|${ctx.userAgent}`)
    .digest("hex");
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access is required for this area.",
    });
  return next({ ctx });
});

const eventAdminSchema = z.object({
  slug: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  dateLabel: z.string().trim().min(2).max(80),
  startsAt: z.number().int().positive(),
  endsAt: z.number().int().positive().nullable().optional(),
  venue: z.string().trim().min(2).max(160),
  venueAddress: z.string().trim().max(500).optional(),
  timeLabel: z.string().trim().min(2).max(80),
  rsvpUrl: z
    .string()
    .url()
    .max(1000)
    .default("https://tagpuan.community/events"),
  capacity: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().max(1000).nullable().optional(),
  imageAlt: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().min(10).max(2000),
  activities: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
  isPublished: z.number().int().min(0).max(1).default(1),
});

function rejectIfBlocked(body: string) {
  if (containsBlockedLanguage(body))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "That note can't go up. Try rephrasing.",
    });
}

/** Throw TOO_MANY_REQUESTS when a session exceeds `limit` of something per hour. */
async function throttle(
  count: Promise<number>,
  limit: number,
  message: string
) {
  if ((await count) >= limit)
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
}

export const appRouter = router({
  system: systemRouter,
  admin: router({
    dashboard: adminProcedure.query(() => getAdminDashboardStats()),
    events: adminProcedure.query(() => listAdminEvents()),
    createEvent: adminProcedure
      .input(eventAdminSchema)
      .mutation(async ({ input }) => {
        const now = Date.now();
        await insertEvent({
          ...input,
          endsAt: input.endsAt ?? null,
          venueAddress: input.venueAddress || null,
          capacity: input.capacity ?? null,
          imageUrl: input.imageUrl || null,
          imageAlt: input.imageAlt || null,
          activities: JSON.stringify(input.activities),
          attendeeCount: 0,
          createdAt: now,
          updatedAt: now,
        });
        return { success: true, message: "Event created." };
      }),
    updateEvent: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          changes: eventAdminSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const { activities, ...rest } = input.changes;
        const changes = {
          ...rest,
          ...(activities ? { activities: JSON.stringify(activities) } : {}),
          updatedAt: Date.now(),
        };
        await updateEvent(input.id, changes);
        return { success: true, message: "Event updated." };
      }),
    registrations: adminProcedure.query(() => listEventRegistrations()),
    updateRegistrationStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["confirmed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateEventRegistrationStatus(input.id, input.status);
        return { success: true, message: "Applicant status updated." };
      }),
    activity: adminProcedure.query(() => getAdminActivityFeed()),
    wall: router({
      list: adminProcedure.query(() => listWallNotesForModeration()),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            status: z.enum(["pending", "approved", "rejected"]),
          })
        )
        .mutation(async ({ input }) => {
          await updateWallNoteStatus(input.id, input.status);
          return { success: true, message: "Wall note updated." };
        }),
    }),
    projects: router({
      list: adminProcedure.query(() => listProjectUpdatesForModeration()),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            status: z.enum(["pending", "approved", "rejected"]),
          })
        )
        .mutation(async ({ input }) => {
          await updateProjectUpdateStatus(input.id, input.status);
          return { success: true, message: "Project update updated." };
        }),
    }),
    reports: router({
      list: adminProcedure.query(() => listModerationReports()),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            status: z.enum(["open", "reviewed", "dismissed"]),
          })
        )
        .mutation(async ({ input }) => {
          await updateModerationReportStatus(input.id, input.status);
          return { success: true, message: "Report updated." };
        }),
    }),
    spotlights: router({
      list: adminProcedure.query(() => listAllSpotlights()),
      create: adminProcedure
        .input(
          z.object({
            name: z.string().trim().min(1).max(120),
            role: z.string().trim().min(1).max(180),
            quote: z.string().trim().min(1).max(2000),
            photoUrl: z.string().url().max(1000).nullable().optional(),
            photoAlt: z.string().trim().max(240).nullable().optional(),
            eventTag: z.string().trim().max(180).nullable().optional(),
            sortOrder: z.number().int().default(0),
            isPublished: z.number().int().min(0).max(1).default(1),
          })
        )
        .mutation(async ({ input }) => {
          const now = Date.now();
          await insertSpotlight({
            ...input,
            photoUrl: input.photoUrl || null,
            photoAlt: input.photoAlt || null,
            eventTag: input.eventTag || null,
            createdAt: now,
            updatedAt: now,
          });
          return { success: true, message: "Spotlight created." };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            changes: z
              .object({
                name: z.string().trim().min(1).max(120).optional(),
                role: z.string().trim().min(1).max(180).optional(),
                quote: z.string().trim().min(1).max(2000).optional(),
                photoUrl: z.string().url().max(1000).nullable().optional(),
                photoAlt: z.string().trim().max(240).nullable().optional(),
                eventTag: z.string().trim().max(180).nullable().optional(),
                sortOrder: z.number().int().optional(),
                isPublished: z.number().int().min(0).max(1).optional(),
              })
              .partial(),
          })
        )
        .mutation(async ({ input }) => {
          await updateSpotlight(input.id, input.changes);
          return { success: true, message: "Spotlight updated." };
        }),
    }),
    recaps: router({
      list: adminProcedure.query(() => listRecapPhotosForAdmin()),
      update: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            changes: z
              .object({
                caption: z.string().trim().max(500).nullable().optional(),
                imageAlt: z.string().trim().max(240).optional(),
                sortOrder: z.number().int().optional(),
                isPublished: z.number().int().min(0).max(1).optional(),
              })
              .partial(),
          })
        )
        .mutation(async ({ input }) => {
          await updateRecapPhoto(input.id, input.changes);
          return { success: true, message: "Recap photo updated." };
        }),
      create: adminProcedure
        .input(
          z.object({
            eventId: z.number().int().positive().nullable().optional(),
            imageUrl: z.string().max(1000),
            imageAlt: z.string().trim().max(240),
            caption: z.string().trim().max(500).nullable().optional(),
            isPublished: z.number().int().min(0).max(1).default(1),
          })
        )
        .mutation(async ({ input }) => {
          const now = Date.now();
          await insertRecapPhoto({
            eventId: input.eventId ?? null,
            imageUrl: input.imageUrl,
            imageAlt: input.imageAlt,
            caption: input.caption || null,
            isPublished: input.isPublished,
            sortOrder: 0,
            createdAt: now,
            updatedAt: now,
          });
          return { success: true, message: "Recap photo added." };
        }),
    }),
    hearMeOut: router({
      list: adminProcedure.query(() => listHearMeOutSubmissions()),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            status: z.enum(["new", "in_review", "published", "archived"]),
          })
        )
        .mutation(async ({ input }) => {
          await updateHearMeOutSubmissionStatus(input.id, input.status);
          return { success: true, message: "Submission updated." };
        }),
    }),
    newsletter: router({
      list: adminProcedure.query(() => listNewsletterSubscribers()),
      campaigns: adminProcedure.query(() => listNewsletterCampaigns()),
      createCampaign: adminProcedure
        .input(
          z.object({
            subject: z.string().trim().min(1).max(240),
            audience: z.string().trim().max(120).default("All subscribers"),
            body: z.string().trim().max(5000).nullable().optional(),
            status: z.enum(["draft", "sent"]).default("draft"),
          })
        )
        .mutation(async ({ input }) => {
          const now = Date.now();
          await createNewsletterCampaign({
            subject: input.subject,
            audience: input.audience,
            body: input.body || null,
            status: input.status,
            recipients:
              input.status === "sent"
                ? await listNewsletterSubscribers().then(s => s.length)
                : 0,
            sentAt: input.status === "sent" ? now : null,
            createdAt: now,
            updatedAt: now,
          });
          return { success: true, message: "Campaign saved." };
        }),
    }),
    media: router({
      list: adminProcedure.query(() => listAdminMedia()),
      // Browsers no longer write to the `media` bucket directly. An admin asks
      // for a one-shot signed upload URL here (service-role), then PUTs the file
      // to it via `supabase.storage.uploadToSignedUrl`.
      createUploadUrl: adminProcedure
        .input(
          z.object({
            folder: z
              .string()
              .trim()
              .regex(/^[a-z0-9-]{1,24}$/, "folder must be a short slug")
              .default("uploads"),
            filename: z.string().trim().min(1).max(200),
            contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
          })
        )
        .mutation(async ({ input }) => {
          const safeName = input.filename.replace(/[^a-zA-Z0-9.\-_]/g, "-");
          const path = `${input.folder}/${randomUUID()}-${safeName}`;
          const storage = supabaseAdmin().storage.from("media");
          const { data, error } = await storage.createSignedUploadUrl(path);
          if (error || !data)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error?.message ?? "Could not create an upload URL.",
            });
          const { data: pub } = storage.getPublicUrl(path);
          return { path, token: data.token, publicUrl: pub.publicUrl };
        }),
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    // Session lives entirely in the Supabase client; sign-out happens there.
    logout: publicProcedure.mutation(() => ({ success: true }) as const),
  }),
  content: router({
    events: publicProcedure.query(() => listPublicEvents()),
    nextEvent: publicProcedure.query(() => getNextPublicEvent()),
    spotlights: publicProcedure.query(() => listSpotlights()),
    recapPhotos: publicProcedure.query(() => listRecapPhotos()),
    venuePins: publicProcedure.query(() => listVenuePins()),
  }),
  wall: router({
    list: publicProcedure
      .input(
        z.object({
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(30).default(12),
          archive: z.boolean().default(false),
        })
      )
      .query(({ input }) =>
        listWallNotes(
          input.pageSize,
          (input.page - 1) * input.pageSize,
          input.archive
        )
      ),
    create: publicProcedure
      .input(wallSchema)
      .mutation(async ({ ctx, input }) => {
        rejectIfBlocked(input.body);
        const hash = sessionHash(ctx);
        if ((await countRecentBySession("wall", hash)) > 0)
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "You have already pinned a note recently. Come back in a little while.",
          });
        const now = Date.now();
        await insertWallNote({
          ...input,
          authorName: input.authorName || null,
          sessionHash: hash,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        });
        return {
          success: true,
          message: "Pinned for review — thanks for leaving a trace.",
        };
      }),
    pin: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        // Known: unauthenticated and unthrottled — worst case is an inflated
        // pin count on one note, which moderation can reset. Low severity;
        // revisit with a per-session guard if it's ever abused.
        await incrementWallPin(input.id);
        return { success: true };
      }),
    report: publicProcedure
      .input(reportSchema)
      .mutation(async ({ ctx, input }) => {
        const hash = sessionHash(ctx);
        await throttle(
          countRecentReportsBySession(hash),
          10,
          "You've sent a lot of reports. Take a break and try again later."
        );
        await createReport(input.targetType, input.targetId, hash, input.reason);
        return { success: true, message: "Thanks, we'll take a look." };
      }),
  }),
  projects: router({
    list: publicProcedure
      .input(
        z.object({
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(30).default(10),
        })
      )
      .query(({ input }) =>
        listProjectUpdates(input.pageSize, (input.page - 1) * input.pageSize)
      ),
    create: publicProcedure
      .input(projectSchema)
      .mutation(async ({ ctx, input }) => {
        rejectIfBlocked(input.body);
        const hash = sessionHash(ctx);
        if ((await countRecentBySession("project", hash)) > 0)
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "You have already shared an update recently. Come back in a little while.",
          });
        const now = Date.now();
        await insertProjectUpdate({
          ...input,
          authorName: input.authorName || null,
          sessionHash: hash,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        });
        return {
          success: true,
          message:
            "Update received — it will appear after a quick moderation check.",
        };
      }),
    report: publicProcedure
      .input(reportSchema)
      .mutation(async ({ ctx, input }) => {
        const hash = sessionHash(ctx);
        await throttle(
          countRecentReportsBySession(hash),
          10,
          "You've sent a lot of reports. Take a break and try again later."
        );
        await createReport(input.targetType, input.targetId, hash, input.reason);
        return { success: true, message: "Thanks, we'll take a look." };
      }),
  }),
  registrations: router({
    create: publicProcedure
      .input(eventRegistrationSchema)
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        if (await findEventRegistration(input.eventSlug, email)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You’re already registered for this Tagpuan gathering.",
          });
        }
        const hash = sessionHash(ctx);
        if ((await countRecentEventRegistrations(hash)) > 0) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "One registration at a time, please. Try again later.",
          });
        }
        const now = Date.now();
        await insertEventRegistration({
          ...input,
          email,
          eventId: input.eventId ?? null,
          topInterests: input.topInterests.join(", "),
          hotTake: input.hotTake || null,
          nightSuggestion: input.nightSuggestion || null,
          sessionHash: hash,
          status: "confirmed",
          createdAt: now,
          updatedAt: now,
          photoConsent: input.photoConsent ? 1 : 0,
        });
        if (input.eventId) await incrementEventAttendeeCount(input.eventId);
        return {
          success: true,
          message: "You’re on the list. See you at Tagpuan!",
        };
      }),
  }),
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().trim().email().max(320) }))
      .mutation(async ({ ctx, input }) => {
        const hash = sessionHash(ctx);
        await throttle(
          countRecentNewsletterBySession(hash),
          5,
          "That's a lot of sign-ups from here. Try again later."
        );
        await subscribeNewsletter({
          email: input.email.toLowerCase(),
          status: "subscribed",
          sessionHash: hash,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { success: true, message: "pinned! we'll write back soon." };
      }),
  }),
  hearMeOut: router({
    submit: publicProcedure
      .input(
        z.object({
          subject: z.string().trim().min(1).max(240),
          sender: z.string().trim().max(120).optional(),
          category: z
            .enum(["Suggestion", "Appreciation", "Idea", "Ask"])
            .default("Suggestion"),
          excerpt: z.string().trim().max(3000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const hash = sessionHash(ctx);
        await throttle(
          countRecentHearMeOutBySession(hash),
          5,
          "You've sent a few of these already. Give it a little while."
        );
        const now = Date.now();
        await insertHearMeOutSubmission({
          subject: input.subject,
          sender: input.sender || null,
          category: input.category,
          excerpt: input.excerpt || null,
          sessionHash: hash,
          status: "new",
          createdAt: now,
          updatedAt: now,
        });
        return { success: true, message: "Thanks — we've heard you." };
      }),
  }),
});

export type AppRouter = typeof appRouter;
