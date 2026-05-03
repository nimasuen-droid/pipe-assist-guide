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
import { ArrowRight, DatabaseZap, Save, FolderOpen, Trash2, RotateCcw, FileDown, FileUp, Eraser } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

export const Route = createFileRoute("/inputs")({
  head: () => ({
    meta: [
      { title: "Project Inputs — Pipe Support Smart Assist" },
      {
        name: "description",
        content:
          "Enter project, line, service and layout data to drive support recommendations.",
      },
    ],
  }),
  component: InputsPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function InputsPage() {
  const { line, setLine, wizard, setWizard, savedProjects, saveProject, loadProject, deleteProject, loadSample, reset } = useApp();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ line, wizard }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${line.projectName || "project"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.line) setLine(data.line);
        if (data.wizard) setWizard(data.wizard);
        toast.success("Project imported");
      } catch {
        toast.error("Invalid project file");
      }
    };
    reader.readAsText(f);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Project Inputs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capture the design basis. These inputs drive every recommendation downstream.
        </p>
      </div>

      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Project Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => { loadSample(); toast.success("Sample data loaded"); }}>
              <DatabaseZap className="h-3.5 w-3.5 mr-1.5" /> Load Sample Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { reset(); toast.success("All fields cleared"); }}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Eraser className="h-3.5 w-3.5 mr-1.5" /> Clear All Fields
            </Button>
            <Button size="sm" variant="outline" onClick={() => { saveProject(); toast.success("Project saved"); }}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Project
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5 mr-1.5" /> Import JSON
            </Button>
            <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
          </div>
          {savedProjects.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" /> Saved Projects ({savedProjects.length})
              </div>
              <div className="space-y-1.5">
                {savedProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(p.savedAt).toLocaleString()}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => { loadProject(p.id); toast.success("Project loaded"); }}>Load</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProject(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <Input value={line.lineNumber} onChange={(e) => setLine({ lineNumber: e.target.value })} placeholder='6"-P-1001-A1A' />
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
