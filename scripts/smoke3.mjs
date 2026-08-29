// Minimal robust pass: browser image upload + moderation + recap update.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const BASE = "https://tagpuan-final.vercel.app";
const OUT = process.env.SMOKE_OUT || "smoke-out";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEYBxVSF8FAGdcA/2mR4WkAAAAAElFTkSuQmCC", "base64");
const R = [];
const rec = (a, s, n = "") => { R.push({ a, s, n }); console.log(`${s}  ${a}${n ? " — " + n : ""}`); };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => m.type() === "error" && errs.push(m.text().slice(0, 160)));
page.on("pageerror", e => errs.push(String(e).slice(0, 160)));

try {
  // login once
  await page.goto(BASE + "/login", { waitUntil: "load" });
  await page.fill("input[type=email]", "admin@tagpuan.community");
  await page.fill("input[type=password]", "admin123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForSelector(".admin-sidebar", { timeout: 25000 });
  await page.waitForTimeout(2000);
  rec("login → admin shell", "PASS", page.url());

  // ---- image upload in Create Event ----
  await page.goto(BASE + "/admin/events/new", { waitUntil: "load" });
  await page.waitForSelector(".create-grid, .create-page", { timeout: 15000 });
  await page.waitForTimeout(1000);
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload image/i }).first().click();
  (await chooser).setFiles({ name: "smoke-cover.png", mimeType: "image/png", buffer: PNG });
  const up = await page.waitForSelector(".image-upload img[src*='supabase.co']", { timeout: 25000 }).then(s => s.getAttribute("src")).catch(() => null);
  rec("ImageUpload → Supabase Storage", up ? "PASS" : "FAIL", up ? up.slice(0, 90) : "no supabase.co img");

  // fill + submit to persist the URL
  await page.locator(".event-info-card input").nth(0).fill("Smoke UI Event " + Date.now());
  await page.locator(".event-info-card input").nth(1).fill("smoke-ui-" + Date.now());
  await page.locator(".event-info-card .input-with-icon input").filter({ hasNot: page.locator("[type=number]") }).first().fill("The Upload Room");
  await page.locator("textarea").first().fill("Verifying admin.createEvent persists the uploaded Supabase Storage cover URL end to end.");
  const [cr] = await Promise.all([
    page.waitForResponse(r => r.url().includes("admin.createEvent"), { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: /create event/i }).first().click(),
  ]);
  rec("createEvent persists (with cover)", cr && cr.status() === 200 && (await cr.text()).includes("success") ? "PASS" : "FAIL", cr ? `HTTP ${cr.status()}` : "no call");

  // ---- recap: add via upload, then drawer publish/hide -> recaps.update ----
  await page.goto(BASE + "/admin/recaps", { waitUntil: "load" });
  await page.waitForSelector(".section-page", { timeout: 15000 });
  await page.getByRole("button", { name: /add recap/i }).click();
  await page.waitForTimeout(500);
  const rc = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /upload image/i }).first().click();
  (await rc).setFiles({ name: "recap.png", mimeType: "image/png", buffer: PNG });
  await page.waitForSelector(".image-upload img[src*='supabase.co']", { timeout: 25000 }).catch(() => {});
  await page.locator(".form-card input").filter({ hasText: "" }).nth(0).fill("Smoke recap alt").catch(() => {});
  // the alt input is the first text input in the add-recap form
  const altInput = page.locator("section.form-card label:has-text('Image description') input");
  if (await altInput.count()) await altInput.fill("Smoke recap alt");
  const [rcResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes("admin.recaps.create"), { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: /save recap/i }).click(),
  ]);
  rec("recap add + upload (recaps.create)", rcResp && rcResp.status() === 200 ? "PASS" : "FAIL", rcResp ? `HTTP ${rcResp.status()} ${(await rcResp.text()).slice(0,60)}` : "no call");
  await page.waitForTimeout(2000);
  const view = page.getByRole("button", { name: /view photo/i }).first();
  if (await view.count()) {
    await view.click();
    await page.waitForTimeout(600);
    const [upd] = await Promise.all([
      page.waitForResponse(r => r.url().includes("admin.recaps.update"), { timeout: 15000 }).catch(() => null),
      page.getByRole("button", { name: /^(unpublish|publish photo)$/i }).first().click(),
    ]);
    rec("recap drawer → recaps.update (was no-op)", upd && upd.status() === 200 ? "PASS" : "FAIL", upd ? `HTTP ${upd.status()}` : "no call");
  } else rec("recap drawer update", "PARTIAL", "no recap card");

  // ---- wall moderation ----
  await page.evaluate(() => fetch("/api/trpc/wall.create?batch=1", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ "0": { json: { body: "mod seed " + Date.now(), tone: "rose" } } }) }));
  await page.waitForTimeout(500);
  await page.goto(BASE + "/admin/wall", { waitUntil: "load" });
  await page.waitForSelector(".section-page", { timeout: 15000 });
  await page.waitForTimeout(1500);
  const approve = page.getByRole("button", { name: /^approve$/i }).first();
  if (await approve.count()) {
    const [ws] = await Promise.all([
      page.waitForResponse(r => r.url().includes("admin.wall.updateStatus"), { timeout: 15000 }).catch(() => null),
      approve.click(),
    ]);
    rec("wall moderation approve (wall.updateStatus)", ws && ws.status() === 200 ? "PASS" : "FAIL", ws ? `HTTP ${ws.status()}` : "no call");
  } else rec("wall moderation", "PARTIAL", "no pending note visible");

  rec("admin session console errors", errs.length === 0 ? "PASS" : "PARTIAL", [...new Set(errs)].slice(0, 3).join(" || "));
} catch (e) {
  rec("smoke3 fatal", "FAIL", String(e).slice(0, 250));
  await page.screenshot({ path: `${OUT}/smoke3-fail.png` }).catch(() => {});
}
await b.close();
const pass = R.filter(r => r.s === "PASS").length, fail = R.filter(r => r.s === "FAIL").length, part = R.filter(r => r.s === "PARTIAL").length;
let md = `# Smoke — pass 3 (upload + moderation)\n\n**${pass} PASS · ${part} PARTIAL · ${fail} FAIL**\n\n| Area | Status | Notes |\n|---|---|---|\n`;
for (const r of R) md += `| ${r.a} | ${r.s} | ${(r.n || "").replace(/\|/g, "\\|").slice(0, 200)} |\n`;
writeFileSync(`${OUT}/report3.md`, md);
console.log(`\n${pass} PASS · ${part} PARTIAL · ${fail} FAIL`);
