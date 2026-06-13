export type Accent = "amber" | "pink" | "sky" | "teal";

export interface AccentClasses {
  /** Card border + chunky offset shadow in the accent color. */
  card: string;
  /** Card title text color. */
  title: string;
  /** Faint accent tint behind each result row. */
  row: string;
  /** Caption pill background + text. */
  pill: string;
  /** Re-roll button color + hover background. */
  reroll: string;
}

// Full class strings are written out as literals (no interpolation) so
// Tailwind's JIT scanner emits every utility used here.
export const accentClasses: Record<Accent, AccentClasses> = {
  amber: {
    card: "border-amber-200 shadow-[0_5px_0_#fcd34d]",
    title: "text-amber-700",
    row: "bg-amber-50",
    pill: "bg-amber-100 text-amber-800",
    reroll: "text-amber-600 hover:bg-amber-100",
  },
  pink: {
    card: "border-pink-200 shadow-[0_5px_0_#f9a8d4]",
    title: "text-pink-700",
    row: "bg-pink-50",
    pill: "bg-pink-100 text-pink-800",
    reroll: "text-pink-600 hover:bg-pink-100",
  },
  sky: {
    card: "border-sky-200 shadow-[0_5px_0_#7dd3fc]",
    title: "text-sky-700",
    row: "bg-sky-50",
    pill: "bg-sky-100 text-sky-800",
    reroll: "text-sky-600 hover:bg-sky-100",
  },
  teal: {
    card: "border-teal-200 shadow-[0_5px_0_#5eead4]",
    title: "text-teal-700",
    row: "bg-teal-50",
    pill: "bg-teal-100 text-teal-800",
    reroll: "text-teal-600 hover:bg-teal-100",
  },
};
