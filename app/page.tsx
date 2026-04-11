import Image from "next/image";
import type { SVGProps } from "react";
import { type Video, VideoCarousel } from "./video-carousel";

const installCommand = "pip install torchgeo";

const navigation = [
  { href: "https://torchgeo.readthedocs.io", label: "Docs" },
  { href: "https://github.com/torchgeo/torchgeo", label: "GitHub" },
  { href: "https://pypi.org/project/torchgeo", label: "PyPI" },
  { href: "https://arxiv.org/abs/2111.08872", label: "Paper" },
  { href: "https://www.youtube.com/@TorchGeo", label: "YouTube" },
];

const surfaces = [
  {
    name: "torchgeo.datasets",
    description:
      "Geo-referenced raster and vector datasets with CRS, metadata, and download handling built in.",
    href: "https://torchgeo.readthedocs.io/en/stable/api/datasets.html",
  },
  {
    name: "torchgeo.samplers",
    description:
      "Spatially-aware samplers that iterate over geographic extents, not just array indices.",
    href: "https://torchgeo.readthedocs.io/en/stable/api/samplers.html",
  },
  {
    name: "torchgeo.transforms",
    description:
      "Kornia-compatible augmentations for arbitrary band counts, not RGB-only.",
    href: "https://torchgeo.readthedocs.io/en/stable/api/transforms.html",
  },
  {
    name: "torchgeo.models",
    description:
      "Satellite-pretrained backbones and task modules that drop into standard PyTorch loops.",
    href: "https://torchgeo.readthedocs.io/en/stable/api/models.html",
  },
];

const gallery = [
  {
    src: "/brand/geodataset.png",
    alt: "TorchGeo dataset tooling preview",
    caption: "Raster + vector labels indexed by CRS",
  },
  {
    src: "/brand/vhr10.png",
    alt: "High-resolution aerial imagery sample",
    caption: "VHR-10: high-resolution object detection",
  },
  {
    src: "/brand/inria.png",
    alt: "Urban segmentation sample",
    caption: "Inria Aerial Image Labeling: urban footprints",
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
              width={124}
              height={36}
              priority
              unoptimized
              className="brand-logo"
              style={{ height: "auto" }}
            />
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
          <p className="kicker">PyTorch domain library for remote sensing</p>
          <h1>Geospatial deep learning, without the glue code.</h1>
          <p className="hero-text">
            Geospatial deep learning isn't just computer vision with larger
            images — satellite data is{" "}
            <a
              href="https://arxiv.org/abs/2402.01444"
              className="inline-link"
              target="_blank"
              rel="noreferrer"
            >
              a distinct modality
            </a>{" "}
            with its own geometry, statistics, and metadata.
          </p>
          <p className="hero-text">
            TorchGeo provides CRS-aware datasets, spatial samplers,
            multispectral transforms, and pretrained models for satellite and
            aerial imagery — all as standard PyTorch primitives.
          </p>

          <div className="hero-actions">
            <a
              href="https://torchgeo.readthedocs.io/en/stable/tutorials/getting_started.html"
              className="button button-primary"
            >
              Read the guide
            </a>
            <a
              href="https://github.com/torchgeo/torchgeo"
              className="button button-secondary"
            >
              View source
              <ArrowUpRightIcon className="button-icon" />
            </a>
          </div>

          <div className="install-row">
            <code>{installCommand}</code>
            <span>
              MIT · Python 3.12+ ·{" "}
              <a
                href="https://www.osgeo.org/projects/torchgeo/"
                target="_blank"
                rel="noreferrer"
                className="install-link"
              >
                OSGeo project
              </a>
            </span>
          </div>

          <pre className="code-block">
            <code>{`from torchgeo.datasets import EuroSAT
from torchgeo.samplers import RandomGeoSampler
from torchgeo.models import ResNet18_Weights, resnet18

dataset = EuroSAT(root="./data", download=True)
sampler = RandomGeoSampler(dataset, size=256, length=1000)
weights = ResNet18_Weights.SENTINEL2_ALL_MOCO
model = resnet18(weights=weights)`}</code>
          </pre>
        </section>

        <section className="section shell">
          <h2 className="section-heading">Library surface</h2>
          <ul className="surface-list">
            {surfaces.map((item) => (
              <li key={item.name}>
                <a href={item.href} className="surface-link">
                  <code className="surface-name">{item.name}</code>
                  <span className="surface-desc">{item.description}</span>
                  <ArrowUpRightIcon className="surface-arrow" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section shell">
          <h2 className="section-heading">Example datasets</h2>
          <div className="gallery">
            {gallery.map((item) => (
              <figure key={item.src} className="gallery-item">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1101}
                  height={683}
                  loading="eager"
                  unoptimized
                  className="gallery-image"
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section shell">
          <div className="section-head">
            <h2 className="section-heading">Podcasts & tutorials</h2>
            <a
              href="https://www.youtube.com/@TorchGeo"
              target="_blank"
              rel="noreferrer"
              className="section-link"
            >
              youtube.com/@TorchGeo
              <ArrowUpRightIcon className="button-icon" />
            </a>
          </div>

          <VideoCarousel videos={videos} autoPlay />
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-row">
          <span className="footer-text">
            TorchGeo · MIT · © {new Date().getFullYear()} contributors
          </span>
          <div className="footer-links">
            <a href="https://torchgeo.readthedocs.io">Docs</a>
            <a href="https://github.com/torchgeo/torchgeo">GitHub</a>
            <a href="https://pypi.org/project/torchgeo">PyPI</a>
            <a href="https://arxiv.org/abs/2111.08872">Paper</a>
            <a href="https://www.youtube.com/@TorchGeo">YouTube</a>
          </div>
        </div>
      </footer>
    </>
  );
}
