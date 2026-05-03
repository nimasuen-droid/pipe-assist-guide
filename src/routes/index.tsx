import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, AlertTriangle, Activity, Layers, ShieldCheck, Upload, Wrench, BookMarked } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipe Support Smart Assist — Home" },
      {
        name: "description",
        content:
          "Industry-grade decision support tool for pipe support selection, MTO and reporting.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { line, setLine, register, recommendation } = useApp();
  const nav = useNavigate();
  void setLine;
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

      <div className="flex justify-end">
        <Button size="lg" onClick={() => nav({ to: "/inputs" })}>
          Enter Project Inputs <ArrowRight className="ml-2 h-4 w-4" />
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

function StepCard({
  n,
  icon: Icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">STEP {n}</span>
      </div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </div>
  );
}
