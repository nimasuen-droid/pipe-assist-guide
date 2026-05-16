import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  ListChecks,
  Building2,
  Sparkles,
  Gauge,
} from "lucide-react";
import { FlowFooter } from "@/components/FlowFooter";
import type { LineInput, ProjectLine, SupportRegisterEntry } from "@/lib/types";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review Inputs — Pipe Support Smart Assist" },
      {
        name: "description",
        content:
          "Verify project context, supports and structures before generating the material take-off.",
      },
    ],
  }),
  component: ReviewPage,
});

function StatusRow({
  ok,
  label,
  detail,
  href,
  icon: Icon,
  actionLabel = "Edit",
}: {
  ok: boolean;
  label: string;
  detail: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
      <div className="flex items-start gap-3">
        <div
          className={
            "h-8 w-8 grid place-items-center rounded-md " +
            (ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning")
          }
        >
          {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
            {ok ? (
              <Badge
                variant="outline"
                className="border-success/40 text-success bg-success/10 text-[10px]"
              >
                Ready
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-warning/40 text-warning bg-warning/10 text-[10px]"
              >
                Action needed
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{detail}</p>
        </div>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link to={href}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> {actionLabel}
        </Link>
      </Button>
    </div>
  );
}

function getMaterialContinuityIssues({
  line,
  lineList,
  activeLineId,
  register,
}: {
  line: LineInput;
  lineList: ProjectLine[];
  activeLineId: string | null;
  register: SupportRegisterEntry[];
}) {
  const issues: string[] = [];
  const activeProjectLine = lineList.find((item) => item.id === activeLineId);
  if (
    activeProjectLine &&
    normalizeMaterial(activeProjectLine.material) !== normalizeMaterial(line.material)
  ) {
    issues.push(
      `Active line material (${line.material}) differs from loaded line-list row (${activeProjectLine.material}).`,
    );
  }

  const materialsByLine = new Map<string, Set<string>>();
  lineList.forEach((item) => {
    const key = item.lineNumber.trim();
    if (!key) return;
    const materials = materialsByLine.get(key) ?? new Set<string>();
    materials.add(normalizeMaterial(item.material));
    materialsByLine.set(key, materials);
  });
  materialsByLine.forEach((materials, lineNumber) => {
    if (materials.size > 1) {
      issues.push(`Line ${lineNumber} has multiple materials across line-list sections.`);
    }
  });

  register.forEach((entry) => {
    const reference =
      lineList.find((item) => item.id === entry.projectLineId) ??
      lineList.find((item) => item.lineNumber === entry.lineNumber);
    if (
      reference &&
      normalizeMaterial(reference.material) !== normalizeMaterial(entry.line.material)
    ) {
      issues.push(
        `Support ${entry.tag} stores ${entry.line.material}, but line list has ${reference.material}.`,
      );
    }
  });

  return issues;
}

function normalizeMaterial(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function ReviewPage() {
  const { line, wizard, recommendation, register, structures, lineList, activeLineId } = useApp();

  const ctxOk = Boolean(line.projectName && line.lineNumber && line.pipeSize);
  const wizOk = Boolean(wizard.orientation);
  const recOk = Boolean(recommendation);
  const regOk = register.length > 0;
  const strOk = structures.length > 0;
  const unlinked = register.filter((r) => !r.structureId).length;
  const materialIssues = getMaterialContinuityIssues({ line, lineList, activeLineId, register });
  const materialOk = materialIssues.length === 0;

  const blockers: string[] = [];
  if (!ctxOk) blockers.push("Project context incomplete");
  if (!regOk) blockers.push("No supports added to register from the recommendation page");

  const warnings: string[] = [];
  if (!strOk)
    warnings.push("No structures defined — supports will not be grouped to racks/pedestals.");
  if (unlinked > 0) warnings.push(`${unlinked} support(s) not linked to a structure.`);
  if (!recOk) warnings.push("No recommendation generated yet.");

  materialIssues.forEach((issue) => warnings.push(issue));

  const canGenerate = blockers.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Inputs</h1>
        <p className="text-sm text-muted-foreground">
          Quick check before generating the Material Take-Off. Edit any item below or jump back via
          the stepper above.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase text-muted-foreground">Project / Line</div>
            <div className="text-lg font-semibold mt-0.5 truncate">{line.projectName || "—"}</div>
            <div className="text-xs text-muted-foreground truncate">
              {line.lineNumber || "no line"} · NPS {line.pipeSize}" · {line.material}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase text-muted-foreground">Supports in register</div>
            <div className="text-2xl font-semibold mt-0.5">{register.length}</div>
            <div className="text-xs text-muted-foreground">{unlinked} unlinked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase text-muted-foreground">Structures</div>
            <div className="text-2xl font-semibold mt-0.5">{structures.length}</div>
            <div className="text-xs text-muted-foreground">racks / pedestals / sleepers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase text-muted-foreground">Last recommendation</div>
            <div className="text-lg font-semibold mt-0.5 truncate">
              {recommendation?.primary || "—"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {recommendation?.verdict || "Run the wizard to generate one"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pre-output checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatusRow
            ok={ctxOk}
            label="Project context"
            detail={
              ctxOk
                ? `${line.projectName} · ${line.lineNumber} · ${line.pipeSize}" ${line.material}`
                : "Add project name, line number and pipe size."
            }
            href="/inputs"
            icon={Gauge}
          />
          <StatusRow
            ok={wizOk}
            label="Selection wizard"
            detail={
              wizOk
                ? `${wizard.orientation} · thermal: ${wizard.thermalMovement ? "yes" : "no"} · uplift: ${wizard.upliftPossible ? "yes" : "no"}`
                : "Answer engineering questions to drive selection."
            }
            href="/wizard"
            icon={Sparkles}
          />
          <StatusRow
            ok={regOk}
            label="Support register"
            detail={
              regOk
                ? `${register.length} support(s) recorded${unlinked ? `, ${unlinked} unlinked` : ""}.`
                : "No supports yet — generate a recommendation and add it to the register."
            }
            href={recOk ? "/report" : "/wizard"}
            icon={ListChecks}
            actionLabel={recOk ? "Add support" : "Run wizard"}
          />
          <StatusRow
            ok={strOk && unlinked === 0}
            label="Structures & arrangements"
            detail={
              strOk && unlinked === 0
                ? `${structures.length} structure(s) defined and supports linked.`
                : "Each support should be assigned to a structure or grade pedestal. Use Structure & Linking to edit carriers."
            }
            href="/arrangements"
            icon={Building2}
            actionLabel="Link supports"
          />
          <StatusRow
            ok={materialOk}
            label="Material continuity"
            detail={
              materialOk
                ? "Active line, line list, and registered support snapshots use consistent material records."
                : materialIssues.slice(0, 2).join(" ")
            }
            href="/inputs"
            icon={CheckCircle2}
            actionLabel="Fix inputs"
          />
        </CardContent>
      </Card>

      {(blockers.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          {blockers.map((b) => (
            <div
              key={b}
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm"
            >
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>
                <b>Blocker:</b> {b}
              </span>
            </div>
          ))}
          {warnings.map((w) => (
            <div
              key={w}
              className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm"
            >
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <span>
                <b>Warning:</b> {w}
              </span>
            </div>
          ))}
        </div>
      )}

      <FlowFooter
        primaryDisabled={!canGenerate}
        hint={
          canGenerate
            ? "All required inputs present."
            : recOk
              ? "Open Recommendation and add assigned supports."
              : "Run the wizard, then add supports from Recommendation."
        }
      />
    </div>
  );
}
