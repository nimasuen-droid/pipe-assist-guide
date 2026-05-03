import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MTOItem, SupportRegisterEntry } from "./types";
import { generateMTO } from "./mto";

export function exportReportPDF(entry: SupportRegisterEntry) {
  const doc = new jsPDF();
  const r = entry.recommendation;
  doc.setFontSize(16);
  doc.text("Pipe Support Smart Assist — Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Tag: ${entry.tag}    Line: ${entry.lineNumber}    Verdict: ${r.verdict}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Input", "Value"]],
    body: Object.entries({
      Project: entry.line.projectName,
      Area: entry.line.area,
      "Pipe Size": entry.line.pipeSize,
      Material: entry.line.material,
      Service: entry.line.service,
      "Design T (°C)": entry.line.designTemp,
      "Operating T (°C)": entry.line.operatingTemp,
      Insulation: entry.line.insulation,
      Layout: entry.line.layout,
    }),
  });

  autoTable(doc, {
    head: [["Recommendation", ""]],
    body: [
      ["Primary", r.primary],
      ["Function", r.function],
      ["Why", r.why.join("\n")],
      ["Movement allowed", r.movementAllowed.join(", ")],
      ["Movement restrained", r.movementRestrained.join(", ")],
      ["Design checks", r.designChecks.join("\n")],
      ["Follow-up", r.followUpChecks.join("\n") || "—"],
      ["References", r.references.map((x) => `${x.code} — ${x.note}`).join("\n")],
      ["Risk flags", r.riskFlags.join("\n") || "None"],
      ["Learning moment", r.learningMoment],
    ],
  });

  const mto = generateMTO(entry);
  autoTable(doc, {
    head: [["Component", "Material", "Size", "Qty", "Unit", "Category"]],
    body: mto.map((m) => [m.component, m.material, m.size, m.qty, m.unit, m.category]),
  });

  const final = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 250;
  doc.setFontSize(8);
  doc.text(
    "Disclaimer: Decision support tool for preliminary support selection. Final design shall be verified against project specifications, stress analysis, structural capacity, site conditions, and applicable codes.",
    14,
    final + 10,
    { maxWidth: 180 },
  );
  doc.save(`${entry.tag}-support-report.pdf`);
}

function toCSV(rows: (string | number | boolean)[][]) {
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
function download(name: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRegisterCSV(entries: SupportRegisterEntry[]) {
  const rows: (string | number | boolean)[][] = [
    [
      "Tag",
      "Line",
      "Location",
      "Support Type",
      "Function",
      "Load Class",
      "Movement Allowed",
      "Movement Restrained",
      "Insulation",
      "Stress Review",
      "Structural Review",
      "Remarks",
    ],
  ];
  entries.forEach((e) =>
    rows.push([
      e.tag,
      e.lineNumber,
      e.location,
      e.supportType,
      e.function,
      e.loadClass,
      e.movementAllowed,
      e.movementRestrained,
      e.insulation,
      e.stressReview,
      e.structuralReview,
      e.remarks,
    ]),
  );
  download("support-register.csv", toCSV(rows));
}

export function exportMTOCSV(entries: SupportRegisterEntry[]) {
  const rows: (string | number | boolean)[][] = [
    ["Tag", "Line", "Support Type", "Component", "Material", "Size", "Qty", "Unit", "Category", "Remarks"],
  ];
  entries.forEach((e) => {
    const items: MTOItem[] = generateMTO(e);
    items.forEach((m) =>
      rows.push([
        m.supportTag,
        m.lineNumber,
        m.supportType,
        m.component,
        m.material,
        m.size,
        m.qty,
        m.unit,
        m.category,
        m.remarks,
      ]),
    );
  });
  download("support-mto.csv", toCSV(rows));
}