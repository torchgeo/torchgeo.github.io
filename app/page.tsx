import Image from "next/image";
import type { SVGProps } from "react";
import citationsData from "../public/data/torchgeo_citations.json";
import dependentsData from "../public/data/torchgeo_dependents.json";
import { CodeTabs } from "./code-tabs";
import { HeroMosaic } from "./hero-mosaic";
import { type Video, VideoCarousel } from "./video-carousel";

const SPONSOR_URL = "https://github.com/sponsors/torchgeo";
const TORCHGEO_DOCS_URL = "https://docs.torchgeo.org/en/stable/";
const TORCHGEO_BENCH_DOCS_URL = "https://torchgeo.org/torchgeo-bench/";
const TERRATORCH_DOCS_URL = "https://torchgeo.org/terratorch/";
const GET_STARTED_URL =
  "https://docs.torchgeo.org/en/stable/tutorials/getting_started.html";
const SLACK_URL =
  "https://torchgeo.slack.com/join/shared_invite/zt-22rse667m-eqtCeNW0yI000Tl4B~2PIw";

const navigation = [
  { href: "#community", label: "Tutorials" },
  { href: "#sponsors", label: "Members" },
  { href: "#datasets", label: "Datasets" },
  { href: "#models", label: "Models" },
  { href: "#research", label: "Research" },
];

const models = [
  {
    name: "DOFA",
    bands: "Any · 1–13 ch",
    desc: "Wavelength-conditioned ViT pretrained on Sentinel-1, Sentinel-2, NAIP, Gaofen, and EnMAP.",
    sensor: "Multi-sensor",
    sensorDot: "#6FB46A",
  },
  {
    name: "Prithvi",
    bands: "HLS · 6 ch",
    desc: "IBM × NASA's masked-autoencoder ViT, fine-tuned for floods, wildfires, and crop classification.",
    sensor: "HLS L30/S30",
    sensorDot: "#1F4F8B",
  },
  {
    name: "Scale-MAE",
    bands: "RGB · 3 ch",
    desc: "Ground-sample-distance-conditioned masked autoencoder for imagery from 0.3 m to 30 m.",
    sensor: "Aerial / VHR",
    sensorDot: "#E8B33C",
  },
  {
    name: "SatMAE",
    bands: "S2 · 13 ch",
    desc: "Masked autoencoder pretrained on temporal Sentinel-2 stacks.",
    sensor: "Sentinel-2",
    sensorDot: "#2EE5A2",
  },
  {
    name: "SeCo",
    bands: "S2 · 13 ch",
    desc: "Seasonal-contrast pretraining over one million Sentinel-2 image pairs.",
    sensor: "Sentinel-2",
    sensorDot: "#3CC0A8",
  },
  {
    name: "SSL4EO",
    bands: "S1 + S2 · 15 ch",
    desc: "DINO, MoCo, MAE, and Data2Vec checkpoints trained on one million Sentinel-1 and Sentinel-2 images.",
    sensor: "SAR + optical",
    sensorDot: "#6BC5E5",
  },
];

// Member organizations. `light` variants render against paper; `dark`
// variants (white logos) render against the navy sponsors section.
const members = [
  {
    light: "/partners/ai4g_light.svg",
    dark: "/partners/ai4g_dark.svg",
    alt: "Microsoft AI for Good",
    name: "Microsoft AI for Good",
    role: "Founding org",
  },
  {
    light: "/partners/tum_light.svg",
    dark: "/partners/tum_dark.svg",
    alt: "Technical University of Munich",
    name: "TU Munich",
    role: "Member",
  },
  {
    light: "/partners/tg_light.svg",
    dark: "/partners/tg_dark.svg",
    alt: "Taylor Geospatial",
    name: "Taylor Geospatial",
    role: "Member",
  },
  {
    light: "/partners/space42_light.svg",
    dark: "/partners/space42_dark.svg",
    alt: "Space42",
    name: "Space42",
    role: "Member",
  },
  {
    light: "/partners/ibm.svg",
    dark: "/partners/ibm.svg",
    alt: "IBM",
    name: "IBM Research",
    role: "Member",
  },
];

