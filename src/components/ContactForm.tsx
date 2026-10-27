import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { autoScrollTo } from "@/components/Motion";
import { BUDGETS, CATEGORIES, TIMELINES, contactSchema, submitContact } from "@/lib/contact.functions";

type Errors = { [K in "name"|"email"|"phone"|"discord"|"category"|"budget"|"message"]?: string | undefined };

function Chips({ name, options, value, onChange }: { name: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(value === o ? "" : o)}
          className={`rounded-full border px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-95 ${value === o ? "border-background bg-background text-foreground" : "border-background/35 text-background/85 hover:border-background/70 hover:bg-background/10 hover:text-background"}`}
        >{o}</button>
      ))}
    </div>
  );
}

function Field({ label, error, step, children }: { label: string; error?: string | undefined; step?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-3">
      <span className="flex items-baseline gap-3 text-[10px] uppercase tracking-[0.35em] text-background/75">
        {step && <span className="font-display text-sm font-black leading-none text-background/50">{step}</span>}
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

const input = "peer w-full border-b border-background/30 bg-transparent py-2.5 text-lg text-background outline-none transition-colors duration-300 placeholder:text-background/45 focus:border-background/60";

function Underline({ children }: { children: ReactNode }) {
  return (
    <span className="relative block">
      {children}
      <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-background transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] peer-focus:scale-x-100" />
    </span>
  );
}

export function ContactForm() {
  const send = useServerFn(submitContact);
  const [f, setF] = useState({ name: "", email: "", phone: "", discord: "", category: "", budget: "", timeline: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail">("idle");
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(f);
    if (!parsed.success) {
      const errs: Errors = {};
      parsed.error.issues.forEach((i) => { const k = String(i.path[0]) as keyof Errors; if (!errs[k]) errs[k] = k === "category" || k === "budget" ? "Pick one" : i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const r = await send({ data: parsed.data });
      setState(r.ok ? "done" : "fail");
    } catch { setState("fail"); }
  };

  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state !== "done") return;
    const el = doneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    autoScrollTo(Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2));
  }, [state]);

  if (state === "done") {
    return (
      <div ref={doneRef} className="grid min-h-[100svh] w-full place-items-center py-[6vh] text-center">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <span className="done-ring grid size-16 place-items-center rounded-full border border-foreground/25 sm:size-20">
            <svg viewBox="0 0 48 48" className="size-8 sm:size-10" fill="none" aria-hidden>
              <path className="done-draw" d="M13 25.5 21 33.5 35.5 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="done-rise mt-[clamp(1.25rem,4vh,2.5rem)] font-display text-[min(11vw,15vh)] font-black uppercase leading-none" style={{ animationDelay: ".2s" }}>Got it ✦</p>
          <span className="done-line mt-[clamp(1.25rem,4vh,2rem)] block h-px w-full max-w-md bg-foreground/25" style={{ animationDelay: ".6s" }} />
          <p className="done-fade mt-[clamp(1.25rem,4vh,2rem)] text-sm uppercase tracking-[0.3em] text-muted-foreground" style={{ animationDelay: ".75s" }}>I’ll get back to you soon.</p>
          <p className="done-fade mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70" style={{ animationDelay: ".95s" }}>Your message is on its way.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto w-full max-w-5xl px-1 py-[4vh]">
      <div
        className="vibe-card group/panel relative overflow-hidden rounded-[clamp(1.25rem,3vw,2.25rem)] p-[clamp(1.25rem,4.5vw,3.25rem)]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
          e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <div className="card-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100" />
        <div className="relative flex flex-col gap-[clamp(1.5rem,4vh,2.25rem)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-background/20 pb-5 text-[10px] uppercase tracking-[0.35em]">
            <span className="text-background/85">Project brief</span>
            <span className="text-background/50">Takes a minute</span>
          </div>

          <div className="grid gap-[clamp(1.5rem,4vh,2.25rem)] md:grid-cols-2">
            <div className="md:col-span-2"><Field label="What do you need?" error={errors.category} step="01"><Chips name="Category" options={CATEGORIES} value={f.category} onChange={set("category")} /></Field></div>
            <div className="md:col-span-2"><Field label="Budget" error={errors.budget} step="02"><Chips name="Budget" options={BUDGETS} value={f.budget} onChange={set("budget")} /></Field></div>
            <div className="md:col-span-2"><Field label="Timeline (optional)" step="03"><Chips name="Timeline" options={TIMELINES} value={f.timeline} onChange={set("timeline")} /></Field></div>
            <Field label="Name" error={errors.name}><Underline><input className={input} value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={100} placeholder="Your name" /></Underline></Field>
            <Field label="Email" error={errors.email}><Underline><input type="email" className={input} value={f.email} onChange={(e) => set("email")(e.target.value)} maxLength={255} placeholder="you@email.com" /></Underline></Field>
            <Field label="Contact number (optional)" error={errors.phone}><Underline><input type="tel" className={input} value={f.phone} onChange={(e) => set("phone")(e.target.value)} maxLength={30} placeholder="+91 98765 43210" /></Underline></Field>
            <Field label="Discord username (optional)" error={errors.discord}><Underline><input className={input} value={f.discord} onChange={(e) => set("discord")(e.target.value)} maxLength={40} placeholder="username" /></Underline></Field>
            <div className="md:col-span-2"><Field label="Tell me about the project" error={errors.message} step="04"><Underline><textarea className={`${input} min-h-32 resize-y`} value={f.message} onChange={(e) => set("message")(e.target.value)} maxLength={2000} placeholder="Ideas, references, goals…" /></Underline></Field></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-background/20 pt-6">
            <p className="max-w-[18rem] text-[10px] uppercase leading-relaxed tracking-[0.3em] text-background/50">
              {state === "fail" ? <span className="text-destructive">Something went wrong — please try again.</span> : "Tell me the idea, I’ll reply fast."}
            </p>
            <button type="submit" disabled={state === "sending"} className="send-btn disabled:opacity-50">
              <span>{state === "sending" ? "Sending…" : "Send it"}</span><span className="scroll-btn-arrow" aria-hidden>↗</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
