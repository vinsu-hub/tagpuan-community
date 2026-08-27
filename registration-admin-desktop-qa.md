# Registration and admin desktop QA

The dedicated `/register?event=sunday-sessions` route renders as a separate full-page registration experience with a prominent event title, warm paper layout, sticky introductory card, reference-aligned fields, consent control, and full-width primary registration CTA.

The `/admin` route renders through the existing authenticated dashboard shell. In the preview session it shows the protected workspace with Overview, Events, Applicants, and Content & Media tabs, plus event preview access. The unauthenticated/authenticated boundary remains delegated to the existing auth layout; the admin role check shows a separate access-denied state for signed-in non-admin accounts.

The desktop capture is visually stable. A mobile capture and final test/build pass remain required before checkpointing.
