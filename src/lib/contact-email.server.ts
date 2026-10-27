import type { ContactInput } from "./contact.functions";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;font:600 11px/1.4 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#888;width:140px;vertical-align:top">${label}</td><td style="padding:12px 0;border-bottom:1px solid #eee;font:15px/1.5 Arial,sans-serif;color:#111">${esc(value)}</td></tr>`;
}

export function contactEmailHtml(d: ContactInput) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f4;padding:32px 16px">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#111;padding:28px 32px">
<div style="font:600 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#aaa">New project inquiry</div>
<div style="font:900 28px/1.2 Arial,sans-serif;color:#fff;margin-top:8px">${esc(d.name)} · ${esc(d.category)}</div>
</td></tr>
<tr><td style="padding:24px 32px"><table role="presentation" width="100%" style="border-collapse:collapse">
${row("Name", d.name)}${row("Email", d.email)}${row("Phone", d.phone)}${row("Discord", d.discord)}
${row("Category", d.category)}${row("Budget", d.budget)}${row("Timeline", d.timeline)}
</table>
<div style="margin-top:24px;font:600 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#888">Project details</div>
<div style="margin-top:8px;padding:16px;background:#f7f7f7;border-radius:8px;font:15px/1.6 Arial,sans-serif;color:#111;white-space:pre-wrap">${esc(d.message)}</div>
<a href="mailto:${esc(d.email)}" style="display:inline-block;margin-top:24px;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font:600 13px Arial,sans-serif">Reply to ${esc(d.name)} ↗</a>
</td></tr></table></body></html>`;
}

export async function sendContactEmail(d: ContactInput) {
  const key = process.env['RESEND_API_KEY'];
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env['RESEND_FROM'] || "Portfolio <onboarding@resend.dev>",
      to: [process.env['CONTACT_TO_EMAIL'] || "aadi@victus.wtf"],
      reply_to: d.email,
      subject: `New inquiry: ${d.category} — ${d.name}`,
      html: contactEmailHtml(d),
    }),
  });
  if (!res.ok) throw new Error(`Resend failed [${res.status}]: ${await res.text()}`);
}
