# SimStarter Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild SimStarter as a client-only Vite + React + TypeScript + Tailwind 4 app that generates a complete Sims 4 starting point (challenge, household, house, world) filtered by owned packs, with per-item re-roll.

**Architecture:** Single-page app, no router, no backend. All rollable content is typed `DataItem` entries tagged with a `PackId`, organized one module per category under `src/data/`. A pure `roll()` function in `src/generator.ts` does pack filtering + exclusion; React state in `App` holds the current `StartingPoint`; pack selections persist in localStorage.

**Tech Stack:** Vite 5, React 19, TypeScript 5.8 (strict), Tailwind CSS 4 (`@tailwindcss/vite`), Vitest 2 + Testing Library, pnpm.

**Spec:** `docs/superpowers/specs/2026-06-12-simstarter-design.md` — read it before starting.

**Working directory for all commands:** `C:\Users\the_r\Desktop\Projects\simstarter` (POSIX form for Bash: `/c/Users/the_r/Desktop/Projects/simstarter`)

---

## File Structure

```
index.html                      — Vite entry
vite.config.ts                  — Vite + React + Tailwind plugins, Vitest config
tsconfig.json                   — strict TS, bundler resolution
package.json                    — scripts + deps (pnpm)
src/
  main.tsx                      — React root
  App.tsx                       — owns state, layout, re-roll handlers
  index.css                     — Tailwind import + theme tokens + pop animation
  test/setup.ts                 — jest-dom matchers
  data/
    packs.ts                    — packIds, PackId, Pack, packs list
    types.ts                    — DataItem
    index.ts                    — categories registry (drives integrity test + generator)
    scenarios.ts  restrictions.ts  goals.ts  wildcards.ts
    households.ts  traits.ts  aspirations.ts
    houseTypes.ts  houseStyles.ts  exteriorMaterials.ts  colorSchemes.ts
    exteriorFeatures.ts  bonusRooms.ts  interiorFeatures.ts
    worlds.ts
    integrity.test.ts           — unique ids, valid packs, base-entry minimums
  generator.ts                  — roll, rollMany, StartingPoint, generateStartingPoint, slot→category maps
  generator.test.ts
  useOwnedPacks.ts              — localStorage-persisted pack selection hook
  useOwnedPacks.test.ts
  components/
    Header.tsx                  — logo, Packs button, Generate button
    PackPicker.tsx              — modal with grouped pack checkboxes
    ResultCard.tsx              — category card shell
    ResultLine.tsx              — one rolled item + ↻ button + pack badge
    PackBadge.tsx               — small pack-name pill
    ResultLine.test.tsx
  App.test.tsx                  — integration: generate fills cards; one ↻ changes only that line
```

Notes for the implementer:

- Old CRA app was snapshotted at commit `b72eaaf` — data is ported from `src/components/consts.js` at that commit into the typed modules below (already done in this plan's code; you don't need to read the old file).
- The old data's `roll2`/`roll3` meta-entries and duplicate rows are intentionally dropped; counts are now fixed by the spec. "Dealer's Choice" entries are kept — they're real prompts ("builder's choice").
- Git on this machine warns `LF will be replaced by CRLF` — harmless, ignore it.

---

### Task 1: Clear CRA scaffold, set up Vite + React + TS + Tailwind 4

**Files:**
- Delete: `src/` (old CRA code), `public/`, `package.json` (CRA one), any `yarn.lock`/`package-lock.json`
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Remove the old app**

```bash
cd /c/Users/the_r/Desktop/Projects/simstarter
git rm -r -q --ignore-unmatch src public package.json yarn.lock package-lock.json
rm -rf node_modules build
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "simstarter",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.11",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^4.7.0",
    "jsdom": "^28.1.0",
    "tailwindcss": "^4.1.11",
    "typescript": "~5.8.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.9"
  }
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    passWithNoTests: true,
  },
});
```

(`base: "./"` makes the built site work on GitHub Pages subpaths.)

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SimStarter — Sims 4 Starting Point Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/index.css`**

```css
@import "tailwindcss";

@theme {
  --animate-pop: pop 0.25s ease-out;

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.95) rotate(-2deg);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
}
```

- [ ] **Step 7: Write `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 8: Write placeholder `src/App.tsx`** (replaced in Task 11)

```tsx
export default function App() {
  return <h1 className="p-8 text-2xl font-extrabold text-green-700">SimStarter</h1>;
}
```

- [ ] **Step 9: Write `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 10: Update `.gitignore`** — add a `/dist` line below the existing `/build` line.

- [ ] **Step 11: Install and verify**

```bash
pnpm install
pnpm test:run   # Expected: "No test files found" but exit 0 (passWithNoTests)
pnpm build      # Expected: tsc clean, vite build emits dist/
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind 4 app, remove CRA"
```

---

### Task 2: Pack registry, DataItem type, integrity test harness

**Files:**
- Create: `src/data/packs.ts`, `src/data/types.ts`, `src/data/index.ts`
- Test: `src/data/integrity.test.ts`

- [ ] **Step 1: Write `src/data/packs.ts`**

```ts
export const packIds = [
  "base",
  // Expansion packs
  "get_to_work",
  "get_together",
  "city_living",
  "cats_and_dogs",
  "seasons",
  "get_famous",
  "island_living",
  "discover_university",
  "eco_lifestyle",
  "snowy_escape",
  "cottage_living",
  "high_school_years",
  "growing_together",
  "horse_ranch",
  "for_rent",
  "lovestruck",
  "life_and_death",
  "businesses_and_hobbies",
  "enchanted_by_nature",
  // Game packs
  "outdoor_retreat",
  "spa_day",
  "dine_out",
  "vampires",
  "parenthood",
  "jungle_adventure",
  "strangerville",
  "realm_of_magic",
  "journey_to_batuu",
  "dream_home_decorator",
  "my_wedding_stories",
  "werewolves",
  // Stuff packs
  "luxury_party",
  "perfect_patio",
  "cool_kitchen",
  "spooky_stuff",
  "movie_hangout",
  "romantic_garden",
  "kids_room",
  "backyard",
  "vintage_glamour",
  "bowling_night",
  "fitness",
  "toddler",
  "laundry_day",
  "my_first_pet",
  "moschino",
  "tiny_living",
  "nifty_knitting",
  "paranormal",
  "home_chef_hustle",
  "crystal_creations",
] as const;

export type PackId = (typeof packIds)[number];
export type PackType = "base" | "expansion" | "game" | "stuff";

export interface Pack {
  id: PackId;
  name: string;
  type: PackType;
}

