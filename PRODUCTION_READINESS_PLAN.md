# Production Readiness Plan

## Executive Summary

Pipe Support Smart Assist is a strong beta-stage engineering workflow app. The main product loop is present: capture line basis, answer support questions, generate a recommendation, add supports to a register, define carrying structures, review readiness, and generate MTO/BOM deliverables.

The first production-hardening pass has now been implemented. The app has a clean security audit, passing build/typecheck/tests, validated project imports, first domain tests, safer CSV-only MTO exports, normalized formatting controls, and a fixed mobile report overflow. Remaining production work is mostly deeper E2E coverage, release governance, accessibility, and engineering SME sign-off.

## Implemented In This Pass

- Removed vulnerable `xlsx` dependency and replaced Excel export with CSV-based MTO/BOM exports.
- Applied `npm audit fix`; `npm audit --audit-level=moderate` now reports zero vulnerabilities.
- Added `typecheck` and `test` scripts.
- Added Vitest and initial domain test coverage for recommendations, MTO generation, structure helpers, and import schemas.
- Added Zod validation for imported project JSON before state mutation.
- Versioned Zustand persisted state for future migrations.
- Fixed the mobile report overflow found in E2E smoke testing.
- Added `.editorconfig` and `.gitattributes` for consistent UTF-8/LF behavior.
- Renamed the package and Cloudflare Worker from starter naming to `pipe-support-smart-assist`.
- Removed known mojibake markers found by source search.

## Evidence From Local Review

Reviewed on May 12, 2026 against the cloned repo at:

`C:\Users\Nosa Imasuen\Documents\Codex\2026-05-12\clone-the-repos-then-understand-the\pipe-assist-guide`

### Commands Run

- `npm install`: completed successfully; updated `package-lock.json` because it was out of sync with `package.json`.
- `npm run build`: passed.
- `npm run lint`: failed due to widespread Prettier/CRLF formatting errors.
- `npm audit --audit-level=moderate`: failed with 2 advisories.
- Headless Edge E2E review via CDP harness: completed with seeded project state.

### E2E Artifacts

Screenshots, findings, and downloaded CSV are in:

`C:\Users\Nosa Imasuen\Documents\Codex\2026-05-12\clone-the-repos-then-understand-the\e2e-output`

Important artifacts:

- `desktop-report.png`
- `desktop-register.png`
- `desktop-arrangements-with-structure.png`
- `desktop-review.png`
- `desktop-mto.png`
- `mobile-report.png`
- `mobile-mto.png`
- `findings.json`
- `downloads\support-register.csv`

## Current Product State

### What Works

- Core routes exist and load: project inputs, wizard, report, structures, review, register, MTO, standards, codes, manual, EULA, about.
- Production build completes.
- Desktop workflow screens are generally coherent and dense enough for engineering use.
- MTO screen successfully shows shared structure MTO and per-support MTO with de-duplication.
- Register CSV export downloaded successfully in the E2E run.
- Mobile navigation switches to a compact top header plus bottom navigation, which is directionally good.
- The app consistently reminds users that outputs require professional engineering review.

### Main Problems Found

- Lint is not passing, so CI cannot safely gate releases yet.
- `npm audit` reports a high-severity unresolved `xlsx` advisory and a moderate `postcss` advisory.
- Many UI strings show encoding/mojibake artifacts such as `Â`, `â€”`, `â†’`, and broken degree symbols.
- The mobile report route overflows horizontally: `scrollWidth 552` vs `clientWidth 390`.
- Some report card content is clipped on mobile, especially long engineering statements and alternate support chips.
- The report page defaults the assigned-structure selector to "No structure assigned" even when the register contains supports already linked to a structure; this can confuse review context.
- Review/readiness flow is useful, but it is not yet a true gated approval workflow.
- Imported JSON is not schema-validated before mutating app state.
- Persisted Zustand state is not explicitly versioned with migrations.
- Engineering recommendations and MTO rules are not covered by automated golden tests.
- Cloudflare worker config still uses starter naming.
- Console review showed hydration mismatch noise in dev. Some of it appears extension-related, but production testing should verify there are no app-caused hydration mismatches.

## Production Readiness Priorities

### P0: Release Blockers

These must be fixed before any production launch.

1. Make quality gates pass
   - Normalize line endings with `.editorconfig`.
   - Decide whether `routeTree.gen.ts` is excluded from lint/format or generated in compliant format.
   - Add scripts:
     - `typecheck`: `tsc --noEmit`
     - `test`: unit test runner
     - `test:e2e`: browser workflow tests
   - CI must pass install, lint, typecheck, unit tests, build, and audit policy.

2. Fix dependency security posture
   - Run a controlled update for the `postcss` advisory.
   - Replace `xlsx` or remove production Excel export until a safe path exists.
   - Preferred production options:
     - CSV-only export for v1.
     - A maintained XLSX writer with no active high advisories.
     - Server-side export in a controlled worker endpoint, if Excel is mandatory.

3. Fix text encoding
   - Replace mojibake artifacts across source and README.
   - Verify PDF, CSV, Excel, print, and UI output all render degree symbols, arrows, multiplication signs, and dashes correctly.
   - Add a text snapshot test for deliverable headings and representative engineering strings.

4. Add domain-rule tests
   - Golden tests for `recommendSupport`.
   - Unit tests for `generateMTO`.
   - Tests for structure MTO de-duplication.
   - Tests for review readiness rules and blockers.

5. Validate all imported and persisted data
   - Use Zod schemas for project import.
   - Reject or quarantine malformed imports.
   - Version persisted localStorage state and add migrations.
   - Add import/export round-trip tests.

