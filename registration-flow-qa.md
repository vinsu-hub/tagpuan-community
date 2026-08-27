# On-site event registration QA

The event details dialog now opens an in-site registration panel from the `Register on Tagpuan` button instead of sending attendees to Luma. The form follows the supplied reference structure with name, email, background, current interests, top interests, referral source, optional hot take, optional night suggestion, and photo/video consent.

The public tRPC procedure validates and normalizes the submission, stores it in `eventRegistrations`, prevents duplicate confirmed registrations for the same event and email, applies a session-based registration rate limit, and increments the linked CMS event attendee count when a numeric event ID is available. The confirmation state reports the saved spot without requiring login.

Desktop and mobile homepage captures remain stable after the change. TypeScript, Vitest, formatting, and production build all pass. The dedicated Events page now uses an internal Register on Tagpuan button that hands attendees to the selected Saturday session and opens the same in-site registration form.
