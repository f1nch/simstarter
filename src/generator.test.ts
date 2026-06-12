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
