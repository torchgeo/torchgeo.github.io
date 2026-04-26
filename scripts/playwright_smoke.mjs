// Smoke test for the TorchGeo landing page. Exits non-zero on any failure.
// Run with: bunx --bun playwright install chromium && node scripts/playwright_smoke.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const failures = [];
const consoleErrors = [];
const pageErrors = [];

const log = (label, ok, info = "") => {
  const tag = ok ? "PASS" : "FAIL";
  console.log(`${tag}  ${label}${info ? ` — ${info}` : ""}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle" });

// 1. Hero loads
log("hero h1 visible", await page.locator(".hero__title").isVisible());

// 2. Topbar logo loads (image has natural size > 0)
const logoOk = await page.locator(".topbar__brand img").evaluate((el) => {
  const img = /** @type {HTMLImageElement} */ (el);
  return img.complete && img.naturalWidth > 0;
});
log("topbar logo loaded", logoOk);

// 3. Mosaic renders all 64 tiles
const tileCount = await page.locator(".mosaic__tile").count();
log("mosaic has 64 tiles", tileCount === 64, `count=${tileCount}`);

// 4. Mosaic crosshair label updates over time
const crosshair = page.locator(".mosaic__crosshair-label");
const label1 = await crosshair.textContent();
await page.waitForTimeout(3500);
const label2 = await crosshair.textContent();
log(
  "crosshair animates",
  label1 !== label2,
  `${label1?.slice(0, 24)} → ${label2?.slice(0, 24)}`,
);

// 5. Code tabs switch
await page.locator(".tabs .tab", { hasText: "segmentation" }).click();
await page.waitForTimeout(150);
const segActive = await page
  .locator(".tabs .tab.is-active")
  .first()
  .textContent();
log("tab switches to segmentation", segActive?.trim() === "segmentation");
const fileText = await page.locator(".code-card__file").innerText();
log(
  "code panel updates filename",
  fileText.startsWith("inria"),
  `file=${fileText}`,
);

await page.locator(".tabs .tab", { hasText: "detection" }).click();
await page.waitForTimeout(150);
const detText = await page.locator(".code-card__file").innerText();
log(
  "tab switches to detection",
  detText.startsWith("vhr10"),
  `file=${detText}`,
);

await page.locator(".tabs .tab", { hasText: "classification" }).click();
await page.waitForTimeout(150);

// 6. Compare slider drags and clipPath updates
const compare = page.locator(".compare").first();
await compare.scrollIntoViewIfNeeded();
const layerBefore = await page
  .locator(".compare__layer")
  .first()
  .evaluate((el) => el.style.clipPath);
const box = await compare.boundingBox();
if (!box) throw new Error("no compare bbox");
await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, {
  steps: 12,
});
await page.mouse.up();
await page.waitForTimeout(120);
const layerAfter = await page
  .locator(".compare__layer")
  .first()
  .evaluate((el) => el.style.clipPath);
log(
  "compare slider responds to drag",
  layerBefore !== layerAfter,
  `${layerBefore} → ${layerAfter}`,
);

// 7. Surface grid links — count + sample href
const surfaceCount = await page.locator(".surface-card").count();
log("surface grid has 6 cards", surfaceCount === 6, `count=${surfaceCount}`);

// 8. Models grid — 6 entries
const modelCount = await page.locator(".model").count();
log("models grid has 6 entries", modelCount === 6, `count=${modelCount}`);

// 9. Video carousel — clicking next advances scrollLeft
const carouselTrack = page.locator(".carousel-track").first();
await carouselTrack.scrollIntoViewIfNeeded();
const sl1 = await carouselTrack.evaluate((el) => el.scrollLeft);
await page.locator(".carousel-next").first().click();
await page.waitForTimeout(450);
const sl2 = await carouselTrack.evaluate((el) => el.scrollLeft);
log("video carousel advances", sl1 !== sl2, `scrollLeft ${sl1} → ${sl2}`);

// 10. Partner logos load
const partnerSrcs = await page.locator(".partner img").evaluateAll((imgs) =>
  imgs.map(
    /** @param {HTMLImageElement} i */ (i) => ({
      ok: i.complete && i.naturalWidth > 0,
      src: i.getAttribute("src"),
    }),
  ),
);
log(
  "all partner logos loaded",
  partnerSrcs.length === 5 && partnerSrcs.every((p) => p.ok),
  partnerSrcs.map((p) => `${p.src}=${p.ok}`).join(" "),
);

// 11. Footer links present
const footerLinks = await page.locator(".footer a").count();
log("footer has links", footerLinks > 8, `count=${footerLinks}`);

// 12. Anchor nav scroll: clicking "Datasets" jumps to that section
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(150);
const yBefore = await page.evaluate(() => window.scrollY);
await page.locator(".topbar__nav a", { hasText: "Datasets" }).click();
await page.waitForTimeout(900);
const yAfter = await page.evaluate(() => window.scrollY);
log(
  "nav anchor scrolls to #datasets",
  Math.abs(yAfter - yBefore) > 200,
  `${yBefore} → ${yAfter}`,
);

// 13. Scrollbar tokens applied
const scrollbarStyle = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    width: cs.getPropertyValue("scrollbar-width").trim(),
    color: cs.getPropertyValue("scrollbar-color").trim(),
  };
});
log(
  "scrollbar-width: thin",
  scrollbarStyle.width === "thin",
  `got ${scrollbarStyle.width}`,
);
// Computed scrollbar-color resolves named colors: "gray" → rgb(128,128,128), "transparent" → rgba(0,0,0,0)
const isGray = /gray|rgb\(128,\s*128,\s*128\)/i.test(scrollbarStyle.color);
const isTransparent = /transparent|rgba\(0,\s*0,\s*0,\s*0\)/i.test(
  scrollbarStyle.color,
);
log(
  "scrollbar-color: gray transparent",
  isGray && isTransparent,
  `got ${scrollbarStyle.color}`,
);

// 14. No console / page errors during the run
log("no page errors", pageErrors.length === 0, pageErrors.join(" | "));
log(
  "no console errors",
  consoleErrors.length === 0,
  consoleErrors.slice(0, 3).join(" | "),
);

// 15. Mobile viewport — topbar still renders
await ctx.close();
const ctxMobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const m = await ctxMobile.newPage();
await m.goto(BASE, { waitUntil: "networkidle" });
log("mobile hero visible", await m.locator(".hero__title").isVisible());
log("mobile topbar visible", await m.locator(".topbar").isVisible());
await ctxMobile.close();

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll checks passed.`);
