import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/codes")({
  head: () => ({
    meta: [
      { title: "Codes & References — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "Reference codes, standards and engineering practices used by the tool.",
      },
    ],
  }),
  component: CodesPage,
});

const CODES = [
  {
    code: "ASME B31.3",
    title: "Process Piping",
    note: "Governing code for design, fabrication, examination, inspection, and testing of process piping.",
  },
  {
    code: "MSS SP-58",
    title:
      "Pipe Hangers and Supports — Materials, Design, Manufacture, Selection, Application, and Installation",
    note: "Material grades, allowable loads, dimensions for support components.",
  },
  {
    code: "MSS SP-69",
    title: "Pipe Hangers and Supports — Selection and Application",
    note: "Type selection guide (Type 1–59) for service conditions, temperature ranges and orientations.",
  },
  {
    code: "MSS SP-89",
    title: "Pipe Hangers and Supports — Fabrication and Installation Practices",
    note: "Welding, attachment, and field installation tolerances.",
  },
  {
    code: "MSS SP-127",
    title: "Bracing for Piping Systems",
    note: "Seismic and dynamic restraint guidance.",
  },
  {
    code: "PFI ES-26",
    title: "Welded Load-Bearing Attachments to Pressure-Retaining Piping Materials",
    note: "Trunnion, lug, dummy-leg attachment guidance.",
  },
  {
    code: "ASME B16.5 / B16.9",
    title: "Flanges & Wrought Fittings",
    note: "Geometry & ratings for flanged interfaces.",
  },
  {
    code: "ASME Section II-D",
    title: "Material Properties",
    note: "Allowable stresses, modulus, expansion coefficients.",
  },
  {
    code: "API 610 / NEMA SM-23",
    title: "Equipment Nozzle Allowables",
    note: "Pump and turbine nozzle load limits.",
  },
  {
    code: "PIP STS / PIP REIE686",
    title: "Process Industry Practices",
    note: "Industry standard support details (where licensed).",
  },
];

function CodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <BookMarked className="h-7 w-7 text-primary" /> Codes & References
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every recommendation in this tool traces back to one or more of the standards below.
          Always verify against the latest approved revision in your project.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standards Library</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {CODES.map((c) => (
            <div key={c.code} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold text-primary">{c.code}</span>
                <span className="text-sm font-medium">{c.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> External Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a
            className="block text-primary hover:underline"
            href="https://www.asme.org/codes-standards"
            target="_blank"
            rel="noreferrer"
          >
            ASME Codes & Standards →
          </a>
          <a
            className="block text-primary hover:underline"
            href="https://msshq.org/standards"
            target="_blank"
            rel="noreferrer"
          >
            MSS Standards Practices →
          </a>
          <a
            className="block text-primary hover:underline"
            href="https://www.pfi-institute.org/"
            target="_blank"
            rel="noreferrer"
          >
            Pipe Fabrication Institute →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
