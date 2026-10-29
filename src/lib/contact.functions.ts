import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CATEGORIES = [
  "Website",
  "Web app",
  "3D / Interactive",
  "UI / UX design",
  "Discord bot",
  "Other",
] as const;
export const BUDGETS = ["Under $250", "$250 – $1k", "$1k – $3k", "$3k+", "Not sure yet"] as const;
export const TIMELINES = ["ASAP", "2–4 weeks", "1–3 months", "Flexible"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Numbers only")
    .optional()
    .or(z.literal("")),
  discord: z.string().trim().max(40).optional().or(z.literal("")),
  category: z.enum(CATEGORIES),
  budget: z.enum(BUDGETS),
  timeline: z.enum(TIMELINES).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendContactEmail } = await import("./contact-email.server");
    try {
      await sendContactEmail(data);
      return { ok: true as const };
    } catch (e) {
      console.error("contact email failed", e);
      return { ok: false as const };
    }
  });
