import { describe, expect, it } from "vitest";
import {
  generateStartingPoint,
  householdMatchesScenario,
  householdsForScenario,
} from "./generator";
import { households, householdShape } from "./data/households";
import { scenarios, scenarioShapes } from "./data/scenarios";

const BASE_ONLY = new Set(["base"] as const);

describe("household shape data", () => {
  it("assigns a shape to every household", () => {
    const missing = households.filter((h) => !householdShape[h.id]);
    expect(missing.map((h) => h.id)).toEqual([]);
  });
});

describe("scenarioShapes data", () => {
  it("keys are real scenario ids", () => {
    const ids = new Set(scenarios.map((s) => s.id));
    const unknown = Object.keys(scenarioShapes).filter((id) => !ids.has(id));
    expect(unknown).toEqual([]);
  });

  it("every constrained shape is reachable by a base-game household", () => {
    const baseShapes = new Set(
      households.filter((h) => h.pack === "base").map((h) => householdShape[h.id]),
    );
    for (const [scenarioId, shapes] of Object.entries(scenarioShapes)) {
      for (const shape of shapes) {
        expect(baseShapes.has(shape), `${scenarioId} needs a base household of shape ${shape}`).toBe(true);
      }
    }
  });
});

describe("householdsForScenario", () => {
  it("returns all households for an unconstrained scenario", () => {
    expect(householdsForScenario("rags_to_riches")).toEqual(households);
  });

  it("returns only compatible shapes for a constrained scenario", () => {
    const result = householdsForScenario("broke_newlyweds");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((h) => householdShape[h.id] === "couple")).toBe(true);
  });
});

describe("generateStartingPoint compatibility", () => {
  it("never pairs a scenario with an incompatible household", () => {
    for (let i = 0; i < 300; i++) {
      const sp = generateStartingPoint(BASE_ONLY);
      expect(
        householdMatchesScenario(sp.scenario.id, sp.household.id),
        `${sp.scenario.id} + ${sp.household.id}`,
      ).toBe(true);
    }
  });
});
