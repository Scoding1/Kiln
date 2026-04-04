export type ProjectStage =
  | "Planning"
  | "Thrown"
  | "Trimming"
  | "Drying"
  | "Bisque firing"
  | "Glazing"
  | "Glaze firing"
  | "Complete";

export interface Project {
  id: string;
  name: string;
  emoji: string;
  stage: ProjectStage;
  clayBody: string;
  glaze: string;
  notes: string;
  photoUris: string[];
  updatedAt: string;
}

export const ALL_STAGES: ProjectStage[] = [
  "Planning",
  "Thrown",
  "Trimming",
  "Drying",
  "Bisque firing",
  "Glazing",
  "Glaze firing",
  "Complete",
];

export function stageIndex(stage: ProjectStage): number {
  return ALL_STAGES.indexOf(stage);
}

export function nextStage(stage: ProjectStage): ProjectStage | null {
  const i = stageIndex(stage);
  return i < ALL_STAGES.length - 1 ? ALL_STAGES[i + 1] : null;
}

// ─── Glaze ────────────────────────────────────────────────────────────────────

export type GlazeType = "Glossy" | "Matte" | "Satin";
export type GlazeCone = "Cone 06" | "Cone 6" | "Cone 10" | "Cone 10-12";
export type GlazeAtmosphere = "Oxidation" | "Reduction" | "Either";

export interface GlazeIngredient {
  name: string;
  percentage: number;
}

export type FoodSafe = "Food safe" | "Not food safe" | "Check with supplier";

export interface Glaze {
  id: string;
  name: string;
  type: GlazeType;
  cone: GlazeCone;
  atmosphere: GlazeAtmosphere;
  surface: string;
  color_hex: string;
  description: string;
  ingredients: GlazeIngredient[];
  food_safe: FoodSafe;
}

// ─── Technique ────────────────────────────────────────────────────────────────

export type TechniqueCategory =
  | "Throwing"
  | "Hand-building"
  | "Glazing"
  | "Finishing";

export type TechniqueLevel = "Beginner" | "Intermediate" | "Advanced";

export interface StepMethod {
  id: string;
  label: string;
  instruction: string;
}

export interface TechniqueStep {
  id: string;
  title: string;
  /** Shown before a method is chosen, or as the instruction when no methods exist. */
  detail: string;
  timeEstimate: string;
  /** When present, show selectable method pills; selected method replaces detail. */
  methods?: StepMethod[];
  /** Pro tip shown as a callout below the instruction. */
  pro_tip?: string;
  /** Per-method pro tips: method id → tip text (used when hasMethods). */
  methodProTips?: Record<string, string>;
  /** Per-method extra tools to display: method id → tool names. */
  methodTools?: Record<string, string[]>;
}

export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  level: TechniqueLevel;
  duration: string;
  description: string;
  thumbnailColor: string;
  steps: TechniqueStep[];
  /** Tools required for this technique (displayed in detail sheet). */
  tools?: string[];
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type MaterialCategory = "Clay" | "Glaze" | "Other";
export type MaterialUnit = "kg" | "g" | "L" | "ml";

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: MaterialUnit;
  maxQuantity: number;
  alertThreshold: number;
}

export type StockStatus = "low" | "running-low" | "good";

export function getStockStatus(m: Material): StockStatus {
  if (m.quantity <= m.alertThreshold) return "low";
  if (m.quantity <= m.alertThreshold * 2) return "running-low";
  return "good";
}

export const UNIT_STEP: Record<MaterialUnit, number> = {
  kg: 1,
  L: 1,
  g: 100,
  ml: 100,
};

export interface Tool {
  id: string;
  name: string;
  primaryUse: string;
  description: string;
  iconName: string;
  iconColor: string;
  owned: boolean;
  wishList: boolean;
}