export const packs: Pack[] = [
  { id: "base", name: "Base Game", type: "base" },
  { id: "get_to_work", name: "Get to Work", type: "expansion" },
  { id: "get_together", name: "Get Together", type: "expansion" },
  { id: "city_living", name: "City Living", type: "expansion" },
  { id: "cats_and_dogs", name: "Cats & Dogs", type: "expansion" },
  { id: "seasons", name: "Seasons", type: "expansion" },
  { id: "get_famous", name: "Get Famous", type: "expansion" },
  { id: "island_living", name: "Island Living", type: "expansion" },
  { id: "discover_university", name: "Discover University", type: "expansion" },
  { id: "eco_lifestyle", name: "Eco Lifestyle", type: "expansion" },
  { id: "snowy_escape", name: "Snowy Escape", type: "expansion" },
  { id: "cottage_living", name: "Cottage Living", type: "expansion" },
  { id: "high_school_years", name: "High School Years", type: "expansion" },
  { id: "growing_together", name: "Growing Together", type: "expansion" },
  { id: "horse_ranch", name: "Horse Ranch", type: "expansion" },
  { id: "for_rent", name: "For Rent", type: "expansion" },
  { id: "lovestruck", name: "Lovestruck", type: "expansion" },
  { id: "life_and_death", name: "Life & Death", type: "expansion" },
  { id: "businesses_and_hobbies", name: "Businesses & Hobbies", type: "expansion" },
  { id: "enchanted_by_nature", name: "Enchanted by Nature", type: "expansion" },
  { id: "outdoor_retreat", name: "Outdoor Retreat", type: "game" },
  { id: "spa_day", name: "Spa Day", type: "game" },
  { id: "dine_out", name: "Dine Out", type: "game" },
  { id: "vampires", name: "Vampires", type: "game" },
  { id: "parenthood", name: "Parenthood", type: "game" },
  { id: "jungle_adventure", name: "Jungle Adventure", type: "game" },
  { id: "strangerville", name: "StrangerVille", type: "game" },
  { id: "realm_of_magic", name: "Realm of Magic", type: "game" },
  { id: "journey_to_batuu", name: "Journey to Batuu", type: "game" },
  { id: "dream_home_decorator", name: "Dream Home Decorator", type: "game" },
  { id: "my_wedding_stories", name: "My Wedding Stories", type: "game" },
  { id: "werewolves", name: "Werewolves", type: "game" },
  { id: "luxury_party", name: "Luxury Party Stuff", type: "stuff" },
  { id: "perfect_patio", name: "Perfect Patio Stuff", type: "stuff" },
  { id: "cool_kitchen", name: "Cool Kitchen Stuff", type: "stuff" },
  { id: "spooky_stuff", name: "Spooky Stuff", type: "stuff" },
  { id: "movie_hangout", name: "Movie Hangout Stuff", type: "stuff" },
  { id: "romantic_garden", name: "Romantic Garden Stuff", type: "stuff" },
  { id: "kids_room", name: "Kids Room Stuff", type: "stuff" },
  { id: "backyard", name: "Backyard Stuff", type: "stuff" },
  { id: "vintage_glamour", name: "Vintage Glamour Stuff", type: "stuff" },
  { id: "bowling_night", name: "Bowling Night Stuff", type: "stuff" },
  { id: "fitness", name: "Fitness Stuff", type: "stuff" },
  { id: "toddler", name: "Toddler Stuff", type: "stuff" },
  { id: "laundry_day", name: "Laundry Day Stuff", type: "stuff" },
  { id: "my_first_pet", name: "My First Pet Stuff", type: "stuff" },
  { id: "moschino", name: "Moschino Stuff", type: "stuff" },
  { id: "tiny_living", name: "Tiny Living Stuff", type: "stuff" },
  { id: "nifty_knitting", name: "Nifty Knitting Stuff", type: "stuff" },
  { id: "paranormal", name: "Paranormal Stuff", type: "stuff" },
  { id: "home_chef_hustle", name: "Home Chef Hustle Stuff", type: "stuff" },
  { id: "crystal_creations", name: "Crystal Creations Stuff", type: "stuff" },
];
```

(Pack list = old `consts.js` lists + expansions released since: Lovestruck, Life & Death, Businesses & Hobbies, Enchanted by Nature, Crystal Creations. Kits are out of scope for v1 — no rollable content references them.)

- [ ] **Step 2: Write `src/data/types.ts`**

```ts
import type { PackId } from "./packs";

export interface DataItem {
  id: string;
  label: string;
  pack: PackId;
  detail?: string;
}
```

- [ ] **Step 3: Write `src/data/index.ts`** (registry starts empty; data tasks add to it)

```ts
import type { DataItem } from "./types";

export const categories: Record<string, DataItem[]> = {};
```

- [ ] **Step 4: Write the failing integrity test `src/data/integrity.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { categories } from "./index";
import { packIds, packs } from "./packs";

// Minimum base-game entries per category. Default 5 guarantees a full roll
// plus a re-roll alternative for every slot (traits holds 3 + needs a 4th).
// worlds: only 3 base-game worlds exist; 3 still allows re-rolling its 1 slot.
const MIN_BASE: Record<string, number> = { worlds: 3 };
const DEFAULT_MIN_BASE = 5;

describe("pack registry", () => {
  it("has a Pack entry for every PackId, no duplicates", () => {
    expect(packs.map((p) => p.id).sort()).toEqual([...packIds].sort());
    expect(new Set(packs.map((p) => p.id)).size).toBe(packs.length);
  });

  it("has exactly one base pack", () => {
    expect(packs.filter((p) => p.type === "base").map((p) => p.id)).toEqual(["base"]);
  });
});

