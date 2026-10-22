// Motion QA for the Learning Hub: captures frames mid-animation and checks the motion rules.
//
// Start the local server first (from learning-hub/):
//   python3 -I qa/serve.py site &          # serves http://127.0.0.1:4180
// Then:
//   node qa/motion.mjs <outDir>
// Prints one line per check (PASS / FAIL) and saves frames as <outDir>/<check>-<ms>.png.
import { createRequire } from "module";
import { readdirSync, mkdirSync } from "fs";
import { homedir } from "os";

const npx = `${homedir()}/.npm/_npx`;
const pkg = readdirSync(npx).map((d) => `${npx}/${d}/node_modules/`).find((p) => { try { createRequire(p).resolve("playwright-core"); return true; } catch { return false; } });
const { chromium } = createRequire(pkg)("playwright-core");
const cache = `${homedir()}/Library/Caches/ms-playwright`;
const cr = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const exe = `${cache}/${cr}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const outDir = process.argv[2] || "design/screens/motion";
mkdirSync(outDir, { recursive: true });
const NOW = "2026-10-19T11:15";
const browser = await chromium.launch({ executablePath: exe, headless: true });
const results = [];
const check = (name, ok, info = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? `  (${info})` : ""}`); };

async function open(hash, { width = 1360, reduced = false, scheme = "light", early = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference" });
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.location().url || "")) page.errors.push(m.text()); });
  await page.addInitScript((n) => { try { localStorage.setItem("hub:debug-now", n); } catch {} }, NOW);
  await page.goto(`http://127.0.0.1:4180/index.html#${hash}`, { waitUntil: early ? "commit" : "networkidle" });
  return page;
}
const frames = async (page, name, times) => { let t0 = 0; for (const t of times) { await page.waitForTimeout(t - t0); t0 = t; await page.screenshot({ path: `${outDir}/${name}-${t}.png` }); } };
const running = (page) => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);

