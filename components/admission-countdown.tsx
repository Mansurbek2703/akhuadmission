"use client";

import { useEffect, useState } from "react";

// Deadline: 15.07.2026 23:59:00 at UTC+5 => 18:59:00 UTC
const DEADLINE = new Date("2026-07-15T23:59:00+05:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function getTimeLeft(): TimeLeft {
  const diff = DEADLINE - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, finished: false };
}

const UNITS: { key: keyof Omit<TimeLeft, "finished">; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function AdmissionCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <p className="text-base font-semibold sm:text-lg lg:text-xl" style={{ color: "#335aa9" }}>
        {timeLeft?.finished
          ? "Bachelor's admission is now closed"
          : "Time left until Bachelor's admission closes"}
      </p>

      <div className="mt-4 flex items-stretch justify-center gap-2 sm:gap-4">
        {UNITS.map(({ key, label }, index) => (
          <div key={key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex min-w-16 flex-col items-center rounded-2xl border border-blue-200 bg-white/80 px-3 py-3 shadow-sm backdrop-blur-sm sm:min-w-24 sm:px-5 sm:py-4">
              <span
                className="font-mono text-3xl font-bold tabular-nums sm:text-5xl"
                style={{ color: "#1e3a8a" }}
              >
                {timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}
              </span>
              <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                {label}
              </span>
            </div>
            {index < UNITS.length - 1 && (
              <span
                className="text-2xl font-bold sm:text-4xl"
                style={{ color: "#93c5fd" }}
                aria-hidden="true"
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Deadline: July 15, 2026, 23:59 (UTC+5)
      </p>
    </div>
  );
}
