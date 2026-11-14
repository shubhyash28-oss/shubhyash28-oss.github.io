# Global Academic Leaders

Website for Shubh Jain's tutoring: SAT prep, school math, and elementary tutoring.
Plain HTML, CSS, and a little JavaScript. No framework, no dependencies.

Live at https://shubhyash28-oss.github.io/

## Build and preview

```bash
python3 build.py
python3 -m http.server 4321 --directory docs
```

`build.py` wraps every page in `src/pages/` with the shared head, header, and footer from
`src/partials/`, and writes the finished site to `docs/`. Edit files in `src/`, never in `docs/`.

## Updating content

| What | Where |
| --- | --- |
| Email, phone, LinkedIn | `SITE` at the top of `build.py`. Any value left as `None` shows "coming soon" instead. |
| Testimonials | The quote cards in `src/pages/testimonials.html` and `src/pages/index.html`. Set `SHOW_REVIEWS = True` in `build.py` once they're real. |
| Shubh's photo | Comment in `src/pages/index.html` (portrait section). Put the file in `src/assets/`. |
| SAT guide delivery | Without a form service, the guide form opens the visitor's email app addressed to Shubh. To send automatically, add `data-endpoint="https://..."` to the form in `src/pages/sat.html`. |

## Publishing

GitHub Pages serves the `docs/` folder on `main`. To publish a change:

```bash
python3 build.py
git add -A && git commit -m "Update site" && git push
```

The live site updates a minute or two after the push.

## Design system

- Type: DM Sans only. Heavy, tight headlines; sentence case everywhere.
- Color: leaf `#0E3B27`, fern `#1D7A4C`, mint `#D5F2DD`, mist `#F2F5F0`, ember `#C9460A` (buttons), tangerine `#FF7A2F` (fills, always with leaf text).
- Each service keeps one color everywhere: SAT is tangerine, school math is fern, elementary is leaf.
- Layout: full-width rounded panels on a mist page, content in a 1200px container.
- Motion: one moment only, the hero result cards dealing in on load. Respects reduced motion.
