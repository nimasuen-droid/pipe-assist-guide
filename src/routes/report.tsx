import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  Info,
  ListPlus,
  Wrench,
} from "lucide-react";
import { exportReportPDF } from "@/lib/export";
import { generateMTO } from "@/lib/mto";
import { useMemo } from "react";
import type { SupportRegisterEntry } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Recommendation Report — Pipe Support Smart Assist" },
      { name: "description", content: "Engineering report with recommended support, design checks, references, risks and MTO." },
    ],
  }),
  component: ReportPage,
});

function VerdictBadge({ v }: { v: string }) {
  const map: Record<string, string> = {
    ACCEPTABLE: "bg-success text-success-foreground",
    "REVIEW REQUIRED": "bg-warning text-warning-foreground",
    "STRESS CHECK REQUIRED": "bg-accent text-accent-foreground",
    "NOT RECOMMENDED": "bg-destructive text-destructive-foreground",
  };
  return <Badge className={`${map[v] ?? "bg-secondary"} text-xs`}>{v}</Badge>;
}

function ReportPage() {
  const { line, wizard, recommendation, addToRegister } = useApp();

  const entry: SupportRegisterEntry | null = useMemo(() => {
    if (!recommendation) return null;
    return {
      id: crypto.randomUUID(),
      tag: `SUP-${(line.lineNumber || "L1").replace(/[^A-Z0-9]/gi, "").slice(0, 8) || "L1"}-${Math.floor(Math.random() * 900 + 100)}`,
      lineNumber: line.lineNumber || "—",
      location: `${line.area || "—"} / ${wizard.nearFeature}`,
      supportType: recommendation.primary,
      function: recommendation.function,
      loadClass: "TBD (per stress)",
      movementAllowed: recommendation.movementAllowed.join(", "),
      movementRestrained: recommendation.movementRestrained.join(", "),
      insulation: line.insulation,
      stressReview: recommendation.verdict.includes("STRESS"),
      structuralReview: recommendation.primary.toLowerCase().includes("anchor"),
      remarks: recommendation.riskFlags.join(" | "),
      line,
      wizard,
      recommendation,
    };
  }, [recommendation, line, wizard]);

  if (!recommendation || !entry) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">No recommendation yet. Run the wizard first.</p>
        <Button asChild><Link to="/wizard">Open Wizard</Link></Button>
      </div>
    );
  }

  const r = recommendation;
  const mto = generateMTO(entry);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{r.primary}</h1>
              <VerdictBadge v={r.verdict} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{r.function}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Tag <b className="text-foreground">{entry.tag}</b></span>
              <span>Line <b className="text-foreground">{entry.lineNumber}</b></span>
              <span>Service <b className="text-foreground">{line.service || "—"}</b></span>
              <span>T_des <b className="text-foreground">{line.designTemp}°C</b></span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportReportPDF(entry)}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={() => { addToRegister(entry); toast.success("Added to support register"); }}>
              <ListPlus className="mr-2 h-4 w-4" /> Add to Register
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4"/>Why this support</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <ul className="list-disc pl-5 space-y-1">{r.why.map((x, i) => <li key={i}>{x}</li>)}</ul>
              {r.alternates.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs uppercase text-muted-foreground mb-1">Alternates</div>
                  <div className="flex flex-wrap gap-1">{r.alternates.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Movement</CardTitle></CardHeader>
            <CardContent className="text-sm grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Allowed</div>
                <ul className="space-y-1">{r.movementAllowed.map((m, i) => <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success"/>{m}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Restrained</div>
                <ul className="space-y-1">{r.movementRestrained.map((m, i) => <li key={i} className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-warning"/>{m}</li>)}</ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Key design checks</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm list-disc pl-5 space-y-1">{r.designChecks.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Required follow-up</CardTitle></CardHeader>
            <CardContent>
              {r.followUpChecks.length === 0 ? (
                <p className="text-sm text-muted-foreground">None beyond standard QA.</p>
              ) : (
                <ul className="text-sm list-disc pl-5 space-y-1">{r.followUpChecks.map((c, i) => <li key={i}>{c}</li>)}</ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-warning/40 bg-warning/5">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning"/>Risk flags</CardTitle></CardHeader>
            <CardContent>
              {r.riskFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No critical flags raised.</p>
              ) : (
                <ul className="text-sm list-disc pl-5 space-y-1">{r.riskFlags.map((c, i) => <li key={i}>{c}</li>)}</ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4"/>Code & reference basis</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {r.references.map((ref) => (
                <Tooltip key={ref.code}>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help gap-1">
                      {ref.code} <Info className="h-3 w-3 opacity-70" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{ref.note}</TooltipContent>
                </Tooltip>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-accent/5 border-accent/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent"/>Learning moment</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{r.learningMoment}</p></CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm">Support MTO (preliminary)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 pr-3">Component</th>
                    <th className="text-left py-2 pr-3">Material</th>
                    <th className="text-left py-2 pr-3">Size</th>
                    <th className="text-left py-2 pr-3">Qty</th>
                    <th className="text-left py-2 pr-3">Unit</th>
                    <th className="text-left py-2 pr-3">Category</th>
                    <th className="text-left py-2 pr-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {mto.map((m, i) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="py-2 pr-3">{m.component}</td>
                      <td className="py-2 pr-3">{m.material}</td>
                      <td className="py-2 pr-3">{m.size}</td>
                      <td className="py-2 pr-3">{m.qty}</td>
                      <td className="py-2 pr-3">{m.unit}</td>
                      <td className="py-2 pr-3"><Badge variant={m.category === "Fabricated" ? "secondary" : "outline"}>{m.category}</Badge></td>
                      <td className="py-2 pr-3 text-muted-foreground">{m.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-warning mt-3 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5"/>MTO quantities are preliminary and must be verified during detailed design and stress analysis.</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground italic border-t border-border pt-4">
          This is a decision support tool for preliminary support selection. Final support design shall be verified against project specifications, stress analysis, structural capacity, site conditions, and applicable codes.
        </p>
      </div>
    </TooltipProvider>
  );
}