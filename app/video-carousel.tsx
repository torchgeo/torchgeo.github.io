"use client";

import { useEffect, useRef } from "react";

function wrap(offset: number, span: number) {
  if (span <= 0) return 0;
  let x = offset % span;
  if (x < 0) x += span;
  return x;
}

export type Video = { id: string; title: string; author: string };

export function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noreferrer"
      className="video-card"
    >
      <div className="video-thumb">
        {/* biome-ignore lint/performance/noImgElement: YouTube thumbnails are external */}
        <img
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          loading="lazy"
        />
        <span className="video-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" role="presentation">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="video-meta">
        <strong>{video.title}</strong>
        <span>{video.author}</span>
      </div>
    </a>
  );
}

export function VideoCarousel({
  videos,
  autoPlay = false,
  speed = 0.35,
}: {
  videos: Video[];
  autoPlay?: boolean;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Shared sub-pixel scroll offset. Both the RAF loop and the manual arrows
  // read/write this so they can't fight each other.
  const offsetRef = useRef(0);

  // Duplicate the list so the loop is seamless.
  const items = autoPlay ? [...videos, ...videos] : videos;

  // Continuous drift via requestAnimationFrame. `Element.scrollLeft` accepts
  // only integers, so we accumulate a fractional offset and write it each frame.
  useEffect(() => {
    if (!autoPlay) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = trackRef.current;
    if (!el) return;

    let raf = 0;
    const tick = () => {
      const half = el.scrollWidth / 2;
      offsetRef.current = wrap(offsetRef.current + speed, half);
      el.scrollLeft = offsetRef.current;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoPlay, speed]);

  // Advance one card at a time with the manual arrows. Updates the shared
  // offset so the RAF loop picks up from there on the next frame.
  const step = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".video-card");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 12;
    const cardWidth = card.getBoundingClientRect().width + gap;
    const half = el.scrollWidth / 2 || el.scrollWidth;
    offsetRef.current = wrap(offsetRef.current + cardWidth * dir, half);
    el.scrollLeft = offsetRef.current;
  };

  return (
    <section
      className={autoPlay ? "carousel carousel--loop" : "carousel"}
      aria-roledescription="carousel"
      aria-label="Tutorial videos"
    >
      <div className="carousel-track" ref={trackRef}>
        {items.map((v, i) => (
          <VideoCard key={i < videos.length ? v.id : `${v.id}-dup`} video={v} />
        ))}
      </div>

      <button
        type="button"
        className="carousel-btn carousel-prev"
        onClick={() => step(-1)}
        aria-label="Previous video"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="presentation"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className="carousel-btn carousel-next"
        onClick={() => step(1)}
        aria-label="Next video"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="presentation"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}
