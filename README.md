# Aadi Portfolio

A personal portfolio website for Aadi — creative developer.

## Tech Stack

- **Framework:** React 19 + TanStack Start (SSR)
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix UI)
- **3D:** Three.js + React Three Fiber
- **Backend/Auth:** Supabase
- **Database ORM:** Drizzle ORM (PostgreSQL)
- **Email:** Resend
- **Build:** Vite + Nitro (Vercel preset)
- **Package manager:** Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.x
- Node.js >= 20

### Install

```sh
git clone https://github.com/aadi-devs/aadi-portfolio
cd aadi-portfolio
bun install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```sh
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `RESEND_API_KEY` | Resend API key for contact form emails |
| `RESEND_FROM` | Sender address (e.g. `Portfolio <contact@yourdomain.com>`) |
| `CONTACT_TO_EMAIL` | Email address to receive contact form submissions |
| `DATABASE_MIGRATION_URL` | PostgreSQL connection string for Drizzle migrations |
| `CRON_SECRET` | Secret for authenticating cron job requests |
| `NITRO_PRESET` | Deployment preset (default: `vercel`) |

### Development

```sh
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```sh
bun run build
```

### Preview production build

```sh
bun run preview
```

## Project Notes

- Keep Developer-title interactions in their own component; dynamically load Matter.js only in its browser effect for pinned string physics so SSR stays browser-independent.
- Scroll-linked animations subscribe to `onFrame()` in `src/components/Motion.tsx` instead of their own `requestAnimationFrame`, so they update in the same frame as Lenis smooth scroll.
- Never gate visibility with `IntersectionObserver` in this project: `overflow-x: clip` on `<main>` makes Chromium report every target as non-intersecting. Use a viewport-rect check inside `Motion.tsx`'s `onFrame()` loop instead.
