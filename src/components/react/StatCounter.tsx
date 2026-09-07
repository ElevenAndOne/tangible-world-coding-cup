import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  value: number;
  label: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatCounter({ value, label }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Server-render (and no-JS) shows the real final value for SEO/accessibility.
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Once JS takes over, reset to 0 so the count-up has something to animate
    // from. Reduced-motion users keep the final value the whole time.
    if (!reduceMotion) {
      setDisplay(0);
    }
    let rafId = 0;

    const animate = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      if (reduceMotion) {
        setDisplay(value);
        return;
      }

      const duration = 1200;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(value * easeOutCubic(progress)));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      animate();
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5">
      <div className="font-display text-[clamp(2rem,1.3rem+2.3vw,3.5rem)] uppercase leading-[1.1] tracking-[-0.05rem] text-ink">
        {display.toLocaleString("en-US")}
      </div>
      <div className="font-display text-[clamp(1.375rem,1.188rem+0.624vw,1.75rem)] leading-[1.25] tracking-[-0.0125rem] text-ink">
        {label}
      </div>
    </div>
  );
}
