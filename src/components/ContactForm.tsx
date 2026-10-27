import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
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
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${value === o ? "border-foreground bg-foreground text-background" : "border-foreground/25 hover:border-foreground"}`}
        >{o}</button>
      ))}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

const input = "w-full border-b border-foreground/25 bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground";

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

  if (state === "done") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="font-display text-[min(10vw,14vh)] font-black uppercase leading-none">Got it ✦</p>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">I’ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid w-full max-w-4xl gap-10 py-[8vh] md:grid-cols-2">
      <div className="md:col-span-2"><Field label="What do you need?" error={errors.category}><Chips name="Category" options={CATEGORIES} value={f.category} onChange={set("category")} /></Field></div>
      <div className="md:col-span-2"><Field label="Budget" error={errors.budget}><Chips name="Budget" options={BUDGETS} value={f.budget} onChange={set("budget")} /></Field></div>
      <div className="md:col-span-2"><Field label="Timeline (optional)"><Chips name="Timeline" options={TIMELINES} value={f.timeline} onChange={set("timeline")} /></Field></div>
      <Field label="Name" error={errors.name}><input className={input} value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={100} placeholder="Your name" /></Field>
      <Field label="Email" error={errors.email}><input type="email" className={input} value={f.email} onChange={(e) => set("email")(e.target.value)} maxLength={255} placeholder="you@email.com" /></Field>
      <Field label="Contact number (optional)" error={errors.phone}><input type="tel" className={input} value={f.phone} onChange={(e) => set("phone")(e.target.value)} maxLength={30} placeholder="+91 98765 43210" /></Field>
      <Field label="Discord username (optional)" error={errors.discord}><input className={input} value={f.discord} onChange={(e) => set("discord")(e.target.value)} maxLength={40} placeholder="username" /></Field>
      <div className="md:col-span-2"><Field label="Tell me about the project" error={errors.message}><textarea className={`${input} min-h-32 resize-y`} value={f.message} onChange={(e) => set("message")(e.target.value)} maxLength={2000} placeholder="Ideas, references, goals…" /></Field></div>
      <div className="flex flex-col items-start gap-3 md:col-span-2">
        <button type="submit" disabled={state === "sending"} className="scroll-btn disabled:opacity-50">
          <span>{state === "sending" ? "Sending…" : "Send it"}</span><span className="scroll-btn-arrow" aria-hidden>↗</span>
        </button>
        {state === "fail" && <span className="text-xs text-destructive">Something went wrong — please try again.</span>}
      </div>
    </form>
  );
}
