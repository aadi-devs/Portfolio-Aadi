import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DeveloperTitle } from "@/components/DeveloperTitle";
import { ContactFab } from "@/components/ContactFab";
import { VibeCards } from "@/components/VibeCards";
import { SmoothScroll, ScrollProgress, Reveal, Magnetic, StaticLine, autoScrollTo, onFrame, useAutoScrollIntent } from "@/components/Motion";
import { AboutSection } from "@/components/AboutSection";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Built from ideas — Developer Portfolio" },
      { name: "description", content: "Independent developer turning sketches into living interfaces." },
      { property: "og:title", content: "Built from ideas — Developer Portfolio" },
      { property: "og:description", content: "Independent developer turning sketches into living interfaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Rise({ children, delay = 0, className = "", wide = false }: { children: ReactNode; delay?: number; className?: string; wide?: boolean }) {
  return (
    <span className={`inline-block overflow-hidden align-bottom ${wide ? "w-[130%] -ml-[15%]" : ""} ${className}`}>
      <span className={`rise inline-block ${wide ? "w-full" : ""}`} style={{ animationDelay: `${delay}s` }}>{children}</span>
    </span>
  );
}

function Loader({ done }: { done: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => { const i = setInterval(() => setN((v) => Math.min(100, v + 6)), 45); return () => clearInterval(i); }, []);
  const hello = n >= 100;
  return (
    <div className={`fixed inset-0 z-[60] bg-foreground p-8 text-background transition-[clip-path] duration-1000 ease-[cubic-bezier(.7,0,.3,1)] ${done ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"}`}>
      {!hello ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.5em] opacity-70">Loading</span>
          <span className="num-outline font-display text-[19vw] leading-none tabular-nums">{String(n).padStart(3, "0")}</span>
          <div className="mt-3 h-px w-[45vw] max-w-md bg-background/25">
            <div className="h-full bg-background transition-[width] duration-150 ease-out" style={{ width: `${n}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <svg viewBox="0 0 800 260" className="w-[80vw] max-w-4xl" aria-label="welcome">
            <text x="50%" y="62%" textAnchor="middle" className="hello-draw fill-current font-script" fontSize="200" stroke="currentColor" strokeWidth="1.5">welcome</text>
          </svg>
        </div>
      )}
    </div>
  );
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let x = 0, y = 0, rx = 0, ry = 0, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      setActive(!!(e.target as HTMLElement).closest("a,button"));
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dot} className={`pointer-events-none fixed left-0 top-0 z-[70] -ml-1 -mt-1 h-2 w-2 rounded-full bg-foreground transition-opacity ${active ? "opacity-0" : "opacity-100"}`} />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[70] mix-blend-difference">
        <div className={`-ml-7 -mt-7 h-14 w-14 rounded-full bg-[#fff] transition-transform duration-300 ${active ? "scale-100" : "scale-0"}`} />
      </div>
    </>
  );
}

const WORDS = ["Aadi", "Victus"];

function WaterText() {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 10000); return () => clearInterval(t); }, []);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const target = useRef(0);
  useEffect(() => {
    let scale = 0, t = 0, raf = 0;
    const loop = () => {
      t += 0.01;
      scale += (target.current - scale) * 0.06;
      turb.current?.setAttribute("baseFrequency", `${0.012 + Math.sin(t) * 0.004} ${0.04 + Math.cos(t * 1.3) * 0.01}`);
      disp.current?.setAttribute("scale", scale.toFixed(2));
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      className="w-full select-none"
      onMouseEnter={() => (target.current = 45)}
      onMouseLeave={() => (target.current = 0)}
    >
      <svg width="0" height="0" className="absolute">
        <filter id="water" x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" />
        </filter>
      </svg>
      <h1 className="text-center font-display font-black uppercase leading-[0.85] text-foreground" style={{ filter: "url(#water)" }}>
        <Rise delay={0.6} wide className="pt-[0.1em] text-[min(27vw,32vh)] tracking-[-0.02em]">
          <span className="grid">
            {WORDS.map((w, i) => (
              <span key={w} aria-hidden={i !== idx} className={`col-start-1 row-start-1 transition-all duration-[1400ms] ease-[cubic-bezier(.7,0,.2,1)] ${i === idx ? "opacity-100 blur-0 [transform:scaleY(1)] tracking-[-0.02em]" : "opacity-0 blur-2xl [transform:scaleY(0.4)] tracking-[0.2em]"}`}>{w}</span>
            ))}
          </span>
        </Rise>
      </h1>
    </div>
  );
}

function HeroOut({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let last = -1;
    return onFrame(() => {
      const p = Math.min(1, scrollY / innerHeight);
      if (!ref.current || p === last) return;
      last = p;
      ref.current.style.transform = `translate3d(0,${-p * 25}vh,0) scale(${1 - p * 0.08})`;
      ref.current.style.opacity = String(1 - p * 0.9);
    });
  }, []);
  return <div ref={ref} className="flex min-h-screen flex-col will-change-transform">{children}</div>;
}

const workTarget = () => {
  const el = document.getElementById("work");
  if (!el) return null;
  return el.getBoundingClientRect().top + scrollY + el.offsetHeight - innerHeight;
};

/** Next auto-scroll stop: first pause at About, then continue to the end of the card animation. */
const nextTarget = () => {
  const about = document.getElementById("about");
  if (about) {
    const aboutTop = Math.round(about.getBoundingClientRect().top + scrollY);
    if (scrollY < aboutTop - 4) return aboutTop;
  }
  return workTarget();
};

function AutoScrollIntent() {
  useAutoScrollIntent(() => {
    const el = document.getElementById("work");
    // Only while the card animation track is still tall (it collapses once finished).
    if (!el || el.offsetHeight <= innerHeight * 1.5) return null;
    return nextTarget();
  });
  return null;
}

function Index() {
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 4200); return () => clearTimeout(t); }, []);
  const links = ["Work", "About", "Projects", "Contact"];
  return (
    <main className="relative overflow-x-clip px-6 md:px-10">
      <div className="blob -left-[10vw] -top-[10vw]" />
      <div className="blob -bottom-[15vw] -right-[10vw] [animation-delay:-11s]" />
      <Loader done={done} />
      <Cursor />
      {done && (
        <>
          <SmoothScroll />
          <AutoScrollIntent />
          <ContactFab />
          <ScrollProgress />
          <HeroOut>
          <nav className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-[clamp(0.75rem,2.5vh,1.5rem)] text-[clamp(9px,2.6vw,11px)] font-medium uppercase tracking-[0.18em] lg:grid-cols-[1fr_auto_1fr] lg:tracking-[0.25em]">
            <a href="#" aria-label="Victus" className="min-w-0 justify-self-start px-1 text-[clamp(1.6rem,6vw,2.25rem)] leading-none" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, letterSpacing: "0.02em" }}><Rise delay={0.3}>Victus</Rise></a>
            <span className="shrink-0 justify-self-end whitespace-nowrap p-1 text-muted-foreground lg:col-start-3 lg:row-start-1"><Rise delay={0.7}>Portfolio ’26</Rise></span>
            <ul className="col-span-2 flex justify-between gap-2 border-t border-foreground/10 pt-2 sm:justify-center sm:gap-8 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:gap-12 lg:border-0 lg:pt-0">
              {links.map((l, i) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="block whitespace-nowrap p-1 transition-opacity hover:opacity-50 sm:p-2"><Magnetic><Rise delay={0.4 + i * 0.07}>{l}</Rise></Magnetic></a></li>
              ))}
            </ul>
          </nav>
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center py-[2vh]">
            <WaterText />
            <DeveloperTitle />
            <p className="mt-[clamp(0.5rem,2vh,1.25rem)] text-center text-[clamp(9px,2.8vw,12px)] uppercase tracking-[0.3em] sm:tracking-[0.4em]"><Rise delay={1.05}>Built from ideas.</Rise></p>
          </section>
          <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-[clamp(0.75rem,2.5vh,1.5rem)] text-[clamp(9px,2.5vw,11px)] uppercase tracking-[0.15em] text-muted-foreground sm:tracking-[0.25em] [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end [&>*:last-child]:text-right">
            <Rise delay={1.2}>©2026</Rise>
            <Rise delay={1.3}>
              <button
                type="button"
                className="scroll-btn"
                onClick={() => {
                  const t = nextTarget();
                  if (t !== null) autoScrollTo(t);
                }}
              >
                <span>Scroll</span>
                <span className="scroll-btn-arrow" aria-hidden>↓</span>
              </button>
            </Rise>
            <Rise delay={1.4}>Open to work</Rise>
          </footer>
          </HeroOut>
          <StaticLine text="U Imagine I Build" />
          <AboutSection />
          <VibeCards />
          <Reveal className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Pick one. Or all three.</p>
            <a href="#contact" className="mt-6 font-display text-[min(14vw,22vh)] font-black uppercase leading-none"><Magnetic strength={0.15}>Let’s talk ↗</Magnetic></a>
          </Reveal>
          <section id="contact"><ContactForm /></section>
        </>
      )}
    </main>
  );
}
