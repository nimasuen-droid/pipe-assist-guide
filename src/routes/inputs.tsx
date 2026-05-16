import { Link, createFileRoute } from "@tanstack/react-router";
import { sampleScenarios, useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DatabaseZap,
  Database,
  Save,
  FolderOpen,
  Trash2,
  FileDown,
  FileUp,
  Eraser,
  ClipboardPaste,
  ListPlus,
  Keyboard,
  Eye,
  Pencil,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlowFooter } from "@/components/FlowFooter";
import { projectImportSchema } from "@/lib/schemas";
import { lineListTemplateRows, parseLineList, serializeLineList } from "@/lib/lineList";
import {
  confirmBeforeReplacingProject,
  getActiveSavedProject,
  hasUnsavedProjectChanges,
} from "@/lib/projectStatus";
import type { ProjectLine, Structure, SupportRegisterEntry } from "@/lib/types";

const pipeSizeOptions = [
  "0.5",
  "0.75",
  "1",
  "1.5",
  "2",
  "3",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "30",
  "36",
];

const scheduleOptions = [
  "5S",
  "10S",
  "10",
  "20",
  "30",
  "40",
  "40S",
  "80",
  "80S",
  "120",
  "160",
  "STD",
  "XS",
  "XXS",
];

const materialOptions = [
  "CS A106 Gr.B",
  "CS A53 Gr.B Galv",
  "LTCS A333 Gr.6",
  "SS 304L",
  "SS316L",
  "Duplex 2205",
  "Alloy 20",
  "Inconel 625",
  "HDPE",
  "FRP",
];

function uniqueOptions(options: string[], current?: string) {
  return current && !options.includes(current) ? [current, ...options] : options;
}

