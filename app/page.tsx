import Image from "next/image";
import type { SVGProps } from "react";
import { CodeTabs } from "./code-tabs";
import { CompareSlider } from "./compare-slider";
import { HeroMosaic } from "./hero-mosaic";
import { type Video, VideoCarousel } from "./video-carousel";

const navigation = [
  { href: "https://torchgeo.readthedocs.io", label: "Docs" },
  { href: "#datasets", label: "Datasets" },
  { href: "#models", label: "Models" },
  { href: "#community", label: "Community" },
];

const surfaces = [
  {
    index: "01 · datasets",
    name: "torchgeo.datasets",
    desc: "Geo-referenced raster & vector datasets with CRS, metadata, and download handling built in.",
    count: "100+",
    countLabel: "benchmark + geospatial",
    href: "https://torchgeo.readthedocs.io/en/stable/api/datasets.html",
  },
  {
    index: "02 · samplers",
    name: "torchgeo.samplers",
    desc: "Spatially-aware samplers that iterate over geographic extents — random, grid, pre-chipped.",
    count: "single",
    countLabel: "+ batched",
    href: "https://torchgeo.readthedocs.io/en/stable/api/samplers.html",
  },
  {
    index: "03 · transforms",
    name: "torchgeo.transforms",
    desc: "Kornia-compatible augmentations for arbitrary band counts. Indices, normalization, geometry.",
    count: "n-band",
    countLabel: "multispectral safe",
    href: "https://torchgeo.readthedocs.io/en/stable/api/transforms.html",
  },
  {
    index: "04 · models",
    name: "torchgeo.models",
    desc: "Satellite-pretrained backbones & task heads. ResNet, ViT, Swin, DOFA, Prithvi, ScaleMAE.",
    count: "40+",
    countLabel: "pretrained weights",
    href: "https://torchgeo.readthedocs.io/en/stable/api/models.html",
  },
  {
    index: "05 · datamodules",
    name: "torchgeo.datamodules",
    desc: "Lightning datamodules wrapping splits, transforms, and samplers — one import per benchmark.",
    count: "ready",
    countLabel: "to train",
    href: "https://torchgeo.readthedocs.io/en/stable/api/datamodules.html",
  },
  {
    index: "06 · trainers",
    name: "torchgeo.trainers",
    desc: "Lightning trainers for classification, segmentation, regression, change & object detection.",
    count: "task",
    countLabel: "modules",
    href: "https://torchgeo.readthedocs.io/en/stable/api/trainers.html",
  },
];

const models = [
  {
    name: "DOFA",
    bands: "Any · 1–13 ch",
    desc: "A single ViT trained on Sentinel-1, Sentinel-2, NAIP, Gaofen, and EnMAP — wavelength-conditioned.",
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
    desc: "GSD-conditioned MAE — the same backbone reasons across 0.3 m to 30 m without retraining.",
    sensor: "Aerial / VHR",
    sensorDot: "#E8B33C",
  },
  {
    name: "SatMAE",
    bands: "S2 · 13 ch",
    desc: "MAE pretrained on temporal Sentinel-2 stacks. Strong on land cover and crop-type tasks.",
    sensor: "Sentinel-2",
    sensorDot: "#2EE5A2",
  },
  {
    name: "SeCo",
    bands: "S2 · 13 ch",
    desc: "Seasonal-contrast pretraining over a million Sentinel-2 image pairs — first-class baseline.",
    sensor: "Sentinel-2",
    sensorDot: "#2EE5A2",
  },
  {
    name: "SSL4EO",
    bands: "S1 + S2 · 15 ch",
    desc: "A 1M-image SSL benchmark — DINO, MoCo, MAE, Data2Vec checkpoints all under one API.",
    sensor: "SAR + optical",
    sensorDot: "#6BE5D6",
  },
];

