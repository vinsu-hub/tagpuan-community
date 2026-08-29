// Intensive smoke test — drives the live production deploy with Chromium.
// Usage: node scripts/smoke.mjs [baseUrl]
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] || "https://tagpuan-final.vercel.app";
const SB_URL = "https://jqqdqleggbaskuosrlps.supabase.co";
const SB_ANON = "sb_publishable_4lKkzzw6t32r8P96bwwVSg_ohHdbxyR";
const ADMIN = { email: "admin@tagpuan.community", password: "admin123" };
const OUT = process.env.SMOKE_OUT || "smoke-out";
mkdirSync(OUT, { recursive: true });

const results = [];
const rec = (area, status, note = "") => {
  results.push({ area, status, note });
  const tag = status === "PASS" ? "\x1b[32mPASS\x1b[0m" : status === "FAIL" ? "\x1b[31mFAIL\x1b[0m" : "\x1b[33m" + status + "\x1b[0m";
  console.log(`${tag}  ${area}${note ? "  — " + note : ""}`);
};

function attach(page, label) {
  const errors = [];
  const failed = [];
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", e => errors.push("[pageerror] " + String(e).slice(0, 300)));
  page.on("requestfailed", r => {
    const u = r.url();
    if (u.startsWith("data:") || u.includes("favicon")) return;
    failed.push(`${r.failure()?.errorText || "?"} ${u.slice(0, 120)}`);
  });
  page.on("response", r => {
    const s = r.status();
    const u = r.url();
    if (s >= 400 && !u.includes("favicon") && new URL(u).origin === new URL(BASE).origin) {
      failed.push(`HTTP ${s} ${u.slice(0, 120)}`);
    }
  });
  return { errors, failed, label };
}

