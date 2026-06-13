import type { DataItem } from "./types";

export const houseTypes: DataItem[] = [
  { id: "micro_home", label: "Micro Home", pack: "base", detail: "32 tiles or fewer." },
  { id: "tiny_home", label: "Tiny Home", pack: "base", detail: "64 tiles or fewer." },
  { id: "small_home", label: "Small Home", pack: "base" },
  { id: "regular_home", label: "Regular Home", pack: "base" },
  { id: "large_home", label: "Large Home", pack: "base" },
  { id: "mansion", label: "Mansion", pack: "base" },
];
