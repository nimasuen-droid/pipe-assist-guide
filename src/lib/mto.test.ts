import { describe, expect, it } from "vitest";
import { generateMTO } from "./mto";
import type { SupportRegisterEntry } from "./types";

const entry: SupportRegisterEntry = {
  id: "support-1",
  tag: "RS-001",
  lineNumber: "8-P-2104-A1A-H",
  location: "Unit 200",
  supportType: "Pipe Shoe (Welded T-Shoe)",
  function: "Rest support",
  loadClass: "TBD",
  movementAllowed: "Axial sliding",
  movementRestrained: "Vertical",
  insulation: "hot",
  stressReview: false,
  structuralReview: false,
  remarks: "",
  line: {
    projectName: "PX",
    area: "Unit 200",
    lineNumber: "8-P-2104-A1A-H",
    pipeSize: "8",
    schedule: "40",
    material: "CS A106 Gr.B",
    service: "HP Steam",
    designPressure: "46",
    designTemp: "385",
    operatingTemp: "360",
    insulation: "hot",
    insulationThickness: "100",
    layout: "pipe-rack",
    phase: "brownfield",
  },
  wizard: {
    orientation: "horizontal",
    nearFeature: "none",
    thermalMovement: true,
    upliftPossible: false,
    vibration: false,
    axialMovement: "allow",
    lateralMovement: "allow",
    verticalAdjustment: false,
    permanent: true,
    weldingAllowed: true,
    specialService: "hot",
  },
  recommendation: {
    primary: "Pipe Shoe (Welded T-Shoe)",
    alternates: [],
    function: "Rest support",
    why: [],
    movementAllowed: ["Axial sliding"],
    movementRestrained: ["Vertical"],
    designChecks: [],
    followUpChecks: [],
    references: [],
    riskFlags: [],
    learningMoment: "",
    verdict: "ACCEPTABLE",
  },
};

describe("generateMTO", () => {
  it("generates fabricated shoe components for pipe shoes", () => {
    const items = generateMTO(entry);

    expect(items.map((item) => item.component)).toContain("Shoe top plate");
    expect(items.map((item) => item.component)).toContain("Wear pad");
    expect(items.every((item) => item.supportTag === "RS-001")).toBe(true);
  });

  it("falls back to a positive DN when pipe size is invalid", () => {
    const items = generateMTO({
      ...entry,
      line: { ...entry.line, pipeSize: "not-a-number" },
    });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.size).toContain("150");
  });
});
