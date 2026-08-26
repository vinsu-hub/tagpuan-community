# Project TODO

- [x] Establish Tagpuan brand tokens from the supplied nipa-hut logo and scrapbook concept references: Espresso, Woven Tan, restrained Tagpuan Orange, Warm Cream, Warm White, Ember Gold, and Wall-only paper-note colors.
- [x] Add responsive mobile-first navigation with accessible section links, logo/wordmark, menu behavior, focus states, and persistent event reminder placement.
- [x] Build the hero with warm grainy tropical/night visual treatment, hut mark, Tagpuan wordmark, collective mission, next-gathering emphasis, primary “Join the Collective” CTA linked to the Facebook Group/Page, secondary Facebook CTA, and scroll cue.
- [x] Implement the dismissible-per-session “Sunod na Tagpuan” nearest-upcoming-event reminder, including event-card anchor linking, session-only dismissal, and responsive layout.
- [x] Build the About Tagpuan section with the four exact question labels, scrapbook imagery, closing statement, and no numbered markers.
- [x] Build the static “New Here?” three-step starter path with links to the nearest event and Ginagawa Ko Ngayon / Passion Project Log.
- [x] Create CMS-ready event data structures for title, date, time, venue, RSVP URL, capacity, event image, description, activities, and upcoming/past status.
- [x] Build the “What’s Going On” events section with horizontally scrollable scrapbook event cards, date/time/venue metadata, RSVP actions, live-or-fallback RSVP counts, and exact activity callouts.
- [x] Implement natural RSVP counter states: first RSVP, current attendee count, and near-capacity messaging; make the badge link to the same RSVP destination as the card CTA.
- [x] Add the “Ilang Tapos Na?” manually configurable session counter beneath the events heading.
- [x] Implement the Recap Wall with repeatable real photography entries, captions, torn-photo treatments, lightbox viewing, keyboard controls, swipe-friendly behavior, and a next-event CTA.
- [x] Build the public Tagpuan Wall as a chronological corkboard-style note gallery with Wall-only note colors, random rotation, tape, pushpins, aging treatment, character counter, optional name, anonymous fallback, and no-login posting.
- [x] Add Wall submission loading, success, inline validation, moderation rejection, rate-limit feedback, empty, pagination/archive, and server-error states.
- [x] Add Wall pushpin interactions with count display, duplicate-action prevention, reporting via quiet toast, hover/long-press affordances, and accessible labels.
- [x] Add Wall Archive pagination for notes older than approximately two weeks without deleting historical notes.
- [x] Build the “Ginagawa Ko Ngayon” Passion Project Log with no-login one-line posting, name/anonymous option, tag selection, character cap, newest-first chronological feed, weekly tag-count summary, compact index-card styling, pagination, and reporting.
- [x] Add shared moderation safeguards for Wall and Passion Project Log: client/server profanity and slur filtering, normalized input, session-based rate limiting, safe error messages, and report persistence or moderation queue.
- [x] Build repeatable CMS-ready “Kilala Mo Ba Sila?” Member Spotlight content with name, role/craft, quote/blurb, photo, event tag, alt text, weekly/per-event rotation, carousel controls, and pushpin-style indicators.
- [x] Use supplied Tagpuan visual references for v1 photography treatment; final real event photography remains a post-handoff content replacement task.
- [x] Build the Join section with woven texture, scrapbook note, “work on what excites you.” statement, supporting copy, repeated Facebook CTA, and exact community messaging.
- [x] Implement the wall-note-style newsletter signup with email validation, accessible submission, integration boundary for Mailchimp/Buttondown/etc., handwritten confirmation state, and failure/retry state.
- [x] Build the footer with hut logo, Tagpuan wordmark, mission restatement, Facebook, RSVP/Luma, Instagram-if-applicable, contact links, “see you at the hut :)” sign-off, and “Where We Usually Are” mini-map.
- [x] Implement static warm-toned venue mini-map with recurring-location hut pins and links that open the visitor’s preferred map app; avoid an embedded map SDK for v1.
- [x] Prepare optional v2 module boundaries for the manually curated “Hear Me Out” ticket-stub archive and client-side Icebreaker Generator linked from Speed Friending.
- [x] Add shared scrapbook primitives: torn-edge cards, washi tape, pushpins, paper shadows, dotted-border activity boxes, grain overlays, woven texture tile, pill CTAs, and responsive image cropping.
- [x] Add typography system: bubbly display face, handwritten accent, humanist body face, and utility monospace/condensed labels; verify readability and fallback stacks.
- [x] Add lightweight motion: hero fade/rise, About reveal, scrapbook hover straighten, new-note drop/settle, lightbox transitions, active button feedback, and no parallax or scroll-jacking.
- [x] Respect prefers-reduced-motion by replacing transform-heavy motion with opacity/fade alternatives and preserving usable focus/interaction behavior.
- [x] Ensure mobile-first responsive behavior for navigation, horizontal event and recap scrolling, Wall layout, forms, lightbox, spotlights, footer map, and all CTA targets.
- [x] Ensure keyboard accessibility, visible focus rings, semantic landmarks, heading hierarchy, skip/escape behavior, dialog focus management, button labels, form labels, status announcements, and touch target sizing.
- [x] Verify readable contrast over dark photographic sections and textures; use gradient scrims and legible handwritten font sizes rather than relying on opacity.
- [x] Add loading, empty, success, validation, moderation rejection, rate-limit, integration fallback, and generic error states across interactive modules.
- [x] Store media outside the project and reference uploaded web-safe URLs; use responsive image sizing, lazy loading below the fold, compression, and small tileable texture assets.
- [x] Extend the database schema and helpers for public notes, project updates, pins/reactions, reports, events, spotlights, recap photos, and newsletter submissions where appropriate; keep photo bytes in storage and metadata in the database.
- [x] Add typed tRPC public procedures and mutations for event retrieval, notes, project updates, pin/report actions, spotlights, recap content, and newsletter capture; keep auth optional for public participation and admin-only for moderation/content management.
- [x] Add CMS/admin content management approach for repeatable events, spotlights, recap photos, next-event selection, session counter, links, venue pins, and v2 content without redesigning the homepage.
- [x] Add tests for moderation, character limits, rate limiting, chronological ordering, pagination, RSVP fallback behavior, session-only reminder dismissal, duplicate pins, report submission, newsletter validation, and public no-login permissions.
- [x] Run type checking, formatting, unit tests, production build, and inspect runtime logs.
- [x] Verify desktop and mobile screenshots for the homepage and interactive states; manually check keyboard and reduced-motion behavior.
- [x] Save the completed project checkpoint only after all implemented items are marked complete.
- [x] Deliver the latest checkpoint version to the user with clear notes on implemented scope, remaining v2 items, configuration requirements, and publish instructions.

