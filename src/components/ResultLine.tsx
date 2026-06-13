import type { DataItem } from "../data/types";
import { PackBadge } from "./PackBadge";

interface ResultLineProps {
  caption: string;
  item: DataItem;
  onReroll: () => void;
}

export function ResultLine({ caption, item, onReroll }: ResultLineProps) {
  return (
    // key remounts the row when the item changes, replaying the pop animation
    <div
      key={item.id}
      className="animate-pop flex items-start justify-between gap-2 rounded-xl bg-green-50/70 px-3 py-2"
    >
      <div className="min-w-0">
        <span className="block text-[11px] font-bold tracking-wide text-green-600 uppercase">
          {caption}
        </span>
        <span className="font-semibold text-slate-800">{item.label}</span>
        {item.detail && <p className="text-sm text-slate-500">{item.detail}</p>}
        {item.pack !== "base" && <PackBadge packId={item.pack} />}
      </div>
      <button
        type="button"
        onClick={onReroll}
        aria-label={`Re-roll ${caption}`}
        title="Re-roll"
        className="mt-1 shrink-0 rounded-full p-1.5 text-lg leading-none text-green-600 transition-transform duration-300 hover:rotate-180 hover:bg-green-100"
      >
        ↻
      </button>
    </div>
  );
}
