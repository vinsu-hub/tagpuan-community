import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations run locally against the Supabase *direct* connection (port 5432).
// Fall back to DATABASE_URL so a single var also works.
const connectionString =
  process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL_DIRECT (or DATABASE_URL) is required to run drizzle commands"
  );
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