// 1. first paint: staggered arrival, then nothing left running
{
  const page = await open("today", { early: true });
  const mid = await page.waitForSelector("#view.view-first", { timeout: 5000 }).then(() => true, () => false);
  await frames(page, "first-paint", [60, 160]);
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => document.querySelector("#view").classList.contains("view-first"));
  check("first paint staggers, then the class is removed", mid && !after, `during=${mid} after=${after}`);
  await page.screenshot({ path: `${outDir}/today-settled.png` });

  // 2. tab indicator slides from Today to Course
  const l0 = await page.evaluate(() => document.querySelector(".tabs__ind").style.getPropertyValue("--ind-l"));
  await page.click('.tabs [data-tab="course"]');
  await page.waitForTimeout(120);
  const clipMid = await page.evaluate(() => getComputedStyle(document.querySelector(".tabs__ind")).clipPath);
  await page.screenshot({ path: `${outDir}/tab-slide-120.png`, clip: { x: 0, y: 0, width: 1360, height: 70 } });
  await page.waitForTimeout(400);
  const l1 = await page.evaluate(() => document.querySelector(".tabs__ind").style.getPropertyValue("--ind-l"));
  check("tab underline moves to the new tab", l0 !== l1 && !!l1, `${l0} -> ${l1}; mid clip ${clipMid}`);

  // 3. course row -> lecture: view transition forward with the title morph
  const hasVT = await page.evaluate(() => !!document.startViewTransition);
  await page.evaluate(() => { document.querySelectorAll(".week").forEach((w) => { if (w.dataset.open !== "true") w.querySelector("[data-week]")?.click(); }); });
  await page.waitForTimeout(300);
  await page.click('.lrow[href="#lecture-ai-7"]');
  await page.waitForTimeout(40);
  const vtClass = await page.evaluate(() => document.documentElement.className);
  await frames(page, "drill-in", [80, 160, 240]);
  await page.waitForTimeout(400);
  const settled = await page.evaluate(() => ({ cls: document.documentElement.className, title: document.querySelector("#v-title")?.textContent, vtn: document.querySelector("#v-title")?.style.viewTransitionName }));
  check("course row -> lecture runs a forward view transition", hasVT && /vt-fwd/.test(vtClass) && settled.cls === "" && !settled.vtn, `during="${vtClass}" after="${settled.cls}" title="${settled.title}"`);

  // 4. tick a step: number fades, check draws, rail fills
  const sid = await page.evaluate(() => document.querySelector('.step[data-done="false"]')?.dataset.step);
  await page.click(`#step-${sid} .marker`);
  await page.waitForTimeout(90);
  const mid4 = await page.evaluate((s) => { const li = document.getElementById(`step-${s}`); return { dash: getComputedStyle(li.querySelector(".chk path")).strokeDashoffset, rail: getComputedStyle(li, "::after").transform, isNew: li.classList.contains("is-new") }; }, sid);
  await page.screenshot({ path: `${outDir}/tick-90.png`, clip: await page.evaluate((s) => { const r = document.getElementById(`step-${s}`).getBoundingClientRect(); return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: 520, height: Math.min(260, r.height + 60) }; }, sid) });
  await page.waitForTimeout(500);
  const end4 = await page.evaluate((s) => { const li = document.getElementById(`step-${s}`); return { dash: getComputedStyle(li.querySelector(".chk path")).strokeDashoffset, rail: getComputedStyle(li, "::after").transform }; }, sid);
  check("step tick: check draws and rail fills", parseFloat(end4.dash) === 0 && mid4.isNew && end4.rail === "matrix(1, 0, 0, 1, 0, 0)", `mid dash=${mid4.dash} rail=${mid4.rail} -> end dash=${end4.dash} rail=${end4.rail}`);

  // 5. rate sheet: enters, and on close stays displayed while it fades out
  await page.evaluate(() => document.querySelector('[data-action="sheet-rate"]').click()); // the Rate button lives in the phone bar
  await page.waitForTimeout(70);
  const op = await page.evaluate(() => getComputedStyle(document.querySelector("#sheet")).opacity);
  await page.screenshot({ path: `${outDir}/sheet-in-70.png` });
  await page.waitForTimeout(300);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  const exit = await page.evaluate(() => { const d = document.querySelector("#sheet"); return { open: d.open, display: getComputedStyle(d).display, opacity: getComputedStyle(d).opacity }; });
  await page.waitForTimeout(300);
  const gone = await page.evaluate(() => getComputedStyle(document.querySelector("#sheet")).display);
  check("sheet fades in, then fades out before hiding", parseFloat(op) < 1 && !exit.open && exit.display !== "none" && parseFloat(exit.opacity) < 1 && gone === "none", `in opacity@70ms=${op}; exit@50ms=${JSON.stringify(exit)}; after=${gone}`);

  // 6. back to Course: transition runs backward
  await page.goBack();
  await page.waitForTimeout(40);
  const back = await page.evaluate(() => document.documentElement.className);
  await page.waitForTimeout(500);
  check("leaving a lecture runs a back transition", /vt-back/.test(back), `during="${back}"`);
  check("no page errors (motion run)", page.errors.length === 0, page.errors.join(" | "));
  await page.close();
}

// 7. Today: "Mark done" swaps Up next with a view transition, toast rises in and waits on hover
{
  const page = await open("today");
  await page.waitForTimeout(900);
  const before = await page.evaluate(() => document.querySelector("#up-h")?.textContent);
  await page.click("[data-action='done-next']");
  // v3: the button says "Done" for 300ms, then the card swaps
  await page.waitForTimeout(120);
  const morph = await page.evaluate(() => document.querySelector("[data-action='done-next']")?.classList.contains("is-done"));
  await page.screenshot({ path: `${outDir}/upnext-done-120.png` });
  await page.waitForTimeout(210);
  const cls = await page.evaluate(() => document.documentElement.className);
  await frames(page, "upnext-swap", [60, 140, 260]);
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.querySelector("#up-h")?.textContent);
  check("Up next says Done, then swaps through a view transition", morph && /vt-swap/.test(cls) && before !== after, `morph=${morph} "${before}" -> "${after}"`);
  await page.hover("#toast");
  await page.waitForTimeout(2600);
  const stillUp = await page.evaluate(() => document.querySelector("#toast").dataset.show);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2400);
  const down = await page.evaluate(() => document.querySelector("#toast").dataset.show);
  check("toast waits while hovered, then leaves", stillUp === "true" && down === "false", `hovered=${stillUp} after=${down}`);
  // log today -> today's goal dot pops
  const logBtn = await page.$("[data-action='log-today']");
  if (logBtn) { await logBtn.click(); await page.waitForTimeout(60); const pop = await page.evaluate(() => !!document.querySelector(".gd.is-new, .goal-days.is-met")); check("logging a day pops the goal dot", pop); }
  check("no page errors (today run)", page.errors.length === 0, page.errors.join(" | "));
  await page.close();
}

