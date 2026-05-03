import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, FileText, AlertTriangle, Activity, Layers, ShieldCheck, Upload, Wrench, BookMarked } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project & Line Input — Pipe Support Smart Assist" },
      {
        name: "description",
        content:
          "Enter project, line, service and layout data to drive support recommendations.",
      },
    ],
  }),
  component: ProjectPage,
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ProjectPage() {
  const { line, setLine, register, recommendation } = useApp();
  const nav = useNavigate();
  const warnings = recommendation?.riskFlags.length ?? 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pipe Support Smart Assist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive support selection with engineering decision logic and full source traceability.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={Layers} label="Lines configured" value={line.lineNumber ? "1" : "0"} />
        <StatTile icon={FileText} label="Supports in register" value={String(register.length)} />
        <StatTile icon={Activity} label="Active line NPS" value={`${line.pipeSize || "—"}"`} />
        <StatTile icon={AlertTriangle} label="Risk flags" value={warnings ? String(warnings) : "—"} accent={warnings > 0} />
      </div>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This tool walks you through practical engineering questions, recommends a pipe support, generates the MTO and
            keeps a project register — every output traces back to your input.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <StepCard n={1} icon={Upload} title="Enter Design Basis" desc="Service, temperature, layout, insulation, phase." />
            <StepCard n={2} icon={Wrench} title="Run Selection Wizard" desc="Orientation, restraints, vibration, special service." />
            <StepCard n={3} icon={FileText} title="Generate Report" desc="Recommendation, risk flags, references, MTO." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <BookMarked className="h-3.5 w-3.5" /> Supported Codes & Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              "ASME B31.3 — Process Piping",
              "MSS SP-58 — Hangers & Supports",
              "MSS SP-69 — Selection & Application",
              "MSS SP-89 — Fabrication & Installation",
              "MSS SP-127 — Bracing for Piping",
              "PFI ES-26 — Welded Attachments",
              "PIP Standards (where applicable)",
              "Vendor Nozzle Allowables (API 610 / NEMA SM-23)",
              "Project Pipe Support Standards",
            ].map((s) => (
              <div key={s} className="rounded-md border border-border bg-muted/30 px-3 py-2">{s}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Project Name">
            <Input value={line.projectName} onChange={(e) => setLine({ projectName: e.target.value })} placeholder="e.g. PX Revamp" />
          </Field>
          <Field label="Area / Unit">
            <Input value={line.area} onChange={(e) => setLine({ area: e.target.value })} placeholder="Unit 200" />
          </Field>
          <Field label="Phase">
            <Select value={line.phase} onValueChange={(v) => setLine({ phase: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new-build">New Build</SelectItem>
                <SelectItem value="brownfield">Brownfield</SelectItem>
                <SelectItem value="retrofit">Retrofit</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Line Number">
            <Input value={line.lineNumber} onChange={(e) => setLine({ lineNumber: e.target.value })} placeholder="6&quot;-P-1001-A1A" />
          </Field>
          <Field label="Pipe Size (NPS)">
            <Input value={line.pipeSize} onChange={(e) => setLine({ pipeSize: e.target.value })} />
          </Field>
          <Field label="Schedule">
            <Input value={line.schedule} onChange={(e) => setLine({ schedule: e.target.value })} />
          </Field>
          <Field label="Material">
            <Input value={line.material} onChange={(e) => setLine({ material: e.target.value })} placeholder="CS / SS316 / LTCS" />
          </Field>
          <Field label="Fluid / Service">
            <Input value={line.service} onChange={(e) => setLine({ service: e.target.value })} placeholder="Steam / Hydrocarbon / Pump suction…" />
          </Field>
          <Field label="Design Pressure (barg)">
            <Input value={line.designPressure} onChange={(e) => setLine({ designPressure: e.target.value })} />
          </Field>
          <Field label="Design Temp (°C)">
            <Input value={line.designTemp} onChange={(e) => setLine({ designTemp: e.target.value })} />
          </Field>
          <Field label="Operating Temp (°C)">
            <Input value={line.operatingTemp} onChange={(e) => setLine({ operatingTemp: e.target.value })} />
          </Field>
          <Field label="Layout">
            <Select value={line.layout} onValueChange={(v) => setLine({ layout: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aboveground">Aboveground</SelectItem>
                <SelectItem value="pipe-rack">Pipe Rack</SelectItem>
                <SelectItem value="equipment-piping">Equipment Piping</SelectItem>
                <SelectItem value="underground-transition">Underground Transition</SelectItem>
                <SelectItem value="skid">Skid</SelectItem>
                <SelectItem value="structure-mounted">Structure Mounted</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Insulation">
            <Select value={line.insulation} onValueChange={(v) => setLine({ insulation: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uninsulated</SelectItem>
                <SelectItem value="hot">Hot Insulation</SelectItem>
                <SelectItem value="cold">Cold Insulation</SelectItem>
                <SelectItem value="cryogenic">Cryogenic</SelectItem>
                <SelectItem value="personnel">Personnel Protection</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Insulation Thickness (mm)">
            <Input value={line.insulationThickness} onChange={(e) => setLine({ insulationThickness: e.target.value })} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={() => nav({ to: "/wizard" })}>
          Continue to Wizard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-4 w-4 ${accent ? "text-warning" : "text-primary"}`} />
        {label}
      </div>
      <div className={`text-2xl font-semibold ${accent ? "text-warning" : ""}`}>{value}</div>
    </div>
  );
}
