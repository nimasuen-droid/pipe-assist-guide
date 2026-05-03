import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, Sparkles, Bug, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Releases — Pipe Support Smart Assist" },
      { name: "description", content: "About the tool, version history, and release notes." },
    ],
  }),
  component: AboutPage,
});

const RELEASES = [
  {
    v: "1.0.0",
    date: "2026-05-03",
    icon: Sparkles,
    type: "Initial Release",
    notes: [
      "Engineering decision wizard for pipe support selection",
      "Project Inputs with sample data, save/load, JSON import/export",
      "Recommendation engine with verdicts, risk flags and code references",
      "Support register and screening MTO",
      "Codes & References library (ASME B31.3, MSS SP-58/69/89/127, PFI ES-26)",
      "EULA, disclaimer banner and user manual",
    ],
  },
];

function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Anchor className="h-7 w-7 text-primary" /> About
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Pipe Support Smart Assist · Engineering decision-support tool</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">What it does</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Pipe Support Smart Assist guides piping engineers through pipe support selection with explicit traceability to ASME B31.3 and MSS standards. It is purpose-built for fast, defensible screening during FEED, detailed design and brownfield revamps.
          </p>
          <p>
            Outputs include a primary recommendation, alternates, design and follow-up checks, allowed/restrained movements, risk flags and a project-level register and MTO.
          </p>
          <p>
            See the <Link to="/manual" className="text-primary hover:underline">User Manual</Link>, the <Link to="/codes" className="text-primary hover:underline">Codes & References</Link>, and the <Link to="/eula" className="text-primary hover:underline">EULA</Link>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Release Notes</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {RELEASES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.v} className="border-l-2 border-primary/40 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">v{r.v}</Badge>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <span className="text-xs flex items-center gap-1 text-foreground/80"><Icon className="h-3 w-3" /> {r.type}</span>
                </div>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {r.notes.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bug className="h-4 w-4" /> Feedback</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Report defects, request dataset updates or send feedback through your project channel. Always validate outputs against the latest approved revision of governing codes.
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Zap className="h-3 w-3" /> Built with Lovable Engineering
      </div>
    </div>
  );
}