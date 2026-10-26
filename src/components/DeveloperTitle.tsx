import { useEffect, useRef, useState } from "react";

function PhysicsString() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const element = svg.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup = () => {};
    void import("matter-js").then(({ default: Matter }) => {
      if (disposed) return;
      const { Engine, Bodies, Body, Constraint, Composite } = Matter;
      const engine = Engine.create({ gravity: { x: 0, y: 0 }, constraintIterations: 6 });
      let width = element.clientWidth;
      const center = 40;
      const count = 30;
      let nodes: ReturnType<typeof Bodies.circle>[] = [];
      let frame = 0;
      let previous = 0;
      const reset = () => {
        width = element.clientWidth;
        Composite.clear(engine.world, false);
        nodes = Array.from({ length: count + 1 }, (_, i) => Bodies.circle(width * i / count, center, 1, {
          isStatic: i === 0 || i === count,
          frictionAir: 0.035,
          collisionFilter: { mask: 0 },
        }));
        Composite.add(engine.world, nodes);
        nodes.forEach((node, i) => {
          if (i > 0) Composite.add(engine.world, Constraint.create({ bodyA: nodes[i - 1], bodyB: node, stiffness: 0.9, damping: 0.025, length: width / count }));
          if (!node.isStatic) Composite.add(engine.world, Constraint.create({ pointA: { x: width * i / count, y: center }, bodyB: node, length: 0, stiffness: 0.008, damping: 0.012 }));
        });
      };
      const move = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        if (x < 3 || x > width - 3 || Math.abs(y - center) > 32) return;
        nodes.forEach((node, i) => {
          const distance = Math.abs(width * i / count - x);
          if (node.isStatic || distance > 36) return;
          const influence = 1 - distance / 36;
          const offset = (y - center || -8) * influence;
          Body.setPosition(node, { x: width * i / count, y: center + offset });
          Body.setVelocity(node, { x: 0, y: offset * 0.18 });
        });
      };
      const loop = (time: number) => {
        if (previous) Engine.update(engine, Math.min(time - previous, 1000 / 60));
        previous = time;
        path.current?.setAttribute("d", nodes.map((node, i) => `${i === 0 ? "M" : "L"}${node.position.x.toFixed(2)},${node.position.y.toFixed(2)}`).join(" "));
        frame = requestAnimationFrame(loop);
      };
      reset();
      const observer = new ResizeObserver(reset);
      observer.observe(element);
      element.addEventListener("pointermove", move);
      frame = requestAnimationFrame(loop);
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        element.removeEventListener("pointermove", move);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });
    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <svg ref={svg} className="h-20 min-w-0 flex-1 touch-pan-y overflow-visible text-foreground/30" aria-hidden="true" data-physics-string="">
      <path ref={path} d="M0,40 H2000" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function DeveloperTitle() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="mt-2 flex w-full items-center gap-3 md:gap-6">
      <PhysicsString />
      <h2 aria-label="Developer" className="developer-title shrink-0 select-none font-display text-4xl font-black uppercase sm:text-5xl md:text-7xl" onPointerLeave={() => setActive(null)}>
        <span className="rise inline-flex py-5" style={{ animationDelay: "0.9s" }} aria-hidden="true">
          {Array.from("Developer").map((letter, i) => (
            <span key={i} className={`developer-letter ${i % 2 === 0 ? "developer-letter-up" : "developer-letter-down"} ${active === i ? "is-active" : active !== null && Math.abs(active - i) === 1 ? "is-neighbor" : ""}`} onPointerEnter={() => setActive(i)}>
              <span>{letter}</span>
            </span>
          ))}
        </span>
      </h2>
      <PhysicsString />
    </div>
  );
}