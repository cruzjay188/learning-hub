// Compares two builds of the hub screen by screen: the page structure (elements, classes,
// attributes, text) and the pixels. Used to prove the React version matches the original.
//
// Serve both first (from learning-hub/), e.g.:
//   python3 -I qa/serve.py ../hub 4180 &   python3 -I qa/serve.py front-end/dist 4181 &
// Then:
//   node qa/compare.mjs <outDir> [portA=4180] [portB=4181] [--merge-text]
// Prints one line per screen. Diff images (changed pixels in magenta) go to <outDir>.
// --merge-text joins neighbouring text nodes before the screenshot. React writes "Week {w}" as
// separate text nodes, which shifts letters by a fraction of a pixel; with this flag, any pixel
// difference left over is a real one.
import { createRequire } from "module";
import { readdirSync, mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";

const npx = `${homedir()}/.npm/_npx`;
const pkg = readdirSync(npx).map((d) => `${npx}/${d}/node_modules/`).find((p) => { try { createRequire(p).resolve("playwright-core"); return true; } catch { return false; } });
const { chromium } = createRequire(pkg)("playwright-core");
const cache = `${homedir()}/Library/Caches/ms-playwright`;
const cr = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const exe = `${cache}/${cr}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const args = process.argv.slice(2);
const mergeText = args.includes("--merge-text");
const [outDir = "design/screens/compare", portA = "4180", portB = "4181"] = args.filter((a) => !a.startsWith("--"));
mkdirSync(outDir, { recursive: true });
const NOW = "2026-10-19T11:15";
const browser = await chromium.launch({ executablePath: exe, headless: true });

// The page as a plain tree: [tag, {attributes}, ...children]. Whitespace-only text is dropped,
// other text has its whitespace collapsed, classes and inline styles are sorted, so two pages that
// render the same compare equal even if their HTML was written differently.
const snapshot = () => {
  const canon = (n) => {
    if (n.nodeType === 3) return n.textContent.replace(/\s+/g, " ");
    if (n.nodeType !== 1 || ["SCRIPT", "STYLE", "LINK", "META", "TITLE"].includes(n.tagName)) return null;
    const attrs = {};
    for (const a of n.attributes) {
      if (a.name === "class") attrs.class = a.value.split(/\s+/).filter(Boolean).sort().join(" ");
      else if (a.name === "style") {
        // let the browser parse it, so "border:0;border-top:…" and its longhand form compare equal
        const d = document.createElement("div");
        d.style.cssText = a.value;
        attrs.style = [...d.style].map((p) => `${p}:${d.style.getPropertyValue(p)}`).sort().join(";");
      }
      else attrs[a.name] = a.value;
    }
    if (n.tagName === "TEXTAREA" || n.tagName === "INPUT") attrs["(value)"] = n.value;
    const kids = [];
    let text = "";
    const flush = () => { if (text.trim()) kids.push(text.trim() === text ? text : text.replace(/^ | $/g, (m) => m)); text = ""; };
    for (const c of n.childNodes) {
      const v = canon(c);
      if (v === null) continue;
      if (typeof v === "string") text += v;
      else { flush(); kids.push(v); }
    }
    flush();
    // trim text at the edges of an element
    if (typeof kids[0] === "string") kids[0] = kids[0].replace(/^ /, "");
    if (typeof kids[kids.length - 1] === "string") kids[kids.length - 1] = kids[kids.length - 1].replace(/ $/, "");
    return [n.tagName.toLowerCase(), attrs, ...kids.filter((k) => k !== "")];
  };
  const root = document.getElementById("root") || document.body;
  return [...root.childNodes].map(canon).filter((x) => x && typeof x !== "string");
};

function diffTrees(a, b, path = "", out = []) {
  if (out.length >= 40) return out;
  if (typeof a === "string" || typeof b === "string") {
    if (a !== b) out.push(`${path}: text ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
    return out;
  }
  if (!a || !b) { out.push(`${path}: ${a ? "missing in B" : "extra in B"} ${JSON.stringify((a || b).slice(0, 2))}`); return out; }
  const [ta, aa, ...ca] = a;
  const [tb, ab, ...cb] = b;
  const here = `${path}/${ta}${aa.id ? "#" + aa.id : aa.class ? "." + aa.class.split(" ")[0] : ""}`;
  if (ta !== tb) { out.push(`${here}: tag ${ta} ≠ ${tb}`); return out; }
  for (const k of new Set([...Object.keys(aa), ...Object.keys(ab)])) if (aa[k] !== ab[k]) out.push(`${here} @${k}: ${JSON.stringify(aa[k])} ≠ ${JSON.stringify(ab[k])}`);
  for (let i = 0; i < Math.max(ca.length, cb.length); i++) diffTrees(ca[i], cb[i], `${here}[${i}]`, out);
  return out;
}

