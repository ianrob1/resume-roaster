# Custom icons for "What you get" section

To use your own icons:

1. **Add your icon files here** (e.g. `bullet.svg`, `keyword.svg`, `ats.svg`, `roast.svg`, `rewrite.svg`).
   - SVG is best (stays sharp at any size).
   - **PNG/WebP**: Use icons that are **one dark color (e.g. black) on transparent**. They are automatically tinted **orange** on the white cards and **white** on the orange ATS card. Use at least 80×80 px.

2. **In `app/page.tsx`**, each feature can use a custom icon by setting `iconSrc` to the path:
   - Path is from the site root, e.g. `/icons/roast.svg`.

3. **Suggested filenames** (match the order of the cards):
   - `bullet.svg` — Bullet Point Rewrites
   - `keyword.svg` — Keyword Optimization
   - `ats.svg` — ATS Compatibility Score (shown on orange card; use a white/light icon)
   - `roast.svg` — Brutal Roast Feedback
   - `rewrite.svg` — AI Resume Rewrite

If `iconSrc` is set for a feature, that image is used. Otherwise the built-in SVG icon is shown.
