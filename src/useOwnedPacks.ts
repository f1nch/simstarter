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