export const Route = createFileRoute("/inputs")({
  head: () => ({
    meta: [
      { title: "Project Inputs — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "Enter project, line, service and layout data to drive support recommendations.",
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

function LineSupportDialog({
  line,
  supports,
  structures,
  onClose,
  onLoadLine,
  onDeleteSupport,
  onEditSupport,
}: {
  line: ProjectLine | null;
  supports: SupportRegisterEntry[];
  structures: Structure[];
  onClose: () => void;
  onLoadLine: (line: ProjectLine) => void;
  onDeleteSupport: (id: string) => void;
  onEditSupport: (entry: SupportRegisterEntry) => void;
}) {
  if (!line) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Line focus - {line.lineNumber}</DialogTitle>
          <DialogDescription>
            Track, edit, delete, reselect, or add supports for this line section.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm sm:grid-cols-4">
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Project</div>
            <div className="font-medium">{line.projectName || "-"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Area</div>
            <div className="font-medium">{line.area || "-"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Section</div>
            <div className="font-medium">{line.sectionName || "-"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Supports</div>
            <div className="font-medium">{supports.length}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" onClick={() => onLoadLine(line)}>
            <Link to="/wizard">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Reselect support
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" onClick={() => onLoadLine(line)}>
            <Link to="/report">
              <ListPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Add another to this line
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/arrangements">Edit structures</Link>
          </Button>
        </div>

        {supports.length === 0 ? (
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            No supports are assigned to this line yet. Load the line, run the selection workflow,
            then add the support with a structural carrier.
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-md border border-border"
            tabIndex={0}
            aria-label={`Supports assigned to ${line.lineNumber}`}
          >
            <table className="w-full min-w-[820px] text-sm">
              <caption className="sr-only">
                Supports assigned to the selected project line, including structure link, review
                status, remarks, and edit actions.
              </caption>
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Tag", "Type", "Function", "Structure", "Review", "Remarks", "Actions"].map(
                    (heading) => (
                      <th key={heading} scope="col" className="px-3 py-2 text-left">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {supports.map((support) => {
                  const structure = structures.find((item) => item.id === support.structureId);
                  return (
                    <tr key={support.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 font-mono font-medium">{support.tag}</td>
                      <td className="px-3 py-2">{support.supportType}</td>
                      <td className="px-3 py-2">{support.function}</td>
                      <td className="px-3 py-2">
                        {structure ? (
                          <span className="font-mono">{structure.tag}</span>
                        ) : (
                          <Badge className="bg-warning text-warning-foreground">Unlinked</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {support.stressReview && (
                            <Badge className="bg-warning text-warning-foreground">Stress</Badge>
                          )}
                          {support.structuralReview && (
                            <Badge className="bg-warning text-warning-foreground">Structural</Badge>
                          )}
                          {!support.stressReview && !support.structuralReview && "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {support.remarks || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onEditSupport(support)}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDeleteSupport(support.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupportEditDialog({
  entry,
  structures,
  onClose,
  onSave,
}: {
  entry: SupportRegisterEntry;
  structures: Structure[];
  onClose: () => void;
  onSave: (patch: Partial<SupportRegisterEntry>) => void;
}) {
  const [tag, setTag] = useState(entry.tag);
  const [location, setLocation] = useState(entry.location);
  const [supportType, setSupportType] = useState(entry.supportType);
  const [func, setFunc] = useState(entry.function);
  const [loadClass, setLoadClass] = useState(entry.loadClass);
  const [movementAllowed, setMovementAllowed] = useState(entry.movementAllowed);
  const [movementRestrained, setMovementRestrained] = useState(entry.movementRestrained);
  const [stressReview, setStressReview] = useState(entry.stressReview);
  const [structuralReview, setStructuralReview] = useState(entry.structuralReview);
  const [remarks, setRemarks] = useState(entry.remarks);
  const [structureId, setStructureId] = useState(entry.structureId ?? "__none__");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit support - {entry.tag}</DialogTitle>
          <DialogDescription>
            Update the support data for this line. Structure options remain editable in Structure &
            Linking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tag">
            <Input value={tag} onChange={(event) => setTag(event.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(event) => setLocation(event.target.value)} />
          </Field>
          <Field label="Support type">
            <Input value={supportType} onChange={(event) => setSupportType(event.target.value)} />
          </Field>
          <Field label="Load class">
            <Input value={loadClass} onChange={(event) => setLoadClass(event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Function">
              <Input value={func} onChange={(event) => setFunc(event.target.value)} />
            </Field>
          </div>
          <Field label="Movement allowed">
            <Input
              value={movementAllowed}
              onChange={(event) => setMovementAllowed(event.target.value)}
            />
          </Field>
          <Field label="Movement restrained">
            <Input
              value={movementRestrained}
              onChange={(event) => setMovementRestrained(event.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Structure">
              <Select value={structureId} onValueChange={setStructureId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {structures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.tag} - {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={stressReview}
                onChange={(event) => setStressReview(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Stress review required
            </label>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={structuralReview}
                onChange={(event) => setStructuralReview(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Structural review required
            </label>
          </div>
          <div className="sm:col-span-2">
            <Field label="Remarks">
              <Textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                tag,
                location,
                supportType,
                function: func,
                loadClass,
                movementAllowed,
                movementRestrained,
                stressReview,
                structuralReview,
                remarks,
                structureId: structureId === "__none__" ? undefined : structureId,
              })
            }
          >
            Save support
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InputsPage() {
  const {
    line,
    setLine,
    wizard,
    setWizard,
    savedProjects,
    lineList,
    activeLineId,
    register,
    structures,
    activeProjectId,
    saveProject,
    loadProject,
    deleteProject,
    loadSample,
    setActiveLine,
    setActiveLineSection,
    addCurrentLineToList,
    removeProjectLine,
    removeFromRegister,
    updateRegisterEntry,
    importLineList,
    reset,
  } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const lineListFileRef = useRef<HTMLInputElement>(null);
  const [sampleId, setSampleId] = useState(sampleScenarios[0]?.id ?? "");
  const [lineListPaste, setLineListPaste] = useState("");
  const [inputMode, setInputMode] = useState<"manual" | "line-list">("manual");
  const [manualSectionName, setManualSectionName] = useState("");
  const [focusedLine, setFocusedLine] = useState<ProjectLine | null>(null);
  const [editingSupport, setEditingSupport] = useState<SupportRegisterEntry | null>(null);

  const activeProjectLine = lineList.find((item) => item.id === activeLineId);
  const savedProject = getActiveSavedProject(savedProjects, activeProjectId, line.projectName);
  const hasUnsavedChanges = hasUnsavedProjectChanges({
    line,
    wizard,
    lineList,
    activeLineId,
    savedProject,
  });

  const confirmProjectReplacement = () =>
    confirmBeforeReplacingProject({
      projectName: line.projectName,
      hasUnsavedChanges,
    });

  useEffect(() => {
    setManualSectionName(activeProjectLine?.sectionName ?? "");
  }, [activeProjectLine?.id, activeProjectLine?.sectionName]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ line, wizard, lineList, activeLineId }, null, 2)], {
      type: "application/json",
    });
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
    if (!confirmProjectReplacement()) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = projectImportSchema.parse(JSON.parse(String(reader.result)));
        if (data.lineList) {
          importLineList(data.lineList);
          if (data.activeLineId && data.lineList.some((item) => item.id === data.activeLineId)) {
            setActiveLine(data.activeLineId);
          }
        }
        if (data.line) setLine(data.line);
        if (data.wizard) setWizard(data.wizard);
        toast.success("Project imported");
      } catch {
        toast.error("Invalid project file. Check the JSON schema and try again.");
      }
    };
    reader.readAsText(f);
  };

  const downloadLineListTemplate = () => {
    const blob = new Blob([serializeLineList(lineListTemplateRows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipe-support-line-list-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyLineListText = (raw: string) => {
    const parsed = parseLineList(raw);
    if (!parsed.length) {
      toast.error("No valid lines found. Check the line list headers and line numbers.");
      return;
    }
    importLineList(parsed);
    toast.success(`${parsed.length} line(s) loaded into the project line list`);
  };

  const handleLineListImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => applyLineListText(String(reader.result ?? ""));
    reader.readAsText(f);
    e.target.value = "";
  };

  const supportIndex = useMemo(() => {
    const byProjectLineId = new Map<string, { count: number; tags: string[] }>();
    const byLineNumber = new Map<string, { count: number; tags: string[] }>();
    register.forEach((entry) => {
      const key = entry.projectLineId || entry.lineNumber;
      const target = entry.projectLineId ? byProjectLineId : byLineNumber;
      const current = target.get(key) ?? { count: 0, tags: [] };
      current.count += 1;
      current.tags.push(entry.tag);
      target.set(key, current);
    });
    return { byProjectLineId, byLineNumber };
  }, [register]);

  const supportsForLine = (projectLine: ProjectLine) =>
    register.filter((entry) =>
      entry.projectLineId
        ? entry.projectLineId === projectLine.id
        : entry.lineNumber === projectLine.lineNumber,
    );

  const duplicateLineNumbers = useMemo(() => {
    const counts = new Map<string, number>();
    lineList.forEach((item) => counts.set(item.lineNumber, (counts.get(item.lineNumber) ?? 0) + 1));
    return counts;
  }, [lineList]);
  const manualDuplicateNeedsSection =
    Boolean(line.lineNumber) &&
    !manualSectionName.trim() &&
    lineList.some((item) => item.lineNumber === line.lineNumber && item.id !== activeLineId);
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
            <div className="flex min-w-[260px] items-center gap-2">
              <Select value={sampleId} onValueChange={setSampleId}>
                <SelectTrigger aria-label="Sample scenario">
                  <SelectValue placeholder="Choose sample scenario" />
                </SelectTrigger>
                <SelectContent>
                  {sampleScenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (!confirmProjectReplacement()) return;
                loadSample(sampleId);
                toast.success("Sample project and line list loaded");
              }}
            >
              <DatabaseZap className="h-3.5 w-3.5 mr-1.5" /> Load Scenario
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!confirmProjectReplacement()) return;
                reset();
                toast.success("All fields cleared");
              }}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Eraser className="h-3.5 w-3.5 mr-1.5" /> Clear All Fields
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                saveProject();
                toast.success("Project saved");
              }}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Project
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5 mr-1.5" /> Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              hidden
              aria-label="Import project JSON file"
              onChange={handleImport}
            />
          </div>
          {savedProjects.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" /> Saved Projects ({savedProjects.length})
              </div>
              <div className="space-y-1.5">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(p.savedAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (!confirmProjectReplacement()) return;
                        loadProject(p.id);
                        toast.success("Project loaded");
                      }}
                    >
                      Load
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProject(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                      <span className="sr-only">Delete saved project {p.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListPlus className="h-4 w-4 text-primary" /> Project Line List & Support Index
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputMode("manual")}
              className={`rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                inputMode === "manual"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/20 hover:bg-muted/40"
              }`}
              aria-pressed={inputMode === "manual"}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Keyboard className="h-4 w-4 text-primary" /> Enter manually
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Type or edit a single line, then add it to the project list when ready.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("line-list")}
              className={`rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                inputMode === "line-list"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/20 hover:bg-muted/40"
              }`}
              aria-pressed={inputMode === "line-list"}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ListPlus className="h-4 w-4 text-primary" /> Load from line list
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Import, paste, or select project lines. Repeated line numbers are tracked by
                section.
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={manualDuplicateNeedsSection}
              onClick={() => {
                addCurrentLineToList(manualSectionName);
                toast.success("Current line saved to the project line list");
              }}
            >
              <ListPlus className="h-3.5 w-3.5 mr-1.5" /> Add / Update Current Line
            </Button>
            <Button size="sm" variant="outline" onClick={downloadLineListTemplate}>
              <FileDown className="h-3.5 w-3.5 mr-1.5" /> Export Line List Template
            </Button>
            <Button size="sm" variant="outline" onClick={() => lineListFileRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5 mr-1.5" /> Import Line List CSV
            </Button>
            <input
              ref={lineListFileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              hidden
              aria-label="Import line list CSV or TSV"
              onChange={handleLineListImport}
            />
          </div>

          {inputMode === "manual" && (
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <Field label="Line section / tracking area">
                <Input
                  aria-label="Line section or tracking area"
                  value={manualSectionName}
                  onChange={(e) => {
                    setManualSectionName(e.target.value);
                    setActiveLineSection(e.target.value);
                  }}
                  placeholder="e.g. Pipe rack bay A, Skid module, Pump nozzle area"
                />
              </Field>
              <p className="mt-2 text-xs text-muted-foreground">
                Use this when the same line number appears in multiple physical sections. Supports
                added while this row is active are tied to that section.
              </p>
              {manualDuplicateNeedsSection && (
                <p className="mt-2 text-xs text-warning">
                  This line number already exists. Add a section name before saving another row.
                </p>
              )}
            </div>
          )}

          <div
            className={`grid gap-3 lg:grid-cols-[1fr_240px] ${
              inputMode === "line-list" ? "" : "hidden"
            }`}
          >
            <div className="space-y-2">
              <Label htmlFor="line-list-paste" className="text-xs uppercase text-muted-foreground">
                Paste line list
              </Label>
              <textarea
                id="line-list-paste"
                value={lineListPaste}
                onChange={(e) => setLineListPaste(e.target.value)}
                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Paste CSV or Excel columns: projectName, area, lineNumber, pipeSize, schedule, material, service..."
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => applyLineListText(lineListPaste)}
                disabled={!lineListPaste.trim()}
              >
                <ClipboardPaste className="h-4 w-4" /> Parse pasted line list
              </Button>
            </div>
          </div>

          {lineList.length === 0 ? (
            <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              No project lines yet. Load a sample scenario, add the current line, import a CSV, or
              paste a line list.
            </div>
          ) : (
            <div
              className="overflow-x-auto rounded-md border border-border"
              tabIndex={0}
              aria-label="Project line list with support index"
            >
              <table className="w-full min-w-[900px] text-sm">
                <caption className="sr-only">
                  Project line list. Support count and support tags are tied to the support
                  register.
                </caption>
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {[
                      "Active",
                      "Line",
                      "Section",
                      "Area",
                      "NPS",
                      "Schedule",
                      "Material",
                      "Service",
                      "Supports",
                      "Support tags",
                      "Actions",
                    ].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineList.map((projectLine) => {
                    const sectionSupport = supportIndex.byProjectLineId.get(projectLine.id);
                    const lineLevelSupport = supportIndex.byLineNumber.get(projectLine.lineNumber);
                    const support = sectionSupport ?? lineLevelSupport;
                    const active = projectLine.id === activeLineId;
                    const duplicateCount = duplicateLineNumbers.get(projectLine.lineNumber) ?? 0;
                    return (
                      <tr
                        key={projectLine.id}
                        className={`border-t border-border ${
                          active ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            variant={active ? "secondary" : "outline"}
                            onClick={() => setActiveLine(projectLine.id)}
                            aria-label={`${active ? "Active line" : "Load line"} ${projectLine.lineNumber}`}
                            aria-current={active ? "true" : undefined}
                          >
                            {active ? "Active" : "Load"}
                          </Button>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <button
                            type="button"
                            className="rounded text-left text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => {
                              setActiveLine(projectLine.id);
                              setFocusedLine(projectLine);
                            }}
                          >
                            {projectLine.lineNumber}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <div>{projectLine.sectionName || "-"}</div>
                          {duplicateCount > 1 && (
                            <div className="text-[11px] text-warning">
                              {duplicateCount} sections for this line
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">{projectLine.area}</td>
                        <td className="px-3 py-2">{projectLine.pipeSize}</td>
                        <td className="px-3 py-2">{projectLine.schedule}</td>
                        <td className="px-3 py-2">{projectLine.material}</td>
                        <td className="px-3 py-2">{projectLine.service}</td>
                        <td className="px-3 py-2">{support?.count ?? 0}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {support?.tags.join(", ") || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setActiveLine(projectLine.id);
                                setFocusedLine(projectLine);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              Manage
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProjectLine(projectLine.id)}
                              aria-label={`Remove line ${projectLine.lineNumber}`}
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LineSupportDialog
        line={focusedLine}
        supports={focusedLine ? supportsForLine(focusedLine) : []}
        structures={structures}
        onClose={() => setFocusedLine(null)}
        onLoadLine={(projectLine) => setActiveLine(projectLine.id)}
        onDeleteSupport={removeFromRegister}
        onEditSupport={setEditingSupport}
      />

      {editingSupport && (
        <SupportEditDialog
          entry={editingSupport}
          structures={structures}
          onClose={() => setEditingSupport(null)}
          onSave={(patch) => {
            updateRegisterEntry(editingSupport.id, patch);
            setEditingSupport(null);
            toast.success("Support updated");
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Project Name">
            <Input
              aria-label="Project Name"
              value={line.projectName}
              onChange={(e) => setLine({ projectName: e.target.value })}
              placeholder="e.g. PX Revamp"
            />
          </Field>
          <Field label="Area / Unit">
            <Input
              aria-label="Area or Unit"
              value={line.area}
              onChange={(e) => setLine({ area: e.target.value })}
              placeholder="Unit 200"
            />
          </Field>
          <Field label="Phase">
            <Select value={line.phase} onValueChange={(v) => setLine({ phase: v as never })}>
              <SelectTrigger aria-label="Phase">
                <SelectValue />
              </SelectTrigger>
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
            <Input
              aria-label="Line Number"
              value={line.lineNumber}
              onChange={(e) => setLine({ lineNumber: e.target.value })}
              placeholder='6"-P-1001-A1A'
            />
          </Field>
          <Field label="Pipe Size (NPS)">
            <Select value={line.pipeSize} onValueChange={(value) => setLine({ pipeSize: value })}>
              <SelectTrigger aria-label="Pipe Size NPS">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueOptions(pipeSizeOptions, line.pipeSize).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}"
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Schedule">
            <Select value={line.schedule} onValueChange={(value) => setLine({ schedule: value })}>
              <SelectTrigger aria-label="Schedule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueOptions(scheduleOptions, line.schedule).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Material">
            <Select value={line.material} onValueChange={(value) => setLine({ material: value })}>
              <SelectTrigger aria-label="Material">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueOptions(materialOptions, line.material).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fluid / Service">
            <Input
              aria-label="Fluid or Service"
              value={line.service}
              onChange={(e) => setLine({ service: e.target.value })}
              placeholder="Steam / Hydrocarbon / Pump suction…"
            />
          </Field>
          <Field label="Design Pressure (barg)">
            <Input
              aria-label="Design Pressure in barg"
              value={line.designPressure}
              onChange={(e) => setLine({ designPressure: e.target.value })}
            />
          </Field>
          <Field label="Design Temp (°C)">
            <Input
              aria-label="Design Temperature in degrees Celsius"
              value={line.designTemp}
              onChange={(e) => setLine({ designTemp: e.target.value })}
            />
          </Field>
          <Field label="Operating Temp (°C)">
            <Input
              aria-label="Operating Temperature in degrees Celsius"
              value={line.operatingTemp}
              onChange={(e) => setLine({ operatingTemp: e.target.value })}
            />
          </Field>
          <Field label="Layout">
            <Select value={line.layout} onValueChange={(v) => setLine({ layout: v as never })}>
              <SelectTrigger aria-label="Layout">
                <SelectValue />
              </SelectTrigger>
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
            <Select
              value={line.insulation}
              onValueChange={(v) => setLine({ insulation: v as never })}
            >
              <SelectTrigger aria-label="Insulation">
                <SelectValue />
              </SelectTrigger>
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
            <Input
              aria-label="Insulation Thickness in millimeters"
              value={line.insulationThickness}
              onChange={(e) => setLine({ insulationThickness: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      <FlowFooter
        hint={
          line.projectName
            ? "Project context captured."
            : "Add at least project name and line number."
        }
        primaryDisabled={!(line.projectName && line.lineNumber)}
      />
    </div>
  );
}
