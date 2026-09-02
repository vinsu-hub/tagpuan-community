import { createRemoteJWKSet, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema.js";
import * as db from "../db.js";
import { ENV, isAdminEmail } from "./env.js";

type VerifiedToken = { sub: string; email: string | null };

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!_jwks) {
    if (!ENV.supabaseUrl) {
      throw new Error("SUPABASE_URL is not configured");
    }
    _jwks = createRemoteJWKSet(
      new URL(`${ENV.supabaseUrl}/auth/v1/.well-known/jwks.json`)
    );
  }
  return _jwks;
}

/**
 * Verify a Supabase Auth access token. Prefers asymmetric verification via the
 * project JWKS; falls back to the legacy shared HS256 secret when configured.
 */
export async function verifyToken(token: string): Promise<VerifiedToken> {
  const claims = await verifyClaims(token);
  const sub = typeof claims.sub === "string" ? claims.sub : "";
  if (!sub) throw new Error("Token missing subject");
  const email =
    typeof claims.email === "string" && claims.email.length > 0
      ? claims.email
      : null;
  return { sub, email };
}

function verifyOptions() {
  // Pin the token to this Supabase project's auth server and the "authenticated"
  // audience so a token minted for anything else on the same JWKS is rejected.
  return ENV.supabaseUrl
    ? { issuer: `${ENV.supabaseUrl}/auth/v1`, audience: "authenticated" }
    : { audience: "authenticated" };
}

async function verifyClaims(token: string): Promise<Record<string, unknown>> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), verifyOptions());
    return payload as Record<string, unknown>;
  } catch (error) {
    if (ENV.supabaseJwtSecret) {
      const secret = new TextEncoder().encode(ENV.supabaseJwtSecret);
      const { payload } = await jwtVerify(token, secret, verifyOptions());
      return payload as Record<string, unknown>;
    }
    throw error;
  }
}

/** Resolve a request's bearer token to a local `users` row (creating it on first sight). */
export async function resolveUser(
  token: string | undefined | null
): Promise<User | null> {
  if (!token) return null;
  let verified: VerifiedToken;
  try {
    verified = await verifyToken(token);
  } catch (error) {
    console.warn("[Auth] Token verification failed:", String(error));
    return null;
  }

  const now = new Date();
  const role = isAdminEmail(verified.email) ? "admin" : "user";

  let user = await db.getUserByOpenId(verified.sub);
  if (!user) {
    await db.upsertUser({
      openId: verified.sub,
      email: verified.email,
      loginMethod: "email",
      role,
      lastSignedIn: now,
    });
    user = await db.getUserByOpenId(verified.sub);
  } else {
    await db.upsertUser({
      openId: verified.sub,
      email: verified.email ?? user.email,
      role,
      lastSignedIn: now,
    });
    user = { ...user, role, email: verified.email ?? user.email };
  }

  return user ?? null;
}

export function bearerToken(
  authorizationHeader: string | undefined | null
): string | null {
  if (!authorizationHeader) return null;
  return authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice(7)
    : null;
}
