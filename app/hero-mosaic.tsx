"use client";

import { useEffect, useRef, useState } from "react";

// Real Sentinel-2 L2A true-color chip over Seattle, WA (tile 10TET,
// 2024-08-29, <1% cloud) sourced from the Microsoft Planetary Computer.
// A sampler box hops across a 6×4 grid to evoke
// torchgeo.samplers.RandomGeoSampler over a CRS-aligned scene.

const COLS = 6;
const ROWS = 4;

type Sample = { col: number; row: number; label: string };
// Cells line up with visually distinct land cover in the Seattle scene.
const SAMPLES: Sample[] = [
  { col: 2, row: 1, label: "land cover: urban dense" },
  { col: 0, row: 1, label: "land cover: water" },
  { col: 4, row: 2, label: "land cover: urban housing" },
  { col: 3, row: 3, label: "land cover: industrial" },
  { col: 5, row: 3, label: "land cover: forest" },
];

export function HeroMosaic() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % SAMPLES.length);
    }, 2400);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const s = SAMPLES[idx];
  const samplerStyle = {
    left: `${(s.col / COLS) * 100}%`,
    top: `${(s.row / ROWS) * 100}%`,
    width: `${(1 / COLS) * 100}%`,
    height: `${(1 / ROWS) * 100}%`,
  };

  return (
    <div className="hero-asset" aria-hidden="true">
      <div className="hero-asset__frame">
        {/* biome-ignore lint/performance/noImgElement: static export, no Next image optimizer */}
        <img
          className="hero-asset__scene"
          src="/brand/seattle-s2.png"
          alt=""
          decoding="async"
        />

        <div className="hero-asset__graticule" />

        <div className="hero-asset__sampler" style={samplerStyle}>
          <span className="hero-asset__sampler-tag">{s.label}</span>
        </div>

        <div className="hero-asset__corner-labels">
          <span className="tl">
            <span className="dot" /> Sentinel-2 L2A · EPSG:32610
          </span>
          <span className="tr">B04 · B03 · B02</span>
          <span className="bl">10 m / px</span>
          <span className="br">RandomGeoSampler</span>
        </div>

        <div className="hero-asset__caption">
          <span>Seattle, WA · 2024-08-29 · CRS-aligned chips</span>
          <span className="live">SAMPLING</span>
        </div>
      </div>
    </div>
  );
}
