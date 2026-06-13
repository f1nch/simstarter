# SimStarter — Handoff

_Last updated: 2026-06-13_

A Sims 4 "new save" starting-point generator. Client-only web app that mixes
challenge components (scenario, restrictions, goal, wildcard) plus household,
house build, and world rolls — all filtered to the packs the user owns.

## Status: feature-complete, PR open, awaiting review/merge

- **Branch:** `rebuild-vite-ts`
- **PR:** https://github.com/f1nch/simstarter/pull/1 (OPEN)
- **Tests:** 72/72 passing (`pnpm test`)
- **Build:** clean (`pnpm build` → `dist/`)
- Browser-verified golden paths: generate, per-item re-roll isolation, pack
  persistence to localStorage, Escape-to-close dialog, responsive 2-col grid.

## Stack

Vite 5 + React 19 + TypeScript 5.8 (strict) + Tailwind CSS 4 + Vitest 2 +
Testing Library. pnpm package manager (note: v10 requires
`pnpm.onlyBuiltDependencies: ["esbuild"]` in package.json). `base: "./"` in
vite.config for GitHub Pages compatibility.

## Architecture

- **`src/data/`** — all rollable content as `DataItem { id, label, pack, detail? }`.
  - `packs.ts` — 52-pack registry (`packIds as const` → `PackId` type). 1 base,
    19 expansions, 12 game, 20 stuff.
  - Category files: `scenarios`, `restrictions`, `goals`, `wildcards`,
    `households`, `traits`, `aspirations`, `houseTypes`, `houseStyles`,
    `exteriorMaterials`, `colorSchemes`, `exteriorFeatures`, `bonusRooms`,
    `interiorFeatures`, `worlds`.
  - `index.ts` — `categories: Record<string, DataItem[]>` registers all 15.
  - `integrity.test.ts` — validates pack coverage, id uniqueness, valid pack
    refs, ≥5 base entries per category (worlds exception: ≥3, see `MIN_BASE`).
    Uses a plain `for...of` loop, NOT `describe.each` (which throws on an empty
    table).
- **`src/generator.ts`** — pure `roll(category, ownedPacks, exclude?)` and
  `rollMany(category, ownedPacks, count)`; `StartingPoint` (16 slots: 11 single,
  5 array); `singleSlotCategories` / `arraySlotCategories` maps + `arraySlotCounts`
  for re-roll wiring; `generateStartingPoint(ownedPacks)`.
- **`src/useOwnedPacks.ts`** — React hook, localStorage persistence
  (`STORAGE_KEY = "simstarter.ownedPacks"`), `useCallback`-stabilized setter,
  filters unknown ids, always keeps `base`.
- **`src/components/`** — `PackBadge`, `ResultLine` (`key={item.id}` +
  `animate-pop` for remount animation), `ResultCard`, `Header`, `PackPicker`
  (accessible dialog: `aria-modal`, focus-on-open, Escape-to-close).
- **`src/App.tsx`** — wiring: generate, per-item re-roll, pack picker toggle.

## Docs

- `docs/superpowers/specs/2026-06-12-simstarter-design.md` — approved design.
- `docs/superpowers/plans/2026-06-12-simstarter-rebuild.md` — 12-task plan (all done).

## Open items / what's left

1. **KNOWN DATA BUG — 4 non-CAS traits still present** (`src/data/traits.ts:43-46`).
   These were flagged Critical in review and should be **removed** — they are not
   selectable in Create-A-Sim:
   - `dance_machine` (Dance Machine) + `insider` (Insider) — Get Together *reward*
     traits, earned via the club system.
   - `adventurous` (Adventurous) + `proper` (Proper) — Snowy Escape *Lifestyle*
     traits, acquired in-world through behavior.
   Fix: delete those 4 lines. Re-run `pnpm test` (integrity test should still pass;
   Get Together / Snowy Escape will simply contribute fewer trait entries).

2. **Merge the PR** once #1 is resolved (or decide to merge as-is and fix in a
   follow-up).

3. **Deploy** — `base: "./"` is already set for GitHub Pages. No CI/deploy workflow
   exists yet; would need a `gh-pages` action or manual `dist/` publish if desired.

## Possible future enhancements (not scoped, not committed)

- "Copy/share" a generated starting point (URL params or text export).
- Difficulty weighting or themed presets.
- More pack content depth per category.