describe("data integrity", () => {
  it("registry is not empty", () => {
    expect(Object.keys(categories).length).toBeGreaterThan(0);
  });

  // plain for-loop, not describe.each — describe.each throws on an empty
  // table, and the registry is legitimately empty until Task 3 registers data
  for (const [name, items] of Object.entries(categories)) {
    describe(name, () => {
      it("has unique ids", () => {
        const ids = items.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("only references valid packs", () => {
        for (const item of items) {
          expect(packIds).toContain(item.pack);
        }
      });

      it("has enough base-game entries", () => {
        const baseCount = items.filter((i) => i.pack === "base").length;
        expect(baseCount).toBeGreaterThanOrEqual(MIN_BASE[name] ?? DEFAULT_MIN_BASE);
      });
    });
  }
});
```

- [ ] **Step 5: Run the test — expect FAIL**

Run: `pnpm test:run`
Expected: FAIL — "registry is not empty" fails (categories is `{}`). That failure stays red until Task 3 registers the first categories; the pack registry tests must PASS now.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat: pack registry, DataItem type, data integrity test harness"
```

---

### Task 3: Challenge data — scenarios, restrictions, goals, wildcards

**Files:**
- Create: `src/data/scenarios.ts`, `src/data/restrictions.ts`, `src/data/goals.ts`, `src/data/wildcards.ts`
- Modify: `src/data/index.ts`
- Test: covered by `src/data/integrity.test.ts` (already written)

- [ ] **Step 1: Write `src/data/scenarios.ts`**

```ts
import type { DataItem } from "./types";

export const scenarios: DataItem[] = [
  { id: "teen_runaway", label: "Teen runaway", pack: "base", detail: "Start as a lone teen with §500. No adults allowed in the household." },
  { id: "rags_to_riches", label: "Rags to riches", pack: "base", detail: "Empty lot, §0 after buying it. Everything is earned from nothing." },
  { id: "broke_single_parent", label: "Broke single parent", pack: "base", detail: "One adult, three kids, §1,500 to your name." },
  { id: "rich_widow", label: "Wealthy widow(er) starting over", pack: "base", detail: "Plenty of money, no friends, new town, a portrait of the late spouse." },
  { id: "big_city_dreamer", label: "Small-town dreamer", pack: "base", detail: "Moved to town with one suitcase and a big aspiration. §2,000." },
  { id: "inherited_mess", label: "The inheritance", pack: "base", detail: "You inherited grandma's run-down house. Start with §500 and a fixer-upper." },
  { id: "broke_newlyweds", label: "Broke newlyweds", pack: "base", detail: "Spent everything on the wedding. §1,000 and big plans." },
  { id: "hermit_returns", label: "The hermit returns", pack: "base", detail: "A reclusive Sim re-entering society after years alone. Terrible social skill, decent savings." },
  { id: "washed_up_celebrity", label: "Washed-up celebrity", pack: "get_famous", detail: "Once famous, now forgotten. Claw back to stardom from a cheap apartment of memories." },
  { id: "island_castaway", label: "Castaway", pack: "island_living", detail: "Washed ashore on Sulani with nothing. Live off the sea." },
  { id: "off_grid_homesteader", label: "Off-the-grid homesteader", pack: "eco_lifestyle", detail: "No power, no water hookups. Make the land provide." },
  { id: "secret_vampire", label: "Secret vampire next door", pack: "vampires", detail: "Live a perfectly normal suburban life. Nobody can find out." },
  { id: "broke_student", label: "Self-funded student", pack: "discover_university", detail: "Put yourself through university with no family money." },
  { id: "city_burnout_farmer", label: "City burnout turned farmer", pack: "cottage_living", detail: "Quit the rat race for Henford-on-Bagley. Trade the laptop for livestock." },
];
```

- [ ] **Step 2: Write `src/data/restrictions.ts`**

```ts
import type { DataItem } from "./types";

export const restrictions: DataItem[] = [
  { id: "no_careers", label: "No traditional careers", pack: "base", detail: "All income from skills: painting, gardening, fishing, writing, programming..." },
  { id: "no_groceries", label: "Never buy food", pack: "base", detail: "Grow it, fish it, or harvest it. No grocery deliveries, no ordering pizza." },
  { id: "fix_it_yourself", label: "No repair services", pack: "base", detail: "Broken things stay broken until someone in the house can fix them." },
  { id: "no_reward_store", label: "No satisfaction store", pack: "base", detail: "Never spend satisfaction points on rewards or potions." },
  { id: "one_room_living", label: "One-room living", pack: "base", detail: "The whole household lives in a single room until funds pass §50,000." },
  { id: "single_skill_income", label: "One-skill economy", pack: "base", detail: "All income must come from a single skill of your choice." },
  { id: "no_moving_in", label: "No move-ins", pack: "base", detail: "Never move another Sim into the household. Births only." },
  { id: "cheapest_only", label: "Budget build only", pack: "base", detail: "When buying anything, you must pick the cheapest option in its category." },
  { id: "off_grid_lot", label: "Off-the-grid lot", pack: "eco_lifestyle", detail: "The lot must keep the Off-the-Grid trait the whole challenge." },
  { id: "no_thermostat", label: "Weather the weather", pack: "seasons", detail: "No thermostats — survive every season as built." },
  { id: "strays_only", label: "Strays only", pack: "cats_and_dogs", detail: "Every pet must be an adopted stray." },
];
```

- [ ] **Step 3: Write `src/data/goals.ts`**

```ts
import type { DataItem } from "./types";

export const goals: DataItem[] = [
  { id: "max_one_skill", label: "Max any skill", pack: "base", detail: "Reach level 10 in any one skill." },
  { id: "hundred_k", label: "Reach §100,000", pack: "base", detail: "Household funds hit §100,000." },
  { id: "complete_aspiration", label: "Complete an aspiration", pack: "base", detail: "Finish every milestone of your Sim's aspiration." },
  { id: "top_of_career", label: "Top of the ladder", pack: "base", detail: "Reach level 10 of any career (if careers are allowed by your restrictions, otherwise max a skill-based income instead)." },
  { id: "ten_friends", label: "Ten friends", pack: "base", detail: "Make 10 friends outside the household." },
  { id: "raise_two_kids", label: "Raise the next generation", pack: "base", detail: "Raise two children from infant to young adult." },
  { id: "dream_home", label: "Build the dream home", pack: "base", detail: "Live in a fully furnished home worth §150,000+." },
  { id: "jack_of_five", label: "Jack of all trades", pack: "base", detail: "Reach level 5 in five different skills." },
  { id: "five_star_celeb", label: "Five-star fame", pack: "get_famous", detail: "Reach 5-star celebrity status." },
  { id: "graduate_honors", label: "Graduate with honors", pack: "discover_university", detail: "Earn a distinguished degree." },
  { id: "win_finchwick_fair", label: "Finchwick Fair champion", pack: "cottage_living", detail: "Win the fair with an animal, crop, or pie." },
  { id: "master_spellcaster", label: "Master spellcaster", pack: "realm_of_magic", detail: "Become a Virtuoso-rank spellcaster." },
];
```

- [ ] **Step 4: Write `src/data/wildcards.ts`** (ported from the old `challenge` list, cleaned up)

```ts
import type { DataItem } from "./types";

export const wildcards: DataItem[] = [
  { id: "toilet_shrine", label: "Toilet cult shrine", pack: "base", detail: "Build a shrine around the household toilet. Candles encouraged." },
  { id: "cupcake_machine", label: "Cupcake industrial complex", pack: "base", detail: "Own the giant cupcake machine and use it every day." },
  { id: "too_many_plants", label: "Too many plants", pack: "base", detail: "Every room must contain at least four plants." },
  { id: "max_clutter", label: "Maximum clutter", pack: "base", detail: "Every surface gets clutter. No empty counters allowed." },
  { id: "never_clean", label: "Messy Sims", pack: "base", detail: "Never clean anything voluntarily. Let autonomy decide your fate." },
  { id: "backyard_cemetery", label: "Backyard cemetery", pack: "base", detail: "Keep every urn/tombstone you ever acquire, displayed in a backyard cemetery." },
  { id: "no_electricity", label: "Electricity is the devil", pack: "base", detail: "No TVs, computers, or electric appliances." },
  { id: "tragic_clown", label: "The Tragic Clown watches", pack: "base", detail: "Hang the Tragic Clown painting in the living room, facing the couch." },
  { id: "suit_of_armour", label: "The armour watches you sleep", pack: "base", detail: "A suit of armour stands in the bedroom, always." },
  { id: "open_air_bathroom", label: "Open-air bathroom", pack: "base", detail: "The bathroom has no walls. Embrace it." },
  { id: "phone_a_friend", label: "Phone a friend", pack: "base", detail: "Once a week, a friend (real-life) picks your next major purchase." },
  { id: "dice_sunday", label: "Dice-roll Sunday", pack: "base", detail: "Every Sunday roll a die: even = treat the household, odd = chaos of your choosing." },
  { id: "jail_cell", label: "Home jail cell", pack: "get_to_work", detail: "Build a working jail cell in the house. Who ends up in it is your business." },
  { id: "adopt_strays", label: "Adopt every stray", pack: "cats_and_dogs", detail: "Every stray that visits gets adopted. No exceptions, no limits." },
  { id: "grogu_nursery", label: "Grogu supervises", pack: "journey_to_batuu", detail: "Grogu sits in the nursery, watching everything." },
  { id: "haunted_lot", label: "Haunted house", pack: "paranormal", detail: "The lot has the Haunted House lot type. Good luck sleeping." },
];
```

- [ ] **Step 5: Register the categories in `src/data/index.ts`**

```ts
import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
};
```

- [ ] **Step 6: Run the integrity test — expect PASS**

Run: `pnpm test:run`
Expected: PASS — all four categories satisfy unique ids, valid packs, ≥5 base entries.

- [ ] **Step 7: Commit**

```bash
git add src/data
git commit -m "feat: challenge data - scenarios, restrictions, goals, wildcards"
```

---

### Task 4: Household data — households, traits, aspirations

**Files:**
- Create: `src/data/households.ts`, `src/data/traits.ts`, `src/data/aspirations.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: Write `src/data/households.ts`** (ported `familyType` + expanded)

```ts
import type { DataItem } from "./types";

export const households: DataItem[] = [
  { id: "single", label: "Single Sim", pack: "base" },
  { id: "couple", label: "Couple", pack: "base" },
  { id: "roommates", label: "Roommates", pack: "base", detail: "2–3 unrelated Sims sharing a place." },
  { id: "nuclear_family", label: "Family", pack: "base", detail: "Two parents, two kids." },
  { id: "single_parent_toddler", label: "Single parent + toddler", pack: "base" },
  { id: "three_generations", label: "Three generations", pack: "base", detail: "Grandparent, parent, child under one roof." },
  { id: "elder_duo", label: "Retired duo", pack: "base", detail: "Two elders enjoying (or enduring) retirement together." },
  { id: "ya_with_teen_sibling", label: "Young adult raising teen sibling", pack: "base" },
  { id: "couple_with_pets", label: "Couple + two pets", pack: "cats_and_dogs" },
  { id: "farm_family", label: "Farming family", pack: "cottage_living", detail: "Family of any shape, plus plans for livestock." },
];
```

- [ ] **Step 2: Write `src/data/traits.ts`**

```ts
import type { DataItem } from "./types";

export const traits: DataItem[] = [
  { id: "ambitious", label: "Ambitious", pack: "base" },
  { id: "active", label: "Active", pack: "base" },
  { id: "art_lover", label: "Art Lover", pack: "base" },
  { id: "bookworm", label: "Bookworm", pack: "base" },
  { id: "cheerful", label: "Cheerful", pack: "base" },
  { id: "childish", label: "Childish", pack: "base" },
  { id: "clumsy", label: "Clumsy", pack: "base" },
  { id: "creative", label: "Creative", pack: "base" },
  { id: "erratic", label: "Erratic", pack: "base" },
  { id: "evil", label: "Evil", pack: "base" },
  { id: "family_oriented", label: "Family-Oriented", pack: "base" },
  { id: "foodie", label: "Foodie", pack: "base" },
  { id: "geek", label: "Geek", pack: "base" },
  { id: "genius", label: "Genius", pack: "base" },
  { id: "gloomy", label: "Gloomy", pack: "base" },
  { id: "glutton", label: "Glutton", pack: "base" },
  { id: "good", label: "Good", pack: "base" },
  { id: "goofball", label: "Goofball", pack: "base" },
  { id: "hot_headed", label: "Hot-Headed", pack: "base" },
  { id: "jealous", label: "Jealous", pack: "base" },
  { id: "kleptomaniac", label: "Kleptomaniac", pack: "base" },
  { id: "lazy", label: "Lazy", pack: "base" },
  { id: "loner", label: "Loner", pack: "base" },
  { id: "loves_outdoors", label: "Loves Outdoors", pack: "base" },
  { id: "materialistic", label: "Materialistic", pack: "base" },
  { id: "music_lover", label: "Music Lover", pack: "base" },
  { id: "neat", label: "Neat", pack: "base" },
  { id: "noncommittal", label: "Noncommittal", pack: "base" },
  { id: "outgoing", label: "Outgoing", pack: "base" },
  { id: "perfectionist", label: "Perfectionist", pack: "base" },
  { id: "romantic", label: "Romantic", pack: "base" },
  { id: "self_assured", label: "Self-Assured", pack: "base" },
  { id: "slob", label: "Slob", pack: "base" },
  { id: "snob", label: "Snob", pack: "base" },
  { id: "squeamish", label: "Squeamish", pack: "base" },
  { id: "unflirty", label: "Unflirty", pack: "base" },
  { id: "vegetarian", label: "Vegetarian", pack: "base" },
  { id: "cat_lover", label: "Cat Lover", pack: "cats_and_dogs" },
  { id: "dog_lover", label: "Dog Lover", pack: "cats_and_dogs" },
  { id: "dance_machine", label: "Dance Machine", pack: "get_together" },
  { id: "insider", label: "Insider", pack: "get_together" },
  { id: "adventurous", label: "Adventurous", pack: "snowy_escape" },
  { id: "proper", label: "Proper", pack: "snowy_escape" },
  { id: "animal_enthusiast", label: "Animal Enthusiast", pack: "cottage_living" },
];
```

- [ ] **Step 3: Write `src/data/aspirations.ts`**

```ts
import type { DataItem } from "./types";

export const aspirations: DataItem[] = [
  { id: "bestselling_author", label: "Bestselling Author", pack: "base" },
  { id: "painter_extraordinaire", label: "Painter Extraordinaire", pack: "base" },
  { id: "musical_genius", label: "Musical Genius", pack: "base" },
  { id: "mansion_baron", label: "Mansion Baron", pack: "base" },
  { id: "fabulously_wealthy", label: "Fabulously Wealthy", pack: "base" },
  { id: "renaissance_sim", label: "Renaissance Sim", pack: "base" },
  { id: "nerd_brain", label: "Nerd Brain", pack: "base" },
  { id: "computer_whiz", label: "Computer Whiz", pack: "base" },
  { id: "bodybuilder", label: "Bodybuilder", pack: "base" },
  { id: "joke_star", label: "Joke Star", pack: "base" },
  { id: "master_chef", label: "Master Chef", pack: "base" },
  { id: "master_mixologist", label: "Master Mixologist", pack: "base" },
  { id: "serial_romantic", label: "Serial Romantic", pack: "base" },
  { id: "soulmate", label: "Soulmate", pack: "base" },
  { id: "successful_lineage", label: "Successful Lineage", pack: "base" },
  { id: "big_happy_family", label: "Big Happy Family", pack: "base" },
  { id: "freelance_botanist", label: "Freelance Botanist", pack: "base" },
  { id: "the_curator", label: "The Curator", pack: "base" },
  { id: "angling_ace", label: "Angling Ace", pack: "base" },
  { id: "friend_of_the_world", label: "Friend of the World", pack: "base" },
  { id: "party_animal", label: "Party Animal", pack: "base" },
  { id: "chief_of_mischief", label: "Chief of Mischief", pack: "base" },
  { id: "public_enemy", label: "Public Enemy", pack: "base" },
  { id: "neighborhood_confidante", label: "Neighborhood Confidante", pack: "base" },
  { id: "city_native", label: "City Native", pack: "city_living" },
  { id: "vampire_family", label: "Vampire Family", pack: "vampires" },
  { id: "strangerville_mystery", label: "StrangerVille Mystery", pack: "strangerville" },
  { id: "beach_life", label: "Beach Life", pack: "island_living" },
  { id: "academic", label: "Academic", pack: "discover_university" },
  { id: "country_caretaker", label: "Country Caretaker", pack: "cottage_living" },
];
```

- [ ] **Step 4: Register in `src/data/index.ts`** — add three imports and three registry entries:

```ts
import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";
import { households } from "./households";
import { traits } from "./traits";
import { aspirations } from "./aspirations";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
  households,
  traits,
  aspirations,
};
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS for all seven categories.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat: household data - family types, traits, aspirations"
```

---

### Task 5: House & world data

**Files:**
- Create: `src/data/houseTypes.ts`, `src/data/houseStyles.ts`, `src/data/exteriorMaterials.ts`, `src/data/colorSchemes.ts`, `src/data/exteriorFeatures.ts`, `src/data/bonusRooms.ts`, `src/data/interiorFeatures.ts`, `src/data/worlds.ts`
- Modify: `src/data/index.ts`

- [ ] **Step 1: Write `src/data/houseTypes.ts`** (old `houseBuild` + two larger tiers)

```ts
import type { DataItem } from "./types";

export const houseTypes: DataItem[] = [
  { id: "micro_home", label: "Micro Home", pack: "base", detail: "32 tiles or fewer." },
  { id: "tiny_home", label: "Tiny Home", pack: "base", detail: "64 tiles or fewer." },
  { id: "small_home", label: "Small Home", pack: "base" },
  { id: "regular_home", label: "Regular Home", pack: "base" },
  { id: "large_home", label: "Large Home", pack: "base" },
  { id: "mansion", label: "Mansion", pack: "base" },
];
```

- [ ] **Step 2: Write `src/data/houseStyles.ts`** (ported, meta-entries dropped)

```ts
import type { DataItem } from "./types";

export const houseStyles: DataItem[] = [
  { id: "cape_cod", label: "Cape Cod", pack: "base" },
  { id: "contemporary", label: "Contemporary", pack: "base" },
  { id: "shotgun", label: "Shotgun", pack: "base" },
  { id: "midcentury", label: "Midcentury", pack: "base" },
  { id: "cottage", label: "Cottage", pack: "base" },
  { id: "trailer", label: "Trailer", pack: "base" },
  { id: "container", label: "Container", pack: "base" },
  { id: "colonial", label: "Colonial", pack: "base" },
  { id: "craftsman", label: "Craftsman", pack: "base" },
  { id: "ranch", label: "Ranch", pack: "base" },
  { id: "art_deco", label: "Art Deco", pack: "base" },
  { id: "underground", label: "Underground", pack: "base" },
  { id: "bungalow", label: "Bungalow", pack: "base" },
  { id: "abandoned", label: "Abandoned", pack: "base" },
  { id: "rustic", label: "Rustic", pack: "base" },
  { id: "farmhouse", label: "Farmhouse", pack: "base" },
  { id: "suburban", label: "Suburban", pack: "base" },
  { id: "dealers_choice_style", label: "Dealer's Choice", pack: "base", detail: "Builder picks the style." },
];
```

- [ ] **Step 3: Write `src/data/exteriorMaterials.ts`** (old `houseExterior`)

```ts
import type { DataItem } from "./types";

export const exteriorMaterials: DataItem[] = [
  { id: "brick", label: "Brick", pack: "base" },
  { id: "panelling", label: "Panelling", pack: "base" },
  { id: "siding", label: "Siding", pack: "base" },
  { id: "shingles", label: "Shingles", pack: "base" },
  { id: "metal", label: "Metal", pack: "base" },
  { id: "dealers_choice_material", label: "Dealer's Choice", pack: "base", detail: "Builder picks the material." },
];
```

- [ ] **Step 4: Write `src/data/colorSchemes.ts`** (one list, rolled separately for exterior and interior)

```ts
import type { DataItem } from "./types";

export const colorSchemes: DataItem[] = [
  { id: "boring_beige", label: "Boring Beige", pack: "base" },
  { id: "neon", label: "Neon", pack: "base" },
  { id: "earthy", label: "Earthy", pack: "base" },
  { id: "beachy", label: "Beachy", pack: "base" },
  { id: "pastel", label: "Pastel", pack: "base" },
  { id: "jewel_tones", label: "Jewel Tones", pack: "base" },
  { id: "monochromatic", label: "Monochromatic", pack: "base" },
  { id: "primary_colors", label: "Primary Colors", pack: "base" },
  { id: "neutral_pop", label: "Neutral with a pop of color", pack: "base" },
  { id: "bold", label: "Bold", pack: "base" },
  { id: "high_contrast", label: "High Contrast", pack: "base" },
  { id: "dealers_choice_colors", label: "Dealer's Choice", pack: "base", detail: "Builder picks the palette." },
];
```

- [ ] **Step 5: Write `src/data/exteriorFeatures.ts`** (ported, deduped, typos fixed)

```ts
import type { DataItem } from "./types";

export const exteriorFeatures: DataItem[] = [
  { id: "pond", label: "Pond", pack: "base" },
  { id: "garden", label: "Garden", pack: "base" },
  { id: "pool", label: "Pool", pack: "base" },
  { id: "sandbox", label: "Sandbox", pack: "base" },
  { id: "patio", label: "Patio", pack: "base" },
  { id: "porch", label: "Porch", pack: "base" },
  { id: "driveway", label: "Driveway", pack: "base" },
  { id: "hot_tub", label: "Hot Tub", pack: "base" },
  { id: "fire_pit", label: "Fire Pit", pack: "base" },
  { id: "swing_set", label: "Swing Set", pack: "base" },
  { id: "shed", label: "Shed", pack: "base" },
  { id: "monkey_bars", label: "Monkey Bars", pack: "base" },
  { id: "garage", label: "Garage", pack: "base" },
  { id: "water_feature", label: "Water Feature", pack: "base" },
  { id: "chimney", label: "Chimney", pack: "base" },
  { id: "splash_zone", label: "Get Wet zone", pack: "base", detail: "Splash pad, sprinklers, water balloons." },
  { id: "picnic_area", label: "Picnic Area", pack: "base" },
  { id: "dealers_choice_exterior", label: "Dealer's Choice", pack: "base", detail: "Builder picks a feature." },
  { id: "livestock", label: "Livestock", pack: "cottage_living" },
  { id: "crafting_space", label: "Outdoor Crafting Space", pack: "eco_lifestyle", detail: "Juice fizzing, candle making." },
];
```

- [ ] **Step 6: Write `src/data/bonusRooms.ts`** (old `extraRoom`, deduped)

```ts
import type { DataItem } from "./types";

export const bonusRooms: DataItem[] = [
  { id: "storage_room", label: "Storage Room", pack: "base" },
  { id: "basement", label: "Basement", pack: "base" },
  { id: "attic", label: "Attic", pack: "base" },
  { id: "gym", label: "Gym", pack: "base" },
  { id: "art_studio", label: "Art Studio", pack: "base" },
  { id: "nursery", label: "Nursery", pack: "base" },
  { id: "game_room", label: "Game Room", pack: "base" },
  { id: "guest_room", label: "Guest Room", pack: "base" },
  { id: "crafting_room", label: "Crafting Room", pack: "base" },
  { id: "greenhouse", label: "Greenhouse", pack: "base" },
  { id: "library", label: "Library", pack: "base" },
  { id: "laundry_room", label: "Laundry Room", pack: "base" },
  { id: "workshop", label: "Workshop", pack: "base" },
  { id: "music_room", label: "Music Room", pack: "base" },
  { id: "playroom", label: "Playroom", pack: "base" },
  { id: "office", label: "Office", pack: "base" },
  { id: "dealers_choice_room", label: "Dealer's Choice", pack: "base", detail: "Builder picks a room." },
  { id: "meditation_space", label: "Meditation Space", pack: "spa_day" },
];
```

- [ ] **Step 7: Write `src/data/interiorFeatures.ts`** (ported)

```ts
import type { DataItem } from "./types";

export const interiorFeatures: DataItem[] = [
  { id: "light_switches", label: "Light Switches", pack: "base", detail: "Decorative switches by every door." },
  { id: "mother_in_law_door", label: "Mother-in-law door", pack: "base", detail: "A second exterior door straight into a private suite." },
  { id: "window_planters", label: "Window Planter Boxes", pack: "base" },
  { id: "fireplace", label: "Fireplace", pack: "base" },
  { id: "built_in_shelving", label: "Built-in Shelving", pack: "base" },
  { id: "carpeted_bedrooms", label: "Carpeted Bedrooms", pack: "base" },
  { id: "ceiling_fans", label: "Ceiling Fans", pack: "base" },
  { id: "overhead_lighting", label: "Overhead Lighting", pack: "base", detail: "Every room properly lit from above." },
  { id: "dealers_choice_interior", label: "Dealer's Choice", pack: "base", detail: "Builder picks a feature." },
  { id: "pet_door", label: "Pet Door", pack: "cats_and_dogs" },
  { id: "radiators", label: "Radiators", pack: "snowy_escape" },
  { id: "thermostats", label: "Thermostat", pack: "seasons" },
];
```

- [ ] **Step 8: Write `src/data/worlds.ts`** (ported + post-2023 worlds)

```ts
import type { DataItem } from "./types";

export const worlds: DataItem[] = [
  { id: "willow_creek", label: "Willow Creek", pack: "base" },
  { id: "oasis_springs", label: "Oasis Springs", pack: "base" },
  { id: "newcrest", label: "Newcrest", pack: "base" },
  { id: "magnolia_promenade", label: "Magnolia Promenade", pack: "get_to_work" },
  { id: "windenburg", label: "Windenburg", pack: "get_together" },
  { id: "san_myshuno", label: "San Myshuno", pack: "city_living" },
  { id: "brindleton_bay", label: "Brindleton Bay", pack: "cats_and_dogs" },
  { id: "del_sol_valley", label: "Del Sol Valley", pack: "get_famous" },
  { id: "sulani", label: "Sulani", pack: "island_living" },
  { id: "britechester", label: "Britechester", pack: "discover_university" },
  { id: "evergreen_harbor", label: "Evergreen Harbor", pack: "eco_lifestyle" },
  { id: "mt_komorebi", label: "Mt. Komorebi", pack: "snowy_escape" },
  { id: "henford_on_bagley", label: "Henford-on-Bagley", pack: "cottage_living" },
  { id: "copperdale", label: "Copperdale", pack: "high_school_years" },
  { id: "san_sequoia", label: "San Sequoia", pack: "growing_together" },
  { id: "chestnut_ridge", label: "Chestnut Ridge", pack: "horse_ranch" },
  { id: "tomarang", label: "Tomarang", pack: "for_rent" },
  { id: "ciudad_enamorada", label: "Ciudad Enamorada", pack: "lovestruck" },
  { id: "ravenwood", label: "Ravenwood", pack: "life_and_death" },
  { id: "nordhaven", label: "Nordhaven", pack: "businesses_and_hobbies" },
  { id: "innisgreen", label: "Innisgreen", pack: "enchanted_by_nature" },
  { id: "granite_falls", label: "Granite Falls", pack: "outdoor_retreat" },
  { id: "selvadorada", label: "Selvadorada", pack: "jungle_adventure" },
  { id: "strangerville_world", label: "StrangerVille", pack: "strangerville" },
  { id: "glimmerbrook", label: "Glimmerbrook", pack: "realm_of_magic" },
  { id: "batuu", label: "Batuu", pack: "journey_to_batuu" },
  { id: "tartosa", label: "Tartosa", pack: "my_wedding_stories" },
  { id: "moonwood_mill", label: "Moonwood Mill", pack: "werewolves" },
];
```

- [ ] **Step 9: Register everything in `src/data/index.ts`** — final form of the file:

```ts
import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";
import { households } from "./households";
import { traits } from "./traits";
import { aspirations } from "./aspirations";
import { houseTypes } from "./houseTypes";
import { houseStyles } from "./houseStyles";
import { exteriorMaterials } from "./exteriorMaterials";
import { colorSchemes } from "./colorSchemes";
import { exteriorFeatures } from "./exteriorFeatures";
import { bonusRooms } from "./bonusRooms";
import { interiorFeatures } from "./interiorFeatures";
import { worlds } from "./worlds";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
  households,
  traits,
  aspirations,
  houseTypes,
  houseStyles,
  exteriorMaterials,
  colorSchemes,
  exteriorFeatures,
  bonusRooms,
  interiorFeatures,
  worlds,
};
```

- [ ] **Step 10: Run tests — expect PASS** (all 15 categories; `worlds` passes via its documented minimum of 3)

Run: `pnpm test:run`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/data
git commit -m "feat: house and world data ported from CRA consts"
```