// Counts pixels that differ by more than a tiny amount; writes a diff image if any do.
async function pixelDiff(pngA, pngB, name) {
  const page = await browser.newPage();
  const res = await page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
    const px = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h); };
    const da = px(ia), db = px(ib);
    const c = new OffscreenCanvas(w, h), x = c.getContext("2d"); x.drawImage(ib, 0, 0); x.fillStyle = "rgba(255,255,255,.7)"; x.fillRect(0, 0, w, h);
    const out = x.getImageData(0, 0, w, h);
    // A pixel only counts as different if no pixel within 1px in the other image matches it,
    // so text that's anti-aliased a fraction of a pixel differently doesn't count; a real shift does.
    const near = (p, q, x, y) => {
      const i = (y * w + x) * 4;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = (yy * w + xx) * 4;
        if (Math.abs(p.data[i] - q.data[j]) + Math.abs(p.data[i + 1] - q.data[j + 1]) + Math.abs(p.data[i + 2] - q.data[j + 2]) <= 24) return true;
      }
      return false;
    };
    let n = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
      if (d > 24 && !(near(da, db, x, y) && near(db, da, x, y))) { n++; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 255; out.data[i + 3] = 255; }
    }
    x.putImageData(out, 0, 0);
    const blob = n ? await c.convertToBlob() : null;
    const bytes = blob ? [...new Uint8Array(await blob.arrayBuffer())] : null;
    return { n, total: w * h, size: [ia.width, ia.height, ib.width, ib.height], bytes };
  }, [`data:image/png;base64,${pngA.toString("base64")}`, `data:image/png;base64,${pngB.toString("base64")}`]);
  await page.close();
  if (res.bytes) writeFileSync(`${outDir}/${name}-diff.png`, Buffer.from(res.bytes));
  if (res.bytes) { writeFileSync(`${outDir}/${name}-A.png`, pngA); writeFileSync(`${outDir}/${name}-B.png`, pngB); }
  return res;
}

// Each screen: where to start, what to do first, and the viewport.
const SCREENS = [
  { name: "today", hash: "today" },
  { name: "today-phone-dark", hash: "today", width: 390, scheme: "dark" },
  { name: "course", hash: "course" },
  { name: "course-all-weeks", hash: "course", steps: [{ click: "[data-action='weeks-all']" }] },
  { name: "course-filter-week", hash: "course", steps: [{ click: "[data-filter='week']" }] },
  { name: "lecture", hash: "lecture-ai-8" },
  { name: "lecture-phone", hash: "lecture-ai-8", width: 390 },
  { name: "lecture-ticked-rated", hash: "lecture-ai-8", steps: [{ click: "#step-s1 .marker" }, { click: "#step-s2 .marker" }, { click: "#rail-rating [data-conf='3']" }, { type: ["#notes-ai-8", "Ask about JWT expiry"] }, { wait: 1200 }] },
  { name: "lecture-all-done", hash: "lecture-ai-6", steps: [{ eval: "document.querySelectorAll('#steps .marker').forEach((b) => b.click())" }] },
  { name: "lecture-deck", hash: "lecture-ai-8", steps: [{ click: "#recall .flip" }, { wait: 400 }, { click: "#recall [data-deck='got']" }, { wait: 500 }, { click: "#recall .flip" }] },
  { name: "lecture-expand-all", hash: "lecture-ai-8", steps: [{ click: "[data-action='expand-all']" }] },
  { name: "review-empty", hash: "review" },
  { name: "review-rated", hash: "lecture-ai-6", steps: [{ click: "#rail-rating [data-conf='2']" }, { nav: "review" }, { click: "[data-rfilter='weak']" }] },
  { name: "review-unrated", hash: "review", steps: [{ click: "[data-rfilter='unrated']" }] },
  { name: "work", hash: "work" },
  { name: "work-done-open", hash: "work", steps: [{ click: "[data-action='toggle-done']" }] },
  { name: "work-activity", hash: "work-activity" },
  { name: "sheet-help", hash: "course", steps: [{ click: "[data-action='help']" }] },
  { name: "sheet-catchup", hash: "today", steps: [{ click: "[data-action='catchup']" }] },
  { name: "sheet-rate-phone", hash: "lecture-ai-8", width: 390, steps: [{ click: "#lecbar [data-action='sheet-rate']" }] },
  { name: "sheet-review", hash: "lecture-ai-5", steps: [{ click: "#rail-rating [data-conf='1']" }, { nav: "review" }, { click: "[data-action='start-review']" }, { wait: 400 }, { click: "#rv-body .flip" }] },
  { name: "palette", hash: "today", steps: [{ key: "Meta+k" }, { type: ["#pal-input", "rls"] }] },
  { name: "status-menu", hash: "work", steps: [{ click: "[data-status-menu]" }] },
];

