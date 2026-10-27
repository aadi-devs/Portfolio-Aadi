import { useEffect, useRef, useState, type ReactNode } from "react";

// Animations are mandatory: the device "reduce motion" setting is intentionally ignored.
export const reduced = () => false;

type LenisLike = { raf: (t: number) => void; destroy: () => void; scrollTo: (t: number, o?: { duration?: number; easing?: (t: number) => number }) => void };
let activeLenis: LenisLike | null = null;

/** One shared frame loop: Lenis updates scroll first, then every animation reads the same position (no frame lag = no jitter). */
const subs = new Set<() => void>();
let tickRaf = 0;
const tick = (t: number) => { activeLenis?.raf(t); subs.forEach((f) => f()); tickRaf = requestAnimationFrame(tick); };
export function onFrame(f: () => void) {
  subs.add(f);
  if (!tickRaf) tickRaf = requestAnimationFrame(tick);
  return () => { subs.delete(f); };
}

/**
 * Auto-scroll at a steady, cinematic speed (used by the Scroll button).
 * Speed is tied to screen height so the card animation plays at the same pace on every device;
 * short soft ramps at start/end avoid a jolt, the middle is constant-speed.
 */
const VIEWPORTS_PER_SECOND = 0.56;
const RAMP = 0.12;
const steady = (t: number) => {
  // integral of a trapezoid velocity profile, normalised to 0..1
  const v = 1 / (1 - RAMP);
  if (t < RAMP) return (v * t * t) / (2 * RAMP);
  if (t > 1 - RAMP) { const r = 1 - t; return 1 - (v * r * r) / (2 * RAMP); }
  return v * (t - RAMP / 2);
};
let autoRaf = 0;
let autoRunning = false;
export const isAutoScrolling = () => autoRunning;
export function autoScrollTo(target: number) {
  cancelAnimationFrame(autoRaf);
  const start = activeLenis ? (activeLenis as unknown as { scroll: number }).scroll : scrollY;
  const distance = Math.abs(target - start);
  // Our own frame-by-frame driver so the card animation always plays in full, never jumps.
  const duration = Math.max(2.5, distance / (innerHeight * VIEWPORTS_PER_SECOND));
  autoRunning = true;
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / (duration * 1000));
    const y = start + (target - start) * steady(t);
    if (activeLenis) (activeLenis as unknown as { scrollTo: (y: number, o: object) => void }).scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    if (t < 1) autoRaf = requestAnimationFrame(step);
    else autoRunning = false;
  };
  autoRaf = requestAnimationFrame(step);
}

/** Instantly shift scroll position (no animation) — used when a section collapses so the view doesn't jump. */
export function shiftScroll(delta: number) {
  cancelAnimationFrame(autoRaf);
  autoRunning = false;
  const cur = activeLenis ? (activeLenis as unknown as { scroll: number }).scroll : scrollY;
  const y = Math.max(0, cur + delta);
  window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  if (activeLenis) {
    (activeLenis as unknown as { resize?: () => void }).resize?.();
    (activeLenis as unknown as { scrollTo: (y: number, o: object) => void }).scrollTo(y, { immediate: true, force: true });
  }
}

export function SmoothScroll() {
  useEffect(() => {
    if (reduced()) return;
    let lenis: LenisLike | null = null; let dead = false;
    const keep = onFrame(() => {});
    import("lenis").then(({ default: Lenis }) => {
      if (dead) return;
      lenis = new Lenis({ lerp: 0.1, autoRaf: false } as object) as unknown as LenisLike;
      activeLenis = lenis;
    });
    return () => { dead = true; keep(); lenis?.destroy(); activeLenis = null; };
  }, []);
  return null;
}

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return onFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    });
  }, []);
  return <div ref={bar} className="fixed left-0 top-0 z-[55] h-[2px] w-full origin-left bg-foreground" style={{ transform: "scaleX(0)" }} />;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return;
    // overflow-x:clip on <main> makes IntersectionObserver report nothing as visible, so compare against the viewport directly.
    return onFrame(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r && r.top < innerHeight * 0.8 && r.bottom > 0) setOn(true);
    });
  }, [on]);
  return <div ref={ref} className={`reveal ${on ? "reveal-in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px,${(e.clientY - r.top - r.height / 2) * strength}px)`;
      }}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
    >{children}</span>
  );
}

export function StaticLine({ text }: { text: string }) {
  return (
    <div className="-mx-6 overflow-hidden border-y border-foreground/20 py-[clamp(1rem,3vh,1.5rem)] text-center md:-mx-10">
      <p className="font-display text-[min(9vw,14vh)] font-black uppercase leading-none">{text}</p>
    </div>
  );
}

/**
 * When the visitor scrolls down by hand (wheel, touch, keys) before the target is reached,
 * hand over to the same cinematic auto-scroll as the Scroll button. Manual input is ignored while it runs.
 * getTarget returns the scroll position to glide to, or null when auto-scroll no longer applies.
 */
export function useAutoScrollIntent(getTarget: () => number | null) {
  const ref = useRef(getTarget);
  ref.current = getTarget;
  useEffect(() => {
    let touchY = 0;
    const handle = (e: Event, down: boolean) => {
      if (autoRunning) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); return; }
      if (!down) return;
      const target = ref.current();
      const cur = activeLenis ? (activeLenis as unknown as { scroll: number }).scroll : scrollY;
      if (target === null || cur >= target - 4) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      autoScrollTo(target);
    };
    const wheel = (e: WheelEvent) => handle(e, e.deltaY > 0);
    const tStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0; };
    const tMove = (e: TouchEvent) => handle(e, touchY - (e.touches[0]?.clientY ?? touchY) > 6);
    const key = (e: KeyboardEvent) => {
      const downKeys = ["ArrowDown", "PageDown", " ", "Spacebar", "End"];
      const upKeys = ["ArrowUp", "PageUp", "Home"];
      if (downKeys.includes(e.key)) handle(e, true);
      else if (upKeys.includes(e.key)) handle(e, false);
    };
    const opts = { capture: true, passive: false } as const;
    window.addEventListener("wheel", wheel, opts);
    window.addEventListener("touchstart", tStart, { capture: true, passive: true });
    window.addEventListener("touchmove", tMove, opts);
    window.addEventListener("keydown", key, opts);
    return () => {
      window.removeEventListener("wheel", wheel, opts);
      window.removeEventListener("touchstart", tStart, { capture: true });
      window.removeEventListener("touchmove", tMove, opts);
      window.removeEventListener("keydown", key, opts);
    };
  }, []);
}
