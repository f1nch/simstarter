import { packs, type PackId } from "../data/packs";

export function PackBadge({ packId }: { packId: PackId }) {
  const pack = packs.find((p) => p.id === packId);
  if (!pack) return null;
  return (
    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      {pack.name.replace(/ Stuff$/, "")}
    </span>
  );
}
