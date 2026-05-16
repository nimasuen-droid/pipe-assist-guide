import { describe, expect, it } from "vitest";
import { parseLineList, serializeLineList } from "./lineList";

describe("line list import", () => {
  it("parses CSV line lists with headers", () => {
    const rows = parseLineList(
      [
        "projectName,area,lineNumber,sectionName,pipeSize,schedule,material,service,designPressure,designTemp,operatingTemp,insulation,insulationThickness,layout,phase,notes",
        'PX,Unit 10,"6""-P-1001-A1A",Rack bay 01,6,40,CS A106 Gr.B,Steam,16,220,190,hot,50,pipe-rack,brownfield,Main rack line',
      ].join("\n"),
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      projectName: "PX",
      lineNumber: '6"-P-1001-A1A',
      sectionName: "Rack bay 01",
      pipeSize: "6",
      insulation: "hot",
      layout: "pipe-rack",
      phase: "brownfield",
    });
  });

  it("round trips exported template style data", () => {
    const line = parseLineList(
      "projectName\tarea\tlineNumber\tsectionName\tpipeSize\nDemo\tArea 1\t4-P-2001\tSkid tie-in\t4",
    )[0];

    const csv = serializeLineList([line]);
    expect(parseLineList(csv)[0]).toMatchObject({
      projectName: "Demo",
      area: "Area 1",
      lineNumber: "4-P-2001",
      sectionName: "Skid tie-in",
      pipeSize: "4",
    });
  });
});