const videos: Video[] = [
  {
    id: "0HfykJa-foE",
    title: "TorchGeo 1.0 with Adam Stewart",
    author: "Robin Cole",
  },
  {
    id: "ET8Hb_HqNJQ",
    title: "TorchGeo with Caleb Robinson",
    author: "Robin Cole",
  },
  {
    id: "R_FhY8aq708",
    title: "IADF School 2022: Change Detection with TorchGeo",
    author: "IEEE GRSS",
  },
  {
    id: "agjX8yUYbyI",
    title: "TorchGeo Experiments EP 1",
    author: "Open Geospatial Solutions",
  },
  {
    id: "W9sTUG7Ok58",
    title: "Deep Learning with TorchGeo: SemanticSegmentationTask",
    author: "Wycology",
  },
  {
    id: "WZdw7uxUCOM",
    title: "End-to-end geospatial semantic segmentation (Part 1)",
    author: "Maurício Cordeiro",
  },
  {
    id: "9Lsj7dlnn8A",
    title: "End-to-end geospatial semantic segmentation (Part 2)",
    author: "Maurício Cordeiro",
  },
  {
    id: "vRT8VRt_9NU",
    title: "TorchGeo + U-Net for Building Footprints (Part 1)",
    author: "Courage Kamusoko",
  },
  {
    id: "zLH8eRdyl1A",
    title: "TorchGeo + U-Net for Building Footprints (Part 2)",
    author: "Courage Kamusoko",
  },
];

// --- Static derivations from the checked-in citation snapshot ---------------
type CitationPaper = {
  title?: string;
  year?: number;
  venue?: string | null;
  citedByCount?: number | null;
  authors?: { affiliations?: string[] | null }[];
};
const citingPapers = (citationsData.papers ?? []) as CitationPaper[];
const citingDisplay = citingPapers.length;
// Top institutions by paper-count. Drops sub-unit affiliations (departments,
// schools, labs) so only the host org names surface, normalizes punctuation
// noise, and de-dupes per paper.
const SUB_UNIT_RE =
  /^(department|school|chair|laboratoire|laboratory|faculty|institute of|center for|centre for|college of|division of)\b/i;
const normalizeInst = (raw: string) =>
  raw
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\bK\.?\s*N\.?\s*Toosi\b/i, "K. N. Toosi")
    .replace(/\s+/g, " ")
    .trim();
const instCounts = new Map<string, number>();
for (const p of citingPapers) {
  const seen = new Set<string>();
  for (const a of p.authors ?? []) {
    for (const af of a.affiliations ?? []) {
      const head = af.split(",")[0];
      if (!head || SUB_UNIT_RE.test(head.trim())) continue;
      const inst = normalizeInst(head);
      if (!inst || seen.has(inst)) continue;
      seen.add(inst);
      instCounts.set(inst, (instCounts.get(inst) ?? 0) + 1);
    }
  }
}
const topInstitutions = Array.from(instCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([name, papers]) => ({ name, papers }));

// --- Dependents (projects that import torchgeo) -----------------------------
type Dependent = {
  repo: string;
  url: string;
  stars: number;
  description: string;
};
const dependents = (dependentsData.projects ?? []) as Dependent[];
const dependentsCount = dependentsData.total_projects ?? dependents.length;
const dependentsOrgCount = dependentsData.total_orgs ?? 0;
const topDependents = [...dependents]
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 8);

const bibtex = `@article{stewart2022torchgeo,
  title   = {TorchGeo: Deep Learning With Geospatial Data},
  author  = {Stewart, Adam J. and Robinson, Caleb and Corley, Isaac A.
             and Ortiz, Anthony and Lavista Ferres, Juan M. and Banerjee, Arindam},
  journal = {Proceedings of the 30th International Conference on
             Advances in Geographic Information Systems},
  year    = {2022},
  doi     = {10.1145/3557915.3560953}
}`;

