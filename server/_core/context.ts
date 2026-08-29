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

  return {
    user,
    clientIp:
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
    userAgent: req.headers.get("user-agent") ?? "unknown",
  };
}
