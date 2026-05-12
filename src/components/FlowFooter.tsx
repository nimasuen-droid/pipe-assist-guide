import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNextStep, getPrevStep, isFlowPath } from "@/lib/flow";

interface FlowFooterProps {
  /** Override the next step's label/onClick (e.g. to run a generate action). */
  primaryLabel?: string;
  onPrimary?: () => void;
  /** Set true when the primary action cannot proceed yet. */
  primaryDisabled?: boolean;
  /** Hint shown next to the primary CTA. */
  hint?: string;
  /** Optional secondary action rendered between Prev and Next. */
  secondary?: React.ReactNode;
}

export function FlowFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  hint,
  secondary,
}: FlowFooterProps) {
  const loc = useLocation();
  if (!isFlowPath(loc.pathname)) return null;
  const prev = getPrevStep(loc.pathname);
  const next = getNextStep(loc.pathname);

  return (
    <div className="sticky bottom-0 -mx-4 md:-mx-8 px-4 md:px-8 py-3 border-t border-border bg-card/85 backdrop-blur z-20">
      <div className="mx-auto max-w-[1600px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {prev ? (
            <Button asChild variant="outline" size="sm">
              <Link to={prev.to}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> {prev.label}
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
        <div className="flex items-center gap-3">
          {hint && <span className="text-xs text-muted-foreground hidden sm:block">{hint}</span>}
          {secondary}
          {onPrimary ? (
            <Button size="sm" onClick={onPrimary} disabled={primaryDisabled}>
              {primaryLabel || (next ? `Next: ${next.label}` : "Continue")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : next ? (
            <Button asChild size="sm" disabled={primaryDisabled}>
              <Link to={next.to}>
                {primaryLabel || `Next: ${next.label}`} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
