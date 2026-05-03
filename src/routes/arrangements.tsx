import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  Ruler,
  ListChecks,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  STRUCTURE_KINDS,
  buildStructureMTO,
  computeStructureDims,
  nextStructureTag,
  type DimsInput,
  type LoadClass,
} from "@/lib/structures";
import type { Structure, StructureKind } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/arrangements")({
  head: () => ({
    meta: [
      { title: "Structures — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "Define support structures (Goal Post, Inverted L, Pedestal, Existing Steel) that carry one or more pipe supports.",
      },
    ],
  }),
  component: ArrangementsPage,
});

function ArrangementsPage() {
  const { line, structures, register, addStructure, removeStructure } = useApp();
  const [kind, setKind] = useState<StructureKind>("goal-post");
  const [cls, setCls] = useState<LoadClass>("Medium");
  const [dynamic, setDynamic] = useState(false);
  const [area, setArea] = useState("");
  const [maxSupports, setMaxSupports] = useState<number | null>(null);
  const [dims, setDims] = useState<DimsInput>({
    pipeCL: 6500,
    topOfSteel: 0,
    groupWidth: 600,
    sideClearance: 150,
    columnToCL: 800,
  });

  const meta = STRUCTURE_KINDS.find((k) => k.id === kind)!;
  const computed = useMemo(() => computeStructureDims(kind, dims), [kind, dims]);
  const mto = useMemo(
    () => buildStructureMTO(kind, cls, dynamic || cls === "Heavy"),
    [kind, cls, dynamic],
  );
  const effectiveMax = maxSupports ?? meta.defaultMax;

  const handleAdd = () => {
    const tag = nextStructureTag(structures, kind);
    const s: Structure = {
      id: crypto.randomUUID(),
      tag,
      kind,
      name: meta.name,
      loadClass: cls,
      dynamic,
      area: area || line.area || undefined,
      dimensions: computed,
      mto,
      maxSupports: effectiveMax,
      notes: kind === "existing-steel" ? "Verify spare capacity of existing member before tie-in." : "",
    };
    addStructure(s);
    toast.success(`Structure ${tag} created`);
  };

  const num = (k: keyof DimsInput) => (
    <Input
      type="number"
      value={dims[k]}
      onChange={(e) => setDims((d) => ({ ...d, [k]: +e.target.value || 0 }))}
      className="h-8"
    />
  );

  const supportsByStructure = useMemo(() => {
    const m = new Map<string, number>();
    register.forEach((r) => {
      if (r.structureId) m.set(r.structureId, (m.get(r.structureId) ?? 0) + 1);
    });
    return m;
  }, [register]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Structures</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          A <em>structure</em> (Goal Post, Inverted L, Pedestal, Pipe Rack Beam, Existing Steel) <em>carries</em> one or more pipe supports.
          Pipe supports (function + hardware) are then created in the Recommendation tab and assigned to a structure.
        </p>
      </div>

      {/* Builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> 1 · New structure
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Kind</Label>
            <Select value={kind} onValueChange={(v) => { setKind(v as StructureKind); setMaxSupports(null); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STRUCTURE_KINDS.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Load class</Label>
            <Select value={cls} onValueChange={(v) => setCls(v as LoadClass)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Area</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder={line.area || "Plant area"} className="h-9" />
          </div>
          <div className="md:col-span-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-2 border-primary/40 text-primary">{meta.prefix}</Badge>
            {meta.description}
          </div>

          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Max supports on this structure</Label>
            <Input
              type="number"
              min={1}
              value={effectiveMax}
              onChange={(e) => setMaxSupports(Math.max(1, +e.target.value || 1))}
              className="h-9"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Default for {meta.name}: {meta.defaultMax}. Override allowed.
            </p>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button
              type="button"
              size="sm"
              variant={dynamic ? "default" : "outline"}
              onClick={() => setDynamic((v) => !v)}
            >
              Dynamic / Shock service: {dynamic ? "Yes" : "No"}
            </Button>
            <Button onClick={handleAdd} className="ml-auto">
              <Plus className="mr-1.5 h-4 w-4" /> Add structure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Geometry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" /> 2 · Geometry inputs (mm)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 text-xs">
          <div><Label className="text-[11px]">Pipe CL elevation</Label>{num("pipeCL")}</div>
          <div><Label className="text-[11px]">Foundation / top of steel</Label>{num("topOfSteel")}</div>
          <div><Label className="text-[11px]">Pipe group width</Label>{num("groupWidth")}</div>
          <div><Label className="text-[11px]">Side clearance</Label>{num("sideClearance")}</div>
          <div><Label className="text-[11px]">Column/wall → pipe CL</Label>{num("columnToCL")}</div>
        </CardContent>
      </Card>

      {/* Preview dims + MTO */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Preliminary dimensions</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {computed.length === 0 && <p className="text-xs text-muted-foreground">No dimensions for this kind.</p>}
            {computed.map((c) => (
              <div key={c.label} className="rounded-md border border-border bg-muted/30 p-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase text-muted-foreground">{c.label}</span>
                  <span className="font-mono text-primary">{c.value}</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic mt-0.5">{c.formula}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary"/>Structure MTO (shared)</CardTitle></CardHeader>
          <CardContent>
            {mto.length === 0 ? (
              <p className="text-xs text-muted-foreground">No structural MTO — connection check only.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-muted-foreground"><tr><th className="text-left py-1">Component</th><th className="text-left py-1">Qty</th><th className="text-left py-1">Size</th></tr></thead>
                <tbody>
                  {mto.map((m, i) => (
                    <tr key={i} className="border-t border-border/60"><td className="py-1">{m.component}</td><td className="py-1">{m.qty}</td><td className="py-1 font-mono">{m.size}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="rounded-md border border-warning/50 bg-warning/10 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/90">
          <b>Multiple supports on a single structure require combined load verification by structural design.</b> Preliminary
          sizes shown here assume one governing support; reactions from all attached supports must be summed in the final check.
        </p>
      </div>

      {/* Structure register */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary"/>Structure register</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {structures.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No structures yet — add one above.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  {["Tag","Kind","Area","Class","Max","Attached","Shared","MTO lines",""].map((h) => (
                    <th key={h} className="text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => {
                  const attached = supportsByStructure.get(s.id) ?? 0;
                  const shared = attached > 1;
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 px-3 font-medium">{s.tag}</td>
                      <td className="py-2 px-3">{s.name}</td>
                      <td className="py-2 px-3">{s.area || "—"}</td>
                      <td className="py-2 px-3">{s.loadClass}{s.dynamic ? " · dyn" : ""}</td>
                      <td className="py-2 px-3">{s.maxSupports}</td>
                      <td className="py-2 px-3"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5"/>{attached}</span></td>
                      <td className="py-2 px-3">{shared ? <Badge className="bg-warning text-warning-foreground">Shared</Badge> : "—"}</td>
                      <td className="py-2 px-3">{s.mto.length}</td>
                      <td className="py-2 px-3">
                        <Button size="icon" variant="ghost" onClick={() => removeStructure(s.id)} disabled={attached > 0} title={attached > 0 ? "Detach supports first" : "Delete"}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent"/>Learning moment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            A goal post or inverted L is a <b>structure</b>, not a pipe support type. The pipe still rests on a shoe or is restrained by a U-bolt;
            the structure simply carries that hardware. Pipe supports reference a structure ID — multiple supports may share one structure,
            but structural quantities count once.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}