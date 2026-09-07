import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryMarqueeProps {
  images: GalleryImage[];
}

/** Cruise speed, matches the original marquee's pace (~2465px over ~41s -> ~60px/s). */
const NORMAL_SPEED = 60; // px/s
/** Target speed while the pointer is hovering the marquee. */
const HOVER_SPEED = 15; // px/s
/** Inertia time constant for the velocity ease (seconds). */
const TAU = 0.5;
/** Clamp dt so a backgrounded/refocused tab doesn't jump the offset. */
const MAX_DT = 0.1; // seconds

const ITEM_CLASS =
  "h-80 w-[29rem] shrink-0 overflow-hidden rounded-[1.25rem] tablet:h-64 landscape:h-52 landscape:basis-[72vw] portrait:h-44 portrait:basis-[78vw]";
const ROW_GAP_CLASS = "gap-[1.8125rem] tablet:gap-4 landscape:gap-3";

function GalleryItem({ image, hidden = false }: { image: GalleryImage; hidden?: boolean }) {
  return (
    <div className={ITEM_CLASS} aria-hidden={hidden || undefined}>
      <img src={image.src} alt={hidden ? "" : image.alt} className="h-full w-full object-cover" />
    </div>
  );
}

export default function GalleryMarquee({ images }: GalleryMarqueeProps) {
  // The track is the element we translate every frame; it wraps both rows so
  // the whole duplicated sequence scrolls together.
  const trackRef = useRef<HTMLDivElement>(null);
  // The first (real) row only, used purely to measure "one loop" of width.
  const rowRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track) return;

    let distance = 0;
    const measure = () => {
      const computed = window.getComputedStyle(row);
      const gap = parseFloat(computed.columnGap || computed.gap || "0") || 0;
      distance = row.scrollWidth + gap;
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);

    let offset = 0;
    let velocity = 0;
    let lastTime: number | null = null;
    let rafId: number;

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, MAX_DT);
      lastTime = time;

      const target = hoveredRef.current ? HOVER_SPEED : NORMAL_SPEED;
      velocity += (target - velocity) * (1 - Math.exp(-dt / TAU));

      if (distance > 0) {
        offset = (offset + velocity * dt) % distance;
        if (offset < 0) offset += distance;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [reducedMotion, images]);

  if (reducedMotion) {
    return (
      <div className={`flex w-full overflow-x-auto ${ROW_GAP_CLASS}`}>
        {images.map((image) => (
          <GalleryItem key={image.src} image={image} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={`flex w-max flex-nowrap items-stretch will-change-transform ${ROW_GAP_CLASS}`}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <div ref={rowRef} className={`flex flex-nowrap items-stretch ${ROW_GAP_CLASS}`}>
        {images.map((image) => (
          <GalleryItem key={image.src} image={image} />
        ))}
      </div>
      <div className={`flex flex-nowrap items-stretch ${ROW_GAP_CLASS}`} aria-hidden="true">
        {images.map((image) => (
          <GalleryItem key={`clone-${image.src}`} image={image} hidden />
        ))}
      </div>
    </div>
  );
}
