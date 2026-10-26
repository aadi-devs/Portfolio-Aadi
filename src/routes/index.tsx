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
      <span className="text-xs uppercase tracking-[0.3em]">Sketching ideas…</span>
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
        <filter id="water">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" />
        </filter>
      </svg>
      <h1 className="font-display italic leading-[0.75] text-foreground" style={{ filter: "url(#water)" }}>
        <Rise delay={0.6} className="pb-[3vw] pr-[2vw] text-[30vw]">ideas<span className="text-ember">.</span></Rise>
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
          <nav className="flex items-start justify-between py-6 text-[11px] uppercase tracking-[0.2em]">
            <a href="#" className="p-2"><Rise delay={0.3}>[ J — 26 ]</Rise></a>
            <ul className="flex gap-6 md:gap-10">
              {links.map((l, i) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="group block p-2"><Rise delay={0.4 + i * 0.08}><span className="text-ember">0{i + 1}</span> <span className="transition-opacity group-hover:opacity-50">{l}</span></Rise></a></li>
              ))}
            </ul>
            <span className="hidden p-2 md:block"><Rise delay={0.7}>Local time · IST</Rise></span>
          </nav>
          <section className="grid flex-1 grid-cols-12 items-end gap-4 pb-8">
            <div className="col-span-12 md:col-span-3 md:pb-[6vw]">
              <p className="font-display text-4xl md:text-6xl"><Rise delay={0.5}>Built from</Rise></p>
              <p className="mt-6 max-w-[26ch] text-xs leading-relaxed text-muted-foreground"><Rise delay={0.8}>Independent developer turning rough sketches into calm, living interfaces.</Rise></p>
            </div>
            <div className="col-span-12 md:col-span-9 md:text-right">
              <WaterText />
            </div>
          </section>
          <footer className="-mx-6 border-t border-foreground/20 py-4 md:-mx-10">
            <div className="flex w-max marquee gap-12 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {Array.from({ length: 2 }).flatMap((_, k) => ["Interfaces", "✺", "Motion", "✺", "Systems", "✺", "Experiments", "✺", "Available 2026", "✺"].map((w, i) => <span key={`${k}-${i}`}>{w}</span>))}
            </div>
          </footer>
        </>
      )}
    </main>
  );
}
