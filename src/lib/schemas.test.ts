import { describe, expect, it } from "vitest";
import { projectImportSchema } from "./schemas";

describe("projectImportSchema", () => {
  it("accepts a minimal valid project import", () => {
    expect(() =>
      projectImportSchema.parse({
        line: {
          projectName: "PX",
          area: "Unit 200",
          lineNumber: "8-P-2104",
          pipeSize: "8",
          schedule: "40",
          material: "CS",
          service: "Steam",
          designPressure: "46",
          designTemp: "385",
          operatingTemp: "360",
          insulation: "hot",
          insulationThickness: "100",
          layout: "pipe-rack",
          phase: "brownfield",
        },
      }),
    ).not.toThrow();
  });

  it("rejects invalid enum values before state mutation", () => {
    expect(() =>
      projectImportSchema.parse({
        line: {
          insulation: "warm",
        },
      }),
    ).toThrow();
  });
});
