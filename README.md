# SimStarter

A Sims 4 starting-point generator. One click rolls a complete fresh-save setup:

- 📜 **Challenge** — a starting scenario, 1–2 restrictions, a win condition, and a wildcard twist
- 👪 **Household** — family type, three traits, and an aspiration
- 🏠 **House** — build type, style, exterior material, color schemes, features, and bonus rooms
- 🌍 **World** — where to put down roots

Every line has its own ↻ re-roll button, and results only use content from the
packs you own (pick them under **Packs ⚙** — saved in your browser).

## Development

```bash
pnpm install
pnpm dev        # dev server
pnpm test       # vitest watch mode
pnpm test:run   # run tests once
pnpm build      # type-check + production build (dist/)
```

## Stack

Vite · React · TypeScript · Tailwind CSS 4 · Vitest

## Adding content

All rollable content lives in `src/data/` — one file per category. Add an entry
with a unique `id`, a `label`, and the `pack` it requires (`"base"` if none).
The data integrity test (`pnpm test:run`) verifies ids are unique, packs are
real, and every category keeps enough base-game entries to roll without packs.

The previous Create React App version is preserved in git history at commit
`b72eaaf`.
