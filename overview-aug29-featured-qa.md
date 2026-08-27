# August 29 featured Overview QA

The Overview now prefers the real upcoming event with the existing Saturday Night Session slug/date when present. When the CMS event table is empty, it uses the same August 29 event already defined in the public Tagpuan experience as a visual/content fallback, with the local recap-01.webp asset, The Social Room title, Session 07 label, The Den venue, 7:00 PM–11:00 PM time, 11 people going, 30 capacity, and the existing event description.

Desktop QA at 1536px confirms the reference-style split Next Gathering card with taped photo, metadata icons, orange Manage event CTA, and public-page action. Mobile QA at 390px confirms the image, metadata, description, and actions stack cleanly without overflow. The remaining metric and attention panels continue to use real dashboard queries or honest empty states. TypeScript passes; final Vitest, formatting, and production build are required before checkpoint.
