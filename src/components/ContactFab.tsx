import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DISCORDS = ["itsmevictus.", "romushomu"];
const EMAIL = "aadi@victus.wtf";
const PHONE = "+918742874921";

function Row({ label, value, href, action }: { label: string; value: string; href: string; action: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-foreground/15 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        <button
          type="button"
          className="truncate font-display text-lg font-black transition-opacity hover:opacity-60"
          onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          title="Copy"
        >
          {copied ? "Copied ✓" : value}
        </button>
      </div>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        onClick={() => { if (label.startsWith("Discord")) navigator.clipboard?.writeText(value); }}
        className="shrink-0 rounded-full bg-foreground px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-background transition-transform hover:scale-105"
      >
        {action} ↗
      </a>
    </div>
  );
}

export function ContactFab() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Contact"
        onClick={() => setOpen(true)}
        className="contact-fab fixed bottom-[clamp(1rem,3vw,2rem)] right-[clamp(1rem,3vw,2rem)] z-50 grid h-14 w-14 place-items-center rounded-full bg-foreground text-background shadow-xl transition-transform duration-300 hover:scale-110"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-foreground/30 [animation-duration:2.5s]" />
        <span className="relative text-xl transition-transform duration-300 group-hover:rotate-0 [.contact-fab:hover_&]:-rotate-45">→</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-black uppercase">Let’s talk</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-[0.3em]">Tap a name to copy</DialogDescription>
          </DialogHeader>
          <div>
            {DISCORDS.map((d) => (
              <Row key={d} label="Discord" value={d} href="https://discord.com/channels/@me" action="DM" />
            ))}
            <Row label="Gmail" value={EMAIL} href={`mailto:${EMAIL}`} action="Mail" />
            <Row label="Phone" value={PHONE} href={`tel:${PHONE}`} action="Call" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
