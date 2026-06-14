import { describe, expect, it } from "vitest";
import {
  buildShareUrl,
  decodeStartingPoint,
  encodeStartingPoint,
  readSharedFromHash,
} from "./share";
import { generateStartingPoint } from "./generator";
import { packIds } from "./data/packs";

// A starter using the full catalog, so array slots and pack items are exercised.
const ALL_PACKS = new Set(packIds);

function ids(sp: ReturnType<typeof generateStartingPoint>) {
  return {
    scenario: sp.scenario.id,
    restrictions: sp.restrictions.map((i) => i.id),
    goal: sp.goal.id,
    wildcard: sp.wildcard.id,
    household: sp.household.id,
    traits: sp.traits.map((i) => i.id),
    aspiration: sp.aspiration.id,
    houseType: sp.houseType.id,
    houseStyle: sp.houseStyle.id,
    exteriorMaterial: sp.exteriorMaterial.id,
    exteriorColors: sp.exteriorColors.id,
    interiorColors: sp.interiorColors.id,
    exteriorFeatures: sp.exteriorFeatures.map((i) => i.id),
    bonusRooms: sp.bonusRooms.map((i) => i.id),
    interiorFeatures: sp.interiorFeatures.map((i) => i.id),
    world: sp.world.id,
  };
}

describe("encode/decode round-trip", () => {
  it("reproduces every slot across many starters", () => {
    for (let i = 0; i < 50; i++) {
      const sp = generateStartingPoint(ALL_PACKS);
      const decoded = decodeStartingPoint(encodeStartingPoint(sp));
      expect(decoded).not.toBeNull();
      expect(ids(decoded!)).toEqual(ids(sp));
    }
  });
});

describe("decode rejects bad input", () => {
  it("returns null for garbage", () => {
    expect(decodeStartingPoint("not-a-code")).toBeNull();
    expect(decodeStartingPoint("")).toBeNull();
    expect(decodeStartingPoint("1.@@@notbase64@@@")).toBeNull();
  });

  it("returns null for an unsupported version", () => {
    const sp = generateStartingPoint(new Set(["base"]));
    const code = encodeStartingPoint(sp);
    expect(decodeStartingPoint(code.replace(/^1\./, "9."))).toBeNull();
  });

  it("returns null when a slot references an unknown id", () => {
    const sp = generateStartingPoint(new Set(["base"]));
    const payload = [
      "totally_made_up_id", // tampered scenario id
      sp.restrictions.map((i) => i.id),
      sp.goal.id, sp.wildcard.id, sp.household.id,
      sp.traits.map((i) => i.id), sp.aspiration.id,
      sp.houseType.id, sp.houseStyle.id, sp.exteriorMaterial.id,
      sp.exteriorColors.id, sp.interiorColors.id,
      sp.exteriorFeatures.map((i) => i.id), sp.bonusRooms.map((i) => i.id),
      sp.interiorFeatures.map((i) => i.id), sp.world.id,
    ];
    const b64url = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(decodeStartingPoint(`1.${b64url}`)).toBeNull();
  });
});

describe("hash + url helpers", () => {
  it("round-trips through a location hash", () => {
    const sp = generateStartingPoint(new Set(["base"]));
    const url = buildShareUrl(sp);
    const hash = "#" + url.split("#")[1];
    const decoded = readSharedFromHash(hash);
    expect(decoded).not.toBeNull();
    expect(ids(decoded!)).toEqual(ids(sp));
  });

  it("ignores hashes that are not share links", () => {
    expect(readSharedFromHash("")).toBeNull();
    expect(readSharedFromHash("#section-2")).toBeNull();
    expect(readSharedFromHash("#sp=garbage")).toBeNull();
  });
});