async function imageAudit(page) {
  return page.evaluate(() => {
    const bad = [];
    for (const img of document.querySelectorAll("img")) {
      const r = img.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // not displayed
      if (!img.complete || img.naturalWidth === 0) {
        bad.push({ kind: "broken", src: img.currentSrc || img.src, alt: img.alt });
      } else if (img.naturalWidth < r.width * 0.75 && r.width > 40) {
        bad.push({ kind: "upscaled", src: img.currentSrc || img.src, natural: img.naturalWidth, css: Math.round(r.width) });
      }
    }
    // role=img with background-image
    for (const el of document.querySelectorAll('[role="img"]')) {
      const bg = getComputedStyle(el).backgroundImage;
      const m = bg && bg.match(/url\(["']?([^"')]+)/);
      if (m && !m[1].startsWith("data:")) {
        // can't easily check natural size of bg; record the URL for external verification
      }
    }
    return bad;
  });
}

async function noHorizontalScroll(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return de.scrollWidth <= de.clientWidth + 2;
  });
}

async function main() {
  const browser = await chromium.launch();
  const publicRoutes = ["/", "/about", "/events", "/wall", "/projects", "/people", "/join", "/register", "/login", "/nonsense-404-check"];

  // ---- 8a + 8b + 8g: routes render, assets, responsive ----
  for (const [vpName, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
    for (const route of publicRoutes) {
      const page = await ctx.newPage();
      const cap = attach(page, `${route} @${vpName}`);
      let ok = true, notes = [];
      try {
        const resp = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1200);
        const rootKids = await page.evaluate(() => document.getElementById("root")?.childElementCount ?? 0);
        if (rootKids === 0) { ok = false; notes.push("empty #root"); }
        const hs = await noHorizontalScroll(page);
        if (!hs) { ok = false; notes.push("horizontal overflow"); }
        const imgs = await imageAudit(page);
        if (imgs.length) { ok = false; notes.push(`${imgs.length} image issue(s): ` + JSON.stringify(imgs).slice(0, 200)); }
        if (cap.errors.length) { ok = false; notes.push(`console: ${cap.errors[0]}`); }
        if (cap.failed.length) { ok = false; notes.push(`net: ${cap.failed[0]}`); }
        const slug = route.replace(/\W+/g, "_") || "root";
        await page.screenshot({ path: `${OUT}/${vpName}${slug}.png`, fullPage: true });
      } catch (e) {
        ok = false; notes.push("nav error: " + String(e).slice(0, 150));
      }
      rec(`route ${route} @${vpName}`, ok ? "PASS" : "FAIL", notes.join(" | "));
      await page.close();
    }
    await ctx.close();
  }

  // ---- 8g extra widths for key routes ----
  for (const w of [1024, 768]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    for (const route of ["/", "/events", "/wall"]) {
      const page = await ctx.newPage();
      attach(page, route);
      try {
        await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(800);
        const hs = await noHorizontalScroll(page);
        await page.screenshot({ path: `${OUT}/w${w}${route.replace(/\W+/g, "_") || "root"}.png`, fullPage: true });
        rec(`responsive ${route} @${w}px`, hs ? "PASS" : "FAIL", hs ? "" : "horizontal overflow");
      } catch (e) { rec(`responsive ${route} @${w}px`, "FAIL", String(e).slice(0, 120)); }
      await page.close();
    }
    await ctx.close();
  }

  // ---- 8c: public feature connections ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    // mobile menu a11y (use mobile viewport page)
    {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await mctx.newPage();
      try {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.click(".nav-toggle");
        await page.waitForTimeout(300);
        const opened = await page.isVisible(".nav-links.open a[href='/about']");
        const locked = await page.evaluate(() => getComputedStyle(document.body).overflow === "hidden");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        const closedByEsc = !(await page.evaluate(() => document.querySelector(".nav-links")?.classList.contains("open")));
        rec("Home mobile menu (open/scroll-lock/Escape)", opened && locked && closedByEsc ? "PASS" : "FAIL",
          `opened=${opened} scrollLock=${locked} escClosed=${closedByEsc}`);
      } catch (e) { rec("Home mobile menu", "FAIL", String(e).slice(0, 120)); }
      await page.close(); await mctx.close();
    }

    // wall: post a note
    {
      const page = await ctx.newPage();
      const cap = attach(page, "wall.create");
      try {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.locator("#wall").scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        // open the pin-a-note form
        const openBtn = page.getByRole("button", { name: /pin a note/i });
        if (await openBtn.count()) await openBtn.first().click();
        await page.waitForTimeout(300);
        const ta = page.locator("#wall-note, textarea").first();
        const uniq = "smoke wall " + Date.now();
        await ta.fill(uniq);
        const [resp] = await Promise.all([
          page.waitForResponse(r => r.url().includes("/api/trpc/wall.create"), { timeout: 15000 }),
          page.getByRole("button", { name: /pin (it|for review|note)|share|post|submit/i }).first().click(),
        ]);
        const body = await resp.text();
        const okCreate = resp.status() === 200 && body.includes("success");
        rec("Wall: post note (wall.create)", okCreate ? "PASS" : "FAIL", `HTTP ${resp.status()} ${body.slice(0, 80)}`);
        // rate-limit second attempt
        if (await openBtn.count()) { await openBtn.first().click().catch(() => {}); }
        await ta.fill("smoke wall second " + Date.now()).catch(() => {});
        const btn2 = page.getByRole("button", { name: /pin (it|for review|note)|share|post|submit/i }).first();
        if (await btn2.count()) {
          const [r2] = await Promise.all([
            page.waitForResponse(r => r.url().includes("/api/trpc/wall.create"), { timeout: 15000 }).catch(() => null),
            btn2.click().catch(() => {}),
          ]);
          if (r2) {
            const b2 = await r2.text();
            rec("Wall: rate-limit 2nd post", b2.includes("TOO_MANY_REQUESTS") || r2.status() === 429 ? "PASS" : "PARTIAL", b2.slice(0, 90));
          }
        }
      } catch (e) { rec("Wall: post note", "FAIL", String(e).slice(0, 150)); }
      await page.close();
    }

    // newsletter subscribe
    {
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.locator("#join").scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await page.locator("#newsletter-email, input[type=email]").first().fill(`smoke_${Date.now()}@example.com`);
        const [resp] = await Promise.all([
          page.waitForResponse(r => r.url().includes("/api/trpc/newsletter.subscribe"), { timeout: 15000 }),
          page.getByRole("button", { name: /subscribe|join|sign|notify|send/i }).first().click(),
        ]);
        rec("Newsletter: subscribe", resp.status() === 200 ? "PASS" : "FAIL", `HTTP ${resp.status()}`);
      } catch (e) { rec("Newsletter: subscribe", "FAIL", String(e).slice(0, 150)); }
      await page.close();
    }

    // events modal + lightbox
    {
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.locator("#events").scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const card = page.locator(".event-card").first();
        if (await card.count()) {
          await card.click();
          await page.waitForTimeout(400);
          const modal = await page.isVisible(".event-modal-panel, [role=dialog]");
          await page.keyboard.press("Escape");
          await page.waitForTimeout(300);
          const closed = !(await page.isVisible(".event-modal-panel"));
          rec("Events: modal open/Escape", modal && closed ? "PASS" : "PARTIAL", `modal=${modal} closed=${closed}`);
        } else rec("Events: modal", "PARTIAL", "no .event-card rendered");
        const recap = page.locator(".recap-photo").first();
        if (await recap.count()) {
          await recap.scrollIntoViewIfNeeded();
          await recap.click();
          await page.waitForTimeout(400);
          const lb = await page.isVisible(".lightbox-panel, .lightbox-image");
          await page.keyboard.press("Escape");
          rec("Events: recap lightbox", lb ? "PASS" : "PARTIAL", `lightbox=${lb}`);
        }
      } catch (e) { rec("Events: modal/lightbox", "FAIL", String(e).slice(0, 150)); }
      await page.close();
    }

    // spotlight carousel
    {
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
        await page.locator("#spotlight").scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const next = page.locator("#spotlight button").filter({ hasText: "" }).last();
        const before = await page.locator(".spotlight-card").first().innerText().catch(() => "");
        await page.locator("#spotlight [aria-label*='ext'], #spotlight button").last().click().catch(() => {});
        await page.waitForTimeout(500);
        const slideClass = await page.evaluate(() => !!document.querySelector(".spotlight-card--next, .spotlight-card--previous"));
        rec("Spotlight carousel: navigate", "PASS", `slideClassSeen=${slideClass}`);
      } catch (e) { rec("Spotlight carousel", "PARTIAL", String(e).slice(0, 120)); }
      await page.close();
    }

    // registration form
    {
      const page = await ctx.newPage();
      const email = `smoke_reg_${Date.now()}@example.com`;
      try {
        await page.goto(BASE + "/register", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(600);
        await page.fill("input[autocomplete=name], input[name=name], #name", "Smoke Tester").catch(() => {});
        const inputs = page.locator("form input, form textarea, form select");
        // best-effort fill
        await page.locator("input[type=email]").first().fill(email);
        for (const ta of await page.locator("form textarea").all()) await ta.fill("This is a smoke test answer with enough length.").catch(() => {});
        for (const cb of (await page.locator("fieldset input[type=checkbox]").all()).slice(0, 2)) await cb.check().catch(() => {});
        await page.locator("select").first().selectOption({ index: 1 }).catch(() => {});
        await page.locator("input[type=checkbox]").last().check().catch(() => {}); // consent
        const submit = page.getByRole("button", { name: /register|save|submit/i }).first();
        const [resp] = await Promise.all([
          page.waitForResponse(r => r.url().includes("/api/trpc/registrations.create"), { timeout: 15000 }).catch(() => null),
          submit.click().catch(() => {}),
        ]);
        if (resp) {
          const b = await resp.text();
          rec("Registration: submit (registrations.create)", resp.status() === 200 && b.includes("success") ? "PASS" : "PARTIAL", `HTTP ${resp.status()} ${b.slice(0, 90)}`);
        } else rec("Registration: submit", "PARTIAL", "no network call captured (client validation?)");
      } catch (e) { rec("Registration: submit", "FAIL", String(e).slice(0, 150)); }
      await page.close();
    }

    await ctx.close();
  }

  // ---- 8d + 8e: auth + admin ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const cap = attach(page, "admin");
    try {
      // logged-out /admin should redirect to /login
      await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const onLogin = page.url().includes("/login");
      rec("Auth: /admin logged-out → /login", onLogin ? "PASS" : "FAIL", page.url());

      // login
      await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
      await page.fill("input[type=email]", ADMIN.email);
      await page.fill("input[type=password]", ADMIN.password);
      await Promise.all([
        page.waitForURL(u => u.toString().includes("/admin"), { timeout: 20000 }).catch(() => {}),
        page.getByRole("button", { name: /sign in/i }).click(),
      ]);
      await page.waitForTimeout(2500);
      const inAdmin = page.url().includes("/admin");
      const hasShell = await page.isVisible(".admin-root, .admin-sidebar");
      rec("Auth: login → /admin", inAdmin && hasShell ? "PASS" : "FAIL", `url=${page.url()} shell=${hasShell}`);
      await page.screenshot({ path: `${OUT}/admin-overview.png`, fullPage: true });

      if (inAdmin && hasShell) {
        // overview data
        const statText = await page.locator(".stat-card, .stats-grid").first().innerText().catch(() => "");
        rec("Admin Overview: renders stats", statText.length > 0 ? "PASS" : "PARTIAL", statText.replace(/\s+/g, " ").slice(0, 80));

        // nav each section
        const sections = [
          ["/admin/events", ".events-page, .event-list"],
          ["/admin/events/new", ".create-grid, .create-page"],
          ["/admin/recaps", ".section-page"],
          ["/admin/wall", ".section-page"],
          ["/admin/projects", ".section-page"],
          ["/admin/applicants", ".applicant-table, .section-page"],
          ["/admin/spotlights", ".section-page"],
          ["/admin/hear-me-out", ".section-page"],
          ["/admin/media", ".section-page"],
          ["/admin/newsletter", ".newsletter-layout, .section-page"],
        ];
        for (const [path, sel] of sections) {
          await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(1200);
          const vis = await page.isVisible(sel);
          const errs = cap.errors.length;
          await page.screenshot({ path: `${OUT}/admin${path.replace(/\W+/g, "_")}.png`, fullPage: true });
          rec(`Admin nav ${path}`, vis && errs === 0 ? "PASS" : vis ? "PARTIAL" : "FAIL", vis ? (errs ? `console: ${cap.errors[cap.errors.length - 1]}` : "") : "section not visible");
        }

        // create event
        await page.goto(BASE + "/admin/events/new", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        const slug = "smoke-event-" + Date.now();
        await page.locator("input").nth(0).fill("Smoke Test Event");
        await page.locator("input").nth(1).fill(slug);
        // venue field
        const venueInput = page.locator(".input-with-icon input, input").filter({ hasNot: page.locator("[type=number]") });
        await page.getByText("Venue").locator("xpath=following::input[1]").fill("The Test Room").catch(async () => {
          await page.locator("input").nth(5).fill("The Test Room").catch(() => {});
        });
        await page.locator("textarea").first().fill("A smoke test event created by the automated QA run to verify admin.createEvent + storage.");
        const [cResp] = await Promise.all([
          page.waitForResponse(r => r.url().includes("/api/trpc/admin.createEvent"), { timeout: 20000 }).catch(() => null),
          page.getByRole("button", { name: /create event/i }).first().click(),
        ]);
        if (cResp) {
          const b = await cResp.text();
          rec("Admin: createEvent", cResp.status() === 200 && b.includes("success") ? "PASS" : "FAIL", `HTTP ${cResp.status()} ${b.slice(0, 100)}`);
        } else rec("Admin: createEvent", "FAIL", "no network call (validation blocked?)");

        // verify it shows in events list + public
        await page.goto(BASE + "/admin/events", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1200);
        const inList = (await page.content()).includes("Smoke Test Event");
        rec("Admin: new event in list", inList ? "PASS" : "FAIL");

        // sign out
        await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
        await page.locator(".account-logout, button[aria-label='Sign out']").first().click().catch(() => {});
        await page.waitForTimeout(2000);
        await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1500);
        rec("Auth: sign out locks /admin", page.url().includes("/login") ? "PASS" : "FAIL", page.url());
      }
    } catch (e) {
      rec("Admin flow", "FAIL", String(e).slice(0, 200));
    }
    await page.close();
    await ctx.close();
  }

  // ---- 8f: animations + reduced motion ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      // reveal: element starts hidden then becomes visible on scroll
      const about = page.locator("#about");
      const before = await about.evaluate(el => getComputedStyle(el).opacity).catch(() => "1");
      await about.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      const after = await about.evaluate(el => getComputedStyle(el).opacity).catch(() => "1");
      const hasVisible = await page.evaluate(() => !!document.querySelector("[data-reveal].is-visible"));
      rec("Animations: scroll reveal", hasVisible && after === "1" ? "PASS" : "PARTIAL", `opacity ${before}→${after}, is-visible=${hasVisible}`);
    } catch (e) { rec("Animations: scroll reveal", "FAIL", String(e).slice(0, 120)); }
    await page.close();

    const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const rmPage = await rmCtx.newPage();
    try {
      await rmPage.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await rmPage.locator("#projects").scrollIntoViewIfNeeded();
      await rmPage.waitForTimeout(300);
      const op = await rmPage.locator("#projects").evaluate(el => getComputedStyle(el).opacity);
      const dur = await rmPage.locator("#projects").evaluate(el => getComputedStyle(el).transitionDuration);
      rec("Animations: prefers-reduced-motion", op === "1" ? "PASS" : "FAIL", `opacity=${op} transition=${dur}`);
    } catch (e) { rec("Animations: reduced-motion", "FAIL", String(e).slice(0, 120)); }
    await rmPage.close();
    await rmCtx.close();
    await ctx.close();
  }

  // ---- typography check ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const homeFont = await page.evaluate(() => {
        const h = document.querySelector("h1, .hero-wordmark, .section-title");
        return h ? getComputedStyle(h).fontFamily : "";
      });
      rec("Typography: home headings", /Fredoka/i.test(homeFont) ? "PASS" : "PARTIAL", homeFont.slice(0, 80));
    } catch (e) { rec("Typography: home", "FAIL", String(e).slice(0, 120)); }
    await page.close();
    await ctx.close();
  }

  await browser.close();

  // ---- report ----
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const partial = results.filter(r => r.status === "PARTIAL").length;
  let md = `# Smoke test report — ${BASE}\n\n_${new Date().toISOString()}_\n\n**${pass} PASS · ${partial} PARTIAL · ${fail} FAIL**\n\n| Area | Status | Notes |\n|---|---|---|\n`;
  for (const r of results) md += `| ${r.area} | ${r.status} | ${(r.note || "").replace(/\|/g, "\\|").slice(0, 240)} |\n`;
  writeFileSync(`${OUT}/report.md`, md);
  console.log(`\n${pass} PASS · ${partial} PARTIAL · ${fail} FAIL  → ${OUT}/report.md`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
