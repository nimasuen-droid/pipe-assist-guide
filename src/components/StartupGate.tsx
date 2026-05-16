import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, FileText, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EulaContent } from "@/components/EulaContent";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface StartupGateProps {
  children: React.ReactNode;
}

const quickStartSteps = [
  {
    title: "Confirm the project context",
    body: "Enter the project, area, line number, pipe size, schedule, material, service and operating basis before using the wizard.",
  },
  {
    title: "Run the selection workflow",
    body: "Use the wizard to describe orientation, nearby features, movement strategy, uplift, vibration and constructability limits.",
  },
  {
    title: "Review the recommendation",
    body: "Check the primary support, alternates, restrained movements, risk flags, learning note and code references before adding it to the register.",
  },
  {
    title: "Build the deliverables",
    body: "Assign supports to structures, review inputs, manage the support register and generate the screening MTO for project review.",
  },
  {
    title: "Save project records locally",
    body: "Choose a local records folder so each project is archived as reloadable app data plus CSV/TXT files that remain readable outside the app.",
  },
];

const manualCards = [
  {
    title: "User manual",
    body: "The manual explains every workflow stage, the expected inputs, how outputs should be reviewed, and where project records are stored.",
    icon: BookOpen,
  },
  {
    title: "Local records",
    body: "Use Save to Local Folder after project setup. The app creates a project folder with app-project.json, line list, support register, MTO and summary files.",
    icon: CheckCircle2,
  },
  {
    title: "Engineering disclaimer",
    body: "The app is decision support only. Final support design still needs qualified engineering review against project specs, stress analysis, structures and applicable codes.",
    icon: ShieldAlert,
  },
  {
    title: "EULA access",
    body: "The full EULA is shown here before first use and remains available later from Library & Help > EULA & Disclaimer.",
    icon: FileText,
  },
];

type StartupTab = "quick" | "manual" | "eula";

export function StartupGate({ children }: StartupGateProps) {
  const { eulaAccepted, acceptEula } = useApp();
  const [tab, setTab] = useState<StartupTab>("quick");
  const [acknowledged, setAcknowledged] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const eulaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eulaAccepted) return;
    dialogRef.current?.focus();
  }, [eulaAccepted]);

  useEffect(() => {
    if (tab !== "eula") return;
    setScrolledToEnd(false);
    window.setTimeout(() => {
      const el = eulaRef.current;
      if (!el || el.scrollHeight <= el.clientHeight + 8) setScrolledToEnd(true);
    }, 0);
  }, [tab]);

  if (eulaAccepted) return <>{children}</>;

  const handleEulaScroll = () => {
    const el = eulaRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledToEnd(true);
    }
  };

  const canAccept = acknowledged && scrolledToEnd;
  const activePanelId = `startup-panel-${tab}`;

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div aria-hidden="true">{children}</div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-3 backdrop-blur-sm md:p-6">
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="startup-gate-title"
          aria-describedby="startup-gate-description"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl focus:outline-none"
        >
          <header className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="startup-gate-title" className="text-base font-semibold">
                Before you continue
              </h2>
              <p
                id="startup-gate-description"
                className="mt-1 text-xs leading-relaxed text-muted-foreground"
              >
                Review the quick how-to-use guide, user manual summary and EULA/disclaimer before
                using Pipe Support Smart Assist.
              </p>
            </div>
          </header>

          <div
            className="grid shrink-0 grid-cols-3 border-b border-border bg-muted/20 p-2"
            role="tablist"
            aria-label="Startup information"
          >
            {[
              { id: "quick" as const, label: "Quick Start", icon: Sparkles },
              { id: "manual" as const, label: "Manual", icon: BookOpen },
              { id: "eula" as const, label: "EULA", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`startup-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  aria-controls={`startup-panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    tab === item.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === "quick" && (
              <div
                id={activePanelId}
                role="tabpanel"
                aria-labelledby="startup-tab-quick"
                className="h-full overflow-y-auto px-4 py-4 sm:px-5"
              >
                <ol className="space-y-3">
                  {quickStartSteps.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-3 rounded-md border border-border bg-background p-3"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tab === "manual" && (
              <div
                id={activePanelId}
                role="tabpanel"
                aria-labelledby="startup-tab-manual"
                className="h-full overflow-y-auto px-4 py-4 sm:px-5"
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {manualCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <article
                        key={card.title}
                        className="rounded-md border border-border bg-background p-3"
                      >
                        <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">{card.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {card.body}
                        </p>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-foreground/90">
                  Keep exported reports, support registers and MTOs as review packages. They are not
                  stamped deliverables and must not replace project approval workflows.
                </div>
              </div>
            )}

            {tab === "eula" && (
              <div
                id={activePanelId}
                role="tabpanel"
                aria-labelledby="startup-tab-eula"
                ref={eulaRef}
                onScroll={handleEulaScroll}
                tabIndex={0}
                aria-label="Scrollable End User License Agreement"
                className="h-full overflow-y-auto px-4 py-4 sm:px-5"
              >
                <EulaContent />
              </div>
            )}
          </div>

          <footer className="shrink-0 space-y-3 border-t border-border px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-foreground">
                <Checkbox
                  aria-describedby="startup-acceptance-help"
                  checked={acknowledged}
                  onCheckedChange={(v) => setAcknowledged(v === true)}
                  className="mt-0.5"
                />
                <span>
                  I understand this is an engineering decision-support tool, and I agree to the End
                  User License Agreement and disclaimer.
                </span>
              </label>
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Button variant="outline" size="sm" onClick={() => setTab("eula")}>
                  View EULA
                </Button>
                <Button
                  size="sm"
                  disabled={!canAccept}
                  onClick={acceptEula}
                  aria-describedby="startup-acceptance-help"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />I Accept
                </Button>
              </div>
            </div>
            {!scrolledToEnd && (
              <p
                id="startup-acceptance-help"
                className="text-[11px] text-muted-foreground"
                aria-live="polite"
              >
                Open the EULA tab and scroll to the end to enable acceptance.
              </p>
            )}
            {scrolledToEnd && (
              <p id="startup-acceptance-help" className="sr-only" aria-live="polite">
                EULA reviewed. Check the acknowledgement box to enable acceptance.
              </p>
            )}
          </footer>
        </section>
      </div>
    </>
  );
}
