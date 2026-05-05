import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Settings2,
  Plus,
  Minus,
  RotateCcw,
  Hash,
} from "lucide-react";
import { exportReportPDF } from "@/lib/export";
import { generateMTO } from "@/lib/mto";
import { useMemo, useState } from "react";
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
  const {
    line,
    wizard,
    recommendation,
    addToRegister,
    tagging,
    tagCounter,
    setTagging,
    resetTagCounter,
    nextTag,
    previewTag,
    structures,
    register,
  } = useApp();
  const [qty, setQty] = useState(1);
  const [structureId, setStructureId] = useState<string | "none">("none");

  const buildEntry = (tag: string): SupportRegisterEntry | null => {
    if (!recommendation) return null;
    return {
      id: crypto.randomUUID(),
      tag,
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
      structureId: structureId === "none" ? undefined : structureId,
    };
  };

  const entry: SupportRegisterEntry | null = useMemo(
    () => buildEntry(previewTag(tagCounter, recommendation?.primary)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recommendation, line, wizard, tagging, tagCounter, structureId],
  );

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
  const previewTags = Array.from({ length: Math.max(1, qty) }, (_, i) =>
    previewTag(tagCounter + i, recommendation?.primary),
  );
  const selectedStructure = structures.find((s) => s.id === structureId);
  const attachedCount = selectedStructure
    ? register.filter((r) => r.structureId === selectedStructure.id).length
    : 0;
  const willBeShared = selectedStructure ? attachedCount + qty > 1 : false;
  const overCapacity = selectedStructure ? attachedCount + qty > selectedStructure.maxSupports : false;

  const handleAdd = () => {
    if (!recommendation) return;
    const n = Math.max(1, qty);
    for (let i = 0; i < n; i++) {
      const tag = nextTag(recommendation?.primary);
      const e = buildEntry(tag);
      if (e) addToRegister(e);
    }
    toast.success(`Added ${n} support${n > 1 ? "s" : ""} to register`);
  };

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
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Tag Format
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-3">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" /> Tagging Procedure
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] uppercase text-muted-foreground">Prefix</Label>
                    <Input value={tagging.prefix} onChange={(e) => setTagging({ prefix: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase text-muted-foreground">Separator</Label>
                    <Input value={tagging.separator} maxLength={3} onChange={(e) => setTagging({ separator: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase text-muted-foreground">Padding</Label>
                    <Input type="number" min={1} max={6} value={tagging.padding} onChange={(e) => setTagging({ padding: Math.max(1, Math.min(6, +e.target.value || 1)) })} />
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase text-muted-foreground">Start Index</Label>
                    <Input type="number" min={0} value={tagging.startIndex} onChange={(e) => setTagging({ startIndex: +e.target.value || 0 })} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                  <Label className="text-xs">Include line token</Label>
                  <Switch checked={tagging.includeLine} onCheckedChange={(v) => setTagging({ includeLine: v })} />
                </div>
                <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                  <div className="text-muted-foreground mb-0.5">Next tag preview</div>
                  <div className="font-mono text-sm text-primary">{previewTag(tagCounter, recommendation?.primary)}</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Counter at <b className="text-foreground">{tagCounter}</b></span>
                  <Button size="sm" variant="ghost" onClick={() => { resetTagCounter(); toast.success("Counter reset"); }}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Reset
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Input
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(999, +e.target.value || 1)))}
                className="h-8 w-14 text-center border-0 bg-transparent focus-visible:ring-0"
                aria-label="Quantity"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQty((q) => Math.min(999, q + 1))}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="secondary" onClick={() => exportReportPDF(entry)}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={handleAdd}>
              <ListPlus className="mr-2 h-4 w-4" /> Add {qty > 1 ? `${qty} ` : ""}to Register
            </Button>
          </div>
        </div>

        {qty > 1 && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
              <Hash className="h-3.5 w-3.5 text-primary" /> Tags that will be generated
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {previewTags.slice(0, 10).map((t) => (
                <Badge key={t} variant="outline" className="border-primary/40 text-primary">{t}</Badge>
              ))}
              {previewTags.length > 10 && (
                <span className="text-muted-foreground self-center">+{previewTags.length - 10} more</span>
              )}
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Assigned structure
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Label className="text-[11px] uppercase text-muted-foreground">Carry this support on</Label>
              <Select value={structureId} onValueChange={(v) => setStructureId(v as string)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No structure assigned —</SelectItem>
                  {structures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.tag} · {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedStructure ? (
                <>
                  Currently carrying <b className="text-foreground">{attachedCount}</b> / {selectedStructure.maxSupports} supports.
                  {willBeShared && (
                    <span className="ml-2"><Badge className="bg-warning text-warning-foreground">Will be shared</Badge></span>
                  )}
                </>
              ) : (
                <>No structure assigned. Create one in <i>Structures</i>.</>
              )}
            </div>
            {overCapacity && (
              <div className="md:col-span-2 text-xs text-warning flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5"/>
                Adding {qty} would exceed the structure's max ({selectedStructure?.maxSupports}). Combined load verification required.
              </div>
            )}
            {willBeShared && (
              <div className="md:col-span-2 text-xs text-muted-foreground border-t border-border pt-2">
                <AlertTriangle className="inline h-3.5 w-3.5 text-warning mr-1"/>
                Multiple supports on a single structure require <b>combined load verification</b> by structural design.
              </div>
            )}
          </CardContent>
        </Card>

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