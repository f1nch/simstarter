import type { DataItem } from "./data/types";
import { categories } from "./data/index";
import type { StartingPoint } from "./generator";

const VERSION = "1";
const HASH_KEY = "sp=";

// Global id -> DataItem lookup. ids are unique across categories
// (integrity.test.ts), so one flat map resolves every slot.
const byId = new Map<string, DataItem>();
for (const items of Object.values(categories)) {
  for (const item of items) byId.set(item.id, item);
}

function base64UrlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(s: string): string {
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function getOne(value: unknown): DataItem {
  if (typeof value !== "string") throw new Error("expected id string");
  const item = byId.get(value);
  if (!item) throw new Error(`unknown id: ${value}`);
  return item;
}

function getMany(value: unknown): DataItem[] {
  if (!Array.isArray(value)) throw new Error("expected id array");
  return value.map(getOne);
}

export function encodeStartingPoint(sp: StartingPoint): string {
  const payload = [
    sp.scenario.id,
    sp.restrictions.map((i) => i.id),
    sp.goal.id,
    sp.wildcard.id,
    sp.household.id,
    sp.traits.map((i) => i.id),
    sp.aspiration.id,
    sp.houseType.id,
    sp.houseStyle.id,
    sp.exteriorMaterial.id,
    sp.exteriorColors.id,
    sp.interiorColors.id,
    sp.exteriorFeatures.map((i) => i.id),
    sp.bonusRooms.map((i) => i.id),
    sp.interiorFeatures.map((i) => i.id),
    sp.world.id,
  ];
  return `${VERSION}.${base64UrlEncode(JSON.stringify(payload))}`;
}

export function decodeStartingPoint(code: string): StartingPoint | null {
  try {
    const dot = code.indexOf(".");
    if (dot === -1) return null;
    if (code.slice(0, dot) !== VERSION) return null;
    const p = JSON.parse(base64UrlDecode(code.slice(dot + 1)));
    if (!Array.isArray(p) || p.length !== 16) return null;
    return {
      scenario: getOne(p[0]),
      restrictions: getMany(p[1]),
      goal: getOne(p[2]),
      wildcard: getOne(p[3]),
      household: getOne(p[4]),
      traits: getMany(p[5]),
      aspiration: getOne(p[6]),
      houseType: getOne(p[7]),
      houseStyle: getOne(p[8]),
      exteriorMaterial: getOne(p[9]),
      exteriorColors: getOne(p[10]),
      interiorColors: getOne(p[11]),
      exteriorFeatures: getMany(p[12]),
      bonusRooms: getMany(p[13]),
      interiorFeatures: getMany(p[14]),
      world: getOne(p[15]),
    };
  } catch {
    return null;
  }
}

/** Full shareable URL for the current page + starter. */
export function buildShareUrl(sp: StartingPoint): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#${HASH_KEY}${encodeStartingPoint(sp)}`;
}

/** Parse a location hash (e.g. "#sp=1.xxxx") into a starter, or null. */
export function readSharedFromHash(hash: string): StartingPoint | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(HASH_KEY)) return null;
  return decodeStartingPoint(raw.slice(HASH_KEY.length));
}

export { HASH_KEY };
