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

// 3. Hero asset renders the real Landsat composite
const heroImg = await page.locator(".hero-asset__img").evaluate((el) => {
  const img = /** @type {HTMLImageElement} */ (el);
  return img.complete && img.naturalWidth > 0;
});
log("hero asset image loaded", heroImg);

// 4. Hero sampler tag rotates through label states
const tag = page.locator(".hero-asset__sampler-tag");
const label1 = await tag.textContent();
await page.waitForTimeout(2700);
const label2 = await tag.textContent();
log(
  "sampler tag animates",
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

// 10. Member-org logos load (sponsors section, dark variants)
const partnerSrcs = await page
  .locator(".sponsors__cell img")
  .evaluateAll((imgs) =>
    imgs.map(
      /** @param {HTMLImageElement} i */ (i) => ({
        ok: i.complete && i.naturalWidth > 0,
        src: i.getAttribute("src"),
      }),
    ),
  );
log(
  "all member-org logos loaded",
  partnerSrcs.length === 5 && partnerSrcs.every((p) => p.ok),
  partnerSrcs.map((p) => `${p.src}=${p.ok}`).join(" "),
);

// 10b. Stewarded-by light-variant logos load
const stewardSrcs = await page
  .locator(".stewards__logo img")
  .evaluateAll((imgs) =>
    imgs.map(
      /** @param {HTMLImageElement} i */ (i) => ({
        ok: i.complete && i.naturalWidth > 0,
        src: i.getAttribute("src"),
      }),
    ),
  );
log(
  "all stewarded-by logos loaded",
  stewardSrcs.length === 5 && stewardSrcs.every((p) => p.ok),
  stewardSrcs.map((p) => `${p.src}=${p.ok}`).join(" "),
);

// 10c. Hero stats wired
const statCount = await page.locator(".hero__meta-item").count();
log("hero stats row has 4 items", statCount === 4, `count=${statCount}`);

// 10d. Citations section renders venues + institutions
const venueCount = await page.locator(".research__venues li").count();
const instCount = await page.locator(".research__inst").count();
log(
  "research section populated",
  venueCount > 0 && instCount > 0,
  `venues=${venueCount} insts=${instCount}`,
);

// 10e. Sponsor CTAs link to GitHub Sponsors
const sponsorHrefs = await page
  .locator("a[href*='github.com/sponsors/torchgeo']")
  .evaluateAll((els) => els.length);
log("sponsor links present", sponsorHrefs >= 3, `count=${sponsorHrefs}`);

// 10f. Footer BibTeX block
const bibtex = await page.locator(".footer__bibtex").textContent();
log(
  "footer bibtex includes stewart2022torchgeo",
  /stewart2022torchgeo/.test(bibtex ?? ""),
);

// 11. Footer links present
const footerLinks = await page.locator(".footer a").count();
log("footer has links", footerLinks > 8, `count=${footerLinks}`);

// 12. Anchor nav scroll: clicking "Datasets" jumps to that section
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
});
await page.waitForFunction(() => window.scrollY === 0);
const yBefore = await page.evaluate(() => window.scrollY);
await page.locator(".topbar__nav a", { hasText: "Datasets" }).click();
const datasetsTop = await page
  .locator("#datasets")
  .evaluate((el) => Math.round(el.getBoundingClientRect().top));
log(
  "nav anchor scrolls to #datasets",
  yBefore === 0 && Math.abs(datasetsTop) < 90,
  `start=${yBefore}, targetTop=${datasetsTop}`,
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
