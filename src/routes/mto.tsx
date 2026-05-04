import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useApp } from "@/lib/store";
import { generateMTO } from "@/lib/mto";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Eye, Layers, Printer, FileSpreadsheet } from "lucide-react";
import { exportMTOCSV } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { MTOItem } from "@/lib/types";

export const Route = createFileRoute("/mto")({
  head: () => ({
    meta: [
      { title: "Support MTO — Pipe Support Smart Assist" },
      { name: "description", content: "Consolidated Material Take-Off across all selected supports." },
    ],
  }),
  component: MTOPage,
});

interface BomRow {
  component: string;
  material: string;
  size: string;
  unit: string;
  category: MTOItem["category"];
  qty: number;
  occurrences: number;
}

function summarizeBOM(items: MTOItem[]): BomRow[] {
  const map = new Map<string, BomRow>();
  for (const it of items) {
    const key = [it.component, it.material, it.size, it.unit, it.category].join("||");
    const existing = map.get(key);
    if (existing) {
      existing.qty += it.qty;
      existing.occurrences += 1;
    } else {
      map.set(key, {
        component: it.component,
        material: it.material,
        size: it.size,
        unit: it.unit,
        category: it.category,
        qty: it.qty,
        occurrences: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.category.localeCompare(b.category) || a.component.localeCompare(b.component),
  );
}

function MTOPage() {
  const { register, structures } = useApp();
  const supportItems = register.flatMap(generateMTO);
  // Structure MTO: only structures actually referenced by at least one support
  const usedStructureIds = new Set(register.map((r) => r.structureId).filter(Boolean) as string[]);
  const usedStructures = structures.filter((s) => usedStructureIds.has(s.id));
  const structureMtoRows = usedStructures.flatMap((s) => {
    const attached = register.filter((r) => r.structureId === s.id).length;
    return s.mto.map((m) => ({
      structTag: s.tag,
      structName: s.name,
      attached,
      shared: attached > 1,
      ...m,
    }));
  });
  // Lift structure MTO into MTOItem shape so it flows into BOM, preview, print and exports.
  const structureItems: MTOItem[] = usedStructures.flatMap((s) => {
    const attached = register.filter((r) => r.structureId === s.id).length;
    return s.mto.map((m) => ({
      supportTag: s.tag,
      lineNumber: "—",
      supportType: `Structure · ${s.name}`,
      component: m.component,
      material: "—",
      size: m.size,
      qty: m.qty,
      unit: "ea",
      category: "Fabricated" as const,
      remarks: [attached > 1 ? `Shared by ${attached} supports` : `Attached: ${attached}`, m.remarks]
        .filter(Boolean)
        .join(" — "),
    }));
  });
  const all = [...structureItems, ...supportItems];
  const bom = summarizeBOM(all);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bomOpen, setBomOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const exportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const detailed = all.map((m) => ({
      Tag: m.supportTag,
      Line: m.lineNumber,
      "Support Type": m.supportType,
      Component: m.component,
      Material: m.material,
      Size: m.size,
      Qty: m.qty,
      Unit: m.unit,
      Category: m.category,
      Remarks: m.remarks,
    }));
    const summary = bom.map((r) => ({
      Component: r.component,
      Material: r.material,
      Size: r.size,
      "Total Qty": r.qty,
      Unit: r.unit,
      Category: r.category,
      "Used in (supports)": r.occurrences,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailed), "Detailed MTO");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary BOM");
    if (structureMtoRows.length) {
      const struct = structureMtoRows.map((r) => ({
        "Structure Tag": r.structTag,
        Structure: r.structName,
        "Attached Supports": r.attached,
        Shared: r.shared ? "Yes" : "No",
        Component: r.component,
        Qty: r.qty,
        Size: r.size,
        Remarks: r.remarks ?? "",
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(struct), "Structure MTO");
    }
    XLSX.writeFile(wb, "support-mto.xlsx");
  };

  const handlePrint = () => {
    const html = printRef.current?.innerHTML;
    if (!html) return;
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Support MTO</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:24px;color:#111}
        h1{font-size:18px;margin:0 0 4px} h2{font-size:14px;margin:18px 0 6px}
        table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}
        th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}
        th{background:#f3f4f6}
        .muted{color:#666;font-size:11px}
        @media print{button{display:none}}
      </style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support MTO</h1>
          <p className="text-sm text-muted-foreground">
            Consolidated material take-off ({all.length} components, {bom.length} unique BOM lines).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={!all.length}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" onClick={() => setBomOpen(true)} disabled={!all.length}>
            <Layers className="mr-2 h-4 w-4" /> Summary BOM
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={!all.length}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={exportXLSX} disabled={!all.length}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={() => exportMTOCSV(register)} disabled={!register.length}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      <p className="text-sm bg-accent/5 border border-accent/30 rounded-md p-3">
        Pipe supports are fabricated assemblies. <b>Selection</b> defines function; <b>MTO</b> defines what gets built and procured.
      </p>

      {/* Structure MTO (shared, deduped) */}
      {usedStructures.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">A · Structure MTO (shared)</h2>
              <span className="text-xs text-muted-foreground">{usedStructures.length} structure(s) — quantities count once per structure</span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  {["Structure","Kind","Attached","Shared","Component","Qty","Size","Remarks"].map((h) => (
                    <th key={h} className="text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {structureMtoRows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 px-3 font-medium">{r.structTag}</td>
                    <td className="py-2 px-3">{r.structName}</td>
                    <td className="py-2 px-3">{r.attached}</td>
                    <td className="py-2 px-3">{r.shared ? <Badge className="bg-warning text-warning-foreground">Shared</Badge> : "—"}</td>
                    <td className="py-2 px-3">{r.component}</td>
                    <td className="py-2 px-3">{r.qty}</td>
                    <td className="py-2 px-3 font-mono text-xs">{r.size}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.remarks ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      {structureMtoRows.some((r) => r.shared) && (
        <p className="text-xs text-warning flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5"/>
          Multiple supports on a single structure require combined load verification by structural design.
        </p>
      )}

      {all.length > 0 && (
        <h2 className="text-sm font-semibold pt-2">B · Pipe support MTO (per support)</h2>
      )}
      {all.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No items. Add supports to the register to populate the MTO.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  {["Tag","Line","Type","Component","Material","Size","Qty","Unit","Category","Remarks"].map((h) => (
                    <th key={h} className="text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((m, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 px-3 font-medium">{m.supportTag}</td>
                    <td className="py-2 px-3">{m.lineNumber}</td>
                    <td className="py-2 px-3">{m.supportType}</td>
                    <td className="py-2 px-3">{m.component}</td>
                    <td className="py-2 px-3">{m.material}</td>
                    <td className="py-2 px-3">{m.size}</td>
                    <td className="py-2 px-3">{m.qty}</td>
                    <td className="py-2 px-3">{m.unit}</td>
                    <td className="py-2 px-3"><Badge variant={m.category === "Fabricated" ? "secondary" : "outline"}>{m.category}</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">{m.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <p className="text-xs text-warning flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5"/>MTO quantities are preliminary and must be verified during detailed design and stress analysis.
      </p>

      {/* Hidden printable area */}
      <div className="hidden">
        <div ref={printRef}>
          <h1>Support MTO — Pipe Support Smart Assist</h1>
          <p className="muted">Generated {new Date().toLocaleString()} — {all.length} components across {register.length} supports.</p>
          <h2>Detailed MTO</h2>
          <table>
            <thead><tr>
              {["Tag","Line","Type","Component","Material","Size","Qty","Unit","Category","Remarks"].map((h) => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {all.map((m, i) => (
                <tr key={i}>
                  <td>{m.supportTag}</td><td>{m.lineNumber}</td><td>{m.supportType}</td>
                  <td>{m.component}</td><td>{m.material}</td><td>{m.size}</td>
                  <td>{m.qty}</td><td>{m.unit}</td><td>{m.category}</td><td>{m.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Summary BOM</h2>
          <table>
            <thead><tr>
              {["Component","Material","Size","Total Qty","Unit","Category","Used in"].map((h) => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {bom.map((r, i) => (
                <tr key={i}>
                  <td>{r.component}</td><td>{r.material}</td><td>{r.size}</td>
                  <td>{r.qty}</td><td>{r.unit}</td><td>{r.category}</td><td>{r.occurrences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>MTO Preview</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground mb-2">
            {all.length} components across {register.length} supports.
          </div>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-muted/50">
              <tr>
                {["Tag","Line","Type","Component","Material","Size","Qty","Unit","Category"].map((h) => (
                  <th key={h} className="border border-border px-2 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((m, i) => (
                <tr key={i}>
                  <td className="border border-border px-2 py-1 font-medium">{m.supportTag}</td>
                  <td className="border border-border px-2 py-1">{m.lineNumber}</td>
                  <td className="border border-border px-2 py-1">{m.supportType}</td>
                  <td className="border border-border px-2 py-1">{m.component}</td>
                  <td className="border border-border px-2 py-1">{m.material}</td>
                  <td className="border border-border px-2 py-1">{m.size}</td>
                  <td className="border border-border px-2 py-1">{m.qty}</td>
                  <td className="border border-border px-2 py-1">{m.unit}</td>
                  <td className="border border-border px-2 py-1">{m.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Print</Button>
            <Button onClick={exportXLSX}><FileSpreadsheet className="mr-2 h-4 w-4"/>Export Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bomOpen} onOpenChange={setBomOpen}>
        <DialogContent className="max-w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Summary BOM</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground mb-2">
            {bom.length} unique items aggregated by component / material / size.
          </div>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-muted/50">
              <tr>
                {["Component","Material","Size","Total Qty","Unit","Category","Used in"].map((h) => (
                  <th key={h} className="border border-border px-2 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bom.map((r, i) => (
                <tr key={i}>
                  <td className="border border-border px-2 py-1">{r.component}</td>
                  <td className="border border-border px-2 py-1">{r.material}</td>
                  <td className="border border-border px-2 py-1">{r.size}</td>
                  <td className="border border-border px-2 py-1 font-semibold">{r.qty}</td>
                  <td className="border border-border px-2 py-1">{r.unit}</td>
                  <td className="border border-border px-2 py-1">
                    <Badge variant={r.category === "Fabricated" ? "secondary" : "outline"}>{r.category}</Badge>
                  </td>
                  <td className="border border-border px-2 py-1">{r.occurrences}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Print</Button>
            <Button onClick={exportXLSX}><FileSpreadsheet className="mr-2 h-4 w-4"/>Export Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
