# Transparent logo regression QA

The regression was caused by the local WebP optimizer converting RGBA logo PNGs to RGB, which flattened transparent pixels into pale opaque rectangles. The regenerated `tagpuan-lockup.webp`, `tagpuan-type.webp`, and `tagpuan-hut.webp` assets preserve RGBA alpha channels and remain below the repository media limit.

Desktop homepage and About-page captures confirm the hero typography-only mark now renders cleanly against the brown hero without a rectangular box, while compact hut-only marks remain crisp in the header and reminder ribbon. The existing dark-surface treatment remains legible. The corresponding mobile layout should retain the same alpha-preserving assets and sizing rules.

Mobile homepage and About-page captures also confirm the transparent hut-only header mark, typography-only hero logo, and dark hero contrast render without pale rectangular backgrounds. The logo remains proportionate beside the mobile menu control and the hero wordmark remains readable at the narrow viewport.
