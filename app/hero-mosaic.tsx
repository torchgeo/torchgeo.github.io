"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Real Landsat 8 + Cropland Data Layer composite (already shipped in /public/brand/)
// is the canonical TorchGeo example — far more credible than synthetic gradients.

type SamplerBox = {
  // percent units inside the visual frame
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
};

const TRACK: SamplerBox[] = [
  { x: 18, y: 28, w: 14, h: 18, label: "256×256 · forest" },
  { x: 38, y: 22, w: 14, h: 18, label: "256×256 · cropland" },
  { x: 58, y: 36, w: 14, h: 18, label: "256×256 · water" },
  { x: 30, y: 56, w: 14, h: 18, label: "256×256 · urban" },
  { x: 70, y: 60, w: 14, h: 18, label: "256×256 · bare soil" },
];

export function HeroMosaic() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % TRACK.length);
    }, 2400);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const box = TRACK[idx];

  return (
    <div className="hero-asset" aria-hidden="true">
      <div className="hero-asset__frame">
        <Image
          src="/brand/geodataset.png"
          alt=""
          fill
          priority
          unoptimized
          className="hero-asset__img"
          sizes="(max-width: 960px) 100vw, 600px"
        />

        <div className="hero-asset__graticule" />

        <div
          className="hero-asset__sampler"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
          }}
        >
          <span className="hero-asset__sampler-tag">{box.label}</span>
        </div>

        <div className="hero-asset__corner-labels">
          <span className="tl">
            <span className="dot" /> Landsat 8 · EPSG:32617
          </span>
          <span className="tr">B04 · B03 · B02</span>
          <span className="bl">10 m / px</span>
          <span className="br">CDL · EPSG:5072</span>
        </div>

        <div className="hero-asset__caption">
          <span>RandomGeoSampler() · CRS-aligned chips</span>
          <span className="live">SAMPLING</span>
        </div>
      </div>
    </div>
  );
}
