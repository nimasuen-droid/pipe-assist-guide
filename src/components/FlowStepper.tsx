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
  };

  const currentIdx = FLOW_STEPS.findIndex((s) => s.to === loc.pathname);

  return (
    <nav
      aria-label="Workflow progress"
      className="rounded-lg border border-border bg-card/60 backdrop-blur px-3 py-2.5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Step {currentIdx + 1} of {FLOW_STEPS.length}
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          {FLOW_STEPS[currentIdx]?.blurb}
        </div>
      </div>
      <ol className="flex items-stretch gap-1 overflow-x-auto">
        {FLOW_STEPS.map((step, i) => {
          const status = computeStepStatus(step.id, loc.pathname, state);
          const isLast = i === FLOW_STEPS.length - 1;
          const blocked = status === "blocked";
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex items-center flex-1 min-w-fit">
              <Link
                to={step.to}
                disabled={blocked}
                aria-current={status === "current" ? "step" : undefined}
                onClick={(e) => {
                  if (blocked) e.preventDefault();
                }}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition flex-1",
                  status === "current" && "bg-primary text-primary-foreground shadow-sm",
                  status === "complete" && "text-foreground hover:bg-muted",
                  status === "available" && "text-muted-foreground hover:bg-muted hover:text-foreground",
                  status === "blocked" && "text-muted-foreground/50 cursor-not-allowed",
                )}
                title={blocked ? "Complete previous step first" : step.label}
              >
                <span
                  className={cn(
                    "h-5 w-5 shrink-0 grid place-items-center rounded-full text-[10px] font-semibold",
                    status === "current" && "bg-primary-foreground/20 text-primary-foreground",
                    status === "complete" && "bg-success/20 text-success",
                    status === "available" && "bg-muted text-muted-foreground group-hover:bg-foreground/10",
                    status === "blocked" && "bg-muted/40",
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-3 w-3" />
                  ) : status === "blocked" ? (
                    <Lock className="h-2.5 w-2.5" />
                  ) : (
                    step.num
                  )}
                </span>
                <Icon className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" />
                <span className="whitespace-nowrap">
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{step.short}</span>
                </span>
              </Link>
              {!isLast && (
                <div
                  className={cn(
                    "h-px w-3 shrink-0 mx-0.5",
                    status === "complete" ? "bg-success/40" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}