---

### Task 6: `roll` / `rollMany` generator functions (TDD)

**Files:**
- Create: `src/generator.ts`
- Test: `src/generator.test.ts`

- [ ] **Step 1: Write the failing tests `src/generator.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { roll, rollMany } from "./generator";
import type { DataItem } from "./data/types";
import type { PackId } from "./data/packs";

const items: DataItem[] = [
  { id: "a", label: "A", pack: "base" },
  { id: "b", label: "B", pack: "base" },
  { id: "c", label: "C", pack: "cats_and_dogs" },
  { id: "d", label: "D", pack: "seasons" },
];

const baseOnly = new Set<PackId>(["base"]);
const withCats = new Set<PackId>(["base", "cats_and_dogs"]);

describe("roll", () => {
  it("only returns items from owned packs", () => {
    for (let i = 0; i < 50; i++) {
      expect(["a", "b"]).toContain(roll(items, baseOnly).id);
    }
    for (let i = 0; i < 50; i++) {
      expect(["a", "b", "c"]).toContain(roll(items, withCats).id);
    }
  });

  it("never returns an excluded id when an alternative exists", () => {
    for (let i = 0; i < 50; i++) {
      expect(roll(items, baseOnly, ["a"]).id).toBe("b");
    }
  });

  it("falls back to the full owned pool when exclusions exhaust it", () => {
    const single: DataItem[] = [{ id: "only", label: "Only", pack: "base" }];
    expect(roll(single, baseOnly, ["only"]).id).toBe("only");
  });

  it("throws when no owned items exist", () => {
    const packOnly: DataItem[] = [{ id: "c", label: "C", pack: "cats_and_dogs" }];
    expect(() => roll(packOnly, baseOnly)).toThrow();
  });
});

describe("rollMany", () => {
  it("returns the requested count with no duplicate ids", () => {
    for (let i = 0; i < 50; i++) {
      const result = rollMany(items, withCats, 3);
      expect(result).toHaveLength(3);
      expect(new Set(result.map((r) => r.id)).size).toBe(3);
    }
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test:run`
Expected: FAIL — `src/generator.ts` does not exist / exports missing.

