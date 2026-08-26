CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`title` varchar(160) NOT NULL,
	`dateLabel` varchar(80) NOT NULL,
	`startsAt` bigint NOT NULL,
	`endsAt` bigint,
	`venue` varchar(160) NOT NULL,
	`venueAddress` text,
	`timeLabel` varchar(80) NOT NULL,
	`rsvpUrl` text NOT NULL,
	`attendeeCount` int NOT NULL DEFAULT 0,
	`capacity` int,
	`imageUrl` text,
	`imageAlt` text,
	`description` text NOT NULL,
	`activities` text NOT NULL,
	`isPublished` int NOT NULL DEFAULT 1,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `memberSpotlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`role` varchar(180) NOT NULL,
	`quote` text NOT NULL,
	`photoUrl` text,
	`photoAlt` text,
	`eventTag` varchar(180),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` int NOT NULL DEFAULT 1,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `memberSpotlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderationReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetType` enum('wall','project') NOT NULL,
	`targetId` int NOT NULL,
	`reporterSessionHash` varchar(128) NOT NULL,
	`reason` varchar(240),
	`status` enum('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` bigint NOT NULL,
	CONSTRAINT `moderationReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `projectUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`body` varchar(120) NOT NULL,
	`authorName` varchar(100),
	`tag` enum('Art','Tech','Writing','Music','Research','Other') NOT NULL DEFAULT 'Other',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reportCount` int NOT NULL DEFAULT 0,
	`sessionHash` varchar(128) NOT NULL,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `projectUpdates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recapPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int,
	`imageUrl` text NOT NULL,
	`imageAlt` text NOT NULL,
	`caption` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` int NOT NULL DEFAULT 1,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `recapPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venuePins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`mapUrl` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` int NOT NULL DEFAULT 1,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `venuePins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`body` varchar(140) NOT NULL,
	`authorName` varchar(100),
	`tone` enum('mustard','sage','rose','bone') NOT NULL DEFAULT 'mustard',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`pinCount` int NOT NULL DEFAULT 0,
	`reportCount` int NOT NULL DEFAULT 0,
	`sessionHash` varchar(128) NOT NULL,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `wallNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `events_startsAt_idx` ON `events` (`startsAt`);--> statement-breakpoint
CREATE INDEX `events_published_idx` ON `events` (`isPublished`);--> statement-breakpoint
CREATE INDEX `moderationReports_target_idx` ON `moderationReports` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `projectUpdates_status_createdAt_idx` ON `projectUpdates` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `projectUpdates_tag_idx` ON `projectUpdates` (`tag`);--> statement-breakpoint
CREATE INDEX `wallNotes_status_createdAt_idx` ON `wallNotes` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `wallNotes_sessionHash_idx` ON `wallNotes` (`sessionHash`);