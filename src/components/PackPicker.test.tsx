import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackPicker } from "./PackPicker";
import { packs, type PackId } from "../data/packs";

const expansionIds = packs.filter((p) => p.type === "expansion").map((p) => p.id);

describe("PackPicker section select-all", () => {
  it("selects every pack in a section, leaving other sections untouched", async () => {
    const onChange = vi.fn();
    render(<PackPicker owned={new Set<PackId>(["base"])} onChange={onChange} onClose={() => {}} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Select all Expansion Packs" }),
    );

    const next: Set<PackId> = onChange.mock.calls[0][0];
    for (const id of expansionIds) expect(next.has(id)).toBe(true);
    expect(next.has("base")).toBe(true);
    // a game pack was not part of this section, so it stays off
    expect(next.has("vampires")).toBe(false);
  });

  it("shows Clear and removes the section when all are already selected", async () => {
    const onChange = vi.fn();
    render(
      <PackPicker
        owned={new Set<PackId>(["base", ...expansionIds])}
        onChange={onChange}
        onClose={() => {}}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Clear Expansion Packs" }),
    );

    const next: Set<PackId> = onChange.mock.calls[0][0];
    for (const id of expansionIds) expect(next.has(id)).toBe(false);
    // base is never removed by a section toggle
    expect(next.has("base")).toBe(true);
  });
});
