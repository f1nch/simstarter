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

// Structural shape of each household, used to keep it compatible with the
// rolled scenario (see scenarioShapes in scenarios.ts). Every household id
// must appear here — householdsHaveShapes in the compat test enforces it.
export type HouseholdShape =
  | "solo"
  | "couple"
  | "shared"
  | "single_parent"
  | "family"
  | "multigen"
  | "siblings";

export const householdShape: Record<string, HouseholdShape> = {
  single: "solo",
  couple: "couple",
  roommates: "shared",
  nuclear_family: "family",
  single_parent_toddler: "single_parent",
  three_generations: "multigen",
  elder_duo: "couple",
  ya_with_teen_sibling: "siblings",
  couple_with_pets: "couple",
  farm_family: "family",
};
