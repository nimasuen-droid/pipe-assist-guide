import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "User Manual — Pipe Support Smart Assist" },
      { name: "description", content: "How to use the Pipe Support Smart Assist tool effectively." },
    ],
  }),
  component: ManualPage,
});

function ManualPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" /> User Manual
        </h1>
        <p className="text-sm text-muted-foreground mt-1">A practical guide to driving the tool from input to MTO.</p>
      </div>

      {[
        {
          t: "1. Project Inputs",
          b: "Start at Project Inputs. Capture project, area, line number, pipe size, schedule, material, service, design and operating temperatures, insulation type/thickness, layout (rack/equipment/skid) and project phase (new-build/brownfield/retrofit). Use Load Sample Data to explore the workflow with realistic values.",
        },
        {
          t: "2. Save & Reload",
          b: "Use Save Project to keep multiple line scenarios in your browser. Export JSON to share a complete design basis with a colleague, or Import JSON to bring it back. All data is stored locally — back up regularly.",
        },
        {
          t: "3. Selection Wizard",
          b: "The wizard asks practical engineering questions: orientation, proximity to nozzles/valves/anchors, expected thermal movement, uplift, vibration, axial/lateral movement strategy, vertical adjustability, permanence, weldability, and special service. Every answer feeds the recommendation engine.",
        },
        {
          t: "4. Recommendation",
          b: "You receive a primary support, alternates, the function it serves, why it was selected, allowed/restrained movements, design checks, follow-up checks, references and risk flags. Verdicts: ACCEPTABLE, REVIEW REQUIRED, STRESS CHECK REQUIRED, or NOT RECOMMENDED.",
        },
        {
          t: "5. Support Register",
          b: "Add the recommended support to the project register with a tag and location. The register is your project-wide list of supports — exportable for handover to fabrication and construction.",
        },
        {
          t: "6. Material Take-Off",
          b: "MTO compiles fabricated and bought-out items across the register. Use it as a screening MTO for early procurement; final MTO must come from approved isometrics.",
        },
        {
          t: "7. Codes & References",
          b: "Every recommendation references the underlying standard. Visit Codes & References for the full library and project verification checklist.",
        },
      ].map((s) => (
        <Card key={s.t}>
          <CardHeader className="pb-2"><CardTitle className="text-base">{s.t}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">{s.b}</CardContent>
        </Card>
      ))}
    </div>
  );
}