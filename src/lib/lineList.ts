import type { Insulation, Layout, LineInput, ProjectLine, ProjectPhase } from "./types";

export const LINE_LIST_HEADERS = [
  "projectName",
  "area",
  "lineNumber",
  "sectionName",
  "pipeSize",
  "schedule",
  "material",
  "service",
  "designPressure",
  "designTemp",
  "operatingTemp",
  "insulation",
  "insulationThickness",
  "layout",
  "phase",
  "notes",
] as const;

const insulationValues: Insulation[] = ["none", "hot", "cold", "cryogenic", "personnel"];
const layoutValues: Layout[] = [
  "aboveground",
  "pipe-rack",
  "equipment-piping",
  "underground-transition",
  "skid",
  "structure-mounted",
];
const phaseValues: ProjectPhase[] = ["new-build", "brownfield", "retrofit"];

export const lineListTemplateRows: ProjectLine[] = [
  {
    id: "template-steam",
    projectName: "PX Revamp Phase 2",
    area: "Unit 200",
    lineNumber: '8"-P-2104-A1A-H',
    sectionName: "Rack bay A",
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
    notes: "Hot rack line with expansion loop.",
  },
  {
    id: "template-condensate",
    projectName: "PX Revamp Phase 2",
    area: "Unit 200",
    lineNumber: '4"-C-2210-B1A-H',
    sectionName: "Rack bay B",
    pipeSize: "4",
    schedule: "40",
    material: "CS A106 Gr.B",
    service: "Condensate return",
    designPressure: "16",
    designTemp: "180",
    operatingTemp: "145",
    insulation: "hot",
    insulationThickness: "50",
    layout: "pipe-rack",
    phase: "brownfield",
    notes: "Small bore hot service.",
  },
];

export function lineToProjectLine(line: LineInput, id: string = crypto.randomUUID()): ProjectLine {
  return { ...line, id };
}

export function serializeLineList(lines: ProjectLine[]): string {
  return [
    LINE_LIST_HEADERS.join(","),
    ...lines.map((line) =>
      LINE_LIST_HEADERS.map((header) => csvEscape(String(line[header] ?? ""))).join(","),
    ),
  ].join("\n");
}

export function parseLineList(raw: string): ProjectLine[] {
  const rows = parseDelimitedRows(raw);
  if (rows.length === 0) return [];

  const first = rows[0].map(normalizeHeader);
  const hasHeader = first.includes("linenumber") || first.includes("line");
  const headers = hasHeader ? first : LINE_LIST_HEADERS.map(normalizeHeader);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .map((row) => rowToLine(headers, row))
    .filter((line): line is ProjectLine => Boolean(line));
}

function rowToLine(headers: string[], row: string[]): ProjectLine | null {
  const data = new Map<string, string>();
  headers.forEach((header, index) => data.set(header, row[index]?.trim() ?? ""));

  const lineNumber = get(data, "linenumber", "line", "tag");
  if (!lineNumber) return null;

  const projectName = get(data, "projectname", "project") || "Imported Line List";
  const insulation = coerce(data, "insulation", insulationValues, "none");
  const layout = coerce(data, "layout", layoutValues, "pipe-rack");
  const phase = coerce(data, "phase", phaseValues, "new-build");

  return {
    id: crypto.randomUUID(),
    projectName,
    area: get(data, "area", "unit") || "",
    lineNumber,
    sectionName: get(data, "sectionname", "section", "segment", "zone"),
    pipeSize: get(data, "pipesize", "nps", "size") || "6",
    schedule: get(data, "schedule", "sch") || "STD",
    material: get(data, "material", "pipeclass") || "CS A106 Gr.B",
    service: get(data, "service", "fluid") || "",
    designPressure: get(data, "designpressure", "pressure", "dp") || "10",
    designTemp: get(data, "designtemp", "designtemperature", "temperature", "dt") || "150",
    operatingTemp: get(data, "operatingtemp", "operatingtemperature", "ot") || "120",
    insulation,
    insulationThickness: get(data, "insulationthickness", "insulthk", "insulationmm") || "50",
    layout,
    phase,
    notes: get(data, "notes", "remarks"),
  };
}

function parseDelimitedRows(raw: string): string[][] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    const next = trimmed[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function get(data: Map<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = data.get(normalizeHeader(key));
    if (value) return value;
  }
  return "";
}

function coerce<T extends string>(
  data: Map<string, string>,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const raw = get(data, key).toLowerCase();
  return allowed.find((value) => value === raw) ?? fallback;
}
