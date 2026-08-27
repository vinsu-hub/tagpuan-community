ALTER TABLE `eventRegistrations` MODIFY COLUMN `eventId` int;--> statement-breakpoint
ALTER TABLE `eventRegistrations` ADD `eventSlug` varchar(120) NOT NULL;