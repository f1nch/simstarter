import { packs, type Pack, type PackId } from "../data/packs";

interface PackPickerProps {
  owned: Set<PackId>;
  onChange: (next: Set<PackId>) => void;
  onClose: () => void;
}

const GROUPS: { type: Pack["type"]; title: string }[] = [
  { type: "expansion", title: "Expansion Packs" },
  { type: "game", title: "Game Packs" },
  { type: "stuff", title: "Stuff Packs" },
];

export function PackPicker({ owned, onChange, onClose }: PackPickerProps) {
  function toggle(id: PackId) {
    const next = new Set(owned);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  }

  function setGroup(type: Pack["type"], select: boolean) {
    const next = new Set(owned);
    for (const pack of packs) {
      if (pack.type !== type) continue;
      if (select) {
        next.add(pack.id);
      } else {
        next.delete(pack.id);
      }
    }
    onChange(next);
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-picker-title"
      tabIndex={-1}
      ref={(node) => node?.focus()}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="pack-picker-title" className="text-lg font-extrabold text-green-800">Your Packs</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-600"
          >
            Done
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Results only use content from packs you own.
        </p>
        <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
          <input type="checkbox" checked disabled className="accent-green-500" />
          Base Game (always on)
        </label>
        {GROUPS.map((group) => {
          const groupPacks = packs.filter((p) => p.type === group.type);
          const allOn = groupPacks.every((p) => owned.has(p.id));
          return (
            <fieldset key={group.type} className="mb-4">
              <legend className="mb-2 flex w-full items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-wide text-green-600 uppercase">
                  {group.title}
                </span>
                <button
                  type="button"
                  onClick={() => setGroup(group.type, !allOn)}
                  aria-label={`${allOn ? "Clear" : "Select all"} ${group.title}`}
                  className="rounded-full px-2 py-0.5 text-xs font-bold text-green-600 hover:bg-green-100"
                >
                  {allOn ? "Clear" : "Select all"}
                </button>
              </legend>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {groupPacks.map((pack) => (
                  <label
                    key={pack.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-green-50"
                  >
                    <input
                      type="checkbox"
                      checked={owned.has(pack.id)}
                      onChange={() => toggle(pack.id)}
                      className="accent-green-500"
                    />
                    {pack.name}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
