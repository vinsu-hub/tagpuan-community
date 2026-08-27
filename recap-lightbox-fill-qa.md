# Recap lightbox fill-image QA

The lightbox now uses a dedicated `lightbox-image` frame instead of inheriting thumbnail-only `recap-photo` sizing, overflow, and decorative overlay behavior. The opened image fills the frame with `background-size: cover`, centered positioning, and a controlled responsive height. The scrapbook paper panel, close control, caption/navigation row, and accessible dialog/image labels remain intact.

Mobile constraints reduce the panel padding and image height while preserving the filled frame and keeping Previous, caption, and Next controls inside the viewport. TypeScript, Vitest, formatting, and production build pass after the correction.
