import { describe, expect, it } from "vitest";
import { buildStructureMTO, computeStructureDims, nextStructureTag } from "./structures";
import type { Structure } from "./types";

describe("structure helpers", () => {
  it("computes goal-post dimensions from geometry", () => {
    const dims = computeStructureDims("goal-post", {
      pipeCL: 6500,
      topOfSteel: 500,
      groupWidth: 600,
      sideClearance: 150,
      columnToCL: 800,
    });

    expect(dims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Post height", value: "6000 mm" }),
        expect.objectContaining({ label: "Beam length", value: "900 mm" }),
      ]),
    );
  });

  it("adds stiffeners for heavy or dynamic structures", () => {
    const mto = buildStructureMTO("goal-post", "Medium", true);

    expect(mto.map((item) => item.component)).toContain("Gusset / Stiffener Plate");
  });

  it("increments tags by structure kind", () => {
    const existing = [
      { id: "1", kind: "goal-post", tag: "GP-001" },
      { id: "2", kind: "wall-bracket", tag: "WB-001" },
    ] as Structure[];

    expect(nextStructureTag(existing, "goal-post")).toBe("GP-002");
  });
});
