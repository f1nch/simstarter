import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultLine } from "./ResultLine";
import type { DataItem } from "../data/types";

const baseItem: DataItem = { id: "pool", label: "Pool", pack: "base" };
const packItem: DataItem = {
  id: "livestock",
  label: "Livestock",
  pack: "cottage_living",
  detail: "Moo.",
};
const stuffItem: DataItem = {
  id: "laundry_room",
  label: "Laundry Room",
  pack: "laundry_day",
};

describe("ResultLine", () => {
  it("shows label and detail", () => {
    render(<ResultLine caption="Feature" item={packItem} onReroll={() => {}} />);
    expect(screen.getByText("Livestock")).toBeInTheDocument();
    expect(screen.getByText("Moo.")).toBeInTheDocument();
  });

  it("shows a pack badge only for non-base items", () => {
    const { rerender } = render(
      <ResultLine caption="Feature" item={packItem} onReroll={() => {}} />,
    );
    expect(screen.getByText("Cottage Living")).toBeInTheDocument();
    rerender(<ResultLine caption="Feature" item={baseItem} onReroll={() => {}} />);
    expect(screen.queryByText("Base Game")).not.toBeInTheDocument();
  });

  it("strips the ' Stuff' suffix from stuff-pack badge names", () => {
    render(<ResultLine caption="Room" item={stuffItem} onReroll={() => {}} />);
    expect(screen.getByText("Laundry Day")).toBeInTheDocument();
    expect(screen.queryByText("Laundry Day Stuff")).not.toBeInTheDocument();
  });

  it("calls onReroll when the re-roll button is clicked", async () => {
    const onReroll = vi.fn();
    render(<ResultLine caption="Feature" item={baseItem} onReroll={onReroll} />);
    await userEvent.click(screen.getByRole("button", { name: "Re-roll Feature" }));
    expect(onReroll).toHaveBeenCalledOnce();
  });
});
