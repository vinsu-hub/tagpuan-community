import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function caller() {
  const ctx: TrpcContext = {
    user: null,
    clientIp: "",
    userAgent: "test",
  };
  return appRouter.createCaller(ctx);
}

describe("Tagpuan public participation safeguards", () => {
  it("rejects blocked Wall language before attempting a write", async () => {
    await expect(
      caller().wall.create({ body: "This is spam", tone: "mustard" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("enforces the Wall character limit", async () => {
    await expect(
      caller().wall.create({ body: "x".repeat(141), tone: "sage" })
    ).rejects.toThrow();
  });

  it("enforces the Passion Project character limit and required body", async () => {
    await expect(
      caller().projects.create({ body: "x".repeat(121), tag: "Tech" })
    ).rejects.toThrow();
    await expect(
      caller().projects.create({ body: "", tag: "Other" })
    ).rejects.toThrow();
  });

  it("validates newsletter addresses", async () => {
    await expect(
      caller().newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("validates the on-site event registration form", async () => {
    await expect(
      caller().registrations.create({
        eventSlug: "saturday-night-session",
        name: "A",
        email: "not-an-email",
        background: "short",
        currentInterests: "short",
        topInterests: [],
        heardFrom: "",
        photoConsent: false,
      })
    ).rejects.toThrow();
  });

  it("keeps public content queries available without login", async () => {
    const events = await caller().content.events();
    const notes = await caller().wall.list({
      page: 1,
      pageSize: 12,
      archive: false,
    });
    expect(Array.isArray(events)).toBe(true);
    expect(notes).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
    });
  });
});
