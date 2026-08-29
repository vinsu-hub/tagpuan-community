import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "../../server/_core/context.js";
import { appRouter } from "../../server/routers.js";

function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ req }) => createContext({ req }),
  });
}

export const GET = handler;
export const POST = handler;
