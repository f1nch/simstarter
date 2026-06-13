import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOwnedPacks, STORAGE_KEY } from "./useOwnedPacks";
import type { PackId } from "./data/packs";

beforeEach(() => localStorage.clear());

describe("useOwnedPacks", () => {
  it("defaults to base game only", () => {
    const { result } = renderHook(() => useOwnedPacks());
    expect([...result.current[0]]).toEqual(["base"]);
  });

  it("persists changes and always keeps base", () => {
    const { result } = renderHook(() => useOwnedPacks());
    act(() => result.current[1](new Set<PackId>(["seasons"])));
    expect(result.current[0].has("base")).toBe(true);
    expect(result.current[0].has("seasons")).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toContain("seasons");
  });

  it("restores from localStorage and drops unknown ids", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["seasons", "not_a_real_pack"]));
    const { result } = renderHook(() => useOwnedPacks());
    expect(result.current[0].has("seasons")).toBe(true);
    expect([...result.current[0]]).not.toContain("not_a_real_pack");
    expect(result.current[0].has("base")).toBe(true);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json[");
    const { result } = renderHook(() => useOwnedPacks());
    expect([...result.current[0]]).toEqual(["base"]);
  });

  it("persists then remounts with the same set", () => {
    const { result: first } = renderHook(() => useOwnedPacks());
    act(() => first.current[1](new Set<PackId>(["seasons", "vampires"])));
    const { result: second } = renderHook(() => useOwnedPacks());
    expect(second.current[0].has("seasons")).toBe(true);
    expect(second.current[0].has("vampires")).toBe(true);
    expect(second.current[0].has("base")).toBe(true);
  });
});