- [ ] **Step 3: Write `src/generator.ts`** (just these two functions for now)

```ts
import type { DataItem } from "./data/types";
import type { PackId } from "./data/packs";

export function roll(
  category: DataItem[],
  ownedPacks: Set<PackId>,
  exclude: string[] = [],
): DataItem {
  const owned = category.filter((item) => ownedPacks.has(item.pack));
  if (owned.length === 0) {
    throw new Error("No rollable items — category has no entries for the owned packs");
  }
  const eligible = owned.filter((item) => !exclude.includes(item.id));
  const pool = eligible.length > 0 ? eligible : owned;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rollMany(
  category: DataItem[],
  ownedPacks: Set<PackId>,
  count: number,
): DataItem[] {
  const picked: DataItem[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(roll(category, ownedPacks, picked.map((p) => p.id)));
  }
  return picked;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/generator.ts src/generator.test.ts
git commit -m "feat: roll and rollMany with pack filtering and exclusions"
```

---

### Task 7: `StartingPoint` + `generateStartingPoint` (TDD)

**Files:**
- Modify: `src/generator.ts`, `src/generator.test.ts`

- [ ] **Step 1: Append failing tests to `src/generator.test.ts`**

```ts
import { generateStartingPoint, arraySlotCounts } from "./generator";
import { categories } from "./data/index";

describe("generateStartingPoint", () => {
  const owned = new Set<PackId>(["base"]);

  it("fills every slot with base-game items when only base is owned", () => {
    for (let i = 0; i < 20; i++) {
      const sp = generateStartingPoint(owned);
      const singles = [
        sp.scenario, sp.goal, sp.wildcard, sp.household, sp.aspiration,
        sp.houseType, sp.houseStyle, sp.exteriorMaterial,
        sp.exteriorColors, sp.interiorColors, sp.world,
      ];
      for (const item of singles) expect(item.pack).toBe("base");
      for (const arr of [sp.restrictions, sp.traits, sp.exteriorFeatures, sp.bonusRooms, sp.interiorFeatures]) {
        for (const item of arr) expect(item.pack).toBe("base");
      }
    }
  });

  it("rolls fixed array counts (restrictions 1-2, traits 3, features 2 each)", () => {
    const restrictionCounts = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const sp = generateStartingPoint(owned);
      restrictionCounts.add(sp.restrictions.length);
      expect([1, 2]).toContain(sp.restrictions.length);
      expect(sp.traits).toHaveLength(arraySlotCounts.traits);
      expect(sp.exteriorFeatures).toHaveLength(arraySlotCounts.exteriorFeatures);
      expect(sp.bonusRooms).toHaveLength(arraySlotCounts.bonusRooms);
      expect(sp.interiorFeatures).toHaveLength(arraySlotCounts.interiorFeatures);
    }
    // over 40 rolls, both 1 and 2 restrictions should appear
    expect(restrictionCounts).toEqual(new Set([1, 2]));
  });

  it("pulls items from the registered categories", () => {
    const sp = generateStartingPoint(owned);
    expect(categories.scenarios.map((s) => s.id)).toContain(sp.scenario.id);
    expect(categories.worlds.map((w) => w.id)).toContain(sp.world.id);
  });
});
```

