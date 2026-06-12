import "./App.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import GeneratedContent from "./components/generated-content/generated-content.component";
import GeneratedConfig from "./components/generator-config/generator-config.component";
import { useEffect, useMemo, useState } from "react";

function App() {
  const [expansions, setExpansions] = useState(() => {
    const cached = localStorage.getItem("expansions");
    return cached ? JSON.parse(cached) : [];
  });
  const [gamePacks, setGamePacks] = useState(() => {
    const cached = localStorage.getItem("gamePacks");
    return cached ? JSON.parse(cached) : [];
  });
  const [stuffPacks, setStuffPacks] = useState(() => {
    const cached = localStorage.getItem("stuffPacks");
    return cached ? JSON.parse(cached) : [];
  });
  const [kits, setKits] = useState(() => {
    const cached = localStorage.getItem("kits");
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    localStorage.setItem("expansions", JSON.stringify(expansions));
  }, [expansions]);
  useEffect(() => {
    localStorage.setItem("gamePacks", JSON.stringify(gamePacks));
  }, [gamePacks]);
  useEffect(() => {
    localStorage.setItem("stuffPacks", JSON.stringify(stuffPacks));
  }, [stuffPacks]);
  useEffect(() => {
    localStorage.setItem("kits", JSON.stringify(kits));
  }, [kits]);

  const ownedPacks = useMemo(() => {
    const set = new Set(["base"]);
    expansions.forEach((p) => set.add(p.label));
    gamePacks.forEach((p) => set.add(p.label));
    stuffPacks.forEach((p) => set.add(p.label));
    kits.forEach((p) => set.add(p.label));
    return set;
  }, [expansions, gamePacks, stuffPacks, kits]);

  return (
    <div className="App">
      <header className="App-header">
        <p>SimStarter - The Sims house starter</p>
      </header>
      <GeneratedConfig
        expansions={expansions}
        setExpansions={setExpansions}
        gamePacks={gamePacks}
        setGamePacks={setGamePacks}
        stuffPacks={stuffPacks}
        setStuffPacks={setStuffPacks}
        kits={kits}
        setKits={setKits}
      />
      <GeneratedContent ownedPacks={ownedPacks} />
    </div>
  );
}

export default App;
