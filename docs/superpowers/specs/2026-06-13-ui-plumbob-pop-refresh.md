# SimStarter UI Refresh — "Plumbob Pop"

_2026-06-13_

## Goal

Make the UI "a little less cookie cutter" — it currently reads as default
Tailwind (system font, flat white cards, uniform green, soft shadows). Add real
personality while keeping the friendly Sims identity. Visual-only: no changes to
behavior, data, the generator, or component structure beyond styling and a small
accent prop.

## Direction: Plumbob Pop (with per-category accents)

Chosen over "Cozy Paper" (warm editorial) and "Retro Sim Panel" (pixel game UI)
because it keeps the existing green identity and is the most proportionate to "a
little less cookie cutter."

### Changes

1. **Typography** — Add Google Fonts **Fredoka** (rounded display: wordmark, card
   titles, buttons) and **Nunito** (body). Loaded via `<link>` in `index.html`;
   exposed as `--font-display` / base sans in `index.css`.

2. **Tactile depth** — Replace soft blur shadows with a chunky offset shadow
   (`0 4px 0 <accent>`). Buttons sink on `:active` (`translate-y`). Pressed
   game-UI feel.

3. **Per-category accents** — Each result card gets its own accent within one
   palette:
   - 📜 Challenge → amber
   - 👪 Household → pink
   - 🏠 House → sky blue
   - 🌍 World → teal

   Drives the card's tinted header, chunky shadow color, and caption pills.
   Plumbob green remains the header/brand/CTA color tying it together.
   Implemented as an `accent` prop on `ResultCard` / `ResultLine` mapping to a
   small set of static Tailwind class bundles (no dynamic class strings, so
   Tailwind's JIT keeps them).

4. **Caption pills** — Tiny uppercase captions become small rounded pills in the
   card's accent color.

5. **Plumbob motif** — Slightly larger header plumbob with a gentle idle bob
   animation; larger plumbob + Fredoka headline in the empty state.

### Files

- `index.html` — font `<link>` tags
- `src/index.css` — font tokens, shadow/bob animation tokens
- `src/components/Header.tsx` — Fredoka wordmark, chunky buttons, bobbing plumbob
- `src/components/ResultCard.tsx` — `accent` prop, tinted header, chunky shadow
- `src/components/ResultLine.tsx` — caption pills, accent-aware row
- `src/App.tsx` — pass `accent` per card
- `src/components/PackBadge.tsx` — restyle to match

### Non-goals / constraints

- No dependency additions (fonts via CDN link).
- All 72 existing tests must still pass — they assert roles/text, not classes.
- No markup/DOM-structure changes that would break ARIA or test queries.
- Accent classes are static literals (Tailwind JIT safe), not interpolated.

### Verification

Dev server + real screenshot for sign-off; `pnpm test:run` green; `pnpm build`
clean.