const partners = [
  { src: "/partners/ai4g_dark.svg", alt: "Microsoft AI for Good" },
  { src: "/partners/tum_dark.svg", alt: "Technical University of Munich" },
  { src: "/partners/tg_dark.svg", alt: "Taylor Geospatial Institute" },
  { src: "/partners/space42_dark.svg", alt: "Space42" },
  { src: "/partners/ibm.svg", alt: "IBM" },
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
            <a
              className="btn btn--primary"
              href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
            >
              Get started
              <ArrowUpRightIcon className="arrow" />
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__copy">
            <span className="kicker">PyTorch domain library · est. 2021</span>
            <h1 className="hero__title">
              Geospatial deep learning,
              <br />
              without the <em>glue&nbsp;code</em>.
            </h1>
            <p className="hero__lead">
              Satellite imagery isn't just computer vision with bigger pictures
              —{" "}
              <a href="https://arxiv.org/abs/2402.01444">
                it is a distinct modality
              </a>{" "}
              with its own geometry, statistics, and metadata. TorchGeo gives
              PyTorch first-class primitives for it: CRS-aware datasets, spatial
              samplers, multispectral transforms, and pretrained models.
            </p>

            <div className="hero__actions">
              <a
                className="btn btn--orange"
                href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
              >
                Read the guide
                <ArrowUpRightIcon className="arrow" />
              </a>
              <a
                className="btn btn--ghost"
                href="https://github.com/torchgeo/torchgeo"
              >
                View on GitHub
              </a>
              <a
                className="btn btn--ghost"
                href="https://arxiv.org/abs/2111.08872"
              >
                Read the paper
              </a>
            </div>
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
              <span className="install__chip">
                <span className="dot" /> MIT licensed
              </span>
              <span className="install__chip">Python 3.11+</span>
              <span className="install__chip">PyTorch 2.4+</span>
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
          <div className="section__head">
            <div>
              <span className="kicker">Three tasks · ten lines</span>
              <h2 className="section-title">
                A complete pipeline, from a fresh interpreter.
              </h2>
            </div>
            <div className="section__head-right">
              <p className="section-lead">
                Every TorchGeo dataset returns a dictionary of tensors. Every
                sampler yields geographic windows. Every model accepts arbitrary
                band counts. The same loop trains classification, segmentation,
                and detection.
              </p>
            </div>
          </div>
          <CodeTabs />
        </div>
      </section>

      <section className="section" id="api">
        <div className="shell">
          <div className="section__head">
            <div>
              <span className="kicker">Library surface</span>
              <h2 className="section-title">
                Six modules. Standard PyTorch on either side.
              </h2>
            </div>
            <div className="section__head-right">
              <p className="section-lead">
                Each module composes with the rest. A dataset feeds a sampler; a
                sampler feeds a dataloader; a model trains on the dataloader.
                The boundaries match torchvision's — read its docs and you
                already half-know TorchGeo.
              </p>
            </div>
          </div>

          <div className="surface-grid">
            {surfaces.map((s) => (
              <a key={s.name} className="surface-card" href={s.href}>
                <div className="surface-card__head">
                  <span className="surface-card__index">{s.index}</span>
                </div>
                <h3 className="surface-card__name">{s.name}</h3>
                <p className="surface-card__desc">{s.desc}</p>
                <span className="surface-card__count">
                  <strong>{s.count}</strong> · {s.countLabel}
                </span>
                <ArrowUpRightIcon className="surface-card__arrow" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="datasets">
        <div className="shell">
          <div className="section__head">
            <div>
              <span className="kicker">Featured datasets</span>
              <h2 className="section-title">
                Real imagery, not curated thumbnails.
              </h2>
            </div>
            <div className="section__head-right">
              <p className="section-lead">
                A sample of what ships in <code>torchgeo.datasets</code> — Inria
                Aerial Image Labeling, NWPU VHR-10, and a hundred more. Hover
                the building footprints to reveal the mask; drag the slider on
                Inria to compare imagery and ground truth.
              </p>
            </div>
          </div>

          <div className="datasets">
            <div className="dataset dataset--wide">
              <CompareSlider
                src="/brand/inria.png"
                alt="Inria Aerial Image Labeling — 0.3 m/px imagery vs. building mask"
                labelA="RGB · 0.3 m/px"
                labelB="Building mask"
              />
              <div className="dataset__corner">
                <span className="d-dot" /> Inria · drag to compare
              </div>
            </div>

            <div className="dataset dataset--tall" id="vhr-card">
              <Image
                className="dataset__a"
                src="/brand/vhr10.png"
                alt="VHR-10 base aerial imagery"
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                unoptimized
              />
              <Image
                className="dataset__b"
                src="/brand/vhr10.png"
                alt="VHR-10 with detection overlays"
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                unoptimized
              />
              <div className="dataset__corner">
                <span className="d-dot" /> VHR-10 · hover to reveal
              </div>
              <div className="dataset__caption">
                <div>
                  <h4>NWPU VHR-10</h4>
                  <p>Mask R-CNN · 10 classes · 800 scenes</p>
                </div>
                <span className="dataset__hint">Object detection</span>
              </div>
            </div>

            <a
              className="dataset dataset--wide dataset--browse"
              href="https://torchgeo.readthedocs.io/en/stable/api/datasets.html"
            >
              <div>
                <div className="browse__num">+ 100 more</div>
                <div className="browse__list">
                  EuroSAT · BigEarthNet · So2Sat · SpaceNet · xBD ·<br />
                  SEN12MS · RESISC45 · OSCD · MillionAID · LEVIR-CD · …
                </div>
              </div>
              <div className="dataset__corner">
                <span className="d-dot" /> All datasets
              </div>
              <div className="dataset__caption">
                <div>
                  <h4>The full catalog</h4>
                  <p>SAR · multispectral · hyperspectral · LiDAR</p>
                </div>
                <span className="dataset__hint">Browse →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="models">
        <div className="shell">
          <div className="section__head">
            <div>
              <span className="kicker">Pretrained weights</span>
              <h2 className="section-title">
                Foundation models for satellite imagery.
              </h2>
            </div>
            <div className="section__head-right">
              <p className="section-lead">
                Drop-in replacements for ImageNet weights, trained on
                multispectral, SAR, and hyperspectral inputs. Each one ships
                with the dataset it was trained on, the spectral bands it
                expects, and a one-line constructor.
              </p>
            </div>
          </div>

          <div className="models">
            {models.map((m) => (
              <div key={m.name} className="model">
                <div className="model__head">
                  <h3 className="model__name">{m.name}</h3>
                  <span className="model__bands">{m.bands}</span>
                </div>
                <p className="model__desc">{m.desc}</p>
                <div className="model__meta">
                  <span
                    className="sat-dot"
                    style={{ background: m.sensorDot }}
                  />
                  {m.sensor}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <a
              className="btn btn--ghost"
              href="https://torchgeo.readthedocs.io/en/stable/api/models.html"
            >
              Browse all checkpoints
              <ArrowUpRightIcon className="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="community">
        <div className="shell">
          <div className="section__head">
            <div>
              <span className="kicker">Talks &amp; tutorials</span>
              <h2 className="section-title">From the community.</h2>
            </div>
            <div className="section__head-right">
              <p className="section-lead">
                Conference talks, podcast episodes, and end-to-end tutorials
                from the TorchGeo community. Click any tile to watch on YouTube.
              </p>
            </div>
          </div>
          <VideoCarousel videos={videos} autoPlay />
        </div>
      </section>

      <section className="partners" id="partners">
        <div className="shell partners__inner">
          <div className="partners__copy">
            <span className="kicker" style={{ color: "var(--mask-mint)" }}>
              The TorchGeo Organization
            </span>
            <h3>
              An independent, self-governing project — stewarded by five member
              organizations.
            </h3>
            <p>
              TorchGeo started as an internship project at the Microsoft AI for
              Good Lab in 2021. It has since grown into a multi-org
              collaboration with contributors across academia, industry, and
              government.
            </p>
            <a
              className="btn btn--inverse"
              href="https://github.com/torchgeo/torchgeo/blob/main/GOVERNANCE.md"
            >
              Read the charter
              <ArrowUpRightIcon className="arrow" />
            </a>
          </div>
          <div className="partners__grid">
            {partners.map((p) => (
              <div key={p.src} className="partner">
                {/* biome-ignore lint/performance/noImgElement: SVG asset, no need for next/image */}
                <img src={p.src} alt={p.alt} />
              </div>
            ))}
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
                A PyTorch domain library for geospatial deep learning.
                MIT-licensed. Built in the open.
              </p>
            </div>
            <div className="footer__col">
              <h5>Project</h5>
              <ul>
                <li>
                  <a href="https://torchgeo.readthedocs.io">Documentation</a>
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
              </ul>
            </div>
            <div className="footer__col">
              <h5>Community</h5>
              <ul>
                <li>
                  <a href="https://www.youtube.com/@TorchGeo">YouTube</a>
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
              </ul>
            </div>
            <div className="footer__col">
              <h5>Cite</h5>
              <ul>
                <li>
                  <a href="https://arxiv.org/abs/2111.08872">arXiv paper</a>
                </li>
                <li>
                  <a href="https://www.osgeo.org/projects/torchgeo/">OSGeo</a>
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
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
