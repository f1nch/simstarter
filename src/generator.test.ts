import { describe, expect, it } from "vitest";
import { roll, rollMany, generateStartingPoint, arraySlotCounts } from "./generator";
import type { DataItem } from "./data/types";
import type { PackId } from "./data/packs";
import { categories } from "./data/index";

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

  it("array re-roll worst case still finds an alternative (invariant safety margin)", () => {
    // 5 base entries, 3 held + re-rolled current = 3 exclusions → 2 eligible remain
    const five: DataItem[] = ["p", "q", "r", "s", "t"].map((id) => ({
      id,
      label: id.toUpperCase(),
      pack: "base",
    }));
    for (let i = 0; i < 50; i++) {
      expect(["s", "t"]).toContain(roll(five, baseOnly, ["p", "q", "r"]).id);
    }
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

  it("degrades to duplicates (not a throw) when count exceeds the eligible pool", () => {
    const two: DataItem[] = [
      { id: "x", label: "X", pack: "base" },
      { id: "y", label: "Y", pack: "base" },
    ];
    const result = rollMany(two, baseOnly, 3);
    expect(result).toHaveLength(3);
    expect(new Set(result.map((r) => r.id)).size).toBe(2);
  });
});

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
