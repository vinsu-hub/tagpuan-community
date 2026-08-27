# Registration and admin mobile QA

The dedicated `/register?event=sunday-sessions` route remains readable at a narrow mobile viewport. The sticky desktop intro becomes a normal stacked card, inputs and textareas remain full width, interest options collapse to one column, and the primary `Register for this session` CTA stays prominent at the bottom of the form.

The `/admin` route adapts through the dashboard mobile header. The admin heading, preview CTA, section tabs, and overview statistics stack without horizontal clipping. The applicant table intentionally retains horizontal scrolling for its multi-column review layout.

Desktop and mobile captures are visually stable. Final validation should include typecheck, tests, formatting, and production build after the last CSS/navigation changes.
