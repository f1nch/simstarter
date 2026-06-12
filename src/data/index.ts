import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";
import { households } from "./households";
import { traits } from "./traits";
import { aspirations } from "./aspirations";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
  households,
  traits,
  aspirations,
};