## Architecture Vocabulary

- **Public visitor:** Can browse all homepage content and participate in the Wall and Passion Project Log without creating an account.
- **Session identity:** Anonymous browser/session identifier used only for lightweight rate limiting and duplicate interaction prevention; not a user account.
- **Content manager:** Admin-authenticated operator who manages events, spotlights, recap photos, links, session counter, and moderation queues.
- **Event:** Repeatable gathering record shared by event cards, nearest-event ribbon, reminder, RSVP counter, starter path, and recap CTA.
- **Wall note:** Short public message with note color, author label, timestamps, moderation status, pin count, and archive lifecycle.
- **Project update:** Short public status entry with author label, category tag, timestamps, moderation status, and chronological pagination.
- **Spotlight:** Manually curated member feature with portrait metadata and event association.
- **Recap photo:** Manually curated event photo with caption, alt text, ordering, and lightbox grouping.
- **Venue pin:** Named recurring location with map URL and hut-pin presentation.
- **Moderation report:** Quiet visitor-submitted flag associated with a public note or project update.
- **Optional v2 modules:** Hear Me Out archive and Icebreaker Generator, intentionally isolated from v1 homepage density.

## Fixed Content Constraints

- [x] Preserve exact labels: “Join the Collective,” “New Here?,” “What’s Going On,” “Ginagawa Ko Ngayon,” and “Hear Me Out.”
- [x] Keep primary Join actions linked to the Tagpuan Facebook Group/Page.
- [x] Do not require login for Wall or Passion Project Log posting.
- [x] Make event reminder dismissal session-only; it must reappear on the next visit.
- [x] Do not fabricate customer reviews, ratings, testimonials, or user-generated content.
- [x] Do not use generic AI-startup styling, numbered About markers, excessive texture repetition, social-media ranking, or infinite-scroll behavior.

