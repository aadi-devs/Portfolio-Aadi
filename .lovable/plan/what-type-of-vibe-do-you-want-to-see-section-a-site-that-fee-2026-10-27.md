# "What type of vibe do you want to see?" section + a site that feels alive

## What you'll see
1. **Scroll from the hero** — the hero text drifts up, fades and blurs a little as you leave it, and a thin progress line at the top fills as you scroll.
2. **New section, pinned to the screen while you scroll through it:**
   - Headline "What type of vibe do you want to see?" shows up word by word (each word slides up out of a mask, with a slight rotate).
   - Three cards — **Mine development**, **Website development**, **Full stack development** — start spread out around the screen and travel in a full 360° orbit around the centre as you scroll, spinning in 3D on the way.
   - At the end of the scroll they land side by side in the middle, under the headline, and come to rest with a gentle bounce.
   - Each card: a big number (01/02/03), the title, one short line of text, and a tilt-toward-your-mouse effect with a moving shine when hovered.
3. **More movement across the site:**
   - Smooth, slightly eased scrolling.
   - Sections reveal with a curtain wipe and a soft fade/blur as they come into view.
   - A strip of large text scrolling sideways between the hero and the cards ("Design • Code • Motion • Ideas"), moving faster when you scroll faster.
   - Nav links and buttons pull gently toward your cursor.
   - Faint background grain and slow-moving glow blobs so the page never feels static.
4. Everything keeps the current cream background, display font and black/cream colours. Movement is reduced for people whose device asks for less motion.

## Technical details
- New `src/components/VibeCards.tsx`: tall section (about 300vh) with a sticky inner stage; scroll progress 0 to 1 is read in a rAF loop (no new library). Each card's angle = baseAngle + progress·360°, radius shrinks to 0 → final row positions mixed in over the last 30% with an easeOutBack curve. Uses transforms only.
- New `src/components/Marquee.tsx`, `ScrollProgress.tsx`, `Reveal.tsx` (IntersectionObserver), `Magnetic.tsx`; Lenis-style smooth scroll done with a small hand-written lerp or the `lenis` package.
- `index.tsx`: page changes from a fixed one-screen layout to a scrolling one; hero gets the scroll-out effect; add the new sections after it.
- New keyframes and utilities (grain, blobs, shine, word-rise) go in `src/styles.css`; no hardcoded colours in components.
- `prefers-reduced-motion` turns off the orbit (cards just fade in) and the smooth scrolling.
- The existing DeveloperTitle physics stays as is.

## Note
"Mine development" is used exactly as you wrote it. If you meant something else (e.g. Mobile or Minecraft development), say so.