## UI and Workflow Review

### Desktop

Desktop is the strongest surface. The dense layout suits engineering users and the stepper/sidebar gives good workflow orientation.

Required improvements:

- The top stepper can become horizontally scroll-heavy; make the active step and next action clearer without relying on horizontal scrolling.
- Report route should show linked structure context when a recommendation/register entry already has structure association.
- Tables are readable on desktop, but production should support sticky headers for large registers and MTOs.
- Long line numbers and service names need tested truncation/tooltip behavior.
- Export buttons should show success/failure feedback, especially for browser-blocked downloads.

### Mobile

Mobile is usable for review, but not yet production-grade for field use.

Required improvements:

- Fix horizontal overflow on `/report`.
- Convert report metadata row into stacked key-value rows on small screens.
- Allow long support names to wrap without pushing the viewport wider.
- Make alternate support chips wrap and truncate safely.
- For MTO/register tables, choose an intentional mobile pattern:
  - card-per-row summary, with details drawer, or
  - horizontal scroll inside a clearly bounded table container.
- Ensure the bottom nav never hides primary footer actions.

### Workflow Understanding

The workflow mostly makes sense:

1. Project Inputs
2. Selection Wizard
3. Recommendation
4. Structure & Linking
5. Review Inputs
6. Support Register
7. Material Take-Off

But there is a conceptual ordering issue: users can define structures before or after adding supports, while the stepper implies one fixed path. Production should clarify this with one of these patterns:

- Recommended path: inputs -> wizard -> report -> register -> structures -> review -> MTO.
- Advanced path: structures can be created early, but assignment happens during report/register review.

The app should make the current data state obvious: recommendation exists, support added, support linked, review passed, deliverables ready.

## Deliverables Review

### Register CSV

CSV export works in the E2E run and downloaded `support-register.csv`.

Production improvements:

- Include project name, export timestamp, app version, and disclaimer header.
- Include structure tag/name and review status in stable columns.
- Add deterministic column ordering tests.
- Confirm CSV encoding is UTF-8 with safe characters for Excel.

### MTO/BOM

The MTO screen is one of the strongest parts of the app. Shared structure quantities are clear on desktop and the warning about combined loads is valuable.

Production improvements:

- Replace or defer Excel export until `xlsx` security is resolved.
- Add export tests for empty MTO, single support, multiple supports on one structure, and multiple structures.
- Add a "basis of estimate" note: screening MTO, not fabrication-ready IFC material list.
- Add units/material assumptions summary.

### PDF Report

The PDF report path exists but needs stronger validation.

Production improvements:

- Add automated PDF smoke test.
- Ensure all symbols and code references render correctly.
- Add revision/version, generated timestamp, project metadata, and disclaimer.
- Consider a "review required" watermark or approval block when verdict is not `ACCEPTABLE`.

## Engineering Best Practices To Add

### Test Architecture

Add a layered test suite:

- Unit tests:
  - recommendation engine
  - MTO generation
  - structure dimension/MTO helpers
  - tag generation
  - schema validation
- Integration tests:
  - persisted state migrations
  - import/export round trips
  - register to MTO aggregation
- E2E tests:
  - sample project happy path
  - manual markup mode
  - mobile report and MTO smoke checks
  - export/download smoke checks

Recommended tool: Playwright, committed as a dev dependency, with trace/screenshots on failure.

### Security and Privacy

- Add Content Security Policy.
- Avoid inline HTML/script patterns where possible.
- Review `window.open`, Blob downloads, and print windows against CSP.
- Document that localStorage contains engineering project data.
- If production data may be sensitive, move to authenticated server persistence with project-level access control.

### Deployment

- Rename `wrangler.jsonc` app name from starter naming to product naming.
- Add preview and production deployment environments.
- Add production smoke test after deployment.
- Add cache/header policy.
- Add error reporting with privacy-safe breadcrumbs.

### Governance

- Add release checklist:
  - engineering SME review
  - QA pass
  - security/dependency audit
  - accessibility pass
  - deployment smoke test
  - known limitations reviewed
- Show app version and build date in About/Releases.
- Tie releases to Git tags.
- Maintain supported-code list separately from code-rule implementation.

## Recommended Milestones

### Milestone 1: Beta Hardening

Goal: make the current app reliable enough for controlled internal testing.

- Fix lint/format.
- Add typecheck and CI.
- Resolve or remove vulnerable Excel export.
- Fix encoding artifacts.
- Add unit tests for recommendation and MTO.
- Fix mobile report overflow.
- Add project import validation.

### Milestone 2: Workflow Confidence

Goal: make users trust the workflow and deliverables.

- Add Playwright E2E happy path.
- Add export smoke tests.
- Improve review gating and state indicators.
- Improve mobile MTO/register presentation.
- Add deliverable metadata and disclaimers.
- Add structured code references.

### Milestone 3: Production Launch

Goal: deploy with operational discipline.

- Add Cloudflare production config and headers.
- Add telemetry/error reporting.
- Add release/version governance.
- Add backup/persistence strategy decision.
- Complete accessibility and keyboard review.
- Run engineering SME sign-off against golden scenarios.

## Acceptance Criteria For Production

Production should not launch until:

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` all pass in CI.
- Security audit has no unresolved high severity production dependency findings.
- E2E tests pass on desktop and mobile viewports.
- No horizontal page overflow exists on mobile except inside intentionally scrollable tables.
- Project import rejects invalid data safely.
- Recommendation and MTO rules have golden test coverage.
- Exports include project metadata, version, timestamp, and disclaimer.
- A qualified engineering reviewer has signed off on supported scenarios and documented limitations.
