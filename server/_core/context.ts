import type { User } from "../../drizzle/schema.js";
import { bearerToken, resolveUser } from "./supabaseAuth.js";

export type TrpcContext = {
  user: User | null;
  clientIp: string;
  userAgent: string;
};

/** Build a tRPC context from a Fetch `Request` (Vercel serverless / `vercel dev`). */
export async function createContext(opts: {
  req: Request;
}): Promise<TrpcContext> {
  const { req } = opts;
  const token = bearerToken(req.headers.get("authorization"));
  const user = await resolveUser(token).catch(() => null);

  // Vercel sets `x-real-ip` from the edge and it can't be spoofed by the client;
  // `x-forwarded-for` is client-appendable, so only trust its first hop as a
  // fallback.
  const forwardedFor = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();

  return {
    user,
    clientIp: req.headers.get("x-real-ip") ?? forwardedFor ?? "",
    userAgent: req.headers.get("user-agent") ?? "unknown",
  };
}
