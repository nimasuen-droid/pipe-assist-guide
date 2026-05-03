import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Wrench, ListChecks, FileBarChart2, Boxes, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Project", icon: Home },
  { to: "/wizard", label: "Wizard", icon: Wrench },
  { to: "/report", label: "Report", icon: FileBarChart2 },
  { to: "/register", label: "Register", icon: ListChecks },
  { to: "/mto", label: "MTO", icon: Boxes },
] as const;

export function AppShell() {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--gradient-hero)] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary-foreground/15 grid place-items-center">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Pipe Support Smart Assist</div>
              <div className="text-xs opacity-80">Engineering decision support · MSS · ASME B31.3</div>
            </div>
          </Link>
          <nav className="hidden md:flex gap-1">
            {tabs.map((t) => {
              const active = loc.pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition",
                    active
                      ? "bg-primary-foreground/20"
                      : "hover:bg-primary-foreground/10 opacity-90",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card">
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = loc.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <footer className="hidden md:block border-t border-border py-4 text-center text-xs text-muted-foreground">
        Decision support tool — final support design must be verified against project specs, stress analysis & applicable codes.
      </footer>
    </div>
  );
}