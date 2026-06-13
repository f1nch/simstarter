import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => localStorage.clear());

describe("App", () => {
  it("shows an empty state before the first generate", () => {
    render(<App />);
    expect(screen.getByText(/roll your next story/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Challenge" })).not.toBeInTheDocument();
  });

  it("fills all four cards on Generate", async () => {
    render(<App />);
    // two Generate buttons exist pre-roll (header + empty-state CTA)
    await userEvent.click(screen.getAllByRole("button", { name: /generate/i })[0]);
    // role query: the heading's text content includes the aria-hidden icon,
    // so an exact getByText("House") would not match
    for (const title of ["Challenge", "Household", "House", "World"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    // every slot rendered: at least scenario, goal, wildcard, household,
    // 3 traits, aspiration, 8 house lines, world => lots of re-roll buttons
    expect(screen.getAllByRole("button", { name: /^re-roll/i }).length).toBeGreaterThanOrEqual(15);
  });

  it("re-rolls only the clicked line", async () => {
    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: /generate/i })[0]);

    const scenarioBefore = screen.getByText("Scenario").parentElement!.textContent;
    const goalBefore = screen.getByText("Goal").parentElement!.textContent;

    await userEvent.click(screen.getByRole("button", { name: "Re-roll Scenario" }));

    const scenarioAfter = screen.getByText("Scenario").parentElement!.textContent;
    const goalAfter = screen.getByText("Goal").parentElement!.textContent;

    expect(scenarioAfter).not.toBe(scenarioBefore); // exclusion guarantees a change
    expect(goalAfter).toBe(goalBefore);
  });

  it("opens the pack picker", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /packs/i }));
    expect(screen.getByRole("dialog", { name: /choose your packs/i })).toBeInTheDocument();
    expect(screen.getByText("Base Game (always on)")).toBeInTheDocument();
  });
});
