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
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/arrangements")({
  head: () => ({
    meta: [
      { title: "Support Structure Arrangements — Pipe Support Smart Assist" },
      {
        name: "description",
        content:
          "Goal Post, Inverted L and other structural arrangements that carry pipe support hardware, with preliminary dimensions and MTO.",
      },
    ],
  }),
  component: ArrangementsPage,
});

// ── Domain types ────────────────────────────────────────────────────────────
type Func = "Rest" | "Guide" | "Stop" | "Anchor" | "Hold-down";
type Hardware =
  | "Shoe"
  | "Clamp"
  | "U-bolt"
  | "Wear Pad"
  | "Sliding Plate"
  | "Spring"
  | "Hanger";
type LoadClass = "Light" | "Medium" | "Heavy";

const FUNCTIONS: Func[] = ["Rest", "Guide", "Stop", "Anchor", "Hold-down"];
const HARDWARES: Hardware[] = [
  "Shoe",
  "Clamp",
  "U-bolt",
  "Wear Pad",
  "Sliding Plate",
  "Spring",
  "Hanger",
];

interface ArrangementTemplate {
  id: "goal-post" | "inverted-l" | "wall-bracket" | "pedestal";
  name: string;
  prefix: string;
  description: string;
  fields: ("postHeight" | "beamLength" | "cantileverLength")[];
}

const TEMPLATES: ArrangementTemplate[] = [
  {
    id: "goal-post",
    name: "Goal Post (Portal Frame)",
    prefix: "GP",
    description: "Two vertical posts and one top beam carrying pipe hardware.",
    fields: ["postHeight", "beamLength"],
  },
  {
    id: "inverted-l",
    name: "Inverted L Cantilever",
    prefix: "IL",
    description: "Single vertical post (or column tie-in) with a cantilever beam.",
    fields: ["postHeight", "cantileverLength"],
  },
  {
    id: "wall-bracket",
    name: "Wall Bracket",
    prefix: "WB",
    description: "Cantilever bracket fixed to a wall or existing column.",
    fields: ["cantileverLength"],
  },
  {
    id: "pedestal",
    name: "Ground-Mounted Pedestal",
    prefix: "PD",
    description: "Concrete or steel pedestal from grade.",
    fields: ["postHeight"],
  },
];

interface MtoLine {
  component: string;
  qty: number;
  size: string;
  remarks?: string;
}

// ── Sizing logic ────────────────────────────────────────────────────────────
function pickClass(c: LoadClass) {
  // Preliminary member/plate/bolt sizing per load class.
  if (c === "Light")
    return {
      post: "W6x20 / HSS4x4x1/4",
      beam: "W6x20",
      basePlate: "PL 250x250x16",
      anchor: "M16 (4 nos.)",
      gusset: "PL 150x150x10",
    };
  if (c === "Medium")
    return {
      post: "W8x31 / HSS6x6x3/8",
      beam: "W8x31",
      basePlate: "PL 350x350x20",
      anchor: "M20 (4 nos.)",
      gusset: "PL 200x200x12",
    };
  return {
    post: "W10x49 / HSS8x8x1/2",
    beam: "W10x49",
    basePlate: "PL 450x450x25",
    anchor: "M24 (4 nos.)",
    gusset: "PL 250x250x16",
  };
}

interface DimsInput {
  pipeCL: number;          // pipe centerline elevation (mm)
  topOfSteel: number;      // foundation / top steel elevation (mm)
  groupWidth: number;      // pipe group total width (mm)
  sideClearance: number;   // mm
  columnToCL: number;      // distance column/wall → pipe centerline (mm)
  insulation: number;      // mm
  shoeClearance: number;   // mm above insulation
}

function computeDims(t: ArrangementTemplate, d: DimsInput) {
  const out: { label: string; value: string; formula: string }[] = [];
  if (t.fields.includes("postHeight")) {
    const h = Math.max(0, d.pipeCL - d.topOfSteel);
    out.push({
      label: "Post height",
      value: `${h} mm`,
      formula: "Pipe CL elevation − foundation / top-of-steel elevation",
    });
  }
  if (t.fields.includes("beamLength")) {
    const l = d.groupWidth + 2 * d.sideClearance;
    out.push({
      label: "Beam length",
      value: `${l} mm`,
      formula: "Pipe group width + 2 × side clearance",
    });
  }
  if (t.fields.includes("cantileverLength")) {
    const l = d.columnToCL + d.sideClearance;
    out.push({
      label: "Cantilever length",
      value: `${l} mm`,
      formula: "Column/wall → pipe CL + clearance",
    });
  }
  const sh = d.insulation + d.shoeClearance;
  out.push({
    label: "Shoe height",
    value: `${sh} mm`,
    formula: "Insulation thickness + required clearance",
  });
  return out;
}

