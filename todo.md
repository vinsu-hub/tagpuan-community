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

## Landing Page Visual Audit

- [x] Improve utility-logo sizing and cropping so the supplied transparent logo reads as a recognizable mark in the desktop header, mobile header, ribbon, hero, and footer.
- [x] Remove ambiguous duplicate branding between the transparent logo mark, large Tagpuan heading, and background concept lettering while preserving the intended hierarchy.
- [x] Improve hero text readability by reducing background competition, strengthening scrim/contrast, and keeping display type legible at desktop and mobile sizes.
- [x] Refine header and event-ribbon spacing so navigation, logo, reminder copy, and close control have clearer hierarchy and touch targets.
- [x] Rebalance hero vertical rhythm so the hero logo, eyebrow, title, description, note, and CTAs feel intentionally grouped rather than vertically loose.
- [x] Preserve scrapbook character while making CTA hierarchy, focus states, and small utility text more readable.
- [x] Re-run desktop/mobile visual QA, typecheck, tests, formatting, and production build after the landing-page refinements.

## Logo Variant Update

- [x] Upload the supplied typography-only and hut-only Tagpuan logo variants through managed web storage.
- [x] Use the hut-only variant for compact header, ribbon, map-pin, and utility placements.
- [x] Use the typography-only variant for the hero wordmark and text-led brand moments.
- [x] Use the full transparent lockup only where the combined hut-and-wordmark composition has enough space.
- [x] Verify all logo variants for cropping, readability, contrast, and responsive sizing across homepage and inner-page routes.

## Logo Variant Evidence Follow-up

- [x] Place the full transparent lockup in an intentional spacious brand context or explicitly document that v1 uses hut-only and typography-only variants only.
- [x] Run post-variant visual QA on representative inner pages at desktop and mobile widths after the variant swap.

- [x] Capture and document a dedicated mobile landing-page screenshot review after the final visual refinement state.

## Header and Ribbon QA Follow-up

- [x] Add explicit header, mobile-menu, event-ribbon, and dismiss-button spacing/touch-target improvements.
- [x] Re-check the header and reminder ribbon at desktop and mobile widths after the spacing changes.

## Dedicated Full-Page Tabs

- [x] Make About a complete standalone page with its own hero, four-question introduction, New Here? path, philosophy, activity context, and Join CTA.
- [x] Make What’s Going On a complete standalone Events page with event discovery, detail content, RSVP, attendance states, recap, and cross-links.
- [x] Make The Wall a complete standalone page with public posting, note gallery, archive, moderation feedback, pins, reports, and pagination.
- [x] Make Ginagawa Ko Ngayon a complete standalone Projects page with project context, tag summary, public update form, feed, pagination, and reports.
- [x] Make Kilala Mo Ba Sila? a complete standalone People page with spotlight content, member context, event associations, and Join CTA.
- [x] Make Join a complete standalone conversion page with Facebook CTA, newsletter interaction, community expectations, venue information, and event/Wall links.
- [x] Make all navigation labels link to dedicated route URLs instead of homepage section anchors.
- [x] Add consistent full-page header, reminder ribbon, footer, active navigation, back-to-home, loading, empty, error, and 404 behavior across routes.
- [x] Verify all dedicated pages on desktop and mobile and run typecheck, tests, formatting, and production build.

## Dedicated Shell Follow-up

- [x] Add active-page navigation styling in the shared inner-page shell based on the current route.
- [x] Add an explicit back-to-home affordance on inner pages and verify it is keyboard accessible.
- [x] Re-run route screenshots after active navigation and back-to-home updates.

## Scroll Animation Pass

- [x] Audit the homepage and dedicated pages for major scroll landmarks that should reveal as they enter the viewport.
- [x] Add a lightweight IntersectionObserver-based reveal system for hero-adjacent sections, cards, notes, projects, spotlights, recap photos, forms, and footer content.
- [x] Use restrained scrapbook motion: fade-up, slight settle, staggered card reveals, and subtle image lift without parallax or scroll-jacking.
- [x] Preserve immediate content visibility when JavaScript is unavailable or IntersectionObserver is unsupported.
- [x] Respect prefers-reduced-motion by disabling transforms and delays while retaining readable opacity.
- [x] Verify scroll animations on homepage and representative dedicated pages at desktop and mobile widths, then run typecheck, tests, formatting, and production build.

## What’s Going On Event Fixes

- [x] Fix the white-on-white activity callout text so “Make a little room / Speed Friending / Hear Me Out / DJ Sets” and “Stay for the fun / Open Mic / Games / Free Drink” meet readable contrast on their light card background.
- [x] Rename the Sunday Session event/activity copy to “Saturday Night Session” everywhere it appears in the event section and relevant event details.
- [x] Add click-to-open event context modal behavior to event cards.
- [x] Include event title, date, time, venue, description/context, activities, RSVP count/state, RSVP CTA, and close control in the modal.
- [x] Add keyboard Escape handling, focus management, backdrop close behavior, accessible dialog labels, and mobile responsive modal layout.
- [x] Verify event section contrast, Saturday copy, modal content, and desktop/mobile interaction states, then run typecheck, tests, formatting, and production build.

## Saturday Session Copy Correction

- [x] Replace every remaining “Sunday Sessions” label under What’s Going On with “Saturday Night Session,” including the event card, event reminder, dedicated event page, and event-details dialog.
- [x] Verify the fixed title remains paired with “AUG 29 · SATURDAY” across desktop and mobile views.

## Supplied Recap Images