(Add the two imports at the top of the test file alongside the existing ones.)

- [ ] **Step 2: Run tests — expect FAIL** (`generateStartingPoint`, `arraySlotCounts` not exported)

Run: `pnpm test:run`
Expected: FAIL

- [ ] **Step 3: Append to `src/generator.ts`**

```ts
import { scenarios } from "./data/scenarios";
import { restrictions } from "./data/restrictions";
import { goals } from "./data/goals";
import { wildcards } from "./data/wildcards";
import { households } from "./data/households";
import { traits } from "./data/traits";
import { aspirations } from "./data/aspirations";
import { houseTypes } from "./data/houseTypes";
import { houseStyles } from "./data/houseStyles";
import { exteriorMaterials } from "./data/exteriorMaterials";
import { colorSchemes } from "./data/colorSchemes";
import { exteriorFeatures } from "./data/exteriorFeatures";
import { bonusRooms } from "./data/bonusRooms";
import { interiorFeatures } from "./data/interiorFeatures";
import { worlds } from "./data/worlds";

export interface StartingPoint {
  scenario: DataItem;
  restrictions: DataItem[];
  goal: DataItem;
  wildcard: DataItem;
  household: DataItem;
  traits: DataItem[];
  aspiration: DataItem;
  houseType: DataItem;
  houseStyle: DataItem;
  exteriorMaterial: DataItem;
  exteriorColors: DataItem;
  interiorColors: DataItem;
  exteriorFeatures: DataItem[];
  bonusRooms: DataItem[];
  interiorFeatures: DataItem[];
  world: DataItem;
}

export type SingleSlot =
  | "scenario" | "goal" | "wildcard" | "household" | "aspiration"
  | "houseType" | "houseStyle" | "exteriorMaterial"
  | "exteriorColors" | "interiorColors" | "world";

export type ArraySlot = "restrictions" | "traits" | "exteriorFeatures" | "bonusRooms" | "interiorFeatures";

export const singleSlotCategories: Record<SingleSlot, DataItem[]> = {
  scenario: scenarios,
  goal: goals,
  wildcard: wildcards,
  household: households,
  aspiration: aspirations,
  houseType: houseTypes,
  houseStyle: houseStyles,
  exteriorMaterial: exteriorMaterials,
  exteriorColors: colorSchemes,
  interiorColors: colorSchemes,
  world: worlds,
};

export const arraySlotCategories: Record<ArraySlot, DataItem[]> = {
  restrictions,
  traits,
  exteriorFeatures,
  bonusRooms,
  interiorFeatures,
};

// restrictions count is decided per generate (1 or 2, equal odds)
export const arraySlotCounts: Record<Exclude<ArraySlot, "restrictions">, number> = {
  traits: 3,
  exteriorFeatures: 2,
  bonusRooms: 2,
  interiorFeatures: 2,
};

export function generateStartingPoint(ownedPacks: Set<PackId>): StartingPoint {
  const restrictionCount = Math.random() < 0.5 ? 1 : 2;
  return {
    scenario: roll(scenarios, ownedPacks),
    restrictions: rollMany(restrictions, ownedPacks, restrictionCount),
    goal: roll(goals, ownedPacks),
    wildcard: roll(wildcards, ownedPacks),
    household: roll(households, ownedPacks),
    traits: rollMany(traits, ownedPacks, arraySlotCounts.traits),
    aspiration: roll(aspirations, ownedPacks),
    houseType: roll(houseTypes, ownedPacks),
    houseStyle: roll(houseStyles, ownedPacks),
    exteriorMaterial: roll(exteriorMaterials, ownedPacks),
    exteriorColors: roll(colorSchemes, ownedPacks),
    interiorColors: roll(colorSchemes, ownedPacks),
    exteriorFeatures: rollMany(exteriorFeatures, ownedPacks, arraySlotCounts.exteriorFeatures),
    bonusRooms: rollMany(bonusRooms, ownedPacks, arraySlotCounts.bonusRooms),
    interiorFeatures: rollMany(interiorFeatures, ownedPacks, arraySlotCounts.interiorFeatures),
    world: roll(worlds, ownedPacks),
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/generator.ts src/generator.test.ts
git commit -m "feat: generateStartingPoint with slot category maps"
```

