# SimStarter — Sims 4 Starting Point Generator: Design

**Date:** 2026-06-12
**Status:** Approved pending final user review

## Purpose

A client-only web app that generates a complete Sims 4 "new save" starting point in one click: a mix-and-match challenge, a household, a house build prompt, and a world — filtered to the expansion packs the player owns. This replaces the old versioned roadmap in the README; all of its ideas are combined into this single app.

## Decisions Made During Brainstorming

| Decision | Choice |
|---|---|
| Scope | Combine everything from the old README: challenge + household + house + world + pack filtering |
| Challenge generation | Mix-and-match from components (scenario, restrictions, goal, wildcard) — not a curated challenge list |
| Pack support | Full per-pack filtering; every data item tagged with its required pack |
| Backend | None — pure client-side, pack selections in localStorage |
| Re-roll model | Per-item ↻ buttons only; no locks, no section re-roll |
| Layout | Card grid dashboard (Challenge / Household / House / World cards) |
| Visual style | "Plumbob Playful" — bright plumbob green, rounded cards, game-like energy |
| Stack | Vite + React + TypeScript + Tailwind 4, pnpm, Vitest |
| Home | This repo (simstarter), CRA leftovers removed, git history kept |

## Architecture

Single-page app, no router, no backend. One screen: header + result card grid + pack picker modal.

### Data Model

Everything rollable is a tagged entry sharing one shape:

```ts
interface DataItem {
  id: string;
  label: string;        // "Teen runaway with §500"
  pack: PackId;         // "base" | "get_to_work" | ...
  detail?: string;      // optional flavor/rules text
}
```

One module per category under `src/data/`:

- `packs.ts` — master pack list (id, name, type: base | expansion | game | stuff)
- Challenge blocks: `scenarios.ts`, `restrictions.ts`, `goals.ts`, `wildcards.ts`
- Household: `households.ts` (family types), `traits.ts`, `aspirations.ts`
- House: `houseTypes.ts`, `houseStyles.ts`, `colorSchemes.ts`, `exteriorFeatures.ts`, `bonusRooms.ts`, `interiorFeatures.ts`
- `worlds.ts` — each world tagged with the pack it ships with

**Invariant: every category has at least 5 base-game entries**, so a base-game-only player always gets a full roll and every line still has a re-roll alternative (worst case: traits holds 3 distinct items and a ↻ needs a 4th). Enforced by a data integrity test.

### Generator

A pure function, no React:

```ts
function roll(category: DataItem[], ownedPacks: Set<PackId>, exclude?: string): DataItem
```

Filters to owned packs, picks uniformly at random, never returns `exclude` when 2+ eligible options exist. "Generate" calls `roll` once per slot; a per-item ↻ re-rolls that slot only.

The full result:

```ts
interface StartingPoint {
  scenario: DataItem;
  restrictions: DataItem[];   // count rolled randomly: 1 or 2, equal odds
  goal: DataItem;
  wildcard: DataItem;
  household: DataItem;
  traits: DataItem[];         // exactly 3 in v1
  aspiration: DataItem;
  houseType: DataItem;
  houseStyle: DataItem;
  exteriorColors: DataItem;
  interiorColors: DataItem;
  exteriorFeatures: DataItem[]; // exactly 2
  bonusRooms: DataItem[];       // exactly 2
  interiorFeatures: DataItem[]; // exactly 2
  world: DataItem;
}
```

Array slots never contain duplicates: rolling an array passes already-held ids as exclusions. A per-item ↻ on an array line re-rolls only that element, excluding both its current id and its siblings' ids.

### State

Plain `useState` in the app root (no state library):

- `ownedPacks: Set<PackId>` — persisted to localStorage on change, loaded on start; defaults to base game only
- `startingPoint: StartingPoint | null` — null until first Generate; not persisted

## UI Components

- **`App`** — owns state, layout shell
- **`Header`** — title, "Packs" button, big 🎲 Generate button
- **`PackPicker`** — modal listing packs grouped by type with checkboxes; base game always on, not uncheckable
- **`ResultGrid`** — responsive grid (2×2 desktop, stacked mobile); friendly empty state before first roll
- **Category cards** (configurations of a shared `ResultCard`):
  - 📜 Challenge — scenario, restrictions, goal, wildcard
  - 👪 Household — family type, traits, aspiration
  - 🏠 House — type, style, exterior + interior color schemes, exterior features, bonus rooms, interior features
  - 🌍 World — world with pack badge
- **`ResultLine`** — label, optional detail, pack badge for non-base content, ↻ button with a quick spin/fade micro-animation on change

Styling: Tailwind 4, plumbob-green palette (`#22c55e` family), rounded cards, soft shadows, playful type.

## Testing

Vitest:

1. `roll()` unit tests — pack filtering respected; excluded id never returned when alternatives exist; single-eligible-item category handled gracefully
2. Data integrity test — walks every data module: unique ids, every `pack` is a valid PackId, ≥5 base-game entries per category
3. One component test — Generate fills all cards; clicking one ↻ changes only that line

No e2e tests.

## Repo Reset & Deployment

- The old CRA app (snapshotted at commit `b72eaaf`) is replaced; keep git history
- Port the existing data lists from `src/components/consts.js` (house types, styles, colors, features, family types) into the new typed `src/data/` modules instead of re-authoring them
- Delete CRA leftovers (old `package.json`, `node_modules`, stale config)
- Scaffold Vite + React + TS + Tailwind 4 with pnpm
- Rewrite README for the new combined app (old version roadmap is obsolete)
- `vite build` → static `dist/`; configured ready for GitHub Pages or Netlify, publishing triggered later by the user

## Out of Scope (v1)

- User accounts, sharing rolls, cross-device sync
- Saving/locking previous rolls
- Curated named community challenges (mix-and-match only)
- Per-Sim trait counts by age; multi-Sim trait sets (flat 3 traits in v1)
