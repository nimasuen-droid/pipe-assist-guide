import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { generateMTO } from "@/lib/mto";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download } from "lucide-react";
import { exportMTOCSV } from "@/lib/export";

export const Route = createFileRoute("/mto")({
  head: () => ({
    meta: [
      { title: "Support MTO — Pipe Support Smart Assist" },
      { name: "description", content: "Consolidated Material Take-Off across all selected supports." },
    ],
  }),
  component: MTOPage,
});

function MTOPage() {
  const { register } = useApp();
  const all = register.flatMap(generateMTO);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support MTO</h1>
          <p className="text-sm text-muted-foreground">Consolidated material take-off ({all.length} components).</p>
        </div>
        <Button onClick={() => exportMTOCSV(register)} disabled={!register.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <p className="text-sm bg-accent/5 border border-accent/30 rounded-md p-3">
        Pipe supports are fabricated assemblies. <b>Selection</b> defines function; <b>MTO</b> defines what gets built and procured.
      </p>
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
      <p className="text-xs text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5"/>MTO quantities are preliminary and must be verified during detailed design and stress analysis.</p>
    </div>
  );
}