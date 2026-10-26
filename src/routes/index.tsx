import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creative Developer — Built from ideas" },
      { name: "description", content: "Minimal portfolio of a creative developer. Built from ideas." },
      { property: "og:title", content: "Creative Developer — Built from ideas" },
      { property: "og:description", content: "Minimal portfolio of a creative developer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className}`}>
      <span className="rise inline-block" style={{ animationDelay: `${delay}s` }}>{children}</span>
    </span>
  );
}

function Loader({ done }: { done: boolean }) {
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-foreground text-background transition-transform duration-1000 ease-[cubic-bezier(.7,0,.3,1)] ${done ? "-translate-y-full" : ""}`}>
      <Rise className="font-display text-5xl uppercase tracking-wide">Built from ideas</Rise>
      <div className="h-px w-48 bg-background/20"><div className="loadbar h-px bg-background" /></div>
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
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[70] -ml-1 -mt-1 h-2 w-2 rounded-full bg-foreground" />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[70]">
        <div className={`-ml-6 -mt-6 h-12 w-12 rounded-full border-2 border-foreground transition-all duration-300 ${active ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
      </div>
    </>
  );
}

function WaterText() {
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
        <filter id="water">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" />
        </filter>
      </svg>
      <h1 className="text-center font-display uppercase leading-[0.8] text-foreground" style={{ filter: "url(#water)" }}>
        <Rise delay={0.6} className="text-[24vw] tracking-tight [transform:scaleY(1.35)] origin-bottom">Creative</Rise>
      </h1>
    </div>
  );
}

function Index() {
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 1700); return () => clearTimeout(t); }, []);
  const links = ["Work", "About", "Projects", "Contact"];
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 md:px-10">
      <Loader done={done} />
      <Cursor />
      {done && (
        <>
          <nav className="grid grid-cols-3 items-center py-6 text-xs font-medium uppercase tracking-widest">
            <a href="#" className="font-display text-lg normal-case tracking-normal"><Rise delay={0.4}>studio.</Rise></a>
            <ul className="flex justify-center gap-8 md:gap-12">
              {links.map((l, i) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="block p-2 transition-opacity hover:opacity-60"><Rise delay={0.5 + i * 0.08}>{l}</Rise></a></li>
              ))}
            </ul>
            <span />
          </nav>
          <section className="flex flex-1 flex-col items-center justify-center pt-[6vw]">
            <WaterText />
            <h2 className="mt-4 font-display text-4xl uppercase md:text-6xl"><Rise delay={0.9}>Developer</Rise></h2>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground"><Rise delay={1.1}>Built from ideas.</Rise></p>
          </section>
          <footer className="flex justify-between py-6 text-xs uppercase tracking-widest text-muted-foreground">
            <Rise delay={1.2}>©2026</Rise>
            <a href="#work" className="p-2"><Rise delay={1.3}>Scroll to explore ↓</Rise></a>
            <Rise delay={1.4}>Available for work</Rise>
          </footer>
        </>
      )}
    </main>
  );
}
