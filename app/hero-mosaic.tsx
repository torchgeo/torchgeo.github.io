"use client";

import { useEffect, useRef, useState } from "react";

// Abstract satellite-imagery mosaic. A 6×4 grid of tiles, each a subtle
// landcover-flavored gradient (forest greens, cropland golds, water blues,
// urban grays, bare-soil ochres). A sampler box hops between tiles to evoke
// torchgeo.samplers.RandomGeoSampler — informational, not photorealistic.

type LC = "forest" | "cropland" | "water" | "urban" | "soil" | "snow" | "shrub";

const PALETTE: Record<LC, [string, string]> = {
  forest: ["#2f5d3a", "#4f8455"],
  cropland: ["#c39446", "#d8b35a"],
  water: ["#2a4d6e", "#3a6f8e"],
  urban: ["#6a6a72", "#8d8d95"],
  soil: ["#8a6a3e", "#a98850"],
  snow: ["#dfe4e8", "#f1f3f5"],
  shrub: ["#7a8a4a", "#94a25c"],
};

// 6 cols × 4 rows. Hand-tuned to read like a regional landcover scene.
const GRID: LC[] = [
  "forest",
  "forest",
  "cropland",
  "cropland",
  "soil",
  "soil",
  "forest",
  "shrub",
  "cropland",
  "cropland",
  "urban",
  "soil",
  "shrub",
  "shrub",
  "cropland",
  "urban",
  "urban",
  "water",
  "shrub",
  "water",
  "water",
  "cropland",
  "soil",
  "water",
];
const COLS = 6;
const ROWS = 4;

type Sample = { col: number; row: number; label: string };
const SAMPLES: Sample[] = [
  { col: 0, row: 0, label: "256×256 · forest" },
  { col: 2, row: 0, label: "256×256 · cropland" },
  { col: 4, row: 1, label: "256×256 · urban" },
  { col: 1, row: 2, label: "256×256 · shrubland" },
  { col: 3, row: 3, label: "256×256 · water" },
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
        <div
          className="hero-asset__grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
        >
          {GRID.map((lc, i) => {
            const [a, b] = PALETTE[lc];
            const tileKey = `tile-${i}`;
            return (
              <div
                key={tileKey}
                className="hero-asset__tile"
                style={{
                  background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
                }}
              />
            );
          })}
        </div>

        <div className="hero-asset__graticule" />

        <div className="hero-asset__sampler" style={samplerStyle}>
          <span className="hero-asset__sampler-tag">{s.label}</span>
        </div>

        <div className="hero-asset__corner-labels">
          <span className="tl">
            <span className="dot" /> Sentinel-2 · EPSG:32617
          </span>
          <span className="tr">B04 · B03 · B02</span>
          <span className="bl">10 m / px</span>
          <span className="br">RandomGeoSampler</span>
        </div>

        <div className="hero-asset__caption">
          <span>CRS-aligned chips · 256 px</span>
          <span className="live">SAMPLING</span>
        </div>
      </div>
    </div>
  );
}