function buildMTO(
  t: ArrangementTemplate,
  cls: LoadClass,
  hw: Hardware,
  fn: Func,
  heavyOrDynamic: boolean,
): MtoLine[] {
  const sz = pickClass(cls);
  const items: MtoLine[] = [];

  // Structural members per template
  if (t.id === "goal-post") {
    items.push({ component: "Vertical Post", qty: 2, size: sz.post });
    items.push({ component: "Top Beam", qty: 1, size: sz.beam });
    items.push({ component: "Base Plate", qty: 2, size: sz.basePlate });
    items.push({ component: "Anchor Bolt Set", qty: 2, size: sz.anchor, remarks: "Per base plate" });
    if (heavyOrDynamic)
      items.push({
        component: "Gusset / Stiffener Plate",
        qty: 4,
        size: sz.gusset,
        remarks: "Heavy load / dynamic service",
      });
  } else if (t.id === "inverted-l") {
    items.push({
      component: "Vertical Post (or existing column tie-in)",
      qty: 1,
      size: sz.post,
    });
    items.push({ component: "Cantilever Beam", qty: 1, size: sz.beam });
    items.push({ component: "Connection / Base Plate", qty: 1, size: sz.basePlate });
    if (heavyOrDynamic)
      items.push({
        component: "Gusset Plate",
        qty: 2,
        size: sz.gusset,
        remarks: "Where required by moment connection",
      });
    items.push({
      component: "Anchor Bolt Set / Weld",
      qty: 1,
      size: `${sz.anchor} or fillet weld`,
      remarks: "Per connection type",
    });
  } else if (t.id === "wall-bracket") {
    items.push({ component: "Cantilever Beam", qty: 1, size: sz.beam });
    items.push({ component: "Wall Plate", qty: 1, size: sz.basePlate });
    items.push({ component: "Anchor Bolt Set", qty: 1, size: sz.anchor });
    if (heavyOrDynamic)
      items.push({ component: "Gusset Plate", qty: 2, size: sz.gusset });
  } else if (t.id === "pedestal") {
    items.push({ component: "Pedestal (concrete or steel)", qty: 1, size: sz.post });
    items.push({ component: "Top Cap Plate", qty: 1, size: sz.basePlate });
    items.push({ component: "Anchor Bolt Set", qty: 1, size: sz.anchor });
  }

  // Pipe support hardware (driven by selected function & hardware)
  items.push({
    component: `Pipe Support Hardware: ${hw}`,
    qty: 1,
    size: "Per support standard",
    remarks: `Function: ${fn}`,
  });
  if (fn === "Rest" && hw === "Shoe") {
    items.push({
      component: "Wear / Slide Plate (PTFE or galv.)",
      qty: 1,
      size: "100 × 200 × 3 mm (typ.)",
      remarks: "Reduce friction at hot lines",
    });
  }
  if (fn === "Anchor") {
    items.push({
      component: "Anchor Lugs / Welded Stops",
      qty: 4,
      size: "PL per stress",
      remarks: "All-direction restraint",
    });
  }
  return items;
}

function requiredChecks(t: ArrangementTemplate, fn: Func): string[] {
  const base = [
    "Structural member stress and deflection (AISC 360 / Eurocode 3)",
    "Base plate / connection design and weld sizing",
    "Anchor bolt pull-out and shear (ACI 318 Appendix D for concrete)",
    "Foundation bearing / settlement check",
    "Piping stress analysis at the support point (ASME B31.3)",
  ];
  if (t.id === "inverted-l" || t.id === "wall-bracket")
    base.push("Cantilever tip deflection and dynamic amplification");
  if (t.id === "goal-post")
    base.push("Frame sway and lateral stability");
  if (fn === "Anchor")
    base.push("Full thermal load transfer to structure — verify reaction envelope");
  if (fn === "Hold-down")
    base.push("Uplift/buoyancy reaction and bolt tension check");
  return base;
}

function learningMoment(t: ArrangementTemplate): string {
  if (t.id === "goal-post")
    return "A goal post is a STRUCTURE — not a support type. The pipe still rests on a shoe or is restrained by a U-bolt; the goal post simply carries that hardware. Frame sway, base fixity and anchor bolt design control its sizing.";
  if (t.id === "inverted-l")
    return "Inverted L cantilevers are convenient off existing columns, but cantilever tip deflection and connection moment usually govern. Always check pipe stress with the structure's true stiffness, not as a rigid anchor.";
  if (t.id === "wall-bracket")
    return "Wall brackets transfer load into the wall — verify wall capacity and anchor pull-out before assuming the bracket is adequate.";
  return "Pedestals are simple in concept but foundation settlement can change pipe elevation. Verify geotechnical capacity for the service life.";
}

