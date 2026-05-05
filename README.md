# Pipe Support Smart Assist

An engineering decision-support web app that guides piping engineers through pipe support selection, structural arrangement design, support register management, and material take-off (MTO) generation — with explicit traceability to ASME B31.3, MSS SP-58/69/89/127, and PFI ES-26.

- Preview: https://id-preview--5239fe40-a440-445d-b136-d377608e86ce.lovable.app
- Published: https://pipe-assist-guide.lovable.app

---

## What this project is

Pipe support selection during FEED, detailed design and brownfield revamps is repetitive, error-prone and hard to defend in design reviews. This tool turns that workflow into a guided, auditable process:

1. Capture the line design basis (service, P/T, material, insulation, layout, phase).
2. Answer engineering questions in a wizard (orientation, restraints, thermal, vibration, special service, ...).
3. Get a recommended primary support + alternates, with allowed/restrained movements, design checks, follow-up checks, risk flags and code references.
4. Build up a project-wide **Support Register** and **Structure Register**.
5. Auto-generate a screening **MTO / BOM** with de-duplicated structural components.
6. Export reports, register and MTO.

Every output traces back to its inputs and the governing code clause.

## What has been built

### Core flows
- **Project Inputs** (`/inputs`) — design basis form, sample data, save/load, JSON import/export.
- **Selection Wizard** (`/wizard`) — engineering questions feeding the recommendation engine.
- **Recommendation engine** (`src/lib/recommend.ts`) — primary + alternates, verdict (`ACCEPTABLE` / `REVIEW REQUIRED` / `STRESS CHECK REQUIRED` / `NOT RECOMMENDED`), risk flags, design and follow-up checks, code references, learning moment.
- **Report** (`/report`) — printable recommendation summary.

### Registers
- **Support Register** (`/register`)
  - Add supports from a recommendation.
  - Edit a single support or **bulk-edit** a group of supports.
  - Configurable tagging scheme (prefix, line token, padding, start index).
  - Wide layout to fit table content without truncation.
- **Structure Arrangements** (`/arrangements`)
  - Define structures: goal-post, inverted-L, pipe-rack beam, wall bracket, pedestal, existing-steel tie-in.
  - Per-structure: dimensions with formulas, structural MTO, max supports, load class, dynamic flag.
  - **Bidirectional Structure ↔ Support relationship**:
    - Add new support directly to a structure (pre-fills line + structure id).
    - Assign existing supports to a structure.
    - View assigned supports per structure.
    - Counters: `Supports assigned: X / max`, `Structure utilization: X%`.
  - Edit structures inline.

### Support Standards library
- **Support Standards** (`/standards`) — 16 standards across `Rigid / Variable / Constant / Restraint / Guide / Anchor / Special / Structure` categories.
- Editable tag prefixes per standard.
- Each card shows an inline **SVG schematic** (`SupportStandardGraphic`) of the hardware.

### Material Take-Off
- **MTO** (`/mto`) — auto-generated from the register.
  - De-duplicates pipe-rack and shared structure components (counted once per structure).
  - Pipe-contact hardware counted per support.
  - Wide preview / BOM dialogs.

### Reference & governance
- **Codes & References** (`/codes`) — library of supported standards.
- **User Manual** (`/manual`).
- **EULA** (`/eula`) and disclaimer banner.
- **About / Releases** (`/about`).

### Supported codes & standards
- ASME B31.3 — Process Piping
- MSS SP-58 — Hangers & Supports
- MSS SP-69 — Selection & Application
- MSS SP-89 — Fabrication & Installation
- MSS SP-127 — Bracing for Piping
- PFI ES-26 — Welded Attachments
- PIP Standards (where applicable)
- API 610 / NEMA SM-23 — Vendor nozzle allowables

## Goals