function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M5 11L11 5M6 5h5v5" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5C1.6 4.3.8 5.1.5 6.2 0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z" />
    </svg>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 14.5s-5.5-3.4-5.5-7.5A3.2 3.2 0 0 1 5.7 3.8c1 0 1.8.5 2.3 1.3.5-.8 1.3-1.3 2.3-1.3a3.2 3.2 0 0 1 3.2 3.2c0 4.1-5.5 7.5-5.5 7.5z" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="shell topbar__inner">
          <a className="topbar__brand" href="/" aria-label="TorchGeo home">
            <Image
              src="/brand/torchgeo-logo.svg"
              alt="TorchGeo"
              width={142}
              height={40}
              priority
              unoptimized
            />
          </a>
          <nav className="topbar__nav" aria-label="Primary">
            {navigation.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="topbar__cluster">
            <a
              className="icon-btn"
              href="https://github.com/torchgeo/torchgeo"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
            <details className="docs-menu">
              <summary className="btn btn--primary topbar__docs">
                Docs
                <ChevronDownIcon className="docs-menu__chevron" />
              </summary>
              <div className="docs-menu__panel">
                <a href={TORCHGEO_DOCS_URL}>
                  <span>
                    <strong>TorchGeo</strong>
                    <small>Datasets, samplers, and models</small>
                  </span>
                  <ArrowUpRightIcon />
                </a>
                <a href={TORCHGEO_BENCH_DOCS_URL}>
                  <span>
                    <strong>TorchGeo-Bench</strong>
                    <small>Reproducible model evaluation</small>
                  </span>
                  <ArrowUpRightIcon />
                </a>
                <a href={TERRATORCH_DOCS_URL}>
                  <span>
                    <strong>TerraTorch</strong>
                    <small>Foundation-model fine-tuning</small>
                  </span>
                  <ArrowUpRightIcon />
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__copy">
            <span className="kicker">
              PyTorch ecosystem library · OSGeo project
            </span>
            <h1 className="hero__title">
              Geospatial data and models for PyTorch.
            </h1>
            <p className="hero__lead">
              TorchGeo provides CRS-aware datasets and samplers, multispectral
              transforms, and pretrained weights for satellite and aerial
              imagery. Its interfaces compose with PyTorch and Lightning.
              TorchGeo, <a href={TORCHGEO_BENCH_DOCS_URL}>TorchGeo-Bench</a>,
              and <a href={TERRATORCH_DOCS_URL}>TerraTorch</a> are projects of
              the independent TorchGeo Organization.
            </p>

            <div className="hero__actions">
              <a className="btn btn--orange" href={GET_STARTED_URL}>
                Read the documentation
                <ArrowUpRightIcon className="arrow" />
              </a>
              <a
                className="hero__text-link"
                href="https://github.com/torchgeo/torchgeo"
              >
                GitHub
                <ArrowUpRightIcon className="arrow" />
              </a>
              <a
                className="hero__text-link"
                href="https://arxiv.org/abs/2111.08872"
              >
                Paper
                <ArrowUpRightIcon className="arrow" />
              </a>
            </div>
            <p className="hero__citation">
              Stewart et al.{" "}
              <cite>TorchGeo: Deep Learning with Geospatial Data.</cite> ACM
              SIGSPATIAL 2022.{" "}
              <a href="https://doi.org/10.1145/3557915.3560953">
                doi:10.1145/3557915.3560953
              </a>
            </p>
          </div>

          <div className="hero__visual">
            <HeroMosaic />
          </div>
        </div>

        <div className="install">
          <div className="shell install__inner">
            <div className="install__cmd">
              <span className="prompt">$</span>
              <span>pip install torchgeo</span>
            </div>
            <div className="install__meta">
              <a
                className="install__chip install__release"
                href="https://github.com/torchgeo/torchgeo/releases/tag/v0.9.0"
              >
                v0.9.0 · Feb 2026
              </a>
              <span className="install__chip">
                <span className="dot" /> MIT licensed
              </span>
              <span className="install__chip">Python 3.12+</span>
              <span className="install__chip">PyTorch 2.2+</span>
              <span className="install__chip">
                <a
                  href="https://www.osgeo.org/projects/torchgeo/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  OSGeo project
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="quickstart">
        <div className="shell">
          <div className="section__head section__head--split">
            <span className="kicker">Quickstart</span>
            <h2 className="section-title">
              CRS-aware training workflows for classification, segmentation, and
              detection.
            </h2>
            <p className="section-lead">
              Datasets return tensor dicts, samplers yield geographic windows,
              and models accept arbitrary band counts. The interfaces follow
              familiar PyTorch and <code>torchvision</code> conventions.
            </p>
          </div>
          <CodeTabs />
        </div>
      </section>

      <section className="section" id="community">
        <div className="shell">
          <div className="section__head section__head--split">
            <span className="kicker">Talks &amp; tutorials</span>
            <h2 className="section-title">
              Talks and tutorials from TorchGeo users.
            </h2>
            <p className="section-lead">
              Recorded sessions cover releases, semantic segmentation, change
              detection, and end-to-end geospatial training workflows.
            </p>
          </div>
          <VideoCarousel videos={videos} autoPlay />
        </div>
      </section>

      <section className="sponsors" id="sponsors">
        <div className="shell sponsors__inner">
          <div className="sponsors__copy">
            <span className="kicker kicker--mint">
              The TorchGeo Organization
            </span>
            <h3>
              Stewarded by Microsoft AI for Good, TU Munich, Taylor Geospatial,
              Space42, and IBM Research.
            </h3>
            <p>
              Founded at Microsoft AI for Good in 2021, TorchGeo is now an
              independent OSGeo Project. The TorchGeo Organization governs
              TorchGeo, <a href={TORCHGEO_BENCH_DOCS_URL}>TorchGeo-Bench</a>,
              and <a href={TERRATORCH_DOCS_URL}>TerraTorch</a> in public.
              Sponsorships fund maintainer time, model checkpoints, dataset
              hosting, and workshops.
            </p>
            <div className="sponsors__actions">
              <a className="btn btn--orange" href={SPONSOR_URL}>
                <HeartIcon className="heart" /> Become a sponsor
                <ArrowUpRightIcon className="arrow" />
              </a>
              <a
                className="btn btn--inverse"
                href="https://github.com/torchgeo/governance"
              >
                Read the governance
                <ArrowUpRightIcon className="arrow" />
              </a>
            </div>
          </div>
          <div className="sponsors__grid">
            {members.map((p) => (
              <div key={p.alt} className="sponsors__cell">
                {/* biome-ignore lint/performance/noImgElement: SVG asset */}
                <img
                  src={p.dark}
                  alt={p.alt}
                  data-name={p.name.toLowerCase().replace(/\s+/g, "-")}
                />
                <span className="sponsors__role">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="datasets">
        <div className="shell">
          <div className="section__head section__head--split">
            <span className="kicker">Datasets</span>
            <h2 className="section-title">
              100+ datasets in <code>torchgeo.datasets</code>.
            </h2>
            <p className="section-lead">
              Dataset classes preserve coordinate reference systems, spatial
              bounds, and acquisition metadata while exposing standard PyTorch
              dataset interfaces.
            </p>
          </div>

          <div className="datasets datasets--editorial">
            <figure className="dataset-figure">
              <div className="dataset__media">
                <Image
                  src="/brand/inria.png"
                  alt="Inria Aerial Image Labeling — 0.3 m/px imagery and building mask"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  unoptimized
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
              <figcaption className="dataset__caption">
                <div>
                  <h4>Inria Aerial Image Labeling</h4>
                  <p>
                    0.3 m aerial imagery · building footprints · five cities
                  </p>
                </div>
                <span className="dataset__task">Semantic segmentation</span>
              </figcaption>
            </figure>

            <figure className="dataset-figure">
              <div className="dataset__media">
                <Image
                  src="/brand/vhr10.png"
                  alt="NWPU VHR-10 detection sample"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  unoptimized
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
              <figcaption className="dataset__caption">
                <div>
                  <h4>NWPU VHR-10</h4>
                  <p>Mask R-CNN · 10 classes · 800 scenes</p>
                </div>
                <span className="dataset__task">Object detection</span>
              </figcaption>
            </figure>
          </div>
          <div className="section__cta">
            <a
              className="text-link"
              href="https://docs.torchgeo.org/en/stable/api/datasets.html"
            >
              Browse all datasets <ArrowUpRightIcon />
            </a>
          </div>
        </div>
      </section>

      <section className="section reference-section" id="models">
        <div className="shell">
          <div className="section__head section__head--split">
            <span className="kicker">Pretrained weights</span>
            <h2 className="section-title">
              Pretrained backbones for satellite imagery.
            </h2>
            <p className="section-lead">
              Checkpoint definitions record the expected sensors, bands, and
              preprocessing so weights can be loaded without discarding input
              metadata.
            </p>
          </div>

          <div className="table-scroll">
            <table className="research-table model-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Input</th>
                  <th>Pretraining and architecture</th>
                  <th>Sensor domain</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.name}>
                    <th scope="row">
                      <code>{m.name}</code>
                    </th>
                    <td>
                      <span className="table-mono">{m.bands}</span>
                    </td>
                    <td>{m.desc}</td>
                    <td>{m.sensor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section__cta">
            <a
              className="text-link"
              href="https://docs.torchgeo.org/en/stable/api/models.html"
            >
              Browse all checkpoints
              <ArrowUpRightIcon className="arrow" />
            </a>
          </div>
        </div>
      </section>

      {/* Research adoption: papers citing TorchGeo + projects depending on it.
          Sourced from public/data/torchgeo_citations.json and
          public/data/torchgeo_dependents.json. */}
      <section className="research reference-section" id="research">
        <div className="shell">
          <div className="section__head research__head">
            <span className="kicker">Research use</span>
            <h2 className="section-title">
              Published work and public projects using TorchGeo.
            </h2>
          </div>

          <dl className="evidence-summary">
            <div>
              <dt>{citingDisplay}</dt>
              <dd>unique citing works</dd>
            </div>
            <div>
              <dt>{dependentsCount}</dt>
              <dd>public dependent projects</dd>
            </div>
            <div>
              <dt>{dependentsOrgCount}</dt>
              <dd>organizations represented</dd>
            </div>
          </dl>

          <div className="evidence-grid">
            <div className="evidence-block">
              <h3>Institutions in citing-work metadata</h3>
              <table className="research-table compact-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>Papers</th>
                  </tr>
                </thead>
                <tbody>
                  {topInstitutions.map((institution) => (
                    <tr key={institution.name}>
                      <td>{institution.name}</td>
                      <td className="numeric">{institution.papers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a
                className="text-link"
                href="https://scholar.google.com/scholar?cites=1909341217001100103"
              >
                Citing work <ArrowUpRightIcon />
              </a>
            </div>
            <div className="evidence-block">
              <h3>Public dependent repositories</h3>
              <table className="research-table compact-table">
                <thead>
                  <tr>
                    <th>Repository</th>
                    <th>Stars</th>
                  </tr>
                </thead>
                <tbody>
                  {topDependents.map((d) => (
                    <tr key={d.repo}>
                      <td>
                        <a href={d.url}>{d.repo}</a>
                      </td>
                      <td className="numeric">
                        {d.stars.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a
                className="text-link"
                href="https://github.com/microsoft/torchgeo/network/dependents"
              >
                Dependency graph <ArrowUpRightIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          <div className="footer__top">
            <div className="footer__brand">
              <Image
                src="/brand/torchgeo-logo.svg"
                alt="TorchGeo"
                width={142}
                height={40}
                unoptimized
              />
              <p>
                An official PyTorch Ecosystem Library for geospatial deep
                learning. MIT-licensed, developed in the open as an OSGeo
                Project.
              </p>
              <details className="footer__cite">
                <summary className="footer__cite-head">
                  <span className="eyebrow">Cite TorchGeo</span>
                  <a
                    className="footer__cite-link"
                    href="https://arxiv.org/abs/2111.08872"
                  >
                    arXiv:2111.08872
                    <ArrowUpRightIcon className="arrow" />
                  </a>
                </summary>
                <pre className="footer__bibtex">
                  <code>{bibtex}</code>
                </pre>
              </details>
            </div>
            <div className="footer__col">
              <h5>Project</h5>
              <ul>
                <li>
                  <a href={TORCHGEO_DOCS_URL}>Documentation</a>
                </li>
                <li>
                  <a href="https://github.com/torchgeo/torchgeo">GitHub</a>
                </li>
                <li>
                  <a href="https://pypi.org/project/torchgeo">PyPI</a>
                </li>
                <li>
                  <a href="https://huggingface.co/torchgeo">Hugging Face</a>
                </li>
                <li>
                  <a href="https://www.osgeo.org/projects/torchgeo/">OSGeo</a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <h5>Community</h5>
              <ul>
                <li>
                  <a href={SLACK_URL}>Slack</a>
                </li>
                <li>
                  <a href="https://github.com/torchgeo/torchgeo/discussions">
                    Discussions
                  </a>
                </li>
                <li>
                  <a href="https://github.com/torchgeo/torchgeo/blob/main/CONTRIBUTING.md">
                    Contribute
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@TorchGeo">YouTube</a>
                </li>
                <li>
                  <a href="https://github.com/torchgeo/torchgeo/blob/main/CODE_OF_CONDUCT.md">
                    Code of Conduct
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <h5>Sponsor</h5>
              <ul>
                <li>
                  <a href={SPONSOR_URL}>GitHub Sponsors</a>
                </li>
                <li>
                  <a href="https://github.com/torchgeo/governance">
                    Governance
                  </a>
                </li>
                <li>
                  <a href="mailto:torchgeo@googlegroups.com">Get in touch</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="footer__legal">
              © 2021–{new Date().getFullYear()} The TorchGeo Authors · MIT
            </span>
            <div className="footer__social">
              <a
                className="icon-btn"
                href="https://github.com/torchgeo/torchgeo"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                className="icon-btn"
                href="https://www.youtube.com/@TorchGeo"
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </a>
              <a
                className="icon-btn"
                href={SPONSOR_URL}
                aria-label="Sponsor TorchGeo"
              >
                <HeartIcon />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