// ── Page ────────────────────────────────────────────────────────────────────
function ArrangementsPage() {
  const { line } = useApp();
  const [tplId, setTplId] = useState<ArrangementTemplate["id"]>("goal-post");
  const [fn, setFn] = useState<Func>("Rest");
  const [hw, setHw] = useState<Hardware>("Shoe");
  const [cls, setCls] = useState<LoadClass>("Medium");
  const [dynamic, setDynamic] = useState(false);

  const [dims, setDims] = useState<DimsInput>({
    pipeCL: 6500,
    topOfSteel: 0,
    groupWidth: 600,
    sideClearance: 150,
    columnToCL: 800,
    insulation: parseInt(line.insulationThickness || "50", 10) || 50,
    shoeClearance: 25,
  });

  const tpl = TEMPLATES.find((t) => t.id === tplId)!;
  const computed = useMemo(() => computeDims(tpl, dims), [tpl, dims]);
  const mto = useMemo(
    () => buildMTO(tpl, cls, hw, fn, dynamic || cls === "Heavy"),
    [tpl, cls, hw, fn, dynamic],
  );
  const checks = requiredChecks(tpl, fn);

  const num = (k: keyof DimsInput) => (
    <Input
      type="number"
      value={dims[k]}
      onChange={(e) => setDims((d) => ({ ...d, [k]: +e.target.value || 0 }))}
      className="h-8"
    />
  );

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Support Structure Arrangements</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Structural arrangements (Goal Post, Inverted L, brackets, pedestals) that <em>carry</em> the pipe support
          hardware. Use this module to generate preliminary member sizes and MTO.
        </p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" /> 1 · Function · Hardware · Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Support Function</Label>
            <Select value={fn} onValueChange={(v) => setFn(v as Func)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FUNCTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Support Hardware</Label>
            <Select value={hw} onValueChange={(v) => setHw(v as Hardware)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {HARDWARES.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] uppercase text-muted-foreground">Structure Arrangement</Label>
            <Select value={tplId} onValueChange={(v) => setTplId(v as ArrangementTemplate["id"])}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-2 border-primary/40 text-primary">{tpl.prefix}</Badge>
            {tpl.description}
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
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
          <div><Label className="text-[11px]">Insulation thickness</Label>{num("insulation")}</div>
          <div><Label className="text-[11px]">Shoe clearance above insulation</Label>{num("shoeClearance")}</div>
          <div className="flex items-end">
            <Label className="text-[11px] uppercase text-muted-foreground mr-2">Load Class</Label>
            <Select value={cls} onValueChange={(v) => setCls(v as LoadClass)}>
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              size="sm"
              variant={dynamic ? "default" : "outline"}
              onClick={() => setDynamic((v) => !v)}
            >
              Dynamic / Shock service: {dynamic ? "Yes" : "No"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Computed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">3 · Preliminary dimensions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
          {computed.map((c) => (
            <div key={c.label} className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase text-muted-foreground">{c.label}</span>
                <span className="font-mono text-primary">{c.value}</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic mt-1">{c.formula}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MTO */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" /> 4 · Preliminary MTO
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 pr-3">Component</th>
                <th className="text-left py-2 pr-3">Qty</th>
                <th className="text-left py-2 pr-3">Preliminary Size</th>
                <th className="text-left py-2 pr-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {mto.map((m, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2 pr-3">{m.component}</td>
                  <td className="py-2 pr-3">{m.qty}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{m.size}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{m.remarks ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Required checks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> 5 · Required checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {checks.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="rounded-md border border-warning/50 bg-warning/10 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/90">
          <b>Preliminary only.</b> Structural sizes and MTO shown here are preliminary. Final member sizes,
          welds, bolts, base plates, and foundations shall be verified by structural design and piping
          stress analysis.
        </p>
      </div>

      {/* Learning moment */}
      <Card className="bg-accent/5 border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent" /> Learning moment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{learningMoment(tpl)}</p>
        </CardContent>
      </Card>

      {/* Report summary fields */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Report record</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 text-xs">
          <div><span className="text-muted-foreground">Support function: </span><b>{fn}</b></div>
          <div><span className="text-muted-foreground">Support hardware: </span><b>{hw}</b></div>
          <div><span className="text-muted-foreground">Structure arrangement: </span><b>{tpl.name}</b></div>
          <div><span className="text-muted-foreground">Load class: </span><b>{cls}{dynamic ? " · dynamic" : ""}</b></div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">Preliminary dimensions: </span>
            <b>{computed.map((c) => `${c.label} = ${c.value}`).join(" · ")}</b>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">Preliminary MTO: </span>
            <b>{mto.map((m) => `${m.qty}× ${m.component}`).join(" · ")}</b>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}