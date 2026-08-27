# Home navigation completeness QA

The bug was caused by the home header rendering only About, What's Going On, The Wall, and Join, while the dedicated `/projects` and `/people` routes existed elsewhere in the app.

The home navigation now includes all six public destinations: About, What's Going On, The Wall, Ginagawa Ko Ngayon, Kilala Mo Ba Sila?, and Join. Desktop screenshot QA confirms all links are visible in the primary header. Mobile screenshot QA confirms the navigation remains available through the existing accessible menu toggle and preserves the Join the Collective CTA.
