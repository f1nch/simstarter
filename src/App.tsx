import { useState } from "react";
import {
  arraySlotCategories,
  generateStartingPoint,
  roll,
  singleSlotCategories,
  type ArraySlot,
  type SingleSlot,
  type StartingPoint,
} from "./generator";
import { useOwnedPacks } from "./useOwnedPacks";
import { Header } from "./components/Header";
import { PackPicker } from "./components/PackPicker";
import { ResultCard } from "./components/ResultCard";
import { ResultLine } from "./components/ResultLine";

export default function App() {
  const [ownedPacks, setOwnedPacks] = useOwnedPacks();
  const [sp, setSp] = useState<StartingPoint | null>(null);
  const [packsOpen, setPacksOpen] = useState(false);

  function generate() {
    setSp(generateStartingPoint(ownedPacks));
  }

  function rerollSingle(slot: SingleSlot) {
    setSp((prev) =>
      prev && {
        ...prev,
        [slot]: roll(singleSlotCategories[slot], ownedPacks, [prev[slot].id]),
      },
    );
  }

  function rerollArrayItem(slot: ArraySlot, index: number) {
    setSp((prev) => {
      if (!prev) return prev;
      const current = prev[slot];
      const next = [...current];
      next[index] = roll(
        arraySlotCategories[slot],
        ownedPacks,
        current.map((i) => i.id),
      );
      return { ...prev, [slot]: next };
    });
  }

  function arrayLines(slot: ArraySlot, caption: string) {
    return sp![slot].map((item, i) => (
      <ResultLine
        key={`${slot}-${i}`}
        caption={sp![slot].length > 1 ? `${caption} ${i + 1}` : caption}
        item={item}
        onReroll={() => rerollArrayItem(slot, i)}
      />
    ));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 text-slate-800">
      <Header onOpenPacks={() => setPacksOpen(true)} onGenerate={generate} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {sp === null ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-2xl font-extrabold text-green-700">
              Roll your next story 🎲
            </p>
            <p className="max-w-md text-slate-500">
              One click generates a challenge, a household, a house build, and a
              world — using only the packs you own.
            </p>
            <button
              type="button"
              onClick={generate}
              className="rounded-full bg-green-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-green-600 active:scale-95"
            >
              🎲 Generate
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard icon="📜" title="Challenge">
              <ResultLine caption="Scenario" item={sp.scenario} onReroll={() => rerollSingle("scenario")} />
              {arrayLines("restrictions", "Restriction")}
              <ResultLine caption="Goal" item={sp.goal} onReroll={() => rerollSingle("goal")} />
              <ResultLine caption="Wildcard" item={sp.wildcard} onReroll={() => rerollSingle("wildcard")} />
            </ResultCard>
            <ResultCard icon="👪" title="Household">
              <ResultLine caption="Family type" item={sp.household} onReroll={() => rerollSingle("household")} />
              {arrayLines("traits", "Trait")}
              <ResultLine caption="Aspiration" item={sp.aspiration} onReroll={() => rerollSingle("aspiration")} />
            </ResultCard>
            <ResultCard icon="🏠" title="House">
              <ResultLine caption="Build type" item={sp.houseType} onReroll={() => rerollSingle("houseType")} />
              <ResultLine caption="Style" item={sp.houseStyle} onReroll={() => rerollSingle("houseStyle")} />
              <ResultLine caption="Exterior material" item={sp.exteriorMaterial} onReroll={() => rerollSingle("exteriorMaterial")} />
              <ResultLine caption="Exterior colors" item={sp.exteriorColors} onReroll={() => rerollSingle("exteriorColors")} />
              <ResultLine caption="Interior colors" item={sp.interiorColors} onReroll={() => rerollSingle("interiorColors")} />
              {arrayLines("exteriorFeatures", "Exterior feature")}
              {arrayLines("bonusRooms", "Bonus room")}
              {arrayLines("interiorFeatures", "Interior feature")}
            </ResultCard>
            <ResultCard icon="🌍" title="World">
              <ResultLine caption="World" item={sp.world} onReroll={() => rerollSingle("world")} />
            </ResultCard>
          </div>
        )}
      </main>
      {packsOpen && (
        <PackPicker
          owned={ownedPacks}
          onChange={setOwnedPacks}
          onClose={() => setPacksOpen(false)}
        />
      )}
    </div>
  );
}