async function run(port, s) {
  const page = await browser.newPage({ viewport: { width: s.width || 1360, height: 900 }, colorScheme: s.scheme || "light", reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript((n) => { try { localStorage.setItem("hub:debug-now", n); } catch {} }, NOW);
  await page.goto(`http://127.0.0.1:${port}/index.html#${s.hash}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  for (const st of s.steps || []) {
    if (st.click) await page.click(st.click);
    if (st.type) await page.fill(st.type[0], st.type[1]);
    if (st.key) await page.keyboard.press(st.key);
    if (st.eval) await page.evaluate(st.eval);
    if (st.nav) await page.evaluate((h) => { location.hash = h; }, st.nav);
    await page.waitForTimeout(st.wait || 350);
  }
  // let toasts leave, freeze anything still moving
  await page.evaluate(() => { const t = document.getElementById("toast"); if (t) t.dataset.show = "false"; document.querySelectorAll(".nowline span").forEach(() => {}); });
  await page.evaluate((merge) => { window.scrollTo(0, 0); if (merge) document.body.normalize(); }, mergeText); // the sticky bar is drawn where you're scrolled to
  await page.evaluate(() => document.fonts.ready); // web fonts load over the network: wait, or text renders in the fallback font
  await page.waitForTimeout(400);
  const tree = await page.evaluate(snapshot);
  const png = await page.screenshot({ fullPage: true, animations: "disabled" });
  await page.close();
  return { tree, png, errors };
}

// Differences between the original and the React build that are known and can't be seen.
// They're still printed (as "known"), just not counted as failures.
const KNOWN = [
  [/tabbar__inner\[\d+\]/, "phone tab bar pill: the original only creates it once it's on a phone screen"],
  [/div#lecbar\[0\]: missing in B/, "the original leaves stale content in the hidden lecture bar"],
  [/: "undefined" ≠ "false"$/, 'the original writes "undefined" where it means false (data-clamp, data-open, aria-expanded); CSS only checks for "true"'],
  [/textarea#notes-[^ ]*: text undefined ≠ /, "React mirrors a textarea's value into its text; the shown value is the same"],
  [/segc__thumb @style: "--tl:\d+px;--tr:\d+px" ≠ /, "segmented thumb: React re-measures after the web fonts load; the original kept its first measurement"],
  [/input#pal-input @value: undefined ≠ /, "React mirrors the search box's value into its value attribute"],
  [/@class: "is-new step" ≠ "step"$/, "the original leaves is-new on ticked steps after the tick animation; React removes it"],
];
const known = (d) => KNOWN.find(([re]) => re.test(d));

let bad = 0;
for (const s of SCREENS) {
  const [A, B] = [await run(portA, s), await run(portB, s)];
  const dom = diffTrees(["root", {}, ...A.tree], ["root", {}, ...B.tree]);
  const real = dom.filter((d) => !known(d));
  const notes = [...new Set(dom.filter(known).map((d) => known(d)[1]))];
  const px = await pixelDiff(A.png, B.png, s.name);
  const ok = !real.length && px.n === 0 && !B.errors.length;
  if (!ok) bad++;
  console.log(`${ok ? "SAME" : "DIFF"}  ${s.name.padEnd(22)} dom: ${real.length ? real.length + " differences" : "identical"} · pixels: ${px.n} of ${px.total} differ${px.size[1] !== px.size[3] ? ` (heights ${px.size[1]} vs ${px.size[3]})` : ""}${B.errors.length ? ` · errors in B: ${B.errors.join(" | ")}` : ""}`);
  real.forEach((d) => console.log(`        ${d}`));
  notes.forEach((n) => console.log(`        known: ${n}`));
}
await browser.close();
console.log(`\n${SCREENS.length - bad}/${SCREENS.length} screens identical`);
