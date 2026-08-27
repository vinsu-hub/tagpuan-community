# Recap hover QA

The missing pointer interaction was caused by the scroll animation retaining its `transform` through `animation-fill-mode: both`, which masked the earlier normal hover transform rule. The fix uses independent `scale` and `translate` properties plus shadow and filter transitions, so the card can lift without fighting the scroll animation’s retained rotation.

Desktop and mobile homepage captures confirm the recap posters remain proportionate and integrated in the Last time at Tagpuan strip. The hover/focus-visible rule is limited to recap cards, and the reduced-motion media query resets scale, translation, filter, and transitions while preserving keyboard usability.
