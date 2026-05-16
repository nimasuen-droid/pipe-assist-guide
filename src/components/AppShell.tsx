import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  Wrench,
  ListChecks,
  FileBarChart2,
  Boxes,
  Home,
  Gauge,
  Anchor,
  HardHat,
  BookMarked,
  Sparkles,
  BookOpen,
  Info,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  FolderKanban,
  Clock3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { FlowStepper } from "@/components/FlowStepper";
import { isFlowPath } from "@/lib/flow";
import { StartupGate } from "@/components/StartupGate";
import { LocalRecordsBar } from "@/components/LocalRecordsBar";
import { getActiveSavedProject, hasUnsavedProjectChanges } from "@/lib/projectStatus";

const homeNav = [{ to: "/", label: "Home", icon: Home }] as const;

const flowNav = [
  { to: "/inputs", label: "1 - Project Context", icon: Gauge },
  { to: "/wizard", label: "2 - Selection Wizard", icon: Sparkles },
  { to: "/report", label: "3 - Recommendation", icon: FileBarChart2 },
  { to: "/arrangements", label: "4 - Structure & Linking", icon: Building2 },
  { to: "/review", label: "5 - Review Inputs", icon: ClipboardCheck },
  { to: "/register", label: "6 - Support Register", icon: ListChecks },
  { to: "/mto", label: "7 - Material Take-Off", icon: Boxes },
] as const;

const toolsNav = [
  { to: "/standards", label: "Support Standards", icon: Anchor },
  { to: "/codes", label: "Codes & References", icon: BookMarked },
  { to: "/manual", label: "User Manual", icon: BookOpen },
  { to: "/about", label: "About & Releases", icon: Info },
  { to: "/eula", label: "EULA & Disclaimer", icon: HardHat },
] as const;

const mobileNav = [
  { to: "/", label: "Project", icon: Home },
  { to: "/wizard", label: "Wizard", icon: Wrench },
  { to: "/report", label: "Report", icon: FileBarChart2 },
  { to: "/register", label: "Register", icon: ListChecks },
  { to: "/mto", label: "MTO", icon: Boxes },
] as const;

export function AppShell() {
  const loc = useLocation();
  const { line, wizard, lineList, activeLineId, savedProjects, activeProjectId } = useApp();
  const inFlow = isFlowPath(loc.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const pageTitle = [...homeNav, ...flowNav, ...toolsNav].find(
    (item) => item.to === loc.pathname,
  )?.label;

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [loc.pathname]);

  return (
    <StartupGate>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[120] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>

        <header className="sticky top-0 z-30 h-12 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-3 md:px-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Pipe Support Smart Assist home"
          >
            <div className="h-7 w-7 rounded-md bg-primary/15 text-primary grid place-items-center">
              <Anchor className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Pipe Support Smart Assist</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">
                by Lovable Engineering - MSS - ASME B31.3
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden max-w-[34vw] truncate border-primary/40 bg-primary/10 text-[11px] text-primary sm:inline-flex"
              role="status"
              aria-label={`Loaded project ${line.projectName || "not selected"}`}
            >
              <span className="truncate">Project: {line.projectName || "Not selected"}</span>
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary bg-primary/10 text-[11px]"
              aria-live="polite"
              aria-label={`Active line nominal pipe size ${line.pipeSize || "not set"}`}
            >
              Active Line NPS: {line.pipeSize || "-"}"
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          <aside className="hidden md:flex sticky top-12 self-start h-[calc(100vh-3rem)] w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground flex-col">
            <nav className="flex-1 p-2 overflow-y-auto" aria-label="Primary navigation">
              <NavGroup label="Start" items={homeNav} pathname={loc.pathname} />
              <NavGroup label="Workflow" items={flowNav} pathname={loc.pathname} />
              <NavGroup label="Library & Help" items={toolsNav} pathname={loc.pathname} />
            </nav>
            <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
              Decision support tool - v1.0
            </div>
          </aside>

          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            aria-label={pageTitle ? `${pageTitle} page` : "Application content"}
            className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-10 focus:outline-none"
          >
            <div className="mx-auto max-w-[1600px] space-y-6">
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {pageTitle ? `${pageTitle} loaded` : "Page loaded"}
              </div>
              <ProjectStatusBanner
                line={line}
                wizard={wizard}
                lineList={lineList}
                activeLineId={activeLineId}
                savedProjects={savedProjects}
                activeProjectId={activeProjectId}
              />
              {(loc.pathname === "/" || loc.pathname === "/inputs") && <LocalRecordsBar />}
              {inFlow && <FlowStepper />}
              <Outlet />
              <DisclaimerBanner />
            </div>
          </main>
        </div>

        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card"
          aria-label="Mobile primary navigation"
        >
          <div className="grid grid-cols-5">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              const active = loc.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${item.label}${active ? ", current page" : ""}`}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center py-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 mb-0.5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </StartupGate>
  );
}

function ProjectStatusBanner({
  line,
  wizard,
  lineList,
  activeLineId,
  savedProjects,
  activeProjectId,
}: {
  line: ReturnType<typeof useApp.getState>["line"];
  wizard: ReturnType<typeof useApp.getState>["wizard"];
  lineList: ReturnType<typeof useApp.getState>["lineList"];
  activeLineId: ReturnType<typeof useApp.getState>["activeLineId"];
  savedProjects: ReturnType<typeof useApp.getState>["savedProjects"];
  activeProjectId: ReturnType<typeof useApp.getState>["activeProjectId"];
}) {
  const savedProject = getActiveSavedProject(savedProjects, activeProjectId, line.projectName);
  const unsaved = hasUnsavedProjectChanges({
    line,
    wizard,
    lineList,
    activeLineId,
    savedProject,
  });

  return (
    <section
      className="rounded-md border border-primary/30 bg-card p-3 shadow-sm"
      aria-label="Active project"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
            <FolderKanban className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              Loaded project
            </div>
            <h2 className="truncate text-base font-semibold">
              {line.projectName || "No project selected"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {line.lineNumber
                ? `${line.lineNumber} · ${line.area || "Area not set"} · ${line.material || "Material not set"}`
                : "Choose a project on Home or enter project inputs to begin."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={
              savedProject
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning"
            }
          >
            {savedProject ? "Browser saved" : "Working copy"}
          </Badge>
          <Badge
            variant="outline"
            className={
              unsaved
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-success/40 bg-success/10 text-success"
            }
          >
            {unsaved ? "Unsaved changes" : "Saved"}
          </Badge>
          {savedProject && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              {new Date(savedProject.savedAt).toLocaleString()}
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: ReadonlyArray<{
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  pathname: string;
}) {
  return (
    <div className="mb-3">
      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
        {label}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.to === pathname;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <aside
      className="rounded-md border border-warning/40 bg-warning/10 p-3 flex items-start gap-3 text-sm"
      aria-label="Engineering disclaimer"
    >
      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-foreground/90">
        <b>For engineering support only.</b> Final support design shall be reviewed and approved by
        a qualified piping engineer against project specifications, stress analysis, structural
        capacity, applicable codes (ASME B31.3, MSS SP-58/69/89/127, PFI ES-26) and client
        standards. This software is a decision-support tool and does not replace professional
        engineering judgement.
      </p>
    </aside>
  );
}
