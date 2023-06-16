import {
  houseBuild,
  houseConcept,
  houseStyle,
  houseExterior,
  exteriorColorScheme,
  interiorColorScheme,
  exteriorFeatures,
  extraRoom,
  interiorFeatures,
  familyType,
  chaos,
} from "./consts.js";

const bonusRoll = (type, array) => {
  const items = [];
  let filteredArray = array.filter((item) => item !== "roll3" && item !== "roll2");

  if (type === "roll2") {
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(
        Math.random() * filteredArray.length
      );
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
    
    if (item === "roll2" || item === "roll3") {
        return bonusRoll(item, array);   
    }

    return item;
};

// on button click
function createBuild() {
  const buildText = document.querySelector(".build-text");

  // Clear existing content
  buildText.innerHTML = "";

  let buildItems = [];

  // get random houseBuild
  const randomBuild = selectItem(houseBuild);
  buildItems.push(randomBuild);

  // get random houseConcept
  const randomConcept = selectItem(houseConcept);
  buildItems.push(randomConcept);

  // get random houseStyle
  //! has bonus roll
  const randomStyle = selectItem(houseStyle);
  buildItems.push(randomStyle);

  // get random houseExterior
  //! has bonus roll
  const randomExterior = selectItem(houseExterior);
  buildItems.push(randomExterior);

  // get random exteriorColorScheme
  const randomExteriorColor = selectItem(exteriorColorScheme);
  buildItems.push(randomExteriorColor);

  // get random interiorColorScheme
  const randomInteriorColor = selectItem(interiorColorScheme);
  buildItems.push(randomInteriorColor);

  // get random exteriorFeatures
  const randomExteriorFeatures = selectItem(exteriorFeatures);
  buildItems.push(randomExteriorFeatures);

  // get random extraRoom
  //! has bonus roll
  const randomExtraRoom = selectItem(extraRoom);
  buildItems.push(randomExtraRoom);

  // get random interiorFeatures
  const randomInteriorFeatures = selectItem(interiorFeatures);
  buildItems.push(randomInteriorFeatures);

  // get random familyType
  const randomFamilyType = selectItem(familyType);
  buildItems.push(randomFamilyType);

  // get random chaos
  //! has bonus roll
  const randomChaos = selectItem(chaos);
  buildItems.push(randomChaos);

  // loop through all buildItems and add them as <li>s to buildText
  for (let i = 0; i < buildItems.length; i++) {
    const newBuildItem = document.createElement("li");
    newBuildItem.innerText = buildItems[i];
    buildText.appendChild(newBuildItem);
  }
}

createBuild();

const createButton = document.querySelector(".create-button");
createButton.addEventListener("click", createBuild);
