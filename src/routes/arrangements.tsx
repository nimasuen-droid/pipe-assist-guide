import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { FlowFooter } from "@/components/FlowFooter";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Building2,
  GraduationCap,
  Ruler,
  ListChecks,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Link2,
  Eye,
  X,
  Pencil,
} from "lucide-react";
import {
  STRUCTURE_KINDS,
  buildStructureMTO,
  computeStructureDims,
  nextStructureTag,
  type DimsInput,
  type LoadClass,
} from "@/lib/structures";
import type { Structure, StructureKind, SupportRegisterEntry } from "@/lib/types";
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
  const {
    line,
    structures,
    register,
    addStructure,
    updateStructure,
    removeStructure,
    addToRegister,
    updateRegisterEntry,
    removeFromRegister,
    nextTag,
  } = useApp();
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

  // Per-structure dialogs
  const [quickAddFor, setQuickAddFor] = useState<Structure | null>(null);
  const [assignFor, setAssignFor] = useState<Structure | null>(null);
  const [viewFor, setViewFor] = useState<Structure | null>(null);
  const [editFor, setEditFor] = useState<Structure | null>(null);

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
                  const util = Math.round((attached / Math.max(1, s.maxSupports)) * 100);
                  const full = attached >= s.maxSupports;
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 px-3 font-medium">{s.tag}</td>
                      <td className="py-2 px-3">{s.name}</td>
                      <td className="py-2 px-3">{s.area || "—"}</td>
                      <td className="py-2 px-3">{s.loadClass}{s.dynamic ? " · dyn" : ""}</td>
                      <td className="py-2 px-3">{s.maxSupports}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5"/>{attached} / {s.maxSupports}</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden" title={`${util}% utilization`}>
                            <div
                              className={`h-full ${util >= 100 ? "bg-destructive" : util >= 75 ? "bg-warning" : "bg-primary"}`}
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{util}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">{shared ? <Badge className="bg-warning text-warning-foreground">Shared</Badge> : "—"}</td>
                      <td className="py-2 px-3">{s.mto.length}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => setQuickAddFor(s)} disabled={full} title={full ? "At max capacity" : "Add new support to this structure"}>
                            <UserPlus className="h-3.5 w-3.5 mr-1"/>Add
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAssignFor(s)} disabled={full} title="Assign existing support">
                            <Link2 className="h-3.5 w-3.5 mr-1"/>Assign
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setViewFor(s)} title="View assigned supports">
                            <Eye className="h-3.5 w-3.5 mr-1"/>View ({attached})
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditFor(s)} title="Edit structure">
                            <Pencil className="h-4 w-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => removeStructure(s.id)} disabled={attached > 0} title={attached > 0 ? "Detach supports first" : "Delete"}>
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {quickAddFor && (
        <QuickAddDialog
          structure={quickAddFor}
          attachedCount={supportsByStructure.get(quickAddFor.id) ?? 0}
          parentLine={line}
          onClose={() => setQuickAddFor(null)}
          onCreate={(entry) => {
            addToRegister(entry);
            toast.success(`Support ${entry.tag} added to ${quickAddFor.tag}`);
            setQuickAddFor(null);
          }}
          nextTag={nextTag}
        />
      )}

      {assignFor && (
        <AssignDialog
          structure={assignFor}
          register={register}
          structures={structures}
          attachedCount={supportsByStructure.get(assignFor.id) ?? 0}
          onClose={() => setAssignFor(null)}
          onAssign={(supportId) => {
            updateRegisterEntry(supportId, { structureId: assignFor.id });
            toast.success(`Support assigned to ${assignFor.tag}`);
          }}
        />
      )}

      {viewFor && (
        <ViewAssignedDialog
          structure={viewFor}
          register={register.filter((r) => r.structureId === viewFor.id)}
          onClose={() => setViewFor(null)}
          onUnassign={(id) => {
            updateRegisterEntry(id, { structureId: undefined });
            toast.success("Support unassigned");
          }}
          onDelete={(id) => {
            removeFromRegister(id);
            toast.success("Support deleted");
          }}
        />
      )}

      {editFor && (
        <EditStructureDialog
          structure={editFor}
          attachedCount={supportsByStructure.get(editFor.id) ?? 0}
          onClose={() => setEditFor(null)}
          onSave={(patch) => {
            updateStructure(editFor.id, patch);
            toast.success(`Structure ${editFor.tag} updated`);
            setEditFor(null);
          }}
        />
      )}

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
      <FlowFooter
        hint={structures.length ? `${structures.length} structure(s) defined.` : "Optional — skip if no structures needed."}
      />
    </div>
  );
}

