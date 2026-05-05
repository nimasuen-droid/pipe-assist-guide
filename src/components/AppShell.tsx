import { Link, Outlet, useLocation } from "@tanstack/react-router";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { FlowStepper } from "@/components/FlowStepper";
import { isFlowPath } from "@/lib/flow";

const flowNav = [
  { to: "/inputs", label: "1 · Project Context", icon: Gauge },
  { to: "/wizard", label: "2 · Selection Wizard", icon: Sparkles },
  { to: "/report", label: "3 · Recommendation", icon: FileBarChart2 },
  { to: "/arrangements", label: "4 · Structure & Linking", icon: Building2 },
  { to: "/review", label: "5 · Review Inputs", icon: ClipboardCheck },
  { to: "/mto", label: "6 · Material Take-Off", icon: Boxes },
] as const;

const dataNav = [
  { to: "/register", label: "Support Register", icon: ListChecks },
] as const;

const toolsNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/standards", label: "Support Standards", icon: Anchor },
  { to: "/codes", label: "Codes & References", icon: BookMarked },
  { to: "/manual", label: "User Manual", icon: BookOpen },
  { to: "/about", label: "About & Releases", icon: Info },
  { to: "/eula", label: "EULA & Disclaimer", icon: HardHat },
] as const;

export function AppShell() {
  const loc = useLocation();
  const { line } = useApp();
  const inFlow = isFlowPath(loc.pathname);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-12 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-3 md:px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 text-primary grid place-items-center">
            <Anchor className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Pipe Support Smart Assist</div>
            <div className="text-[11px] text-muted-foreground hidden sm:block">by Lovable Engineering · MSS · ASME B31.3</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex border-success/40 text-success bg-success/10 text-[11px]">
            Session active
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-[11px]">
            Active Line NPS: {line.pipeSize || "—"}"
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — fixed, does not scroll with main */}
        <aside className="hidden md:flex sticky top-12 self-start h-[calc(100vh-3rem)] w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground flex-col">
          <nav className="flex-1 p-2 overflow-y-auto">
            <NavGroup label="Workflow" items={flowNav} pathname={loc.pathname} />
            <NavGroup label="Data" items={dataNav} pathname={loc.pathname} />
            <NavGroup label="Library & Help" items={toolsNav} pathname={loc.pathname} />
          </nav>
          <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
            Decision support tool · v1.0
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-10">
          <div className="mx-auto max-w-[1600px] space-y-6">
            {inFlow && <FlowStepper />}
            <Outlet />
            <DisclaimerBanner />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card">
        <div className="grid grid-cols-5">
          {[
            { to: "/", label: "Project", icon: Home },
            { to: "/wizard", label: "Wizard", icon: Wrench },
            { to: "/report", label: "Report", icon: FileBarChart2 },
            { to: "/register", label: "Register", icon: ListChecks },
            { to: "/mto", label: "MTO", icon: Boxes },
          ].map((t) => {
            const Icon = t.icon;
            const active = loc.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: ReadonlyArray<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
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
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
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
    <div className="rounded-md border border-warning/40 bg-warning/10 p-3 flex items-start gap-3 text-sm">
      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
      <p className="text-foreground/90">
        <b>For engineering support only.</b> Final support design shall be reviewed and approved by a qualified piping
        engineer against project specifications, stress analysis, structural capacity, applicable codes (ASME B31.3, MSS
        SP-58/69/89/127, PFI ES-26) and client standards. This software is a decision-support tool and does not replace
        professional engineering judgement.
      </p>
    </div>
  );
}