---

### Task 8: `useOwnedPacks` localStorage hook (TDD)

**Files:**
- Create: `src/useOwnedPacks.ts`
- Test: `src/useOwnedPacks.test.ts`

- [ ] **Step 1: Write the failing tests `src/useOwnedPacks.test.ts`**

```ts
import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOwnedPacks, STORAGE_KEY } from "./useOwnedPacks";
import type { PackId } from "./data/packs";

beforeEach(() => localStorage.clear());

describe("useOwnedPacks", () => {
  it("defaults to base game only", () => {
    const { result } = renderHook(() => useOwnedPacks());
    expect([...result.current[0]]).toEqual(["base"]);
  });

  it("persists changes and always keeps base", () => {
    const { result } = renderHook(() => useOwnedPacks());
    act(() => result.current[1](new Set<PackId>(["seasons"])));
    expect(result.current[0].has("base")).toBe(true);
    expect(result.current[0].has("seasons")).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toContain("seasons");
  });

  it("restores from localStorage and drops unknown ids", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["seasons", "not_a_real_pack"]));
    const { result } = renderHook(() => useOwnedPacks());
    expect(result.current[0].has("seasons")).toBe(true);
    expect([...result.current[0]]).not.toContain("not_a_real_pack");
    expect(result.current[0].has("base")).toBe(true);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json[");
    const { result } = renderHook(() => useOwnedPacks());
    expect([...result.current[0]]).toEqual(["base"]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test:run`
Expected: FAIL — module missing.

- [ ] **Step 3: Write `src/useOwnedPacks.ts`**

```ts
import { useState } from "react";
import { packIds, type PackId } from "./data/packs";

export const STORAGE_KEY = "simstarter.ownedPacks";

function load(): Set<PackId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (id): id is PackId => (packIds as readonly string[]).includes(String(id)),
        );
        return new Set<PackId>(["base", ...valid]);
      }
    }
  } catch {
    // corrupted storage falls through to the default
  }
  return new Set<PackId>(["base"]);
}

export function useOwnedPacks(): [Set<PackId>, (next: Set<PackId>) => void] {
  const [owned, setOwned] = useState<Set<PackId>>(load);

  function update(next: Set<PackId>) {
    const withBase = new Set(next).add("base");
    setOwned(withBase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...withBase]));
  }

  return [owned, update];
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/useOwnedPacks.ts src/useOwnedPacks.test.ts
git commit -m "feat: useOwnedPacks hook with localStorage persistence"
```

---

### Task 9: ResultLine, PackBadge, ResultCard components

**Files:**
- Create: `src/components/PackBadge.tsx`, `src/components/ResultLine.tsx`, `src/components/ResultCard.tsx`
- Test: `src/components/ResultLine.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/ResultLine.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultLine } from "./ResultLine";
import type { DataItem } from "../data/types";

const baseItem: DataItem = { id: "pool", label: "Pool", pack: "base" };
const packItem: DataItem = {
  id: "livestock",
  label: "Livestock",
  pack: "cottage_living",
  detail: "Moo.",
};

describe("ResultLine", () => {
  it("shows label and detail", () => {
    render(<ResultLine caption="Feature" item={packItem} onReroll={() => {}} />);
    expect(screen.getByText("Livestock")).toBeInTheDocument();
    expect(screen.getByText("Moo.")).toBeInTheDocument();
  });

  it("shows a pack badge only for non-base items", () => {
    const { rerender } = render(
      <ResultLine caption="Feature" item={packItem} onReroll={() => {}} />,
    );
    expect(screen.getByText("Cottage Living")).toBeInTheDocument();
    rerender(<ResultLine caption="Feature" item={baseItem} onReroll={() => {}} />);
    expect(screen.queryByText("Base Game")).not.toBeInTheDocument();
  });

  it("calls onReroll when the re-roll button is clicked", async () => {
    const onReroll = vi.fn();
    render(<ResultLine caption="Feature" item={baseItem} onReroll={onReroll} />);
    await userEvent.click(screen.getByRole("button", { name: "Re-roll Feature" }));
    expect(onReroll).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test:run`
Expected: FAIL — components missing.

- [ ] **Step 3: Write `src/components/PackBadge.tsx`**

```tsx
import { packs, type PackId } from "../data/packs";

export function PackBadge({ packId }: { packId: PackId }) {
  const pack = packs.find((p) => p.id === packId);
  if (!pack) return null;
  return (
    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      {pack.name.replace(/ Stuff$/, "")}
    </span>
  );
}
```

- [ ] **Step 4: Write `src/components/ResultLine.tsx`**

```tsx
import type { DataItem } from "../data/types";
import { PackBadge } from "./PackBadge";

interface ResultLineProps {
  caption: string;
  item: DataItem;
  onReroll: () => void;
}

export function ResultLine({ caption, item, onReroll }: ResultLineProps) {
  return (
    // key remounts the row when the item changes, replaying the pop animation
    <div
      key={item.id}
      className="animate-pop flex items-start justify-between gap-2 rounded-xl bg-green-50/70 px-3 py-2"
    >
      <div className="min-w-0">
        <span className="block text-[11px] font-bold tracking-wide text-green-600 uppercase">
          {caption}
        </span>
        <span className="font-semibold text-slate-800">{item.label}</span>
        {item.detail && <p className="text-sm text-slate-500">{item.detail}</p>}
        {item.pack !== "base" && <PackBadge packId={item.pack} />}
      </div>
      <button
        type="button"
        onClick={onReroll}
        aria-label={`Re-roll ${caption}`}
        title="Re-roll"
        className="mt-1 shrink-0 rounded-full p-1.5 text-lg leading-none text-green-600 transition-transform duration-300 hover:rotate-180 hover:bg-green-100"
      >
        ↻
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/components/ResultCard.tsx`**

```tsx
import type { ReactNode } from "react";

interface ResultCardProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function ResultCard({ icon, title, children }: ResultCardProps) {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-md">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-green-800">
        <span aria-hidden>{icon}</span> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components
git commit -m "feat: ResultLine, PackBadge, ResultCard components"
```

---

### Task 10: Header and PackPicker

**Files:**
- Create: `src/components/Header.tsx`, `src/components/PackPicker.tsx`

No new unit tests here — both are exercised by the App integration test in Task 11.

- [ ] **Step 1: Write `src/components/Header.tsx`**

```tsx
interface HeaderProps {
  onOpenPacks: () => void;
  onGenerate: () => void;
}

function Plumbob() {
  return (
    <svg viewBox="0 0 20 28" className="h-7 w-5" aria-hidden>
      <polygon points="10,0 20,14 10,28 0,14" fill="#22c55e" />
      <polygon points="10,4 16.5,14 10,24 3.5,14" fill="#4ade80" />
    </svg>
  );
}

export function Header({ onOpenPacks, onGenerate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-green-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Plumbob />
        <h1 className="text-xl font-extrabold tracking-tight text-green-700">SimStarter</h1>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onOpenPacks}
            className="rounded-full border-2 border-green-300 px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50"
          >
            Packs ⚙
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-green-600 active:scale-95"
          >
            🎲 Generate
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Write `src/components/PackPicker.tsx`**

```tsx
import { packs, type Pack, type PackId } from "../data/packs";

interface PackPickerProps {
  owned: Set<PackId>;
  onChange: (next: Set<PackId>) => void;
  onClose: () => void;
}

const GROUPS: { type: Pack["type"]; title: string }[] = [
  { type: "expansion", title: "Expansion Packs" },
  { type: "game", title: "Game Packs" },
  { type: "stuff", title: "Stuff Packs" },
];

