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
