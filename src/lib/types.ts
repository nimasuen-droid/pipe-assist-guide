export type Insulation = "none" | "hot" | "cold" | "cryogenic" | "personnel";
export type Layout =
  | "aboveground"
  | "pipe-rack"
  | "equipment-piping"
  | "underground-transition"
  | "skid"
  | "structure-mounted";
export type Orientation = "horizontal" | "vertical" | "sloped" | "change-direction";
export type ProjectPhase = "new-build" | "brownfield" | "retrofit";
export type Verdict =
  | "ACCEPTABLE"
  | "REVIEW REQUIRED"
  | "STRESS CHECK REQUIRED"
  | "NOT RECOMMENDED";

export interface LineInput {
  projectName: string;
  area: string;
  lineNumber: string;
  pipeSize: string; // NPS in inches
  schedule: string;
  material: string; // CS / SS316 / LTCS etc.
  service: string;
  designPressure: string; // barg
  designTemp: string; // °C
  operatingTemp: string; // °C
  insulation: Insulation;
  insulationThickness?: string; // mm
  layout: Layout;
  phase: ProjectPhase;
}

export interface WizardInput {
  orientation: Orientation;
  nearFeature:
    | "none"
    | "equipment-nozzle"
    | "valve"
    | "flange"
    | "anchor-point"
    | "bend"
    | "branch"
    | "expansion-loop";
  thermalMovement: boolean;
  upliftPossible: boolean;
  vibration: boolean;
  axialMovement: "allow" | "restrain";
  lateralMovement: "allow" | "restrain";
  verticalAdjustment: boolean;
  permanent: boolean;
  weldingAllowed: boolean;
  specialService:
    | "none"
    | "cryogenic"
    | "hot"
    | "sour"
    | "corrosive"
    | "firewater";
}

export interface SupportRecommendation {
  primary: string;
  alternates: string[];
  function: string;
  why: string[];
  movementAllowed: string[];
  movementRestrained: string[];
  designChecks: string[];
  followUpChecks: string[];
  references: { code: string; note: string }[];
  riskFlags: string[];
  learningMoment: string;
  verdict: Verdict;
}

export interface SupportRegisterEntry {
  id: string;
  tag: string;
  lineNumber: string;
  location: string;
  supportType: string;
  function: string;
  loadClass: string;
  movementAllowed: string;
  movementRestrained: string;
  insulation: string;
  stressReview: boolean;
  structuralReview: boolean;
  remarks: string;
  line: LineInput;
  wizard: WizardInput;
  recommendation: SupportRecommendation;
}

export interface MTOItem {
  supportTag: string;
  lineNumber: string;
  supportType: string;
  component: string;
  material: string;
  size: string;
  qty: number;
  unit: string;
  category: "Fabricated" | "Bought-out";
  remarks: string;
}