## Local Development with Tracked Tagpuan Assets

The supplied Tagpuan logo variants and recap images are tracked in `client/public/assets/tagpuan/`, so a fresh clone does not depend on hosted storage URLs for the supplied visual assets.

```bash
git clone <repository-url>
cd tagpuan-community
pnpm install
pnpm dev
```

Open the local development URL printed by Vite. The asset files are served from `/assets/tagpuan/`. The full lockup is `tagpuan-lockup.webp`, the typography-only mark is `tagpuan-type.webp`, the hut-only mark is `tagpuan-hut.webp`, the reference backgrounds are `concept-reference.webp` and `logo-reference.webp`, and the supplied recap posters are `recap-01.webp` through `recap-04.webp`.

The full-stack features still use the project environment variables for OAuth, database access, storage, and built-in services. For a local clone, copy the required variables into a local `.env` file without committing secrets. The standalone frontend assets themselves do not require a connector or hosted storage account.
