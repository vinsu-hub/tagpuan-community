import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  countRecentBySession,
  countRecentEventRegistrations,
  createReport,
  getNextPublicEvent,
  incrementEventAttendeeCount,
  incrementWallPin,
  insertEventRegistration,
  insertProjectUpdate,
  insertWallNote,
  listProjectUpdates,
  listPublicEvents,
  listRecapPhotos,
  listSpotlights,
  listVenuePins,
  listWallNotes,
  findEventRegistration,
  subscribeNewsletter,
} from "./db";

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

function sessionHash(req: { headers: Record<string, unknown> }) {
  const forwarded = String(req.headers["x-forwarded-for"] ?? "");
  const userAgent = String(req.headers["user-agent"] ?? "unknown");
  return createHash("sha256").update(`${forwarded}|${userAgent}`).digest("hex");
}

function rejectIfBlocked(body: string) {
  if (containsBlockedLanguage(body))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "That note can't go up. Try rephrasing.",
    });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
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
        const hash = sessionHash(ctx.req);
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
        await incrementWallPin(input.id);
        return { success: true };
      }),
    report: publicProcedure
      .input(reportSchema)
      .mutation(async ({ ctx, input }) => {
        await createReport(
          input.targetType,
          input.targetId,
          sessionHash(ctx.req),
          input.reason
        );
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
        const hash = sessionHash(ctx.req);
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
        await createReport(
          input.targetType,
          input.targetId,
          sessionHash(ctx.req),
          input.reason
        );
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
        const hash = sessionHash(ctx.req);
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
      .mutation(async ({ input }) => {
        await subscribeNewsletter({
          email: input.email.toLowerCase(),
          status: "subscribed",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { success: true, message: "pinned! we'll write back soon." };
      }),
  }),
});

export type AppRouter = typeof appRouter;
