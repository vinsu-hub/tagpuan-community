export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? "",
  // Service-role / secret key — server only, never sent to the client. Used to
  // mint signed Storage upload URLs so browsers don't need bucket write access.
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === "production",
};

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ENV.adminEmails.includes(email.toLowerCase());
}