// 8. Work: status menu grows from its trigger and fades out
{
  const page = await open("work");
  await page.waitForTimeout(900);
  const btn = await page.$("[data-status-menu]");
  if (btn) {
    await btn.click();
    await page.waitForTimeout(60);
    const m = await page.evaluate(() => { const el = document.querySelector("#menu"); const cs = getComputedStyle(el); return { op: cs.opacity, origin: cs.transformOrigin }; });
    await page.screenshot({ path: `${outDir}/menu-in-60.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(40);
    const ex = await page.evaluate(() => getComputedStyle(document.querySelector("#menu")).display);
    check("status menu animates in from its trigger and out", parseFloat(m.op) < 1 && ex !== "none", `in=${JSON.stringify(m)} exit display@40ms=${ex}`);
  } else check("status menu present", false);
  await page.close();
}

// 9. Keyboard shortcuts are instant: "x" ticks with no animations running
{
  const page = await open("lecture-ai-8");
  await page.waitForTimeout(900);
  await page.keyboard.press("x");
  await page.waitForTimeout(16);
  const n = await running(page);
  check("keyboard tick (x) runs no animation", n === 0, `${n} running`);
  await page.keyboard.press("g"); await page.keyboard.press("c");
  await page.waitForTimeout(30);
  const cls = await page.evaluate(() => document.documentElement.className);
  check("g c navigation skips the view transition", !/vt/.test(cls), `html class="${cls}"`);
  await page.close();
}

// 10. Reduced motion: nothing animates anywhere
{
  const page = await open("course", { reduced: true });
  await page.waitForTimeout(100);
  const a = await running(page);
  await page.evaluate(() => { document.querySelectorAll(".week").forEach((w) => { if (w.dataset.open !== "true") w.querySelector("[data-week]")?.click(); }); });
  await page.click('.lrow[href="#lecture-ai-7"]');
  await page.waitForTimeout(20);
  const cls = await page.evaluate(() => document.documentElement.className);
  const sid = await page.evaluate(() => document.querySelector('.step[data-done="false"]')?.dataset.step);
  await page.click(`#step-${sid} .marker`);
  await page.waitForTimeout(16);
  const b = await running(page);
  const t = await page.evaluate(() => getComputedStyle(document.querySelector(".step__body")).transitionDuration);
  check("reduced motion: no animations, no view transitions", a === 0 && b === 0 && !/vt/.test(cls) && /^0s/.test(t), `first=${a} tick=${b} html="${cls}" transition=${t}`);
  await page.close();
}

// 11. phone + dark: no overflow, no errors after a drill-in
{
  const page = await open("course", { width: 390, scheme: "dark" });
  await page.waitForTimeout(900);
  await page.evaluate(() => { document.querySelectorAll(".week").forEach((w) => { if (w.dataset.open !== "true") w.querySelector("[data-week]")?.click(); }); });
  await page.click('.lrow[href="#lecture-ai-7"]');
  await frames(page, "phone-drill-in", [100, 700]);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("phone dark: no horizontal overflow, no errors", ov <= 0 && page.errors.length === 0, `overflow=${ov} errors=${page.errors.join(" | ")}`);
  await page.close();
}

// ---------- v3 motion ----------
// 12. Lecture "Mark done and continue": says Done, holds the next step closed until this one has folded
{
  const page = await open("lecture-ai-8");
  const btn = page.locator("[data-action='done-continue']").first();
  await btn.click();
  await page.waitForTimeout(120);
  const morph = await page.evaluate(() => !!document.querySelector("[data-action='done-continue'].is-done"));
  await page.waitForTimeout(300);
  const heldClosed = await page.evaluate(() => { const s = [...document.querySelectorAll("#steps .step")]; return s[0].dataset.done === "true" && s[1].dataset.open === "false"; });
  await page.screenshot({ path: `${outDir}/continue-hold-420.png` });
  await page.waitForTimeout(800);
  const nextOpen = await page.evaluate(() => { const s = [...document.querySelectorAll("#steps .step")]; return s[0].dataset.open === "false" && s[1].dataset.open === "true"; });
  check("continue: Done beat, next step opens only after this one folds", morph && heldClosed && nextOpen, `morph=${morph} held=${heldClosed} next=${nextOpen}`);

  // 13. Rating: the thumb slides to the choice (mid-frame differs from the end)
  await page.locator("#rail-rating [data-conf='1']").click(); await page.waitForTimeout(500);
  await page.locator("#rail-rating [data-conf='4']").click(); await page.waitForTimeout(90);
  const mid = await page.evaluate(() => getComputedStyle(document.querySelector("#rail-rating .rating__thumb")).transform);
  await page.waitForTimeout(400);
  const end = await page.evaluate(() => getComputedStyle(document.querySelector("#rail-rating .rating__thumb")).transform);
  check("rating thumb slides to the new choice", mid !== end && mid !== "none", `mid=${mid} end=${end}`);

  // 14. Recall deck: flips, the answer leaves without a mirrored frame, the next card arrives
  await page.locator("#recall").scrollIntoViewIfNeeded();
  const term0 = await page.evaluate(() => document.querySelector("#recall .face__term")?.textContent);
  await page.locator("#recall .flip").click(); await page.waitForTimeout(140);
  const flipMid = await page.evaluate(() => getComputedStyle(document.querySelector("#recall .flip")).transform);
  await page.waitForTimeout(300);
  await page.locator("#recall [data-deck='got']").click(); await page.waitForTimeout(100);
  const exitMid = await page.evaluate(() => { const f = document.querySelector("#recall .flip"); const m = new DOMMatrix(getComputedStyle(f).transform); return { got: f.classList.contains("is-got"), backFacing: m.m11 < 0 }; });
  await page.screenshot({ path: `${outDir}/deck-exit-100.png` });
  await page.waitForTimeout(500);
  const term1 = await page.evaluate(() => document.querySelector("#recall .face__term")?.textContent);
  check("recall deck flips, exits facing back (no mirror flash), next card arrives", flipMid !== "none" && exitMid.got && exitMid.backFacing && term1 && term1 !== term0, `flipMid=${flipMid.slice(0, 24)} exit=${JSON.stringify(exitMid)} ${term0} -> ${term1}`);
  await page.close();
}
// 15. Segmented control: the thumb slides between filters; continuity: Today's step counter rolls
{
  const page = await open("course");
  await page.click("[data-filter='week']"); await page.waitForTimeout(80);
  const midClip = await page.evaluate(() => getComputedStyle(document.querySelector("[data-segc='course'] .segc__thumb")).clipPath);
  await page.waitForTimeout(400);
  const endClip = await page.evaluate(() => getComputedStyle(document.querySelector("[data-segc='course'] .segc__thumb")).clipPath);
  check("segmented thumb slides to the chosen filter", midClip !== endClip, `${midClip} -> ${endClip}`);
  await page.close();
  const t = await open("today");
  await t.click("[data-action='done-next']"); await t.waitForTimeout(700);
  const d = await t.evaluate(() => { const c = document.querySelector(".upnext__step .tick .d"); return c ? { v: c.style.getPropertyValue("--d"), m: getComputedStyle(c).transform } : null; });
  check("Up next step counter is a ticker that lands on the new step", d && d.v === "2", JSON.stringify(d));
  await t.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
