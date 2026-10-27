import { useEffect, useRef } from "react";
import { onFrame, reduced, shiftScroll } from "./Motion";

const CARDS = [
  { n: "01", t: "Minecraft Development", d: "Worlds, mods and servers built block by block." },
  { n: "02", t: "Website Development", d: "Fast, crafted sites that move like they breathe." },
  { n: "03", t: "Full Stack Development", d: "From database to pixel — the whole machine." },
];
const HEAD = "What type of my work do you wanna check out?".split(" ");

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export function VibeCards() {
  const sec = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const head = useRef<HTMLHeadingElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const landed = useRef(false);
  const done = useRef(false); // once finished, cards stay landed (no reverse on scroll up)

  useEffect(() => {
    const still = reduced();
    const loop = () => {
      const el = sec.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const raw = still ? 1 : clamp(-r.top / (r.height - innerHeight));
        if (raw >= 0.999 && !done.current) {
          done.current = true;
          // Animation finished: collapse the tall scroll track so scrolling back up is short.
          const removed = el.offsetHeight - innerHeight;
          if (removed > 0) {
            el.style.height = "100vh";
            shiftScroll(-removed);
          }
        }
        const p = done.current ? 1 : raw;
        const w = innerWidth, h = innerHeight;
        // Layout: fit 3 cards into the space below the heading, for any screen size.
        const headBottom = head.current ? head.current.offsetTop + head.current.offsetHeight : h * 0.3;
        const top = headBottom + Math.max(16, h * 0.04), bottom = h - Math.max(16, h * 0.05);
        const availH = Math.max(120, bottom - top), cy = (top + bottom) / 2 - h / 2;
        const pad = w < 640 ? 20 : 40, gap = w < 640 ? 12 : Math.min(28, w * 0.02);
        const stack = w < 640 || (w - pad * 2) / 3 < 170;
        let cw: number, ch: number;
        if (stack) {
          cw = Math.min(w - pad * 2, 420);
          ch = Math.min((availH - gap * 2) / 3, cw * 0.55);
        } else {
          cw = Math.min(300, (w - pad * 2 - gap * 2) / 3);
          ch = cw * 4 / 3;
          if (ch > availH) { ch = availH; cw = Math.max(ch * 0.62, Math.min(cw, ch * 0.9)); }
        }
        words.current.forEach((s, i) => {
          const t = ease(clamp(p * 4 - i * 0.25));
          if (s) s.style.transform = `translateY(${(1 - t) * 110}%) rotate(${(1 - t) * 8}deg)`;
        });
        const orbit = clamp(p / 0.8);
        const land = back(clamp((p - 0.78) / 0.22));
        landed.current = p > 0.97;
        cards.current.forEach((c, i) => {
          if (!c) return;
          const W = `${cw}px`, H = `${ch}px`, C = stack ? "1" : "0";
          if (c.style.width !== W) c.style.width = W;
          if (c.style.height !== H) c.style.height = H;
          if (c.dataset["compact"] !== C) c.dataset["compact"] = C;
          const a = (i / 3) * Math.PI * 2 + orbit * Math.PI * 2 - Math.PI / 2;
          const R = Math.min(w * 0.3, availH * 0.4);
          const ox = Math.cos(a) * R, oy = Math.sin(a) * R * 0.8 + cy;
          const fx = stack ? 0 : (i - 1) * (cw + gap);
          const fy = stack ? cy + (i - 1) * (ch + gap) : cy;
          const x = ox + (fx - ox) * land, y = oy + (fy - oy) * land;
          const spin = 360 - orbit * 360; // full 360 turn, ends upright
          c.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${spin * (1 - land)}deg) scale(${0.65 + land * 0.35})`;
          c.style.zIndex = String(Math.round(Math.sin(a) * 10) + 20);
          c.style.opacity = String(clamp(p * 6));
        });
      }
    };
    loop();
    return onFrame(loop);
  }, []);

  return (
    <section ref={sec} id="work" className="relative -mx-6 h-[320vh] md:-mx-10">
      <div className="sticky top-0 h-screen overflow-hidden [perspective:1400px]">
        <h2 ref={head} className="absolute inset-x-0 top-[max(5rem,10vh)] z-10 mx-auto max-w-5xl px-5 text-center font-display text-[clamp(1.6rem,min(6.5vw,7vh),4.75rem)] font-black uppercase leading-[0.92]">
          {HEAD.map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
              <span ref={(e) => { words.current[i] = e; }} className="inline-block origin-bottom-left">{w}</span>
            </span>
          ))}
        </h2>
        {CARDS.map((c, i) => (
          <div
            key={c.t}
            ref={(e) => { cards.current[i] = e; }}
            className="group/card absolute left-1/2 top-1/2 will-change-transform [perspective:900px]"
          >
            <div
              className="vibe-card group relative h-full overflow-hidden rounded-2xl p-[clamp(0.9rem,1.6vw,1.5rem)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
              onMouseMove={(e) => {
                if (!landed.current) return;
                const r = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                e.currentTarget.style.transform = `rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 10}deg) scale(1.03)`;
                e.currentTarget.style.setProperty("--mx", `${x * 100}%`);
                e.currentTarget.style.setProperty("--my", `${y * 100}%`);
              }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
            >
              <div className="card-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] opacity-60">
                  <span>Work / {c.n}</span>
                  <span className="text-base transition-transform duration-300 group-hover:-rotate-45">→</span>
                </div>
                <span className="num-outline mt-auto font-display text-[clamp(2.75rem,6vw,5.5rem)] group-data-[compact=1]/card:hidden font-black leading-none">{c.n}</span>
                <div className="mt-4 border-t border-current/20 pt-4 group-data-[compact=1]/card:mt-auto group-data-[compact=1]/card:pt-2">
                  <h3 className="font-display text-[clamp(1rem,1.9vw,1.6rem)] font-black uppercase leading-[0.95] [overflow-wrap:anywhere]">{c.t}</h3>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed opacity-60 group-data-[compact=1]/card:mt-1">{c.d}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
