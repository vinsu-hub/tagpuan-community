# Scroll motion QA

The final desktop and 390px mobile captures show the homepage and About page retaining a stable reading order while sections reveal with a restrained fade-up/settle treatment. Event cards, Wall notes, project rows, spotlight content, starter cards, and Join content receive a short stagger once their parent enters view. The motion remains tactile rather than theatrical, with no parallax or scroll-jacking. The CSS includes a reduced-motion override that removes transforms, delays, and keyframe movement while keeping content fully visible.
