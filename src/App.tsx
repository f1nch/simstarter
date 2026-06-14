import { useState } from "react";
import {
  arraySlotCategories,
  generateStartingPoint,
  householdMatchesScenario,
  householdsForScenario,
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
import type { Accent } from "./components/accents";
import { buildShareUrl, readSharedFromHash } from "./share";

export default function App() {
  const [ownedPacks, setOwnedPacks] = useOwnedPacks();
  const [sp, setSp] = useState<StartingPoint | null>(() =>
    readSharedFromHash(window.location.hash),
  );
  const [packsOpen, setPacksOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function generate() {
    setSp(generateStartingPoint(ownedPacks));
    setCopied(false);
    // a fresh roll invalidates any shared link sitting in the address bar
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  async function share() {
    if (!sp) return;
    const url = buildShareUrl(sp);
    // reflect the starter in the address bar so the page itself is shareable
    window.history.replaceState(null, "", new URL(url).hash);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard blocked — the address bar still holds the shareable link
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function rerollSingle(slot: SingleSlot) {
    setSp((prev) => {
      if (!prev) return prev;
      // Household stays within the current scenario's allowed shapes.
      if (slot === "household") {
        return {
          ...prev,
          household: roll(householdsForScenario(prev.scenario.id), ownedPacks, [prev.household.id]),
        };
      }
      // Re-rolling the scenario auto-fixes the household only if it now clashes.
      if (slot === "scenario") {
        const scenario = roll(singleSlotCategories.scenario, ownedPacks, [prev.scenario.id]);
        const household = householdMatchesScenario(scenario.id, prev.household.id)
          ? prev.household
          : roll(householdsForScenario(scenario.id), ownedPacks);
        return { ...prev, scenario, household };
      }
      return {
        ...prev,
        [slot]: roll(singleSlotCategories[slot], ownedPacks, [prev[slot].id]),
      };
    });
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

  function arrayLines(slot: ArraySlot, caption: string, accent: Accent) {
    return sp![slot].map((item, i) => (
      <ResultLine
        key={`${slot}-${i}`}
        caption={sp![slot].length > 1 ? `${caption} ${i + 1}` : caption}
        item={item}
        accent={accent}
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
            <svg viewBox="0 0 20 28" className="h-20 w-14 animate-bob" aria-hidden="true">
              <polygon points="10,0 20,14 10,28 0,14" fill="#22c55e" />
              <polygon points="10,4 16.5,14 10,24 3.5,14" fill="#4ade80" />
            </svg>
            <p className="font-display text-3xl font-semibold text-green-700">
              Roll your next story
            </p>
            <p className="max-w-md text-slate-500">
              One click generates a challenge, a household, a house build, and a
              world — using only the packs you own.
            </p>
            <button
              type="button"
              onClick={generate}
              className="rounded-full bg-green-500 px-8 py-3 font-display text-lg font-semibold text-white shadow-[0_5px_0_#15803d] transition-transform active:translate-y-[5px] active:shadow-none hover:bg-green-600"
            >
              🎲 Generate
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard icon="📜" title="Challenge" accent="amber">
                <ResultLine caption="Scenario" accent="amber" item={sp.scenario} onReroll={() => rerollSingle("scenario")} />
                {arrayLines("restrictions", "Restriction", "amber")}
                <ResultLine caption="Goal" accent="amber" item={sp.goal} onReroll={() => rerollSingle("goal")} />
                <ResultLine caption="Wildcard" accent="amber" item={sp.wildcard} onReroll={() => rerollSingle("wildcard")} />
              </ResultCard>
              <ResultCard icon="👪" title="Household" accent="pink">
                <ResultLine caption="Family type" accent="pink" item={sp.household} onReroll={() => rerollSingle("household")} />
                {arrayLines("traits", "Trait", "pink")}
                <ResultLine caption="Aspiration" accent="pink" item={sp.aspiration} onReroll={() => rerollSingle("aspiration")} />
              </ResultCard>
              <ResultCard icon="🏠" title="House" accent="sky">
                <ResultLine caption="Build type" accent="sky" item={sp.houseType} onReroll={() => rerollSingle("houseType")} />
                <ResultLine caption="Style" accent="sky" item={sp.houseStyle} onReroll={() => rerollSingle("houseStyle")} />
                <ResultLine caption="Exterior material" accent="sky" item={sp.exteriorMaterial} onReroll={() => rerollSingle("exteriorMaterial")} />
                <ResultLine caption="Exterior colors" accent="sky" item={sp.exteriorColors} onReroll={() => rerollSingle("exteriorColors")} />
                <ResultLine caption="Interior colors" accent="sky" item={sp.interiorColors} onReroll={() => rerollSingle("interiorColors")} />
                {arrayLines("exteriorFeatures", "Exterior feature", "sky")}
                {arrayLines("bonusRooms", "Bonus room", "sky")}
                {arrayLines("interiorFeatures", "Interior feature", "sky")}
              </ResultCard>
              <ResultCard icon="🌍" title="World" accent="teal">
                <ResultLine caption="World" accent="teal" item={sp.world} onReroll={() => rerollSingle("world")} />
              </ResultCard>
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={share}
                className="rounded-full bg-green-500 px-6 py-2.5 font-display text-base font-semibold text-white shadow-[0_4px_0_#15803d] transition-transform active:translate-y-[4px] active:shadow-none hover:bg-green-600"
              >
                🔗 Share this starter
              </button>
              {copied && (
                <p className="font-display text-sm font-semibold text-green-700">
                  Link copied! Paste it anywhere.
                </p>
              )}
            </div>
          </>
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
