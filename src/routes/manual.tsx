import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FileInput,
  Sparkles,
  FileText,
  ListChecks,
  Building2,
  Library,
  Package,
  Scale,
  Lightbulb,
  AlertTriangle,
  Workflow,
  MonitorDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "User Manual — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "How to use the Pipe Support Smart Assist tool effectively.",
      },
    ],
  }),
  component: ManualPage,
});

function ManualPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" /> How to Use
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          A practical, end-to-end guide to driving Pipe Support Smart Assist — from the design basis
          of a single line to a project-wide support register, structural arrangement and screening
          MTO. Every output is traceable to its inputs and the governing code.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary">ASME B31.3</Badge>
          <Badge variant="secondary">MSS SP-58 / 69 / 89 / 127</Badge>
          <Badge variant="secondary">PFI ES-26</Badge>
        </div>
      </header>

      {/* Quick start */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" /> Quick start (5 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Open{" "}
              <Link to="/inputs" className="text-primary underline">
                Project Inputs
              </Link>{" "}
              → click <em>Load Sample Data</em>.
            </li>
            <li>
              Open{" "}
              <Link to="/wizard" className="text-primary underline">
                Selection Wizard
              </Link>{" "}
              → answer the questions → <em>Generate Recommendation</em>.
            </li>
            <li>
              On{" "}
              <Link to="/report" className="text-primary underline">
                Report
              </Link>
              , review the verdict and click <em>Add to Register</em>.
            </li>
            <li>
              Define the supporting steel on{" "}
              <Link to="/arrangements" className="text-primary underline">
                Structure Arrangements
              </Link>
              .
            </li>
            <li>
              Open{" "}
              <Link to="/mto" className="text-primary underline">
                MTO
              </Link>{" "}
              to see the auto-generated bill of materials.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Separator />

      {[
        {
          icon: FileInput,
          t: "1. Project Inputs — design basis",
          b: (
            <>
              Start at{" "}
              <Link to="/inputs" className="text-primary underline">
                Project Inputs
              </Link>
              . Capture the line design basis: project, area, line number, pipe size, schedule,
              material, service, design &amp; operating temperatures, insulation type/thickness,
              layout (above-ground / pipe-rack / equipment piping / skid) and project phase
              (new-build / brownfield / retrofit).
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <em>Load Sample Data</em> — fills the form with a realistic line so you can
                  explore.
                </li>
                <li>
                  <em>Save Project</em> — keeps multiple named scenarios in your browser.
                </li>
                <li>
                  <em>Export / Import JSON</em> — share a complete design basis with a colleague.
                </li>
              </ul>
              <p className="mt-2">
                All state is persisted locally under <code>pipe-support-smart-assist</code>. Back up
                periodically by exporting JSON.
              </p>
            </>
          ),
        },
        {
          icon: MonitorDown,
          t: "1A. Offline desktop installation",
          b: (
            <>
              Pipe Support Smart Assist can be installed from a supported desktop browser as an
              offline-first app.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Open the app in Chrome or Edge on the computer where it will be used.</li>
                <li>
                  On the Home screen, use <em>Install Desktop App</em>, or choose the browser menu
                  option named <em>Install app</em>.
                </li>
                <li>
                  The installed app opens in its own desktop window and caches the app shell for
                  offline access.
                </li>
                <li>
                  Continue using <em>Save to Local Folder</em> for each project. Offline
                  installation keeps the app available; local project records keep the engineering
                  data recoverable.
                </li>
              </ul>
            </>
          ),
        },
        {
          icon: Sparkles,
          t: "2. Selection Wizard — answer engineering questions",
          b: (
            <>
              The{" "}
              <Link to="/wizard" className="text-primary underline">
                Wizard
              </Link>{" "}
              asks the questions an experienced piping engineer would ask on site:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Geometry:</strong> orientation (horizontal / vertical / sloped / changing
                  direction), and proximity to a nozzle, valve, flange, anchor, bend, branch or
                  expansion loop.
                </li>
                <li>
                  <strong>Movement &amp; loading:</strong> thermal movement, uplift, vibration,
                  vertical adjustability, axial &amp; lateral movement strategy (allow vs restrain).
                </li>
                <li>
                  <strong>Constructability:</strong> permanent vs temporary, welding-to-pipe
                  permitted, special service (cryogenic / hot / sour / corrosive / firewater).
                </li>
              </ul>
              <p className="mt-2">
                Every answer feeds the recommendation engine — there are no hidden defaults.
              </p>
            </>
          ),
        },
        {
          icon: FileText,
          t: "3. Recommendation Report",
          b: (
            <>
              The{" "}
              <Link to="/report" className="text-primary underline">
                Report
              </Link>{" "}
              page returns:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Primary support</strong> + ranked alternates.
                </li>
                <li>
                  <strong>Function</strong> served (weight, guide, anchor, limit-stop, vibration
                  control…).
                </li>
                <li>
                  <strong>Allowed vs restrained</strong> movements.
                </li>
                <li>
                  <strong>Design checks</strong> and <strong>follow-up checks</strong> the engineer
                  must close.
                </li>
                <li>
                  <strong>Code references</strong> for every decision.
                </li>
                <li>
                  <strong>Risk flags</strong> and a short <strong>learning moment</strong>.
                </li>
              </ul>
              <p className="mt-2">Verdict is one of:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge>ACCEPTABLE</Badge>
                <Badge variant="secondary">REVIEW REQUIRED</Badge>
                <Badge variant="secondary">STRESS CHECK REQUIRED</Badge>
                <Badge variant="destructive">NOT RECOMMENDED</Badge>
              </div>
              <p className="mt-2">
                Use <em>Add to Register</em> to push the support into the project register with a
                tag and location.
              </p>
            </>
          ),
        },
        {
          icon: ListChecks,
          t: "4. Support Register",
          b: (
            <>
              The{" "}
              <Link to="/register" className="text-primary underline">
                Support Register
              </Link>{" "}
              is your project-wide list of supports.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Add</strong> from a recommendation, or directly from a structure card.
                </li>
                <li>
                  <strong>Edit</strong> a single support (tag, location, hardware, function,
                  remarks, structural review flag, etc.).
                </li>
                <li>
                  <strong>Bulk-edit</strong> a group of supports — apply the same change (e.g.
                  assign a structure, change load class) across many tags at once.
                </li>
                <li>
                  <strong>Tagging scheme</strong> is configurable: prefix, line token, padding and
                  start index. Tags renumber consistently across the project.
                </li>
                <li>
                  <strong>Export</strong> the register to PDF / XLSX for hand-over to fabrication
                  and construction.
                </li>
              </ul>
            </>
          ),
        },
        {
          icon: Building2,
          t: "5. Structure Arrangements",
          b: (
            <>
              Use{" "}
              <Link to="/arrangements" className="text-primary underline">
                Structure Arrangements
              </Link>{" "}
              to define the supporting steel: goal-post, inverted-L, pipe-rack beam, wall bracket,
              pedestal, or existing-steel tie-in. For each structure you set dimensions (with
              formulas), structural MTO, max supports, load class and dynamic flag.
              <p className="mt-2 font-medium text-foreground">
                Bidirectional Structure ↔ Support relationship
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <em>Add new support to this structure</em> — opens the Add dialog with line and
                  structure pre-filled.
                </li>
                <li>
                  <em>Assign existing support</em> — pick supports already in the register.
                </li>
                <li>
                  <em>View assigned supports</em> — see everything sitting on this structure.
                </li>
                <li>
                  Counters: <strong>Supports assigned: X / max</strong> and{" "}
                  <strong>Structure utilization: X%</strong>.
                </li>
              </ul>
              <p className="mt-2">
                Supports can also be assigned the other way: from the Register, set the structure on
                a support and it appears under that structure here.
              </p>
            </>
          ),
        },
        {
          icon: Library,
          t: "6. Support Standards library",
          b: (
            <>
              <Link to="/standards" className="text-primary underline">
                Support Standards
              </Link>{" "}
              is the reference library of 16 standard supports, grouped into Rigid / Variable /
              Constant / Restraint / Guide / Anchor / Special / Structure. Each card shows an inline{" "}
              <strong>SVG schematic</strong> so the hardware is unambiguous, plus the editable tag
              prefix used by the register.
            </>
          ),
        },
        {
          icon: Package,
          t: "7. Material Take-Off (MTO)",
          b: (
            <>
              <Link to="/mto" className="text-primary underline">
                MTO
              </Link>{" "}
              auto-compiles a screening bill of materials from the register and the structure
              register.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Shared structural components</strong> (rack beams, posts) are counted{" "}
                  <em>once per structure</em>.
                </li>
                <li>
                  <strong>Pipe-contact hardware</strong> (shoes, U-bolts, clamps) is counted{" "}
                  <em>per support</em>.
                </li>
                <li>
                  Items are split into <em>Fabricated</em> and <em>Bought-out</em>, with material,
                  size, qty and remarks.
                </li>
                <li>
                  Use it for early procurement only — final MTO must come from approved isometrics.
                </li>
              </ul>
            </>
          ),
        },
        {
          icon: Scale,
          t: "8. Codes &amp; References",
          b: (
            <>
              <Link to="/codes" className="text-primary underline">
                Codes &amp; References
              </Link>{" "}
              lists the standards the engine cites: ASME B31.3, MSS SP-58/69/89/127, PFI ES-26, PIP
              standards, and vendor allowables (API 610, NEMA SM-23). Use it as your verification
              checklist before issuing a design.
            </>
          ),
        },
      ].map(({ icon: Icon, t, b }) => (
        <Card key={t}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" /> {t}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">{b}</CardContent>
        </Card>
      ))}

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" /> Tips for getting the most out of the tool
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Treat the wizard answers as design intent — change them and re-run to compare
              strategies.
            </li>
            <li>
              Define structures <em>before</em> bulk-adding supports so you can assign as you go.
            </li>
            <li>Use the configurable tagging scheme on day one — renumbering later is a chore.</li>
            <li>Export JSON at every milestone (FEED, IFR, IFC) — it's your audit trail.</li>
            <li>
              Use the SVG graphics on Standards to align with site &amp; fabrication on hardware
              terminology.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" /> Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This is a decision-support tool. All outputs must be validated against the latest approved
          revision of the governing codes and the project's pipe support specification before being
          used for construction.
        </CardContent>
      </Card>
    </div>
  );
}
