import { useEffect, useState } from "react";

const TARGET_TIME = new Date("2026-11-05T00:00:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET_TIME - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function Countdown() {
  // Render "--" placeholders until mounted so the server-rendered markup
  // never has to guess the visitor's clock (avoids a hydration mismatch).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-4 portrait:gap-3"
      role="timer"
      aria-label="Countdown to the Coding Cup"
    >
      {UNITS.map(({ key, label }, index) => (
        <div
          key={key}
          className={`flex flex-col items-center px-4 first:pl-0 portrait:px-2 ${
            index > 0 ? "border-l border-white/15" : ""
          }`}
        >
          <span className="font-display text-4xl leading-none text-white tabular-nums portrait:text-3xl">
            {timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-[0.0875rem] text-sky">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
