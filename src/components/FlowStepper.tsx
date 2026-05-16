import { Link, useLocation } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { FLOW_STEPS, computeStepStatus, isFlowPath } from "@/lib/flow";

export function FlowStepper() {
  const loc = useLocation();
  const { line, recommendation, register, structures, wizard } = useApp();

  if (!isFlowPath(loc.pathname)) return null;

  const state = {
    hasContext: Boolean(line.projectName || line.lineNumber || line.pipeSize),
    hasWizard: Boolean(wizard.orientation),
    hasRecommendation: Boolean(recommendation),
    hasRegister: register.length > 0,
    hasStructures: structures.length > 0,
    hasLinkedSupport: register.some((r) => r.structureId),
  };

  const currentIdx = FLOW_STEPS.findIndex((s) => s.to === loc.pathname);
  const currentStep = FLOW_STEPS[currentIdx];
  const progress = ((currentIdx + 1) / FLOW_STEPS.length) * 100;

  return (
    <nav
      aria-label="Workflow progress"
      aria-describedby="workflow-progress-help"
      className="rounded-lg border border-border bg-card/60 backdrop-blur px-3 py-2.5"
    >
      <p id="workflow-progress-help" className="sr-only">
        Workflow steps are links. Blocked steps are skipped until required earlier work is complete.
      </p>
      <div className="flex items-center justify-between mb-2">
        <div
          className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
          aria-live="polite"
        >
          Step {currentIdx + 1} of {FLOW_STEPS.length}
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          {FLOW_STEPS[currentIdx]?.blurb}
        </div>
      </div>
      <div className="sm:hidden" aria-label="Current workflow step">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{currentStep?.label}</div>
            <div className="truncate text-xs text-muted-foreground">{currentStep?.blurb}</div>
          </div>
          <div className="shrink-0 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            {currentIdx + 1}/{FLOW_STEPS.length}
          </div>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Workflow progress"
          aria-valuemin={1}
          aria-valuemax={FLOW_STEPS.length}
          aria-valuenow={currentIdx + 1}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <ol
        className="hidden items-stretch gap-1 overflow-x-auto sm:flex"
        aria-label="Workflow steps"
      >
        {FLOW_STEPS.map((step, i) => {
          const status = computeStepStatus(step.id, loc.pathname, state);
          const isLast = i === FLOW_STEPS.length - 1;
          const blocked = status === "blocked";
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex items-center flex-1 min-w-fit">
              <Link
                to={step.to}
                aria-current={status === "current" ? "step" : undefined}
                aria-disabled={blocked || undefined}
                aria-label={`${step.label}, step ${i + 1} of ${FLOW_STEPS.length}, ${status}`}
                tabIndex={blocked ? -1 : undefined}
                onClick={(e) => {
                  if (blocked) e.preventDefault();
                }}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition flex-1",
                  status === "current" && "bg-primary text-primary-foreground shadow-sm",
                  status === "complete" && "text-foreground hover:bg-muted",
                  status === "available" &&
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                  status === "blocked" && "text-muted-foreground/50 cursor-not-allowed",
                )}
                title={blocked ? "Complete previous step first" : step.label}
              >
                <span
                  className={cn(
                    "h-5 w-5 shrink-0 grid place-items-center rounded-full text-[10px] font-semibold",
                    status === "current" && "bg-primary-foreground/20 text-primary-foreground",
                    status === "complete" && "bg-success/20 text-success",
                    status === "available" &&
                      "bg-muted text-muted-foreground group-hover:bg-foreground/10",
                    status === "blocked" && "bg-muted/40",
                  )}
                  aria-hidden="true"
                >
                  {status === "complete" ? (
                    <Check className="h-3 w-3" />
                  ) : status === "blocked" ? (
                    <Lock className="h-2.5 w-2.5" />
                  ) : (
                    step.num
                  )}
                </span>
                <Icon className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" aria-hidden="true" />
                <span className="whitespace-nowrap">
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{step.short}</span>
                </span>
                <span className="sr-only">{status}</span>
              </Link>
              {!isLast && (
                <div
                  className={cn(
                    "h-px w-3 shrink-0 mx-0.5",
                    status === "complete" ? "bg-success/40" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
