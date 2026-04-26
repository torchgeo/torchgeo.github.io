"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Sentinel-2 RGB patch palette — naturalistic colors sampled from real S2 imagery.
// Each tile is a CSS gradient (cheap and crisp) instead of loading 64 image files.
const PALETTE: ReadonlyArray<readonly [string, string, string]> = [
  ["#1F4F8B", "#2D6BA8", "#3E84BD"], // water
  ["#173E6E", "#225285", "#2D6BA8"],
  ["#2F4A2A", "#3E5F36", "#4F7745"], // dense forest
  ["#3E5F36", "#557E47", "#6B9B5A"],
  ["#6FB46A", "#8FCB6A", "#B5D879"], // ag
  ["#A8B860", "#C8C26B", "#D8C170"],
  ["#9E8E4E", "#B89F58", "#D2B36A"],
  ["#8A6A3F", "#A08055", "#B5946A"], // bare / soil
  ["#A08055", "#B89770", "#CFB28E"],
  ["#5C5F66", "#787C84", "#9499A0"], // urban
  ["#787C84", "#9499A0", "#AEB3B9"],
  ["#D4DAE0", "#E5E9ED", "#F1F3F5"], // cloud / snow
];

const N = 8;

type Tile = { background: string; delayMs: number };

function buildTiles(seed = 1): Tile[] {
  // Deterministic PRNG so SSR and CSR produce identical markup.
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Keep tiles in row-major (r,c) order so the CSS grid lays them out
  // spatially. Animation delay is driven by distance from center so the
  // reveal flows outward without disturbing layout.
  const tiles: Tile[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const dx = c - N / 2;
      const dy = r - N / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let pool: typeof PALETTE;
      if (r < 2 && c < 3) pool = PALETTE.slice(0, 2);
      else if (r < 4) pool = PALETTE.slice(2, 4);
      else if (r < 6) pool = PALETTE.slice(4, 7);
      else if (c > 5) pool = PALETTE.slice(9, 11);
      else pool = PALETTE.slice(2, 9);
      const p = pool[Math.floor(rand() * pool.length)];
      const angle = 135 + rand() * 30;
      const jitter = Math.floor(rand() * 80);
      tiles.push({
        background: `linear-gradient(${angle.toFixed(1)}deg, ${p[0]} 0%, ${p[1]} 50%, ${p[2]} 100%)`,
        delayMs: Math.round(dist * 50) + jitter,
      });
    }
  }
  return tiles;
}

export function HeroMosaic() {
  const tiles = useMemo(() => buildTiles(7), []);

  // Wandering crosshair
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [label, setLabel] = useState("SCENE LS-027 · 38.05°N 121.31°W");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const move = () => {
      const r = 1 + Math.floor(Math.random() * 6);
      const c = 1 + Math.floor(Math.random() * 6);
      setPos({ x: ((c + 0.5) / N) * 100, y: ((r + 0.5) / N) * 100 });
      const lat = (38 + Math.random() * 0.9).toFixed(2);
      const lon = (121 + Math.random() * 0.9).toFixed(2);
      const sceneId = String(20 + Math.floor(Math.random() * 80)).padStart(
        3,
        "0",
      );
      setLabel(`SCENE LS-${sceneId} · ${lat}°N ${lon}°W`);
    };
    move();
    timerRef.current = setInterval(move, 3200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="mosaic" aria-hidden="true">
      <div className="mosaic__grid">
        {tiles.map((t, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: positions are stable
            key={i}
            className="mosaic__tile"
            style={{
              background: t.background,
              animationDelay: `${t.delayMs}ms`,
            }}
          />
        ))}
      </div>
      <div className="mosaic__overlay">
        <div
          className="mosaic__crosshair"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <span className="mosaic__crosshair-label">{label}</span>
        </div>
      </div>
      <div className="mosaic__corner-labels">
        <span className="tl">
          <span className="dot" /> EPSG:32617
        </span>
        <span className="tr">B04 · B03 · B02</span>
        <span className="bl">10m / px</span>
        <span className="br">256 × 256</span>
      </div>
      <div className="mosaic__caption">
        <span>RandomGeoSampler() · stride 128px</span>
        <span className="live">SAMPLING</span>
      </div>
    </div>
  );
}
