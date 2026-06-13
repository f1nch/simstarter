import type { DataItem } from "./data/types";
import type { PackId } from "./data/packs";
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
