import { describe, expect, it } from "vitest";
import { recommendSupport } from "./recommend";
import type { LineInput, WizardInput } from "./types";

const baseLine: LineInput = {
  projectName: "PX Revamp",
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
};

const baseWizard: WizardInput = {
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
};

describe("recommendSupport", () => {
  it("recommends a shoe for a hot insulated horizontal line", () => {
    const rec = recommendSupport(baseLine, baseWizard);

    expect(rec.primary).toContain("Pipe Shoe");
    expect(rec.verdict).toBe("ACCEPTABLE");
    expect(rec.riskFlags).toContain("High temperature line: thermal expansion review required.");
  });

  it("requires stress review near equipment nozzles", () => {
    const rec = recommendSupport(baseLine, { ...baseWizard, nearFeature: "equipment-nozzle" });

    expect(rec.primary).toContain("Equipment Nozzle");
    expect(rec.verdict).toBe("STRESS CHECK REQUIRED");
    expect(rec.followUpChecks.join(" ")).toContain("nozzle allowable");
  });

  it("validates manual anchor markup as a stress-check item", () => {
    const rec = recommendSupport(baseLine, {
      ...baseWizard,
      overrideMode: true,
      manualFunction: "anchor",
    });

    expect(rec.primary).toContain("Anchor");
    expect(rec.verdict).toBe("STRESS CHECK REQUIRED");
    expect(rec.movementRestrained).toContain("Axial");
  });
});
