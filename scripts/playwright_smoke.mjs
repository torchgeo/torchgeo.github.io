// Smoke test for the TorchGeo landing page. Exits non-zero on any failure.
// Run with: bunx --bun playwright install chromium && node scripts/playwright_smoke.mjs
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const citations = JSON.parse(
  await readFile(
    new URL("../public/data/torchgeo_citations.json", import.meta.url),
    "utf8",
  ),
);
const expectedCitationCount = citations.counts.merged_unique;
const dependents = JSON.parse(
  await readFile(
    new URL("../public/data/torchgeo_dependents.json", import.meta.url),
    "utf8",
  ),
);
const expectedDependentCount = dependents.total_projects;

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

const topbarSpacing = await page.evaluate(() => {
  const cluster = document.querySelector(".topbar__cluster");
  const github = document.querySelector(".topbar__cluster .icon-btn");
  const docs = document.querySelector(".topbar__docs");
  if (!cluster || !github || !docs) return null;
  const githubRect = github.getBoundingClientRect();
  const docsRect = docs.getBoundingClientRect();
  return {
    gap: Math.round(docsRect.left - githubRect.right),
    docsHeight: Math.round(docsRect.height),
    docsWidth: Math.round(docsRect.width),
  };
});
log(
  "topbar actions are compact and separated",
  Boolean(
    topbarSpacing &&
      topbarSpacing.gap >= 12 &&
      topbarSpacing.docsHeight <= 36 &&
      topbarSpacing.docsWidth <= 140,
  ),
  topbarSpacing ? JSON.stringify(topbarSpacing) : "controls missing",
);

const releaseLink = page.locator(".install__release");
log(
  "current stable release is visible",
  (await releaseLink.textContent())?.trim() === "v0.9.0 · Feb 2026",
);

await page.locator(".docs-menu > summary").click();
const docsMenuLinks = await page
  .locator(".docs-menu__panel a")
  .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
log(
  "documentation menu links all organization projects",
  docsMenuLinks.length === 3 &&
    docsMenuLinks.includes("https://docs.torchgeo.org/en/stable/") &&
    docsMenuLinks.includes("https://torchgeo.org/torchgeo-bench/") &&
    docsMenuLinks.includes("https://torchgeo.org/terratorch/"),
  docsMenuLinks.join(" "),
);
await page.locator(".docs-menu > summary").click();

const projectLanguage = await page.locator("body").innerText();
log(
  "organization status and projects are current",
  !projectLanguage.includes("OSGeo Community Project") &&
    projectLanguage.includes("OSGeo Project") &&
    projectLanguage.includes("TorchGeo-Bench") &&
    projectLanguage.includes("TerraTorch"),
);

// 3. Hero asset renders the Sentinel-2 scene.
const heroSceneOk = await page.locator(".hero-asset__scene").evaluate((el) => {
  const img = /** @type {HTMLImageElement} */ (el);
  return img.complete && img.naturalWidth > 0;
});
log("hero Sentinel-2 scene loaded", heroSceneOk);

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
await page.getByRole("tab", { name: "segmentation", exact: true }).click();
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

await page.getByRole("tab", { name: "detection", exact: true }).click();
await page.waitForTimeout(150);
const detText = await page.locator(".code-card__file").innerText();
log(
  "tab switches to detection",
  detText.startsWith("vhr10"),
  `file=${detText}`,
);

await page.getByRole("tab", { name: "classification", exact: true }).click();
await page.waitForTimeout(150);

// 6. Datasets section stays focused on two examples plus one docs link.
const datasetFigureCount = await page.locator(".dataset-figure").count();
const datasetReferenceCount = await page
  .locator("#datasets a", { hasText: "Browse all datasets" })
  .count();
log(
  "datasets section has two figures and a quiet reference link",
  datasetFigureCount === 2 && datasetReferenceCount === 1,
  `figures=${datasetFigureCount} references=${datasetReferenceCount}`,
);

// 7. Keep the quickstart focused on runnable examples, then surface talks.
const surfaceCount = await page.locator(".api-table tbody tr").count();
const communityContextBeforeDatasets = await page.evaluate(() => {
  const community = document.querySelector("#community");
  const sponsors = document.querySelector("#sponsors");
  const datasets = document.querySelector("#datasets");
  return Boolean(
    community &&
      sponsors &&
      datasets &&
      community.compareDocumentPosition(datasets) &
        Node.DOCUMENT_POSITION_FOLLOWING &&
      sponsors.compareDocumentPosition(datasets) &
        Node.DOCUMENT_POSITION_FOLLOWING,
  );
});
log(
  "quickstart omits module table and community context precedes datasets",
  surfaceCount === 0 && communityContextBeforeDatasets,
  `modules=${surfaceCount} communityFirst=${communityContextBeforeDatasets}`,
);

// 8. Model reference table has six entries.
const modelCount = await page.locator(".model-table tbody tr").count();
log("model table has 6 entries", modelCount === 6, `count=${modelCount}`);

// 9. Video carousel auto-scrolls (RAF drift) without manual buttons.
const carouselTrack = page.locator(".carousel-track").first();
await carouselTrack.scrollIntoViewIfNeeded();
const sl1 = await carouselTrack.evaluate((el) => el.scrollLeft);
await page.waitForTimeout(900);
const sl2 = await carouselTrack.evaluate((el) => el.scrollLeft);
log("video carousel auto-scrolls", sl2 > sl1, `scrollLeft ${sl1} → ${sl2}`);

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

// 10b. Research section reports the exact checked-in evidence snapshot.
const researchCopy = await page
  .locator("#research .evidence-summary")
  .innerText();
const researchRows = await page
  .locator("#research .compact-table tbody tr")
  .count();
const researchExplanations = await page
  .locator("#research .evidence-block > p")
  .count();
const lastContentSection = await page.evaluate(
  () => [...document.querySelectorAll("section[id]")].at(-1)?.id,
);
log(
  "research evidence is exact, compact, and last before footer navigation",
  researchCopy.includes(`${expectedCitationCount}`) &&
    researchCopy.includes(`${expectedDependentCount}`) &&
    researchRows === 16 &&
    researchExplanations === 0 &&
    lastContentSection === "research",
  `rows=${researchRows} explanations=${researchExplanations} last=${lastContentSection}`,
);

// 10c. Sponsor CTAs link to GitHub Sponsors (section + footer).
const sponsorHrefs = await page
  .locator("a[href*='github.com/sponsors/torchgeo']")
  .evaluateAll((els) => els.length);
log("sponsor links present", sponsorHrefs >= 2, `count=${sponsorHrefs}`);

// 10d. Footer BibTeX block
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
  yBefore === 0 && datasetsTop >= 64 && datasetsTop <= 96,
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
await m.locator(".docs-menu > summary").click();
const mobileDocsMenu = await m.locator(".docs-menu__panel").evaluate((el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    visible: rect.width > 0 && rect.height > 0,
  };
});
log(
  "mobile documentation menu fits the viewport",
  mobileDocsMenu.visible &&
    mobileDocsMenu.left >= 0 &&
    mobileDocsMenu.right <= 390,
  JSON.stringify(mobileDocsMenu),
);
const mobileWidths = await m.evaluate(() => ({
  viewport: window.innerWidth,
  document: document.documentElement.scrollWidth,
}));
log(
  "mobile page has no document-level horizontal overflow",
  mobileWidths.document === mobileWidths.viewport,
  `${mobileWidths.document}px document / ${mobileWidths.viewport}px viewport`,
);
await ctxMobile.close();

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll checks passed.`);
