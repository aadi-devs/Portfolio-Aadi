import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { onFrame } from "./Motion";

const RobotScene = lazy(() => import("./RobotScene"));

const NAME = ["Aadi", "Bishnoi"];

export function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setMounted(true);
    // overflow-x:clip on <main> makes IntersectionObserver report nothing as visible, so compare against the viewport directly.
    return onFrame(() => {
      const r = ref.current?.getBoundingClientRect();
      setVisible(!!r && r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3);
    });
  }, []);

  return (
    <section
      ref={ref}
      id="about"
      className="relative grid min-h-screen grid-cols-1 items-center gap-6 py-[8vh] md:grid-cols-2 md:gap-10"
    >
      <div className="relative order-2 h-[55vh] min-h-[340px] md:order-1 md:h-[78vh]">
        {mounted && (
          <Suspense fallback={null}>
            <RobotScene visible={visible} />
          </Suspense>
        )}
        <p
          className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-opacity duration-700 ${visible ? "opacity-100 delay-1000" : "opacity-0"}`}
        >
          Drag to spin · Double-click to break it
        </p>
      </div>
      <div className="order-1 md:order-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">About / Me</p>
        <h2 className="mt-4 font-display text-[clamp(3.5rem,11vw,9rem)] font-black uppercase leading-[0.85]">
          {NAME.map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <span
                className="inline-block transition-transform duration-[1100ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{
                  transform: visible ? "translateY(0)" : "translateY(110%)",
                  transitionDelay: `${0.15 + i * 0.12}s`,
                }}
              >
                {w}
              </span>
            </span>
          ))}
        </h2>
        <p
          className="mt-8 max-w-md text-[clamp(0.95rem,1.4vw,1.15rem)] leading-relaxed text-muted-foreground transition-all duration-1000"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transitionDelay: "0.45s",
          }}
        >
          I'm a developer who builds things block by block — Minecraft worlds, websites that feel
          alive, and full-stack apps from database to pixel. Headphones on, ideas loud.
        </p>
      </div>
    </section>
  );
}
