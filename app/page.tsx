import Image from "next/image";
import type { SVGProps } from "react";

const installCommand = "pip install torchgeo";

const navigation = [
  { href: "https://torchgeo.readthedocs.io", label: "Docs" },
  { href: "https://github.com/microsoft/torchgeo", label: "GitHub" },
  { href: "https://pypi.org/project/torchgeo", label: "PyPI" },
  { href: "https://arxiv.org/abs/2111.08872", label: "Paper" },
];

const metrics = [
  { value: "50+", label: "benchmark datasets" },
  { value: "30+", label: "pretrained weights" },
  { value: "CRS-aware", label: "data handling" },
  { value: "Apache 2.0", label: "open source" },
];

const surfaces = [
  {
    eyebrow: "Datasets",
    title: "Geo-referenced loaders",
    description:
      "Raster and vector benchmarks with coordinates, metadata, and domain-specific conventions already handled.",
    Icon: DatasetIcon,
  },
  {
    eyebrow: "Samplers",
    title: "Spatially correct sampling",
    description:
      "Patch extraction and region-aware iteration that respect extent, scale, and geographic boundaries.",
    Icon: SamplerIcon,
  },
  {
    eyebrow: "Transforms",
    title: "Multispectral augmentation",
    description:
      "Kornia-compatible transforms for arbitrary band counts, not just RGB assumptions carried over from natural images.",
    Icon: TransformIcon,
  },
  {
    eyebrow: "Models",
    title: "Remote sensing priors",
    description:
      "Satellite-pretrained backbones and task-ready components that fit directly into PyTorch training loops.",
    Icon: ModelIcon,
  },
];

const principles = [
  {
    title: "Research-friendly defaults",
    description:
      "Clear APIs, reproducible dataset wrappers, and a narrow learning curve for teams already fluent in PyTorch.",
  },
  {
    title: "Built around Earth observation",
    description:
      "Coordinate reference systems, tiling, geospatial metadata, and multi-band imagery treated as first-class concerns.",
  },
  {
    title: "Modern, not over-designed",
    description:
      "Documentation, examples, and library surface arranged for fast orientation instead of startup-style visual noise.",
  },
];

const pipeline = [
  {
    step: "01",
    title: "Load",
    description:
      "Open satellite or aerial benchmarks with spatial metadata preserved.",
  },
  {
    step: "02",
    title: "Sample",
    description:
      "Generate geographic tiles and train-validation splits that match the study area.",
  },
  {
    step: "03",
    title: "Transform",
    description:
      "Apply augmentation and preprocessing across multispectral tensors, not just three channels.",
  },
  {
    step: "04",
    title: "Train",
    description:
      "Fine-tune pretrained models or build new ones inside familiar PyTorch workflows.",
  },
];

const gallery = [
  {
    src: "/brand/geodataset.png",
    alt: "TorchGeo dataset tooling preview",
    label: "Dataset tooling",
    title: "Training data with map context intact",
  },
  {
    src: "/brand/vhr10.png",
    alt: "High-resolution aerial imagery sample",
    label: "Aerial imagery",
    title: "High-resolution scenes for dense visual tasks",
  },
  {
    src: "/brand/inria.png",
    alt: "Urban segmentation sample",
    label: "Segmentation",
    title: "Urban footprint and land cover workflows",
  },
];

function DatasetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" strokeWidth="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" strokeWidth="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" strokeWidth="1.5" />
    </svg>
  );
}

function SamplerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M12 21s6-6.53 6-11.1A6 6 0 0 0 6 9.9C6 14.47 12 21 12 21Z"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.25" strokeWidth="1.5" />
    </svg>
  );
}

function TransformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" strokeWidth="1.5" />
      <path d="m4 11.5 8 4.5 8-4.5" strokeWidth="1.5" />
      <path d="m4 16.5 8 4.5 8-4.5" strokeWidth="1.5" />
    </svg>
  );
}

function ModelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="5" r="2" strokeWidth="1.5" />
      <circle cx="5" cy="12" r="2" strokeWidth="1.5" />
      <circle cx="19" cy="12" r="2" strokeWidth="1.5" />
      <circle cx="12" cy="19" r="2" strokeWidth="1.5" />
      <path
        d="M12 7v10M7 12h10M6.5 10.5 10 7M17.5 10.5 14 7"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M7 17 17 7" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 7h8v8" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <nav className="site-nav">
        <div className="shell nav-row">
          <a className="brand" href="/" aria-label="TorchGeo home">
            <Image
              src="/brand/torchgeo-logo.svg"
              alt="TorchGeo"
              width={168}
              height={48}
              priority
              unoptimized
              className="brand-logo"
            />
            <span className="brand-note">PyTorch geospatial library</span>
          </a>

          <div className="nav-links">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
            className="nav-cta"
          >
            Get started
          </a>
        </div>
      </nav>

      <main className="page">
        <section className="hero shell">
          <div className="hero-copy">
            <p className="kicker">PyTorch domain library for remote sensing</p>
            <h1>Geospatial deep learning, without geospatial glue code.</h1>
            <p className="hero-text">
              TorchGeo gives researchers and engineers CRS-aware datasets,
              spatial samplers, multispectral transforms, and pretrained models
              for satellite and aerial imagery.
            </p>

            <div className="hero-actions">
              <a
                href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
                className="button button-primary"
              >
                Read the guide
              </a>
              <a
                href="https://github.com/microsoft/torchgeo"
                className="button button-secondary"
              >
                View source
                <ArrowUpRightIcon className="button-icon" />
              </a>
            </div>

            <div className="install-card">
              <code>{installCommand}</code>
              <span>Apache 2.0 license. PyTorch-native API surface.</span>
            </div>
          </div>

          <div className="hero-panel">
            <article className="panel panel-code">
              <div className="panel-header">
                <span className="panel-label">Typical workflow</span>
                <span className="panel-meta">research notebook</span>
              </div>
              <pre className="code-block">
                <code>{`from torchgeo.datasets import EuroSAT
from torchgeo.samplers import RandomGeoSampler
from torchgeo.models import ResNet18_Weights, resnet18

dataset = EuroSAT(root="./data", download=True)
sampler = RandomGeoSampler(dataset, size=256, length=1000)
weights = ResNet18_Weights.SENTINEL2_ALL_MOCO
transforms = weights.transforms()
model = resnet18(weights=weights)`}</code>
              </pre>
            </article>

            <article className="panel panel-brief">
              <div className="panel-header">
                <span className="panel-label">Why teams use it</span>
                <span className="panel-meta">practical scope</span>
              </div>
              <div className="brief-grid">
                <div>
                  <strong>Classification</strong>
                  <span>scene and crop type benchmarks</span>
                </div>
                <div>
                  <strong>Segmentation</strong>
                  <span>land cover and footprint mapping</span>
                </div>
                <div>
                  <strong>Detection</strong>
                  <span>objects in satellite and aerial scenes</span>
                </div>
                <div>
                  <strong>Change</strong>
                  <span>temporal monitoring across revisits</span>
                </div>
              </div>
            </article>

            <figure className="panel panel-image">
              <Image
                src="/brand/geodataset.png"
                alt="TorchGeo sample imagery"
                width={1101}
                height={683}
                unoptimized
                className="hero-image"
              />
              <figcaption>
                Benchmark-ready imagery, from map coordinates to model input.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="metrics">
          <div className="shell metrics-grid">
            {metrics.map((item) => (
              <div key={item.label} className="metric">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section shell">
          <div className="section-intro">
            <p className="section-kicker">Library surface</p>
            <h2>Core pieces, arranged the way PyTorch users expect.</h2>
            <p>
              TorchGeo stays close to standard PyTorch ergonomics while handling
              the spatial rules that ordinary vision libraries ignore.
            </p>
          </div>

          <div className="surface-grid">
            {surfaces.map(({ Icon, ...item }) => (
              <article key={item.title} className="surface-card">
                <div className="surface-icon">
                  <Icon className="surface-icon-svg" />
                </div>
                <p className="surface-eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-muted">
          <div className="shell split-layout">
            <div className="section-intro section-intro-tight">
              <p className="section-kicker">Design principles</p>
              <h2>
                Solid, research-oriented, and easier to trust at a glance.
              </h2>
              <p>
                The site should feel closer to a strong scientific software
                project than a startup landing page. Clear claims. Clear entry
                points. Enough polish to feel current.
              </p>
            </div>

            <div className="principles">
              {principles.map((item) => (
                <article key={item.title} className="principle">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="section-intro">
            <p className="section-kicker">Workflow</p>
            <h2>From raw raster to trained model.</h2>
            <p>
              The path is simple, but the underlying geospatial details are not.
              TorchGeo carries them for you.
            </p>
          </div>

          <div className="pipeline">
            {pipeline.map((item) => (
              <article key={item.step} className="pipeline-step">
                <span className="pipeline-count">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell">
          <div className="section-intro">
            <p className="section-kicker">Examples</p>
            <h2>Imagery and tasks already in the library ecosystem.</h2>
            <p>
              Existing benchmarks and example workflows make the project legible
              for both first-time users and experienced remote sensing groups.
            </p>
          </div>

          <div className="gallery">
            {gallery.map((item) => (
              <article key={item.title} className="gallery-card">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1101}
                  height={683}
                  loading="eager"
                  unoptimized
                  className="gallery-image"
                />
                <div className="gallery-copy">
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="shell">
          <div className="cta">
            <div>
              <p className="section-kicker section-kicker-on-dark">
                Start here
              </p>
              <h2>Install TorchGeo and move straight to the data pipeline.</h2>
              <p>
                Documentation, tutorials, paper, and source code all in one
                place.
              </p>
            </div>

            <div className="cta-actions">
              <code>{installCommand}</code>
              <a
                href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
                className="button button-light"
              >
                Open documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-row">
          <div>
            <Image
              src="/brand/torchgeo-logo.svg"
              alt="TorchGeo"
              width={140}
              height={40}
              unoptimized
              className="footer-logo"
            />
            <p className="footer-text">Geospatial deep learning for PyTorch.</p>
          </div>

          <div className="footer-links">
            <a href="https://torchgeo.readthedocs.io">Documentation</a>
            <a href="https://github.com/microsoft/torchgeo">GitHub</a>
            <a href="https://pypi.org/project/torchgeo">PyPI</a>
            <a href="https://arxiv.org/abs/2111.08872">Paper</a>
          </div>

          <p className="footer-text footer-text-right">
            © {new Date().getFullYear()} TorchGeo contributors.
          </p>
        </div>
      </footer>
    </>
  );
}
