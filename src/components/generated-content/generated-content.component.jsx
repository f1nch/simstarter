import React, { useRef } from "react";
import * as consts from "../consts";
import "./generated-content.css";


function GeneratedContent(props) {
  // const items = props.items.map((item) => <li key={item.id}>{item.name}</li>);
  const generatedText = useRef(null);
  let buildItems = [];


  const bonusRoll = (type, array) => {
    const items = [];
    let filteredArray = array.filter(
      (item) => item !== "roll3" && item !== "roll2"
    );

    if (type === "roll2") {
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * filteredArray.length);
        const randomItem = filteredArray[randomIndex];
        items.push(randomItem);

        // remove item from filteredArray so it cannot be selected again
        filteredArray = filteredArray.filter((item) => item !== randomItem);
      }

      const joinedItems = items.join(" + bonus: ");
      return joinedItems;
    } else if (type === "roll3") {
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * filteredArray.length);
        const randomItem = filteredArray[randomIndex];
        items.push(randomItem);

        // remove item from filteredArray so it cannot be selected again
        filteredArray = filteredArray.filter((item) => item !== randomItem);
      }
      const joinedItems = items.join(" + bonus: ");
      return joinedItems;
    }
    return [];
  };

  const selectItem = (array) => {
    const item = array[Math.floor(Math.random() * array.length)];

    // TODO - filter items that aren't in the list of avavilable packs the user has selected

    if (item === "roll2" || item === "roll3") {
      return bonusRoll(item, array);
    }

    return item;
  };

  // on button click
  function createBuild() {
    // Clear existing content
    generatedText.current.innerHTML = "";
    buildItems = [];

    // get random houseBuild
    const randomBuild = selectItem(consts.houseBuild);
    buildItems.push(randomBuild.value);

    // get random houseConcept
    const randomConcept = selectItem(consts.houseConcept);
    buildItems.push(randomConcept.value);

    // get random houseStyle
    //! has bonus roll
    const randomStyle = selectItem(consts.houseStyle);
    buildItems.push(randomStyle.value);

    // get random houseExterior
    //! has bonus roll
    const randomExterior = selectItem(consts.houseExterior);
    buildItems.push(randomExterior.value);

    // get random exteriorColorScheme
    const randomExteriorColor = selectItem(consts.exteriorColorScheme);
    buildItems.push(randomExteriorColor.value);

    // get random interiorColorScheme
    const randomInteriorColor = selectItem(consts.interiorColorScheme);
    buildItems.push(randomInteriorColor.value);

    // get random exteriorFeatures
    const randomExteriorFeatures = bonusRoll("roll2", consts.exteriorFeatures);
    buildItems.push(randomExteriorFeatures.value);

    // get random interiorFeatures
    const randomInteriorFeatures = selectItem(consts.interiorFeatures);
    buildItems.push(randomInteriorFeatures.value);

    // get random extraRoom
    //! has bonus roll
    const randomExtraRoom = selectItem(consts.extraRoom);
    buildItems.push(randomExtraRoom.value);

    // get random familyType
    const randomFamilyType = selectItem(consts.familyType);
    buildItems.push(randomFamilyType.value);

    // get random challenge
    //! has bonus roll
    const randomChallenge = selectItem(consts.challenge);
    buildItems.push(randomChallenge.value);

    // loop through all buildItems and add them as <li>s to generatedText
    for (let i = 0; i < buildItems.length; i++) {
      const newBuildItem = document.createElement("li");
      newBuildItem.innerText = buildItems[i];
      generatedText.current.appendChild(newBuildItem);
    }
  }

  // createBuild();
  const handleGenerateClick = () => {
    createBuild();
  };

  return (
    <div className="generated-content">
      <ul ref={generatedText}>
        {buildItems &&
          buildItems.map((item) => {
            return <li>{item}</li>;
          })}
      </ul>

      <button
        type="button"
        className="create-button"
        onClick={handleGenerateClick}
      >
        Generate
      </button>
    </div>
  );
}

export default GeneratedContent;
