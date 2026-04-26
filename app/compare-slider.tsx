"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  labelA: string;
  labelB: string;
};

// The source image is a side-by-side composite (left = RGB, right = mask).
// Each layer renders the SAME source as a background-image at 200% width,
// anchored left or right so we see only that half of the source. A draggable
// slider clips the layers, sweeping between them.
export function CompareSlider({ src, alt, labelA, labelB }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const draggingRef = useRef(false);

  const setFromX = (clientX: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = clientX - r.left;
    setPct(Math.max(2, Math.min(98, (x / r.width) * 100)));
  };
  const setRef = useRef(setFromX);
  setRef.current = setFromX;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current) setRef.current(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current && e.touches[0])
        setRef.current(e.touches[0].clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // Auto-demo nudge so the affordance is visible until the user grabs it.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const seq = [50, 70, 35, 60, 50];
    let i = 0;
    const t = setInterval(() => {
      if (draggingRef.current) {
        clearInterval(t);
        return;
      }
      setPct(seq[i % seq.length]);
      i++;
      if (i >= seq.length) clearInterval(t);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const bgStyle = (anchor: "0%" | "100%"): React.CSSProperties => ({
    backgroundImage: `url("${src}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "200% auto",
    backgroundPosition: `${anchor} center`,
  });

  return (
    <div
      ref={rootRef}
      className="compare"
      onMouseDown={(e) => {
        draggingRef.current = true;
        setFromX(e.clientX);
      }}
      onTouchStart={(e) => {
        draggingRef.current = true;
        if (e.touches[0]) setFromX(e.touches[0].clientX);
      }}
      role="img"
      aria-label={`${labelA} versus ${labelB}: ${alt}`}
    >
      <div
        className="compare__layer"
        style={{ ...bgStyle("0%"), clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />
      <div
        className="compare__layer"
        style={{ ...bgStyle("100%"), clipPath: `inset(0 0 0 ${pct}%)` }}
      />
      <div className="compare__handle" style={{ left: `${pct}%` }} />
      <span className="compare__label compare__label--a">{labelA}</span>
      <span className="compare__label compare__label--b">{labelB}</span>
    </div>
  );
}
