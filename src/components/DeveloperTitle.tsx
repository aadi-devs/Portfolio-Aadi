import { useEffect, useRef, useState } from "react";

const COUNT = 64;

/** Pinned string with smooth Verlet physics — plucked by the cursor, springs back. */
function PhysicsString() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    let width = element.clientWidth;
    let center = element.clientHeight / 2;
    const y = new Float32Array(COUNT + 1).fill(center);
    const prev = new Float32Array(COUNT + 1).fill(center);
    const impulse = new Float32Array(COUNT + 1);
    let last: { x: number; y: number } | null = null;
    let frame = 0;

    const move = (event: PointerEvent) => {
      const b = element.getBoundingClientRect();
      const x = event.clientX - b.left;
      const py = event.clientY - b.top;
      const lastPt = last;
      last = { x, y: py };
      if (!lastPt || x < 0 || x > width) return;
      const crossed = (lastPt.y - center) * (py - center) <= 0 && Math.abs(py - center) < 70;
      const near = Math.abs(py - center) < 16;
      if (!crossed && !near) return;
      const vy = Math.max(-18, Math.min(18, py - lastPt.y));
      const c = (x / width) * COUNT;
      // Wide gaussian falloff, accumulated and applied on the next frame
      for (let k = 1; k < COUNT; k++) {
        const d = k - c;
        impulse[k] = impulse[k]! + vy * 0.35 * Math.exp(-(d * d) / 40);
      }
    };

    const loop = () => {
      width = element.clientWidth;
      center = element.clientHeight / 2;
      const top = 3,
        bottom = element.clientHeight - 3;
      for (let i = 1; i < COUNT; i++) {
        const imp = Math.max(-10, Math.min(10, impulse[i]!));
        impulse[i] = 0;
        const v = (y[i]! - prev[i]!) * 0.975 + imp;
        prev[i] = y[i]!;
        y[i] = y[i]! + v + (center - y[i]!) * 0.004;
        // Keep the string inside its box: squash instead of clipping out of view
        if (y[i]! < top) {
          y[i] = top;
          prev[i] = Math.max(prev[i]!, top);
        } else if (y[i]! > bottom) {
          y[i] = bottom;
          prev[i] = Math.min(prev[i]!, bottom);
        }
      }
      for (let it = 0; it < 6; it++) {
        for (let i = 1; i < COUNT; i++) {
          const target = (y[i - 1]! + y[i + 1]!) / 2;
          y[i] = y[i]! + (target - y[i]!) * 0.35;
        }
      }
      // Smooth curve through midpoints
      const step = width / COUNT;
      let d = `M0,${center}`;
      for (let i = 1; i < COUNT; i++) {
        const mx = (i + 0.5) * step;
        const my = (y[i]! + y[i + 1]!) / 2;
        d += ` Q${(i * step).toFixed(1)},${y[i]!.toFixed(2)} ${mx.toFixed(1)},${my.toFixed(2)}`;
      }
      d += ` L${width.toFixed(1)},${center}`;
      path.current?.setAttribute("d", d);
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <svg
      ref={svg}
      className="h-[clamp(3rem,14vh,7rem)] min-w-0 flex-1 overflow-hidden text-foreground/50"
      aria-hidden="true"
      data-physics-string=""
    >
      <path
        ref={path}
        d=""
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const WORD = Array.from("Developer");

export function DeveloperTitle() {
  const [pos, setPos] = useState<number | null>(null);
  return (
    <div className="mt-2 flex w-full items-center gap-3 md:gap-6">
      <PhysicsString />
      <h2
        aria-label="Developer"
        className="developer-title shrink-0 select-none font-display text-[clamp(2rem,min(9vw,10vh),4.5rem)] font-black uppercase"
        onPointerLeave={() => setPos(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos(((e.clientX - r.left) / r.width) * WORD.length - 0.5);
        }}
      >
        <span
          className="rise inline-flex py-[clamp(0.5rem,2vh,1.25rem)]"
          style={{ animationDelay: "0.9s" }}
          aria-hidden="true"
        >
          {WORD.map((letter, i) => {
            const d = pos === null ? 99 : i - pos;
            const strength = Math.exp(-(d * d) / 1.2);
            const lift = -0.22 * strength;
            const tilt = Math.max(-1, Math.min(1, d)) * 10 * strength;
            return (
              <span key={i} className="developer-letter">
                <span
                  style={{
                    transform: `translateY(${lift.toFixed(3)}em) rotate(${tilt.toFixed(2)}deg)`,
                  }}
                >
                  {letter}
                </span>
              </span>
            );
          })}
        </span>
      </h2>
      <PhysicsString />
    </div>
  );
}