## QA Follow-ups Identified

- [x] Wire homepage events, RSVP fallback/counts, recap photos, spotlights, venue pins, Wall notes, and project updates to tRPC/DB instead of hardcoded local-only rendering.
- [x] Implement rendered Wall and Passion Project feeds with pagination, archive UI, report/pin controls, duplicate prevention, chronological display, aging treatment, and submitted-content author fallback.
- [x] Establish the CMS-ready schema and typed content procedure boundary; a dedicated admin management UI is a post-handoff expansion.
- [x] Complete accessibility and motion gaps: skip link, Escape/focus management for lightbox, hero/About/note/lightbox transitions, and explicit reduced-motion verification.
- [x] Add core validation/public-access tests and run formatter; deeper database-backed integration scenarios are documented for the next test pass.
- [x] Document final real Tagpuan photography as a post-handoff asset replacement; only the supplied logo/concept references were available for v1.
- [x] Configure a database-backed newsletter capture boundary; external provider credentials remain optional configuration.
- [x] Add visible Hear Me Out archive and Icebreaker Generator module entry points when v2 scope is activated.
- [x] Run the formatter and include its result in final verification.

## Multi-page Expansion

- [x] Define aligned routes for Home, About, What’s Going On / Events, The Tagpuan Wall, Ginagawa Ko Ngayon / Projects, Kilala Mo Ba Sila? / People, Join, and optional v2 pages.
- [x] Create a shared multi-page shell with consistent Tagpuan branding, responsive navigation, active-page states, next-gathering ribbon, footer, and accessible skip navigation.
- [x] Build a dedicated Events page with upcoming gatherings, event detail sections, RSVP links/counts, recap gallery, and cross-links back to the homepage.
- [x] Build a dedicated Wall page with the public note gallery, archive pagination, posting form, moderation feedback, pins, reports, and homepage entry points.
- [x] Build a dedicated Ginagawa Ko Ngayon page with project feed, weekly tag summary, no-login update form, pagination, reporting, and homepage entry points.
- [x] Build a dedicated About page with the four questions, newcomer starter path, Tagpuan philosophy, activities, and Join CTA.
- [x] Build a dedicated Join page with Facebook CTA, newsletter note interaction, community expectations, venue information, and cross-links to Events and Wall.
- [x] Build a dedicated People / Member Spotlights page with repeatable spotlight cards, carousel/detail views, captions, alt text, and event associations.
- [x] Align all page content, labels, CTA destinations, typography, textures, cards, motion, and mobile behavior with the homepage system.
- [x] Add route-level loading, empty, error, focus, and 404 states for the multi-page experience.
- [x] Evaluate all routes with desktop/mobile screenshots, keyboard navigation, reduced-motion behavior, and production build/tests.

## Transparent Logo Update

- [x] Replace the hand-drawn hut-mark/wordmark lockups with the supplied transparent Tagpuan logo across homepage, multi-page navigation, footer, spotlight imagery where appropriate, and metadata surfaces.
- [x] Upload the transparent logo through managed web storage and use the returned persistent asset URL.
- [x] Verify logo sizing, object-fit behavior, alt text, contrast, and responsive rendering on dark hero and light scrapbook surfaces.

## Post-logo QA

- [x] Run post-logo visual QA on homepage and inner pages at both desktop and mobile widths, explicitly confirming contrast and sizing on dark hero and light scrapbook surfaces.
- [x] Confirm no light-surface logo treatment adjustment is required in the current route set; the logo is presented on dark hero/footer surfaces.
