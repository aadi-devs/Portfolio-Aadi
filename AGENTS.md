<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Developer title interactions in their own component; dynamically load Matter.js only in its browser effect for pinned string physics so SSR stays browser-independent.
- Scroll-linked animations subscribe to onFrame() in src/components/Motion.tsx instead of their own requestAnimationFrame, so they update in the same frame as Lenis smooth scroll (separate loops cause jitter).
