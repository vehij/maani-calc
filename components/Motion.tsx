"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark, Logotype } from "./Brand.tsx";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Eases a number towards its target whenever the target changes. */
export function useTween(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const current = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion() || !Number.isFinite(target)) {
      current.current = target;
      setValue(target);
      return;
    }
    from.current = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from.current + (target - from.current) * eased;
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const v = useTween(value);
  return <>{format(v)}</>;
}

/** True for a short moment after any of `deps` changes (skips the first render). */
export function usePulse(deps: unknown[], ms = 520): boolean {
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOn(true);
    const id = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return on;
}

/** Full-screen intro shown while fonts load: the M reveals, then the logotype. */
export function Splash({ label }: { label: string }) {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");
  useEffect(() => {
    let alive = true;
    const minDelay = new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : 950));
    Promise.all([document.fonts?.ready, minDelay]).then(() => {
      if (!alive) return;
      setPhase("out");
      setTimeout(() => alive && setPhase("gone"), 550);
    });
    return () => {
      alive = false;
    };
  }, []);
  if (phase === "gone") return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas transition-opacity duration-500 ${
        phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label={label}
    >
      <div className="splash-mark">
        <LogoMark size={76} />
      </div>
      <div className="splash-type mt-5 text-ink">
        <Logotype height={26} />
      </div>
      <div className="mt-7 h-[3px] w-40 overflow-hidden rounded-full bg-bar">
        <div className="splash-bar h-full rounded-full bg-teal" />
      </div>
      <div className="splash-type mt-3 text-[12px] text-muted">{label}</div>
    </div>
  );
}