export function PackPicker({ owned, onChange, onClose }: PackPickerProps) {
  function toggle(id: PackId) {
    const next = new Set(owned);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-label="Choose your packs"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-green-800">Your Packs</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-600"
          >
            Done
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Results only use content from packs you own.
        </p>
        <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
          <input type="checkbox" checked disabled className="accent-green-500" />
          Base Game (always on)
        </label>
        {GROUPS.map((group) => (
          <fieldset key={group.type} className="mb-4">
            <legend className="mb-2 text-xs font-bold tracking-wide text-green-600 uppercase">
              {group.title}
            </legend>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {packs
                .filter((p) => p.type === group.type)
                .map((pack) => (
                  <label
                    key={pack.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-green-50"
                  >
                    <input
                      type="checkbox"
                      checked={owned.has(pack.id)}
                      onChange={() => toggle(pack.id)}
                      className="accent-green-500"
                    />
                    {pack.name}
                  </label>
                ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: clean

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: Header and PackPicker components"
```

---

### Task 11: App wiring + integration test

**Files:**
- Modify: `src/App.tsx` (replace placeholder)
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing integration test `src/App.test.tsx`**

```tsx
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => localStorage.clear());

describe("App", () => {
  it("shows an empty state before the first generate", () => {
    render(<App />);
    expect(screen.getByText(/roll your next story/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Challenge" })).not.toBeInTheDocument();
  });

  it("fills all four cards on Generate", async () => {
    render(<App />);
    // two Generate buttons exist pre-roll (header + empty-state CTA)
    await userEvent.click(screen.getAllByRole("button", { name: /generate/i })[0]);
    // role query: the heading's text content includes the aria-hidden icon,
    // so an exact getByText("House") would not match
    for (const title of ["Challenge", "Household", "House", "World"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    // every slot rendered: at least scenario, goal, wildcard, household,
    // 3 traits, aspiration, 8 house lines, world => lots of re-roll buttons
    expect(screen.getAllByRole("button", { name: /^re-roll/i }).length).toBeGreaterThanOrEqual(15);
  });

  it("re-rolls only the clicked line", async () => {
    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: /generate/i })[0]);

    const scenarioBefore = screen.getByText("Scenario").parentElement!.textContent;
    const goalBefore = screen.getByText("Goal").parentElement!.textContent;

    await userEvent.click(screen.getByRole("button", { name: "Re-roll Scenario" }));

    const scenarioAfter = screen.getByText("Scenario").parentElement!.textContent;
    const goalAfter = screen.getByText("Goal").parentElement!.textContent;

    expect(scenarioAfter).not.toBe(scenarioBefore); // exclusion guarantees a change
    expect(goalAfter).toBe(goalBefore);
  });

  it("opens the pack picker", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /packs/i }));
    expect(screen.getByRole("dialog", { name: /choose your packs/i })).toBeInTheDocument();
    expect(screen.getByText("Base Game (always on)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test:run`
Expected: FAIL — App is still the placeholder.

- [ ] **Step 3: Replace `src/App.tsx`**

```tsx
import { useState } from "react";
import {
  arraySlotCategories,
  generateStartingPoint,
  roll,
  singleSlotCategories,
  type ArraySlot,
  type SingleSlot,
  type StartingPoint,
} from "./generator";
import { useOwnedPacks } from "./useOwnedPacks";
import { Header } from "./components/Header";
import { PackPicker } from "./components/PackPicker";
import { ResultCard } from "./components/ResultCard";
import { ResultLine } from "./components/ResultLine";

export default function App() {
  const [ownedPacks, setOwnedPacks] = useOwnedPacks();
  const [sp, setSp] = useState<StartingPoint | null>(null);
  const [packsOpen, setPacksOpen] = useState(false);

  function generate() {
    setSp(generateStartingPoint(ownedPacks));
  }

  function rerollSingle(slot: SingleSlot) {
    setSp((prev) =>
      prev && {
        ...prev,
        [slot]: roll(singleSlotCategories[slot], ownedPacks, [prev[slot].id]),
      },
    );
  }

  function rerollArrayItem(slot: ArraySlot, index: number) {
    setSp((prev) => {
      if (!prev) return prev;
      const current = prev[slot];
      const next = [...current];
      next[index] = roll(
        arraySlotCategories[slot],
        ownedPacks,
        current.map((i) => i.id),
      );
      return { ...prev, [slot]: next };
    });
  }

  function arrayLines(slot: ArraySlot, caption: string) {
    return sp![slot].map((item, i) => (
      <ResultLine
        key={`${slot}-${i}`}
        caption={sp![slot].length > 1 ? `${caption} ${i + 1}` : caption}
        item={item}
        onReroll={() => rerollArrayItem(slot, i)}
      />
    ));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 text-slate-800">
      <Header onOpenPacks={() => setPacksOpen(true)} onGenerate={generate} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {sp === null ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-2xl font-extrabold text-green-700">
              Roll your next story 🎲
            </p>
            <p className="max-w-md text-slate-500">
              One click generates a challenge, a household, a house build, and a
              world — using only the packs you own.
            </p>
            <button
              type="button"
              onClick={generate}
              className="rounded-full bg-green-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600 active:scale-95"
            >
              🎲 Generate
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard icon="📜" title="Challenge">
              <ResultLine caption="Scenario" item={sp.scenario} onReroll={() => rerollSingle("scenario")} />
              {arrayLines("restrictions", "Restriction")}
              <ResultLine caption="Goal" item={sp.goal} onReroll={() => rerollSingle("goal")} />
              <ResultLine caption="Wildcard" item={sp.wildcard} onReroll={() => rerollSingle("wildcard")} />
            </ResultCard>
            <ResultCard icon="👪" title="Household">
              <ResultLine caption="Family type" item={sp.household} onReroll={() => rerollSingle("household")} />
              {arrayLines("traits", "Trait")}
              <ResultLine caption="Aspiration" item={sp.aspiration} onReroll={() => rerollSingle("aspiration")} />
            </ResultCard>
            <ResultCard icon="🏠" title="House">
              <ResultLine caption="Build type" item={sp.houseType} onReroll={() => rerollSingle("houseType")} />
              <ResultLine caption="Style" item={sp.houseStyle} onReroll={() => rerollSingle("houseStyle")} />
              <ResultLine caption="Exterior material" item={sp.exteriorMaterial} onReroll={() => rerollSingle("exteriorMaterial")} />
              <ResultLine caption="Exterior colors" item={sp.exteriorColors} onReroll={() => rerollSingle("exteriorColors")} />
              <ResultLine caption="Interior colors" item={sp.interiorColors} onReroll={() => rerollSingle("interiorColors")} />
              {arrayLines("exteriorFeatures", "Exterior feature")}
              {arrayLines("bonusRooms", "Bonus room")}
              {arrayLines("interiorFeatures", "Interior feature")}
            </ResultCard>
            <ResultCard icon="🌍" title="World">
              <ResultLine caption="World" item={sp.world} onReroll={() => rerollSingle("world")} />
            </ResultCard>
          </div>
        )}
      </main>
      {packsOpen && (
        <PackPicker
          owned={ownedPacks}
          onChange={setOwnedPacks}
          onClose={() => setPacksOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run all tests — expect PASS**

Run: `pnpm test:run`
Expected: PASS — integrity, generator, hook, ResultLine, and App tests all green.

- [ ] **Step 5: Visual verification**

Start the dev server (use preview tools if available, otherwise `pnpm dev`) and verify: empty state → Generate fills 4 cards → a ↻ changes only its line with the pop animation → Packs modal toggles packs → pack badges appear on non-base items after enabling packs → mobile width stacks the cards.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire up App - generate, per-item re-roll, pack picker"
```

---

### Task 12: README rewrite + final verification

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1: Replace `README.md`**

```markdown
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
```

- [ ] **Step 2: Full verification**

```bash
pnpm test:run   # Expected: all tests pass
pnpm build      # Expected: clean type-check, dist/ produced
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for the rebuilt app"
```

---

## Self-Review Notes (already applied)

- Spec coverage: every spec section maps to a task — data model (2–5), generator + invariant exception (2, 6, 7), state/persistence (8), UI components (9–11), testing (2, 6, 7, 8, 9, 11), repo reset (1), README/deployment readiness (1: `base: "./"`, 12).
- `colorSchemes` is one category rolled twice (exteriorColors, interiorColors) — matches spec.
- The integrity test's `describe.each` requires the registry to be importable with zero entries in Task 2; the explicit "registry is not empty" test keeps the suite red until Task 3.
- Worlds base-entry exception (3) is encoded in `MIN_BASE`, per the amended spec.
