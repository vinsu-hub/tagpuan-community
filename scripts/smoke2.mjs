// Focused pass: image upload to Supabase Storage, admin moderation, recap CRUD.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BASE = "https://tagpuan-final.vercel.app";
const OUT = process.env.SMOKE_OUT || "smoke-out";
const A = { email: "admin@tagpuan.community", password: "admin123" };
const R = [];
const rec = (a, s, n = "") => { R.push({ a, s, n }); console.log(`${s}  ${a}${n ? " — " + n : ""}`); };

// tiny 2x2 png
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEYBxVSF8FAGdcA/2mR4WkAAAAAElFTkSuQmCC", "base64");

async function login(page) {
  await page.goto(BASE + "/login", { waitUntil: "load" });
  await page.fill("input[type=email]", A.email);
  await page.fill("input[type=password]", A.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(u => u.toString().includes("/admin"), { timeout: 20000 });
  await page.waitForTimeout(2500);
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => m.type() === "error" && errs.push(m.text().slice(0, 200)));
page.on("pageerror", e => errs.push(String(e).slice(0, 200)));

try {
  await login(page);

  // dashboard data present?
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const stats = await page.locator(".stats-grid").innerText();
  rec("Admin dashboard shows live counts", /[1-9]/.test(stats) ? "PASS" : "PARTIAL", stats.replace(/\s+/g, " ").slice(0, 120));

  // ---- Create Event WITH image upload ----
  await page.goto(BASE + "/admin/events/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const slug = "smoke-ui-event-" + Date.now();
  await page.getByText("Event name", { exact: false }).locator("xpath=following::input[1]").fill("Smoke UI Event");
  await page.getByText("Slug", { exact: false }).locator("xpath=following::input[1]").fill(slug);
  await page.getByText("Venue", { exact: false }).locator("xpath=following::input[1]").fill("The Upload Room");
  await page.locator("textarea").first().fill("Smoke UI event verifying admin.createEvent plus a real Supabase Storage image upload from the browser.");
  // upload cover image
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload image/i }).first().click();
  const fc = await chooser;
  await fc.setFiles({ name: "smoke-cover.png", mimeType: "image/png", buffer: PNG });
  // wait for the preview img (public URL) to appear
  const uploaded = await page.waitForSelector(".image-upload img[src*='supabase.co']", { timeout: 20000 }).then(() => true).catch(() => false);
  rec("ImageUpload → Supabase Storage (Create Event)", uploaded ? "PASS" : "FAIL", uploaded ? "" : "no supabase.co preview img after upload");
  await page.getByText("Image description", { exact: false }).locator("xpath=following::input[1]").fill("Smoke cover").catch(() => {});
  const [cr] = await Promise.all([
    page.waitForResponse(r => r.url().includes("admin.createEvent"), { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: /create event/i }).first().click(),
  ]);
  rec("Create Event submit (with image)", cr && cr.status() === 200 ? "PASS" : "FAIL", cr ? `HTTP ${cr.status()} ${(await cr.text()).slice(0, 80)}` : "no call");

  // public /events shows the uploaded image
  await page.goto(BASE + "/events", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const pubImg = await page.evaluate(() => {
    const hit = [...document.querySelectorAll("*")].some(el => {
      const bg = getComputedStyle(el).backgroundImage || "";
      return bg.includes("supabase.co");
    });
    return hit;
  });
  rec("Public /events renders uploaded cover", pubImg ? "PASS" : "PARTIAL", pubImg ? "" : "no supabase.co bg on /events (may need publish/time)");

  // ---- Recap create + update via drawer ----
  await page.goto(BASE + "/admin/recaps", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /add recap/i }).click();
  await page.waitForTimeout(400);
  const rc1 = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload image/i }).first().click();
  (await rc1).setFiles({ name: "recap.png", mimeType: "image/png", buffer: PNG });
  await page.waitForSelector(".image-upload img[src*='supabase.co']", { timeout: 20000 }).catch(() => {});
  await page.getByText("Image description", { exact: false }).locator("xpath=following::input[1]").fill("Smoke recap photo");
  const [rcResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes("admin.recaps.create"), { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: /save recap/i }).click(),
  ]);
  rec("Recap: add with upload (recaps.create)", rcResp && rcResp.status() === 200 ? "PASS" : "FAIL", rcResp ? `HTTP ${rcResp.status()}` : "no call");
  await page.waitForTimeout(1500);
  // open drawer, hit Unpublish/Publish -> recaps.update
  const viewBtn = page.getByRole("button", { name: /view photo/i }).first();
  if (await viewBtn.count()) {
    await viewBtn.click();
    await page.waitForTimeout(500);
    const [upd] = await Promise.all([
      page.waitForResponse(r => r.url().includes("admin.recaps.update"), { timeout: 15000 }).catch(() => null),
      page.getByRole("button", { name: /unpublish|publish photo/i }).first().click(),
    ]);
    rec("Recap: drawer publish/hide → recaps.update", upd && upd.status() === 200 ? "PASS" : "FAIL", upd ? `HTTP ${upd.status()}` : "no call (still a no-op?)");
  } else rec("Recap: drawer update", "PARTIAL", "no recap card to open");

  // ---- Wall moderation ----
  // seed a wall note via API first (anon)
  await page.evaluate(async () => {
    await fetch("/api/trpc/wall.create?batch=1", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ "0": { json: { body: "moderation seed " + Date.now(), tone: "rose" } } }) });
  });
  await page.goto(BASE + "/admin/wall", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const approveBtn = page.getByRole("button", { name: /^approve$/i }).first();
  if (await approveBtn.count()) {
    const [ws] = await Promise.all([
      page.waitForResponse(r => r.url().includes("admin.wall.updateStatus"), { timeout: 15000 }).catch(() => null),
      approveBtn.click(),
    ]);
    rec("Wall moderation: approve (wall.updateStatus)", ws && ws.status() === 200 ? "PASS" : "FAIL", ws ? `HTTP ${ws.status()}` : "no call");
  } else rec("Wall moderation", "PARTIAL", "no pending note / approve button");

  // ---- Applicants: the smoke registration from run 1 should be here ----
  await page.goto(BASE + "/admin/applicants", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const hasRows = (await page.locator(".applicant-row").count()) > 0;
  rec("Applicants: registrations listed", hasRows ? "PASS" : "PARTIAL", hasRows ? `${await page.locator(".applicant-row").count()} row(s)` : "none");

  // ---- Newsletter: createCampaign ----
  await page.goto(BASE + "/admin/newsletter", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const [nc] = await Promise.all([
    page.waitForResponse(r => r.url().includes("newsletter.createCampaign"), { timeout: 15000 }).catch(() => null),
    page.getByRole("button", { name: /new campaign/i }).last().click(),
  ]);
  rec("Newsletter: create draft campaign", nc && nc.status() === 200 ? "PASS" : "PARTIAL", nc ? `HTTP ${nc.status()}` : "no call");

  rec("Admin console errors (whole session)", errs.length === 0 ? "PASS" : "PARTIAL", errs.slice(0, 2).join(" || "));
} catch (e) {
  rec("smoke2 fatal", "FAIL", String(e).slice(0, 250));
}

await b.close();
const pass = R.filter(r => r.s === "PASS").length, fail = R.filter(r => r.s === "FAIL").length, part = R.filter(r => r.s === "PARTIAL").length;
let md = `# Smoke test — focused pass (admin CRUD + storage)\n\n**${pass} PASS · ${part} PARTIAL · ${fail} FAIL**\n\n| Area | Status | Notes |\n|---|---|---|\n`;
for (const r of R) md += `| ${r.a} | ${r.s} | ${(r.n || "").replace(/\|/g, "\\|").slice(0, 220)} |\n`;
writeFileSync(`${OUT}/report2.md`, md);
console.log(`\n${pass} PASS · ${part} PARTIAL · ${fail} FAIL`);
