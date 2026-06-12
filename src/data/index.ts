import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";
import { households } from "./households";
import { traits } from "./traits";
import { aspirations } from "./aspirations";
import { houseTypes } from "./houseTypes";
import { houseStyles } from "./houseStyles";
import { exteriorMaterials } from "./exteriorMaterials";
import { colorSchemes } from "./colorSchemes";
import { exteriorFeatures } from "./exteriorFeatures";
import { bonusRooms } from "./bonusRooms";
import { interiorFeatures } from "./interiorFeatures";
import { worlds } from "./worlds";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
  households,
  traits,
  aspirations,
  houseTypes,
  houseStyles,
  exteriorMaterials,
  colorSchemes,
  exteriorFeatures,
  bonusRooms,
  interiorFeatures,
  worlds,
};
