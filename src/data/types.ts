import type { PackId } from "./packs";

export interface DataItem {
  id: string;
  label: string;
  pack: PackId;
  detail?: string;
}
