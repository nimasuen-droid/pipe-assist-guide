import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { sampleScenarios, useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FLOW_STEPS } from "@/lib/flow";
import {
  confirmBeforeReplacingProject,
  getActiveSavedProject,
  hasUnsavedProjectChanges,
} from "@/lib/projectStatus";
import {
  ArrowRight,
  ShieldCheck,
  BookMarked,
  Anchor,
  Compass,
  Workflow,
  CheckCircle2,
  PlayCircle,
  FileBarChart2,
  Layers,
  AlertTriangle,
  Sparkles,
  Save,
  FolderOpen,
  DatabaseZap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipe Support Smart Assist — Welcome" },
      {
        name: "description",
        content:
          "A guided, code-aware workflow for selecting pipe supports, building the register and generating MTO — from project context to issue-ready output.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const {
    line,
    wizard,
    register,
    recommendation,
    savedProjects,
    activeProjectId,
    lineList,
    activeLineId,
    saveProject,
    loadProject,
    loadSample,
  } = useApp();
  const nav = useNavigate();
  const warnings = recommendation?.riskFlags.length ?? 0;
  const hasSession = Boolean(line.lineNumber) || register.length > 0;
  const activeSavedProject = getActiveSavedProject(
    savedProjects,
    activeProjectId,
    line.projectName,
  );
  const hasUnsavedChanges = hasUnsavedProjectChanges({
    line,
    wizard,
    lineList,
    activeLineId,
    savedProject: activeSavedProject,
  });
  const confirmProjectReplacement = () =>
    confirmBeforeReplacingProject({
      projectName: line.projectName,
      hasUnsavedChanges,
    });
  const resumeStep = !line.lineNumber
    ? FLOW_STEPS[0]
    : !recommendation
      ? FLOW_STEPS[1]
      : register.length === 0
        ? FLOW_STEPS[2]
        : FLOW_STEPS[5];

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Decorative grid + gradient */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 70% 30%, black 40%, transparent 75%)",
          }}
        />
        <div className="relative px-6 md:px-10 py-12 md:py-16 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1.5" /> Decision support · v1.0
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Engineer pipe supports
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                with confidence.
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              A guided, code-aware workflow that takes you from project context to a fully traceable
              support register and material take-off — aligned with ASME B31.3, MSS SP-58/69/89/127
              and PFI ES-26.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {hasSession ? (
                <>
                  <Button size="lg" onClick={() => nav({ to: resumeStep.to })}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Resume — {resumeStep.label}
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => nav({ to: "/inputs" })}>
                    Start new session <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => nav({ to: "/inputs" })}>
                    Begin workflow <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => nav({ to: "/manual" })}>
                    <BookMarked className="mr-2 h-4 w-4" /> Read the manual
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Code-traceable outputs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Markup override mode
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> MTO & register export
              </span>
            </div>
          </div>

          {/* Hero card — session snapshot */}
          <div className="relative">
            <div
              className="rounded-xl border border-primary/30 bg-background/60 backdrop-blur p-5 shadow-2xl"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Compass className="h-3.5 w-3.5 text-primary" /> Session snapshot
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-success/40 text-success bg-success/10"
                >
                  Live
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Active line" value={line.lineNumber || "—"} />
                <Stat label="NPS" value={line.pipeSize ? `${line.pipeSize}"` : "—"} />
                <Stat label="Register" value={String(register.length)} />
                <Stat
                  label="Risk flags"
                  value={warnings ? String(warnings) : "—"}
                  accent={warnings > 0}
                />
              </div>
              <div className="mt-5 rounded-md border border-border bg-muted/40 p-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Every recommendation links back to your inputs, code references and override
                  decisions — ready for engineering review.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="project-selection-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" /> Project selection
            </div>
            <h2
              id="project-selection-heading"
              className="text-2xl font-semibold tracking-tight mt-1"
            >
              Choose the project before entering the workflow.
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              saveProject();
              toast.success("Project saved");
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Current Project
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Saved browser projects</h3>
                <p className="text-xs text-muted-foreground">
                  Loading a different project will first prompt you to save this one.
                </p>
              </div>
              <Badge variant="outline">{savedProjects.length}</Badge>
            </div>
            {savedProjects.length ? (
              <div className="space-y-2">
                {savedProjects.map((project) => {
                  const active = project.id === activeSavedProject?.id;
                  return (
                    <div
                      key={project.id}
                      className={`flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between ${
                        active ? "border-primary bg-primary/10" : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{project.name}</span>
                          {active && <Badge className="text-[10px]">Loaded</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.line.lineNumber || "No line selected"} · saved{" "}
                          {new Date(project.savedAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={active ? "secondary" : "outline"}
                        onClick={() => {
                          if (active) {
                            nav({ to: resumeStep.to });
                            return;
                          }
                          if (!confirmProjectReplacement()) return;
                          loadProject(project.id);
                          toast.success(`Loaded project: ${project.name}`);
                        }}
                      >
                        {active ? "Resume" : "Load"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                No saved browser projects yet. Save the current project or load a sample to create
                one.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Sample project scenarios</h3>
              <p className="text-xs text-muted-foreground">
                Use these to validate workflows or demonstrate common support cases.
              </p>
            </div>
            <div className="space-y-2">
              {sampleScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => {
                    if (!confirmProjectReplacement()) return;
                    loadSample(scenario.id);
                    toast.success(`Loaded sample: ${scenario.name}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-sm transition hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{scenario.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {scenario.line.projectName} · {scenario.line.lineNumber}
                    </span>
                  </span>
                  <DatabaseZap className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW TIMELINE */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5" /> The workflow
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mt-1">
              Seven steps. One source of truth.
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav({ to: "/inputs" })}>
            Jump to Step 1 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {FLOW_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={s.to}
                className="group relative rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-card/80 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-md bg-primary/15 text-primary grid place-items-center group-hover:bg-primary/25 transition">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                    STEP · {String(s.num).padStart(2, "0")}
                  </span>
                </div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.blurb}</div>
                <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="grid gap-4 md:grid-cols-3">
        <Feature
          icon={Sparkles}
          title="Guided selection"
          desc="Plain-English engineering questions drive a defensible support recommendation — no spreadsheet required."
        />
        <Feature
          icon={Layers}
          title="Markup override"
          desc="Working from issued isos or stress markups? Lock the support function and let the app validate hardware."
        />
        <Feature
          icon={FileBarChart2}
          title="Register & MTO"
          desc="Every selection rolls into a project register, then a deterministic MTO ready to export."
        />
      </section>

      {/* CODES STRIP */}
      <section className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <BookMarked className="h-3.5 w-3.5" /> Built on recognised codes & standards
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {[
            "ASME B31.3 — Process Piping",
            "MSS SP-58 — Hangers & Supports",
            "MSS SP-69 — Selection & Application",
            "MSS SP-89 — Fabrication & Installation",
            "MSS SP-127 — Bracing for Piping",
            "PFI ES-26 — Welded Attachments",
            "API 610 / NEMA SM-23 — Nozzle Loads",
            "PIP & Project Standards",
          ].map((s) => (
            <div
              key={s}
              className="rounded-md border border-border bg-background/40 px-3 py-2 flex items-center gap-2"
            >
              <Anchor className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section
        className="relative overflow-hidden rounded-2xl border border-primary/30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="text-primary-foreground">
          <div className="text-xs uppercase tracking-widest opacity-80">Ready to start?</div>
          <div className="text-xl md:text-2xl font-semibold mt-1">
            Set your project context and let the wizard do the heavy lifting.
          </div>
        </div>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => nav({ to: "/inputs" })}
          className="shrink-0"
        >
          Enter Project Inputs <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card/60 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold mt-0.5 ${accent ? "text-warning" : ""}`}>
        {accent && <AlertTriangle className="inline h-4 w-4 mr-1 -mt-0.5" />}
        {value}
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition">
      <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</div>
    </div>
  );
}