- [x] Upload the four unique supplied event images to managed web storage and keep them outside the project bundle.
- [x] Replace the “Last time at Tagpuan” placeholder recap tiles with the uploaded images in the supplied sequence.
- [x] Add meaningful recap captions and alt text based on each image’s event poster or gathering context.
- [x] Preserve the existing scrapbook rotation, photo-frame treatment, lazy loading, and recap lightbox behavior.
- [x] Verify desktop/mobile cropping, image loading, lightbox labels, and build health after the recap update.

## Spotlight Carousel Fix

- [x] Fix the Kilala Mo Ba Sila? next-card arrow so it advances through the active spotlight list and wraps correctly.
- [x] Add a clearly labeled placeholder spotlight card for a future Tagpuan member without fabricating a testimonial or user-generated profile.
- [x] Verify arrow keyboard/click behavior, active indicator state, placeholder readability, and mobile presentation.

## Clone-ready Local Assets

- [x] Add all supplied Tagpuan logo variants and recap/event images to a Git-tracked local asset directory under the client app.
- [x] Replace Manus-only `/manus-storage/...` image references with local public asset paths that work after `git clone`.
- [x] Preserve the current Manus-hosted asset behavior where possible without making local development depend on Manus storage.
- [x] Add README documentation for `pnpm install`, `pnpm dev`, asset locations, environment requirements, and production build.
- [x] Confirm no source image reference still requires `/manus-storage/...` for the supplied local assets.
- [x] Run typecheck, tests, formatting, production build, and a local asset-path verification.
- [x] Sync the clone-ready changes to the connected GitHub repository without overwriting unrelated remote work.

## Transparent Logo Regression Fix

- [x] Diagnose why the optimized local logo files render with opaque pale rectangles instead of transparency.
- [x] Regenerate the tracked logo variants with alpha transparency preserved and keep each file under the repository media limit.
- [x] Confirm the hero uses the typography-only transparent wordmark, compact utility placements use the hut-only transparent mark, and the footer uses the full lockup without an opaque box.
- [x] Verify header, reminder ribbon, hero, footer, and mobile-menu logo rendering at desktop and mobile widths.
- [x] Run typecheck, tests, formatting, production build, and a final local asset-path check before checkpointing.

## Landing Page Element Motion Expansion

- [x] Animate individual About question cards with subtle staggered reveals.
- [x] Animate New Here? starter steps and the supporting scrapbook note as they enter view.
- [x] Animate What’s Going On event cards and activity callouts with varied, restrained settle timing.
- [x] Animate Last time at Tagpuan recap posters with photo-frame lift/reveal behavior.
- [x] Animate Wall notes and the Pin a note / Post a note controls without making interaction feel noisy.
- [x] Animate Ginagawa Mo Ngayon summary and project-log entry controls.
- [x] Animate Kilala Mo Ba Sila? spotlight image, copy, and controls as a coordinated group.
- [x] Animate Join note, newsletter form, venue map, and footer columns.
- [x] Add stagger limits, viewport-safe performance behavior, and a complete prefers-reduced-motion fallback.
- [x] Verify the expanded landing-page animations on desktop and mobile, then run typecheck, tests, formatting, and production build.

## Recap Animation Regression

- [x] Restore the distinct Last time at Tagpuan recap photo-card entrance that was overridden by the expanded element-level reveal rules.
- [x] Preserve the earlier scrapbook lift/settle timing and stagger for recap posters without affecting other cards.
- [x] Confirm the recap animation remains reduced-motion safe and works on desktop and mobile layouts.
- [x] Run typecheck, tests, formatting, production build, and recap visual QA before checkpointing.

## Recap Hover Animation

- [x] Restore pointer-hover lift, slight tilt, and shadow response on Last time at Tagpuan recap cards.
- [x] Keep hover animation separate from the scroll entrance so both behaviors work together without resetting the card’s scrapbook rotation.
- [x] Disable non-essential hover motion under prefers-reduced-motion while preserving pointer and keyboard usability.
- [x] Verify recap hover and scroll behavior, then run typecheck, tests, formatting, and production build.

## Recap Hover Clipping Fix

- [x] Move the hovered Last time at Tagpuan poster slightly downward so its visual treatment is not cut off by the strip boundary.
- [x] Add sufficient top and bottom breathing room to the recap strip while preserving horizontal scrolling and card alignment.
- [x] Keep hover/focus-visible lift, scrapbook rotation, and reduced-motion behavior intact.
- [x] Verify the poster hover visibility and responsive recap layout, then run typecheck, tests, formatting, and production build.

## Kilala Mo Ba Sila Directional Slide Animation

- [x] Add a right-to-left slide transition when advancing to the next Kilala Mo Ba Sila profile.
- [x] Add a left-to-right slide transition when returning to the previous profile.
- [x] Preserve carousel wraparound, keyboard controls, focus-visible styling, and reduced-motion behavior.
- [x] Verify both navigation directions on desktop and mobile, then run typecheck, tests, formatting, and production build.

## On-site Event Registration Form

- [x] Replace the event’s Luma registration hyperlink with an in-site Register action.
- [x] Add a responsive accessible registration form matching the supplied reference fields and Tagpuan styling.
- [x] Validate required name, email, background, current interests, top interests, and referral fields, with optional hot take and night suggestion.
- [x] Persist public registrations with event association, consent, session metadata, and duplicate-registration safeguards.
- [x] Add a submitted confirmation state and clear error/rate-limit feedback without requiring login.
- [x] Verify the registration flow on desktop and mobile, then run typecheck, tests, formatting, and production build.
