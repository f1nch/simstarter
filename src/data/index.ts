import type { DataItem } from "./types";
import { scenarios } from "./scenarios";
import { restrictions } from "./restrictions";
import { goals } from "./goals";
import { wildcards } from "./wildcards";

export const categories: Record<string, DataItem[]> = {
  scenarios,
  restrictions,
  goals,
  wildcards,
};
