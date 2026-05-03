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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/", label: "Project Inputs", icon: Gauge, alias: "inputs" },
  { to: "/wizard", label: "Selection Wizard", icon: Sparkles },
  { to: "/report", label: "Recommendation", icon: FileBarChart2 },
  { to: "/register", label: "Support Register", icon: ListChecks },
  { to: "/mto", label: "Material Take-Off", icon: Boxes },
  { to: "/codes", label: "Codes & References", icon: BookMarked, locked: true },
  { to: "/eula", label: "Disclaimer", icon: HardHat, locked: true },
] as const;

export function AppShell() {
  const loc = useLocation();
  const { line } = useApp();
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
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground flex-col">
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {nav.map((item, i) => {
              const Icon = item.icon;
              const active =
                (item.to === loc.pathname) ||
                (item.to === "/" && "alias" in item && loc.pathname === "/" && i === 1);
              const locked = "locked" in item && item.locked;
              return (
                <Link
                  key={`${item.label}-${i}`}
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
                  {locked && (
                    <span className="text-[10px] text-muted-foreground">soon</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
            Decision support tool · v1.0
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
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