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
  // Falling back to the full owned pool can return an excluded item. The data
  // invariant (≥5 base entries per category, integrity.test.ts) guarantees this
  // never happens in real flows: the largest exclusion list (3 traits + sibling
  // re-roll) still leaves eligible alternatives.
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
