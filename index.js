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
  if (type === "roll2") {
  } else if (type === "roll3") {
  }
  return [];
};

const selectItem = (array) => {
    const item = array[Math.floor(Math.random() * array.length)];
    
    if (item === "roll2" || item === "roll3") {
        return bonusRoll(item, array);   
    }

    return array[Math.floor(Math.random() * array.length)];
};

// on button click
function createBuild() {
  console.log("create build");
  const buildText = document.querySelector(".build-text");

  // Clear existing content
  buildText.innerHTML = "";

  let buildItems = [];

  // get random houseBuild
  //   const randomBuild = houseBuild[Math.floor(Math.random() * houseBuild.length)];
  const randomBuild = selectItem(houseBuild);
  buildItems.push(randomBuild);

  // get random houseConcept
  //   const randomConcept =
  //     houseConcept[Math.floor(Math.random() * houseConcept.length)];
  const randomConcept = selectItem(houseConcept);
  buildItems.push(randomConcept);

  // get random houseStyle
  const randomStyle = houseStyle[Math.floor(Math.random() * houseStyle.length)];
  if (randomStyle === "roll2") {
    const randomExteriorFeatures = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(
        Math.random() * exteriorFeatures.length - 1
      );
      const randomFeature = exteriorFeatures[randomIndex];
      randomExteriorFeatures.push(randomFeature);
    }
    const joinedFeatures = randomExteriorFeatures.join(" + bonus: ");
    buildItems.push(joinedFeatures);
  } else {
    buildItems.push(randomStyle);
  }

  // get random houseExterior
  const randomExterior =
    houseExterior[Math.floor(Math.random() * houseExterior.length)];
  if (randomExterior === "roll2") {
    const randomExteriorFeatures = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(
        Math.random() * exteriorFeatures.length - 1
      );
      const randomFeature = exteriorFeatures[randomIndex];
      randomExteriorFeatures.push(randomFeature);
    }
    const joinedFeatures = randomExteriorFeatures.join(" + bonus: ");
    buildItems.push(joinedFeatures);
  } else if (randomExterior === "roll3") {
    const randomExteriorFeatures = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(
        Math.random() * exteriorFeatures.length - 1
      );
      const randomFeature = exteriorFeatures[randomIndex];
      randomExteriorFeatures.push(randomFeature);
    }
    const joinedFeatures = randomExteriorFeatures.join(" + bonus: ");
    buildItems.push(joinedFeatures);
  } else {
    buildItems.push(randomExterior);
  }
  buildItems.push(randomExterior);

  // get random exteriorColorScheme
  const randomExteriorColor =
    exteriorColorScheme[Math.floor(Math.random() * exteriorColorScheme.length)];
  buildItems.push(randomExteriorColor);

  // get random interiorColorScheme
  const randomInteriorColor =
    interiorColorScheme[Math.floor(Math.random() * interiorColorScheme.length)];
  buildItems.push(randomInteriorColor);

  // get random exteriorFeatures
  const randomExteriorFeatures =
    exteriorFeatures[Math.floor(Math.random() * exteriorFeatures.length)];
  if (randomExteriorFeatures === "roll2") {
    buildItems.push(randomExteriorFeatures);
  }

  // get random extraRoom
  const randomExtraRoom =
    extraRoom[Math.floor(Math.random() * extraRoom.length)];
  if (randomExtraRoom === "roll2") {
    const bonus = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(
        Math.random() * exteriorFeatures.length - 1
      );
      const bonus = exteriorFeatures[randomIndex];
      randomExteriorFeatures.push(bonus);
    }
    const joinedFeatures = randomExteriorFeatures.join(" + bonus: ");
    buildItems.push(joinedFeatures);
  } else {
    buildItems.push(randomExtraRoom);
  }

  // get random interiorFeatures
  const randomInteriorFeatures =
    interiorFeatures[Math.floor(Math.random() * interiorFeatures.length)];
  buildItems.push(randomInteriorFeatures);

  // get random familyType
  const randomFamilyType =
    familyType[Math.floor(Math.random() * familyType.length)];
  buildItems.push(randomFamilyType);

  // get random chaos
  const randomChaos = chaos[Math.floor(Math.random() * chaos.length)];
  if (randomChaos === "roll2") {
  }
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
