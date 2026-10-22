// End-to-end check of accounts + Supabase saving, in a real browser:
//   1. student A registers, ticks a step, rates the lecture and writes a note
//   2. A's browser copy is wiped and the page reloads: everything comes back from Supabase
//   3. student B registers: sees none of A's progress (row-level security)
//   4. A logs out: the Log in screen is back
// Needs "Confirm email" off in Supabase (Authentication → Sign In / Providers → Email).
// Test accounts are hubtest+<time>-a@example.com / -b; delete them afterwards (see CLAUDE.md).
//
// Serve the normal build first (from learning-hub/):  python3 -I qa/serve.py front-end/dist &
// Then:  node qa/accounts.mjs
import { createRequire } from "module";
import { readdirSync } from "fs";
import { homedir } from "os";

const npx = `${homedir()}/.npm/_npx`;
const pkg = readdirSync(npx).map((d) => `${npx}/${d}/node_modules/`).find((p) => { try { createRequire(p).resolve("playwright-core"); return true; } catch { return false; } });
const { chromium } = createRequire(pkg)("playwright-core");
const cache = `${homedir()}/Library/Caches/ms-playwright`;
const cr = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const exe = `${cache}/${cr}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

// HUB_URL tests another copy, e.g. the live site: HUB_URL=https://eagle-learning-hub.vercel.app/ node qa/accounts.mjs
const URL = process.env.HUB_URL || "http://127.0.0.1:4180/index.html";
const stamp = Date.now();
const results = [];
const check = (name, ok, info = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? `  (${info})` : ""}`); };
const browser = await chromium.launch({ executablePath: exe, headless: true });

async function student(tag) {
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem("hub:debug-now", "2026-10-19T11:15"); } catch {} });
  await page.goto(`${URL}#today`, { waitUntil: "networkidle" });
  await page.click(".auth__switch .link-btn"); // Create an account
  await page.fill('input[autocomplete="name"]', `Test ${tag.toUpperCase()}`);
  await page.fill('input[type="email"]', `hubtest+${stamp}-${tag}@example.com`);
  await page.fill('input[type="password"]', `pw-${stamp}`);
  await page.click(".auth__submit");
  await page.waitForSelector("#save[data-mode='cloud']", { timeout: 15000 }).catch(() => {});
  return { ctx, page };
}
const saveMode = (page) => page.evaluate(() => document.querySelector("#save")?.dataset.mode);

// 1. A registers and does some work
const A = await student("a");
const errA = await A.page.$eval(".auth__error", (e) => e.textContent).catch(() => null);
check("A can create an account and lands in the hub", (await saveMode(A.page)) === "cloud", errA || `save badge: ${await saveMode(A.page)}`);
await A.page.goto(`${URL}#lecture-ai-8`, { waitUntil: "networkidle" });
await A.page.click("#step-s1 .marker");
await A.page.click("#rail-rating [data-conf='3']");
await A.page.fill("#notes-ai-8", "Ask about refresh tokens");
await A.page.waitForTimeout(1500); // notes save 0.8s after typing stops
await A.page.waitForFunction(() => document.querySelector("#save")?.dataset.mode === "cloud", null, { timeout: 10000 }).catch(() => {});

// 2. wipe A's browser copy of the progress (not the login) and reload: it must come from Supabase
await A.page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("eagle-hub:v1")).forEach((k) => localStorage.removeItem(k)));
await A.page.reload({ waitUntil: "networkidle" });
await A.page.waitForSelector("#save[data-mode='cloud']", { timeout: 15000 }).catch(() => {});
const back = await A.page.evaluate(() => ({
  ticked: document.querySelector("#step-s1")?.dataset.done,
  rating: document.querySelector("#rail-rating .rating")?.style.getPropertyValue("--c"),
  notes: document.querySelector("#notes-ai-8")?.value,
}));
check("A's tick, rating and note come back from Supabase after wiping the browser copy", back.ticked === "true" && back.rating === "3" && back.notes === "Ask about refresh tokens", JSON.stringify(back));

// 3. B sees none of it
const B = await student("b");
await B.page.goto(`${URL}#lecture-ai-8`, { waitUntil: "networkidle" });
await B.page.waitForTimeout(800);
const bView = await B.page.evaluate(() => ({
  ticked: document.querySelector("#step-s1")?.dataset.done,
  rating: document.querySelector("#rail-rating .rating")?.style.getPropertyValue("--c"),
  notes: document.querySelector("#notes-ai-8")?.value,
}));
check("B sees none of A's progress", bView.ticked === "false" && bView.rating === "0" && bView.notes === "", JSON.stringify(bView));

// 4. log out
await A.page.click(".account-btn");
const loggedOut = await A.page.waitForSelector(".auth__card", { timeout: 10000 }).then(() => true, () => false);
const leftovers = await A.page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("eagle-hub:v1:")).length);
check("Log out returns to the Log in screen and removes the browser copy", loggedOut && leftovers === 0, `leftover copies: ${leftovers}`);
check("no page errors", !A.page.errors.length && !B.page.errors.length, [...A.page.errors, ...B.page.errors].join(" | "));

await browser.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed · test accounts: hubtest+${stamp}-a/-b@example.com`);
process.exit(results.every(Boolean) ? 0 : 1);
