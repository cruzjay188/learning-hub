// Screenshot the Learning Hub in a real browser (Playwright's own Chromium).
//
// Start the local server first (from learning-hub/):
//   python3 -I qa/serve.py site &          # serves http://127.0.0.1:4180
// Then:
//   node qa/shoot.mjs <outDir> <now> <hash> [width] [scheme] [actions]
//     now     fake "current" ET time, e.g. 2026-10-19T11:15 (sets localStorage hub:debug-now)
//     hash    view to open: today | map | assignments | work | lecture-ai-8 ...
//     width   viewport width in px (default 1360; use 390 for phone)
//     scheme  light | dark (default light)
//     actions optional JSON list run before the screenshot, e.g.
//             '[{"click":"[data-step=s1]"},{"type":["textarea.notes","hello"]},{"press":"Tab"},{"wait":500}]'
// Prints JSON: { file, overflowPx, errors }. The page's localStorage starts empty each run.
import { createRequire } from "module";
import { readdirSync } from "fs";
import { homedir } from "os";

const npx = `${homedir()}/.npm/_npx`;
const pkg = readdirSync(npx).map((d) => `${npx}/${d}/node_modules/`).find((p) => { try { createRequire(p).resolve("playwright-core"); return true; } catch { return false; } });
if (!pkg) throw new Error("playwright-core not found in ~/.npm/_npx; run: npx -y @playwright/mcp@latest --help once");
const { chromium } = createRequire(pkg)("playwright-core");
const cache = `${homedir()}/Library/Caches/ms-playwright`;
const cr = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const exe = `${cache}/${cr}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const [outDir, now, hash = "today", width = "1360", scheme = "light", actionsJson = "[]"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, colorScheme: scheme });
const errors = [];
page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.location().url || "")) errors.push(`console: ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
await page.addInitScript((n) => { try { if (n) localStorage.setItem("hub:debug-now", n); } catch {} }, now);
await page.goto(`http://127.0.0.1:4180/index.html#${hash}`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
for (const a of JSON.parse(actionsJson)) {
  if (a.click) await page.click(a.click);
  if (a.type) await page.fill(a.type[0], a.type[1]);
  if (a.press) await page.keyboard.press(a.press);
  if (a.wait) await page.waitForTimeout(a.wait);
  if (a.hash) { await page.evaluate((h) => { location.hash = h; }, a.hash); await page.waitForTimeout(400); }
}
await page.waitForTimeout(400);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const tag = JSON.parse(actionsJson).length ? "-after" : "";
const file = `${outDir}/${hash}-${width}-${scheme}${tag}.png`;
await page.screenshot({ path: file, fullPage: true });
console.log(JSON.stringify({ file, overflowPx: overflow, errors }));
await browser.close();
