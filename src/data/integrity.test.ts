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

  it("ids are unique across all categories", () => {
    const all: string[] = [];
    for (const items of Object.values(categories)) {
      all.push(...items.map((i) => i.id));
    }
    expect(new Set(all).size).toBe(all.length);
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
        const validSet = new Set<string>(packIds);
        const bad = items.filter((i) => !validSet.has(i.pack));
        expect(bad.map((i) => `${i.id}→${i.pack}`)).toEqual([]);
      });

      it("has enough base-game entries", () => {
        const baseCount = items.filter((i) => i.pack === "base").length;
        expect(baseCount).toBeGreaterThanOrEqual(MIN_BASE[name] ?? DEFAULT_MIN_BASE);
      });
    });
  }
});
