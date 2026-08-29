CREATE TABLE "eventRegistrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" integer,
	"eventSlug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(320) NOT NULL,
	"background" text NOT NULL,
	"currentInterests" text NOT NULL,
	"topInterests" varchar(500) NOT NULL,
	"heardFrom" varchar(120) NOT NULL,
	"hotTake" text,
	"nightSuggestion" text,
	"photoConsent" integer DEFAULT 1 NOT NULL,
	"sessionHash" varchar(64) NOT NULL,
	"status" varchar(16) DEFAULT 'confirmed' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(160) NOT NULL,
	"dateLabel" varchar(80) NOT NULL,
	"startsAt" bigint NOT NULL,
	"endsAt" bigint,
	"venue" varchar(160) NOT NULL,
	"venueAddress" text,
	"timeLabel" varchar(80) NOT NULL,
	"rsvpUrl" text NOT NULL,
	"attendeeCount" integer DEFAULT 0 NOT NULL,
	"capacity" integer,
	"imageUrl" text,
	"imageAlt" text,
	"description" text NOT NULL,
	"activities" text NOT NULL,
	"isPublished" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hearMeOutSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" varchar(240) NOT NULL,
	"sender" varchar(120),
	"category" varchar(24) DEFAULT 'Suggestion' NOT NULL,
	"excerpt" text,
	"status" varchar(16) DEFAULT 'new' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberSpotlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"role" varchar(180) NOT NULL,
	"quote" text NOT NULL,
	"photoUrl" text,
	"photoAlt" text,
	"eventTag" varchar(180),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isPublished" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderationReports" (
	"id" serial PRIMARY KEY NOT NULL,
	"targetType" varchar(16) NOT NULL,
	"targetId" integer NOT NULL,
	"reporterSessionHash" varchar(128) NOT NULL,
	"reason" varchar(240),
	"status" varchar(16) DEFAULT 'open' NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletterCampaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" varchar(240) NOT NULL,
	"audience" varchar(120) DEFAULT 'All subscribers',
	"recipients" integer DEFAULT 0 NOT NULL,
	"body" text,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"sentAt" bigint,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"status" varchar(16) DEFAULT 'subscribed' NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "newsletterSubscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "projectUpdates" (
	"id" serial PRIMARY KEY NOT NULL,
	"body" varchar(120) NOT NULL,
	"authorName" varchar(100),
	"tag" varchar(16) DEFAULT 'Other' NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"reportCount" integer DEFAULT 0 NOT NULL,
	"sessionHash" varchar(128) NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recapPhotos" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" integer,
	"imageUrl" text NOT NULL,
	"imageAlt" text NOT NULL,
	"caption" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isPublished" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(16) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "venuePins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"mapUrl" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isPublished" integer DEFAULT 1 NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallNotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"body" varchar(140) NOT NULL,
	"authorName" varchar(100),
	"tone" varchar(16) DEFAULT 'mustard' NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"pinCount" integer DEFAULT 0 NOT NULL,
	"reportCount" integer DEFAULT 0 NOT NULL,
	"sessionHash" varchar(128) NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "eventRegistrations_event_idx" ON "eventRegistrations" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "eventRegistrations_email_idx" ON "eventRegistrations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "eventRegistrations_session_idx" ON "eventRegistrations" USING btree ("sessionHash");--> statement-breakpoint
CREATE INDEX "events_startsAt_idx" ON "events" USING btree ("startsAt");--> statement-breakpoint
CREATE INDEX "events_published_idx" ON "events" USING btree ("isPublished");--> statement-breakpoint
CREATE INDEX "moderationReports_target_idx" ON "moderationReports" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "projectUpdates_status_createdAt_idx" ON "projectUpdates" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "projectUpdates_tag_idx" ON "projectUpdates" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "wallNotes_status_createdAt_idx" ON "wallNotes" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "wallNotes_sessionHash_idx" ON "wallNotes" USING btree ("sessionHash");