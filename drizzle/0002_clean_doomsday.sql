CREATE TABLE `eventRegistrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`background` text NOT NULL,
	`currentInterests` text NOT NULL,
	`topInterests` varchar(500) NOT NULL,
	`heardFrom` varchar(120) NOT NULL,
	`hotTake` text,
	`nightSuggestion` text,
	`photoConsent` int NOT NULL DEFAULT 1,
	`sessionHash` varchar(64) NOT NULL,
	`status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `eventRegistrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `eventRegistrations_event_idx` ON `eventRegistrations` (`eventId`);--> statement-breakpoint
CREATE INDEX `eventRegistrations_email_idx` ON `eventRegistrations` (`email`);--> statement-breakpoint
CREATE INDEX `eventRegistrations_session_idx` ON `eventRegistrations` (`sessionHash`);