// ── Quick-add a new support directly attached to this structure ──
const PIPE_FUNCTIONS = ["Rest", "Guide", "Stop", "Anchor", "Hold-down"];
const HARDWARE = ["Shoe", "Clamp", "U-bolt", "Wear Pad", "Sliding Plate", "Spring Hanger", "Trunnion"];

function QuickAddDialog({
  structure, attachedCount, defaultLineNumber, defaultArea, defaultInsulation,
  onClose, onCreate, nextTag,
}: {
  structure: Structure;
  attachedCount: number;
  defaultLineNumber: string;
  defaultArea: string;
  defaultInsulation: string;
  onClose: () => void;
  onCreate: (e: SupportRegisterEntry) => void;
  nextTag: (supportType?: string) => string;
}) {
  const remaining = structure.maxSupports - attachedCount;
  const elevation = structure.dimensions.find((d) => /post height|cantilever/i.test(d.label))?.value;
  const [pipeFunction, setPipeFunction] = useState("Rest");
  const [hardware, setHardware] = useState("Shoe");
  const [lineNumber, setLineNumber] = useState(defaultLineNumber || "");
  const [location, setLocation] = useState(`${defaultArea || structure.area || ""}${elevation ? ` @ ${elevation}` : ""}`);
  const [remarks, setRemarks] = useState("");

  const submit = () => {
    const tag = nextTag(`${hardware} (${pipeFunction})`);
    const entry: SupportRegisterEntry = {
      id: crypto.randomUUID(),
      tag,
      lineNumber: lineNumber || "—",
      location: location || structure.area || "—",
      supportType: `${hardware} (${pipeFunction})`,
      function: `${pipeFunction} — pipe-contact via ${hardware}`,
      loadClass: structure.loadClass,
      movementAllowed: pipeFunction === "Anchor" ? "" : "Axial",
      movementRestrained: pipeFunction === "Anchor" ? "All DoF" : "Vertical (down)",
      insulation: defaultInsulation || "none",
      stressReview: pipeFunction === "Anchor" || pipeFunction === "Stop",
      structuralReview: attachedCount + 1 > 1,
      remarks: remarks || `Created from structure ${structure.tag}`,
      // Minimal line/wizard/recommendation stubs — full data set on Recommendation tab
      line: {
        projectName: "", area: defaultArea || structure.area || "", lineNumber: lineNumber || "",
        pipeSize: "6", schedule: "STD", material: "CS A106 Gr.B", service: "",
        designPressure: "10", designTemp: "150", operatingTemp: "120",
        insulation: (defaultInsulation as never) || "none", insulationThickness: "50",
        layout: "pipe-rack", phase: "new-build",
      },
      wizard: {
        orientation: "horizontal", nearFeature: "none", thermalMovement: true,
        upliftPossible: false, vibration: false, axialMovement: "allow",
        lateralMovement: "allow", verticalAdjustment: false, permanent: true,
        weldingAllowed: true, specialService: "none",
      },
      recommendation: {
        primary: `${hardware} (${pipeFunction})`,
        alternates: [], function: pipeFunction,
        why: [`Created directly on structure ${structure.tag}`],
        movementAllowed: [], movementRestrained: [],
        designChecks: [], followUpChecks: [], references: [],
        riskFlags: [], learningMoment: "", verdict: "REVIEW REQUIRED",
      },
      structureId: structure.id,
      hardware,
      pipeFunction,
    };
    onCreate(entry);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new support to {structure.tag}</DialogTitle>
          <DialogDescription>
            Pre-filled from structure. Capacity: <b>{attachedCount}</b> / {structure.maxSupports} ({remaining} slot{remaining === 1 ? "" : "s"} left).
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs grid grid-cols-2 gap-2">
          <div><span className="text-muted-foreground">Structure ID:</span> <b>{structure.tag}</b></div>
          <div><span className="text-muted-foreground">Type:</span> <b>{structure.name}</b></div>
          <div><span className="text-muted-foreground">Area:</span> <b>{structure.area || "—"}</b></div>
          <div><span className="text-muted-foreground">Load class:</span> <b>{structure.loadClass}</b></div>
          {elevation && <div className="col-span-2"><span className="text-muted-foreground">Elevation ref:</span> <b>{elevation}</b></div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Pipe function</Label>
            <Select value={pipeFunction} onValueChange={setPipeFunction}>
              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
              <SelectContent>{PIPE_FUNCTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Hardware</Label>
            <Select value={hardware} onValueChange={setHardware}>
              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
              <SelectContent>{HARDWARE.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Line number</Label>
            <Input value={lineNumber} onChange={(e) => setLineNumber(e.target.value)} className="h-9"/>
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9"/>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Remarks</Label>
            <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-9"/>
          </div>
        </div>

        {attachedCount + 1 > 1 && (
          <div className="text-xs flex items-start gap-1.5 text-warning">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5"/>
            Multiple supports on a single structure require combined load verification by structural design.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={remaining <= 0}>Create support</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign / reassign an existing support ──
function AssignDialog({
  structure, register, structures, attachedCount, onClose, onAssign,
}: {
  structure: Structure;
  register: SupportRegisterEntry[];
  structures: Structure[];
  attachedCount: number;
  onClose: () => void;
  onAssign: (supportId: string) => void;
}) {
  const remaining = structure.maxSupports - attachedCount;
  const candidates = register.filter((r) => r.structureId !== structure.id);
  const [pendingReassign, setPendingReassign] = useState<SupportRegisterEntry | null>(null);

  const handlePick = (r: SupportRegisterEntry) => {
    if (r.structureId) setPendingReassign(r);
    else { onAssign(r.id); onClose(); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign support to {structure.tag}</DialogTitle>
          <DialogDescription>
            {remaining} slot{remaining === 1 ? "" : "s"} available. Unassigned supports first; reassignable supports show their current structure.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No supports available to assign. Create one first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left py-2 px-2">Tag</th>
                <th className="text-left py-2 px-2">Line</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Currently on</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {candidates
                .sort((a, b) => Number(!!a.structureId) - Number(!!b.structureId))
                .map((r) => {
                  const cur = r.structureId ? structures.find((s) => s.id === r.structureId) : null;
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2 px-2 font-medium">{r.tag}</td>
                      <td className="py-2 px-2">{r.lineNumber}</td>
                      <td className="py-2 px-2">{r.supportType}</td>
                      <td className="py-2 px-2">
                        {cur ? <Badge variant="outline">{cur.tag}</Badge> : <span className="text-muted-foreground">— Unassigned —</span>}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => handlePick(r)} disabled={remaining <= 0}>
                          {cur ? "Reassign" : "Assign"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {pendingReassign && (
        <Dialog open onOpenChange={(o) => !o && setPendingReassign(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning"/>Confirm reassignment</DialogTitle>
              <DialogDescription>
                This support is currently assigned to another structure. Reassigning it will update the support register and MTO.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
              Move <b>{pendingReassign.tag}</b> → <b>{structure.tag}</b>?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingReassign(null)}>Cancel</Button>
              <Button onClick={() => { onAssign(pendingReassign.id); setPendingReassign(null); onClose(); }}>
                Reassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

// ── View supports currently attached to a structure ──
function ViewAssignedDialog({
  structure, register, onClose, onUnassign, onDelete,
}: {
  structure: Structure;
  register: SupportRegisterEntry[];
  onClose: () => void;
  onUnassign: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const util = Math.round((register.length / Math.max(1, structure.maxSupports)) * 100);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supports on {structure.tag}</DialogTitle>
          <DialogDescription>
            {register.length} / {structure.maxSupports} assigned · utilization {util}%
          </DialogDescription>
        </DialogHeader>
        {register.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No supports assigned to this structure yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left py-2 px-2">Tag</th>
                <th className="text-left py-2 px-2">Line</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Function</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {register.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2 px-2 font-medium">{r.tag}</td>
                  <td className="py-2 px-2">{r.lineNumber}</td>
                  <td className="py-2 px-2">{r.supportType}</td>
                  <td className="py-2 px-2">{r.function}</td>
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => onUnassign(r.id)} title="Detach from this structure">
                      <X className="h-3.5 w-3.5 mr-1"/>Unassign
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(r.id)} title="Delete support">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit a structure (tag, kind, class, area, max, dynamic, dims, MTO) ──
function EditStructureDialog({
  structure, attachedCount, onClose, onSave,
}: {
  structure: Structure;
  attachedCount: number;
  onClose: () => void;
  onSave: (p: Partial<Structure>) => void;
}) {
  const [tag, setTag] = useState(structure.tag);
  const [kind, setKind] = useState<StructureKind>(structure.kind);
  const [cls, setCls] = useState<LoadClass>(structure.loadClass);
  const [dynamic, setDynamic] = useState(structure.dynamic);
  const [area, setArea] = useState(structure.area || "");
  const [maxSupports, setMaxSupports] = useState<number>(structure.maxSupports);
  const [notes, setNotes] = useState(structure.notes || "");
  const [recompute, setRecompute] = useState(false);
  const [dims, setDims] = useState<DimsInput>({
    pipeCL: 6500, topOfSteel: 0, groupWidth: 600, sideClearance: 150, columnToCL: 800,
  });

  const meta = STRUCTURE_KINDS.find((k) => k.id === kind)!;
  const newDimensions = useMemo(() => computeStructureDims(kind, dims), [kind, dims]);
  const newMto = useMemo(() => buildStructureMTO(kind, cls, dynamic || cls === "Heavy"), [kind, cls, dynamic]);
  const overCapacity = maxSupports < attachedCount;

  const save = () => {
    const patch: Partial<Structure> = {
      tag, kind, name: meta.name, loadClass: cls, dynamic, area: area || undefined,
      maxSupports, notes,
    };
    if (recompute) {
      patch.dimensions = newDimensions;
      patch.mto = newMto;
    } else {
      // class/kind/dynamic still affect MTO; refresh MTO without touching dims
      patch.mto = newMto;
    }
    onSave(patch);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit structure — {structure.tag}</DialogTitle>
          <DialogDescription>
            Update tag, kind, class, area and capacity. {attachedCount} support(s) currently attached.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tag</Label>
            <Input value={tag} onChange={(e) => setTag(e.target.value)} className="h-9"/>
          </div>
          <div>
            <Label className="text-xs">Kind</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as StructureKind)}>
              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
              <SelectContent>
                {STRUCTURE_KINDS.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Load class</Label>
            <Select value={cls} onValueChange={(v) => setCls(v as LoadClass)}>
              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Area</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} className="h-9"/>
          </div>
          <div>
            <Label className="text-xs">Max supports</Label>
            <Input
              type="number"
              min={1}
              value={maxSupports}
              onChange={(e) => setMaxSupports(Math.max(1, +e.target.value || 1))}
              className="h-9"
            />
            {overCapacity && (
              <p className="text-[11px] text-destructive mt-1">
                Below currently attached count ({attachedCount}). Detach supports or raise the limit.
              </p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              variant={dynamic ? "default" : "outline"}
              onClick={() => setDynamic((v) => !v)}
            >
              Dynamic / Shock: {dynamic ? "Yes" : "No"}
            </Button>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-9"/>
          </div>
        </div>

        <div className="rounded-md border border-border p-3 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={recompute} onChange={(e) => setRecompute(e.target.checked)} />
            Recompute preliminary dimensions from new geometry
          </label>
          {recompute && (
            <div className="grid gap-2 md:grid-cols-3 text-xs">
              <div><Label className="text-[11px]">Pipe CL</Label>
                <Input type="number" value={dims.pipeCL} onChange={(e) => setDims((d) => ({ ...d, pipeCL: +e.target.value || 0 }))} className="h-8"/></div>
              <div><Label className="text-[11px]">Top of steel</Label>
                <Input type="number" value={dims.topOfSteel} onChange={(e) => setDims((d) => ({ ...d, topOfSteel: +e.target.value || 0 }))} className="h-8"/></div>
              <div><Label className="text-[11px]">Group width</Label>
                <Input type="number" value={dims.groupWidth} onChange={(e) => setDims((d) => ({ ...d, groupWidth: +e.target.value || 0 }))} className="h-8"/></div>
              <div><Label className="text-[11px]">Side clearance</Label>
                <Input type="number" value={dims.sideClearance} onChange={(e) => setDims((d) => ({ ...d, sideClearance: +e.target.value || 0 }))} className="h-8"/></div>
              <div><Label className="text-[11px]">Column → CL</Label>
                <Input type="number" value={dims.columnToCL} onChange={(e) => setDims((d) => ({ ...d, columnToCL: +e.target.value || 0 }))} className="h-8"/></div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={overCapacity}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}