- **Defensible by design** — every recommendation cites the inputs and codes that drove it.
- **Fast screening** — produce a credible support strategy + MTO in minutes, not days.
- **Brownfield-aware** — existing-steel tie-in, retrofit phase, structural verification flags.
- **No hidden state** — entire project (line, wizard, register, structures, standards, tagging) is persisted client-side via Zustand and exportable.
- **Engineer-first UI** — dense, table-oriented, printable, consistently tagged.

## Tech stack

- **Framework:** TanStack Start v1 (React 19, file-based routing in `src/routes/`).
- **Build:** Vite 7, deployed to Cloudflare Workers via `@cloudflare/vite-plugin`.
- **UI:** Tailwind CSS v4 (tokens in `src/styles.css`), shadcn/ui (Radix), lucide-react.
- **State:** Zustand with `persist` middleware (`src/lib/store.ts`).
- **Forms / validation:** react-hook-form + zod.
- **Exports:** `jspdf`, `jspdf-autotable`, `xlsx`.
- **Lang:** TypeScript (strict).

## Project structure

```
src/
  routes/                 File-based routes (TanStack Start)
    __root.tsx            Root layout (html/head/body shell)
    index.tsx             Home / dashboard
    inputs.tsx            Project inputs / design basis
    wizard.tsx            Selection wizard
    report.tsx            Recommendation report
    register.tsx          Support register (edit / bulk edit)
    arrangements.tsx      Structure register + Structure-Support links
    standards.tsx         Support Standards library (with SVG graphics)
    mto.tsx               Material Take-Off
    codes.tsx             Codes & references
    manual.tsx            User manual
    eula.tsx              EULA
    about.tsx             About + release notes
  components/
    AppShell.tsx          Top-level layout (max-w 1600)
    SupportStandardGraphic.tsx  Inline SVG schematics per standard
    ui/                   shadcn/ui primitives
  lib/
    store.ts              Zustand store (line, wizard, register, structures, standards, tagging)
    types.ts              Domain types
    recommend.ts          Recommendation engine
    structures.ts         Structure helpers
    mto.ts                MTO generation + de-duplication
    export.ts             PDF / XLSX export
  styles.css              Tailwind v4 tokens (oklch)
  router.tsx              Router config
```

## Getting started

```bash
bun install
bun run dev          # vite dev
bun run build        # production build
bun run lint
bun run format
```

The app runs entirely client-side today — no backend required. State persists in `localStorage` under the key `pipe-support-smart-assist`. Use **Save Project** on `/inputs` to keep multiple named scenarios.

## Where to start as a collaborator

- **Add a new support type:** append to `defaultStandards` in `src/lib/store.ts`, then add a shape in `src/components/SupportStandardGraphic.tsx`.
- **Tune the recommendation logic:** `src/lib/recommend.ts` — pure function over `LineInput + WizardInput`.
- **Change MTO behaviour or de-dup rules:** `src/lib/mto.ts`.
- **Add a new screen:** create `src/routes/<name>.tsx` exporting `Route = createFileRoute("/<name>")(...)`. Routing is auto-generated — do not edit `routeTree.gen.ts`.
- **Design tokens:** edit `src/styles.css` (oklch). Never hardcode colors in components.
- **Domain model changes:** update `src/lib/types.ts` first, then the store, then consumers.

## Conventions

- TypeScript strict mode; every import must resolve.
- File-based routing only (no `src/pages/`).
- Use semantic Tailwind tokens (`bg-card`, `text-muted-foreground`, ...), not raw colors.
- Keep state in the Zustand store; persist by default.
- All recommendations and MTO outputs must remain traceable to inputs.

## Committing to GitHub

This project is built with Lovable and supports two-way GitHub sync. To push the code to a GitHub repository:

1. In the Lovable editor, open **Connectors → GitHub → Connect project**.
2. Authorize the Lovable GitHub App and select the target account / org.
3. Click **Create Repository** in Lovable to push the current code.

Once connected, changes made in Lovable push to GitHub automatically, and commits pushed to GitHub sync back to Lovable.

## Disclaimer

This is a decision-support tool. All outputs must be validated against the latest approved revision of the governing codes and the project's pipe support specification before being used for construction.
