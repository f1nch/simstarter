import type { DataItem } from "../data/types";
import { accentClasses, type Accent } from "./accents";
import { PackBadge } from "./PackBadge";

interface ResultLineProps {
  caption: string;
  item: DataItem;
  accent: Accent;
  onReroll: () => void;
}

export function ResultLine({ caption, item, accent, onReroll }: ResultLineProps) {
  const c = accentClasses[accent];
  return (
    // key remounts the row when the item changes, replaying the pop animation
    <div
      key={item.id}
      className={`animate-pop flex items-start justify-between gap-2 rounded-xl px-3 py-2 ${c.row}`}
    >
      <div className="min-w-0">
        <span
          className={`mb-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${c.pill}`}
        >
          {caption}
        </span>
        <span className="block font-semibold text-slate-800">{item.label}</span>
        {item.detail && <p className="text-sm text-slate-500">{item.detail}</p>}
        {item.pack !== "base" && <PackBadge packId={item.pack} />}
      </div>
      <button
        type="button"
        onClick={onReroll}
        aria-label={`Re-roll ${caption}`}
        title="Re-roll"
        className={`mt-1 shrink-0 rounded-full p-1.5 text-lg leading-none transition-transform duration-300 hover:rotate-180 ${c.reroll}`}
      >
        ↻
      </button>
    </div>
  );
}
