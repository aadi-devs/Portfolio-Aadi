import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className}`}>
      <span className="rise inline-block" style={{ animationDelay: `${delay}s` }}>{children}</span>
    </span>
  );
}

function Loader({ done }: { done: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => { const i = setInterval(() => setN((v) => Math.min(100, v + 3)), 45); return () => clearInterval(i); }, []);
  return (
    <div className={`fixed inset-0 z-[60] flex items-end justify-between bg-foreground p-8 text-background transition-[clip-path] duration-1000 ease-[cubic-bezier(.7,0,.3,1)] ${done ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"}`}>
      <span className="text-xs uppercase tracking-[0.3em]">Loading</span>
      <span className="font-display text-[22vw] italic leading-none">{String(n).padStart(3, "0")}</span>
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
        <div className={`-ml-6 -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-[10px] uppercase tracking-widest text-background transition-all duration-300 ${active ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>go</div>
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
        <filter id="water" x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" />
        </filter>
      </svg>
      <h1 className="text-center font-display font-black uppercase leading-[0.85] text-foreground" style={{ filter: "url(#water)" }}>
        <Rise delay={0.6} className="pt-[0.1em] text-[27vw] tracking-[-0.02em]">Creative</Rise>
      </h1>
    </div>
  );
}

function Index() {
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 1800); return () => clearTimeout(t); }, []);
  const links = ["Work", "About", "Projects", "Contact"];
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 md:px-10">
      <Loader done={done} />
      <Cursor />
      {done && (
        <>
          <nav className="grid grid-cols-3 items-center py-6 text-[11px] font-medium uppercase tracking-[0.25em]">
            <a href="#" className="justify-self-start p-2 font-display text-xl font-black tracking-tight"><Rise delay={0.3}>J/26</Rise></a>
            <ul className="flex justify-center gap-6 md:gap-12">
              {links.map((l, i) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="block p-2 transition-opacity hover:opacity-50"><Rise delay={0.4 + i * 0.07}>{l}</Rise></a></li>
              ))}
            </ul>
            <span className="justify-self-end p-2 text-muted-foreground"><Rise delay={0.7}>Portfolio ’26</Rise></span>
          </nav>
          <section className="flex flex-1 flex-col items-center justify-center">
            <WaterText />
            <div className="mt-2 flex w-full items-center gap-6">
              <span className="h-px flex-1 bg-foreground/30" />
              <h2 className="font-display text-5xl font-black uppercase md:text-7xl"><Rise delay={0.9}>Developer</Rise></h2>
              <span className="h-px flex-1 bg-foreground/30" />
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.4em]"><Rise delay={1.05}>Built from ideas.</Rise></p>
          </section>
          <footer className="flex items-end justify-between py-6 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <Rise delay={1.2}>©2026</Rise>
            <a href="#work" className="p-2"><Rise delay={1.3}>Scroll ↓</Rise></a>
            <Rise delay={1.4}>Open to work</Rise>
          </footer>
        </>
      )}
    </main>
  );
}
