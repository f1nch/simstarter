import React, { useState } from "react";
import * as consts from "../consts";
import "./generated-content.css";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function GeneratedContent({ ownedPacks }) {
  const [buildItems, setBuildItems] = useState([]);

  const filterByOwnedPacks = (options) => {
    return options.filter((opt) => ownedPacks.has(opt.pack));
  };

  const bonusRoll = (count, array) => {
    const items = [];
    let filteredArray = array.filter(
      (item) => item.value !== "roll3" && item.value !== "roll2"
    );
    for (let i = 0; i < count && filteredArray.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * filteredArray.length);
      const randomItem = filteredArray[randomIndex];
      items.push(randomItem.value);
      filteredArray = filteredArray.filter((item) => item !== randomItem);
    }
    return items.join(" + bonus: ");
  };

  const selectItem = (array) => {
    if (!array || array.length === 0) return null;
    const item = array[Math.floor(Math.random() * array.length)];
    if (item.value === "roll2") return bonusRoll(2, array);
    if (item.value === "roll3") return bonusRoll(3, array);
    return item.value;
  };

  const rollAll = () => {
    const houseBuildOptions = filterByOwnedPacks(consts.houseBuild);
    const houseConceptOptions = filterByOwnedPacks(consts.houseConcept);
    const houseStyleOptions = filterByOwnedPacks(consts.houseStyle);
    const houseExteriorOptions = filterByOwnedPacks(consts.houseExterior);
    const exteriorColorOptions = filterByOwnedPacks(consts.exteriorColorScheme);
    const interiorColorOptions = filterByOwnedPacks(consts.interiorColorScheme);
    const exteriorFeaturesOptions = filterByOwnedPacks(consts.exteriorFeatures);
    const interiorFeaturesOptions = filterByOwnedPacks(consts.interiorFeatures);
    const extraRoomOptions = filterByOwnedPacks(consts.extraRoom);
    const familyTypeOptions = filterByOwnedPacks(consts.familyType);
    const challengeOptions = filterByOwnedPacks(consts.challenge);
    const worldOptions = filterByOwnedPacks(consts.worlds);
    const lotSizeOptions = filterByOwnedPacks(consts.lotSizes);
    const budgetOptions = filterByOwnedPacks(consts.budgetTiers);

    const build = {
      world: selectItem(worldOptions),
      lotSize: selectItem(lotSizeOptions),
      budget: selectItem(budgetOptions),
      houseBuild: selectItem(houseBuildOptions),
      houseConcept: selectItem(houseConceptOptions),
      houseStyle: selectItem(houseStyleOptions),
      houseExterior: selectItem(houseExteriorOptions),
      exteriorColor: selectItem(exteriorColorOptions),
      interiorColor: selectItem(interiorColorOptions),
      exteriorFeatures: bonusRoll(2, exteriorFeaturesOptions),
      interiorFeature: selectItem(interiorFeaturesOptions),
      extraRoom: selectItem(extraRoomOptions),
      familyType: selectItem(familyTypeOptions),
      challenge: selectItem(challengeOptions),
      householdSize: `${Math.floor(Math.random() * 6) + 1} sims`,
      ageHint: selectItem([
        { value: "Young family focus", pack: "base" },
        { value: "Elders friendly design", pack: "base" },
        { value: "Teen hangout vibes", pack: "base" },
        { value: "Infant/toddler ready", pack: "base" },
        { value: "Mixed ages", pack: "base" },
      ]),
    };

    setBuildItems(build);
  };

  const handleGenerateClick = () => {
    rollAll();
  };

  const rollOne = (field) => {
    if (!buildItems) return;
    const updated = { ...buildItems };
    const map = {
      world: filterByOwnedPacks(consts.worlds),
      lotSize: filterByOwnedPacks(consts.lotSizes),
      budget: filterByOwnedPacks(consts.budgetTiers),
      houseBuild: filterByOwnedPacks(consts.houseBuild),
      houseConcept: filterByOwnedPacks(consts.houseConcept),
      houseStyle: filterByOwnedPacks(consts.houseStyle),
      houseExterior: filterByOwnedPacks(consts.houseExterior),
      exteriorColor: filterByOwnedPacks(consts.exteriorColorScheme),
      interiorColor: filterByOwnedPacks(consts.interiorColorScheme),
      exteriorFeatures: filterByOwnedPacks(consts.exteriorFeatures),
      interiorFeature: filterByOwnedPacks(consts.interiorFeatures),
      extraRoom: filterByOwnedPacks(consts.extraRoom),
      familyType: filterByOwnedPacks(consts.familyType),
      challenge: filterByOwnedPacks(consts.challenge),
      householdSize: null,
      ageHint: [
        { value: "Young family focus", pack: "base" },
        { value: "Elders friendly design", pack: "base" },
        { value: "Teen hangout vibes", pack: "base" },
        { value: "Infant/toddler ready", pack: "base" },
        { value: "Mixed ages", pack: "base" },
      ],
    };

    if (field === "exteriorFeatures") {
      updated.exteriorFeatures = bonusRoll(2, map.exteriorFeatures);
    } else if (field === "householdSize") {
      updated.householdSize = `${Math.floor(Math.random() * 6) + 1} sims`;
    } else if (field === "ageHint") {
      updated.ageHint = selectItem(map.ageHint);
    } else {
      updated[field] = selectItem(map[field]);
    }
    setBuildItems(updated);
  };

  const copyToClipboard = async () => {
    if (!buildItems) return;
    const text = `World: ${buildItems.world}\nLot size: ${buildItems.lotSize}\nBudget: ${buildItems.budget}\nHouse build: ${buildItems.houseBuild}\nConcept: ${buildItems.houseConcept}\nStyle: ${buildItems.houseStyle}\nExterior: ${buildItems.houseExterior}\nExterior colors: ${buildItems.exteriorColor}\nInterior colors: ${buildItems.interiorColor}\nExterior features: ${buildItems.exteriorFeatures}\nInterior feature: ${buildItems.interiorFeature}\nExtra room: ${buildItems.extraRoom}\nFamily type: ${buildItems.familyType}\nHousehold size: ${buildItems.householdSize}\nAge hint: ${buildItems.ageHint}\nChallenge: ${buildItems.challenge}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="generated-content">
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" onClick={handleGenerateClick}>
          Generate story
        </Button>
        <Button
          variant="outlined"
          onClick={copyToClipboard}
          startIcon={<ContentCopyIcon />}
        >
          Copy
        </Button>
      </Stack>
      {buildItems && (
        <div style={{ textAlign: "left", margin: "30px auto", width: "50vw" }}>
          <h3>Location</h3>
          <ul>
            <li>
              <b>World:</b> {buildItems.world}{" "}
              <Button size="small" onClick={() => rollOne("world")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Lot size:</b> {buildItems.lotSize}{" "}
              <Button size="small" onClick={() => rollOne("lotSize")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Budget:</b> {buildItems.budget}{" "}
              <Button size="small" onClick={() => rollOne("budget")}>
                Regenerate
              </Button>
            </li>
          </ul>
          <Divider />
          <h3>Build</h3>
          <ul>
            <li>
              <b>Type:</b> {buildItems.houseBuild}{" "}
              <Button size="small" onClick={() => rollOne("houseBuild")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Concept:</b> {buildItems.houseConcept}{" "}
              <Button size="small" onClick={() => rollOne("houseConcept")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Style:</b> {buildItems.houseStyle}{" "}
              <Button size="small" onClick={() => rollOne("houseStyle")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Exterior material:</b> {buildItems.houseExterior}{" "}
              <Button size="small" onClick={() => rollOne("houseExterior")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Exterior colors:</b> {buildItems.exteriorColor}{" "}
              <Button size="small" onClick={() => rollOne("exteriorColor")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Interior colors:</b> {buildItems.interiorColor}{" "}
              <Button size="small" onClick={() => rollOne("interiorColor")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Exterior features:</b> {buildItems.exteriorFeatures}{" "}
              <Button size="small" onClick={() => rollOne("exteriorFeatures")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Interior feature:</b> {buildItems.interiorFeature}{" "}
              <Button size="small" onClick={() => rollOne("interiorFeature")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Extra room:</b> {buildItems.extraRoom}{" "}
              <Button size="small" onClick={() => rollOne("extraRoom")}>
                Regenerate
              </Button>
            </li>
          </ul>
          <Divider />
          <h3>Household</h3>
          <ul>
            <li>
              <b>Family type:</b> {buildItems.familyType}{" "}
              <Button size="small" onClick={() => rollOne("familyType")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Household size:</b> {buildItems.householdSize}{" "}
              <Button size="small" onClick={() => rollOne("householdSize")}>
                Regenerate
              </Button>
            </li>
            <li>
              <b>Age hint:</b> {buildItems.ageHint}{" "}
              <Button size="small" onClick={() => rollOne("ageHint")}>
                Regenerate
              </Button>
            </li>
          </ul>
          <Divider />
          <h3>Challenge</h3>
          <ul>
            <li>
              <b>Twist:</b> {buildItems.challenge}{" "}
              <Button size="small" onClick={() => rollOne("challenge")}>
                Regenerate
              </Button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default GeneratedContent;
