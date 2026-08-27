# Kilala Mo Ba Sila directional slide QA

The spotlight carousel now tracks navigation direction. The next arrow assigns a `next` state and mounts the incoming profile with a right-to-left visual slide; the previous arrow assigns a `previous` state and mounts it with a left-to-right visual slide. Dot navigation remains available and uses the corresponding direction when moving between indexed profiles.

The animation is limited to a 280ms transform/opacity transition, keeps the scrapbook card’s final rotation, and is disabled under `prefers-reduced-motion`. Desktop and mobile homepage captures confirm the spotlight card remains aligned and readable within the existing responsive layout.
