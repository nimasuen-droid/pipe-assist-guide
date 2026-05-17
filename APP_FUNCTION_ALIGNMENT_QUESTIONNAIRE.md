# Pipe Support Smart Assist - Function Alignment Questionnaire

Use this document to confirm whether the app matches what you are trying to achieve. For each function, read **What the app currently does**, answer the questionnaire, then mark whether there is a deviation.

Suggested scoring:

- **Fits**: Current behavior matches intent.
- **Partial**: Direction is right, but workflow/detail is missing.
- **Deviation**: Current behavior is not what you want.
- **Not needed**: Remove or hide this function.

## 1. Overall Product Goal

**What the app currently does**

Pipe Support Smart Assist is a local, browser-based decision-support workflow for preliminary pipe support selection. It captures project and line data, runs a guided support-selection wizard, produces a support recommendation, requires support-to-structure assignment, builds a support register, runs pre-output checks, and generates preliminary MTO/BOM exports.

**Questions**

| Question                                                                                                                                                                 | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------------- | -------- |
| What is the primary job this app must do for you: support selection, support register, structural grouping, MTO, QA review, or all of them?                              |             |                           |          |
| Who is the primary user: piping designer, piping engineer, stress engineer, structural engineer, material controller, contractor, or project reviewer?                   |             |                           |          |
| Should the app be used for FEED screening, detailed design, construction support, as-built validation, or all stages?                                                    |             |                           |          |
| What deliverable should be considered the final output: support register, MTO, support list by line, structure list, PDF report, CSV package, or project archive folder? |             |                           |          |
| What must never be automated without engineer approval?                                                                                                                  |             |                           |          |

## 2. Startup, EULA, Manual, and User Guidance

**What the app currently does**

On first launch, the app shows a startup gate with quick-start guidance, user manual access, local-records guidance, EULA/disclaimer content, and an acceptance requirement before normal use. The manual is also available from navigation.

**Questions**

| Question                                                                                                       | Your answer | Fit / Partial / Deviation | Priority |
| -------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Is EULA acceptance required for every user, every device, or every project?                                    |             |                           |          |
| Should the quick-start explain the exact project workflow before users enter data?                             |             |                           |          |
| Should the manual be a high-level guide, a detailed procedure, or an engineering standard operating procedure? |             |                           |          |
| Should the disclaimer be shown on every output/export or only in-app?                                          |             |                           |          |
| Is the current wording strong enough that users understand this is not a final engineering approval tool?      |             |                           |          |

## 3. Home Screen and Project Selection

**What the app currently does**

The Home screen shows a product overview, the active project, session snapshot, saved browser projects, sample project scenarios, and entry points into the workflow. The active project is also shown at the top of every screen.

**Questions**

| Question                                                                                        | Your answer | Fit / Partial / Deviation | Priority |
| ----------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Should the Home screen behave mainly as a dashboard, project launcher, or training/sample area? |             |                           |          |
| Should users always select or create a project before entering workflow pages?                  |             |                           |          |
| Should saved projects be browser-local only, folder-based only, or both?                        |             |                           |          |
| What project metadata should be visible at the top of every screen?                             |             |                           |          |
| Should sample projects be visible to production users, or moved behind a demo/training mode?    |             |                           |          |

## 4. Local Project Records and Data Ownership

**What the app currently does**

The app can save project records to a local folder and creates user-readable files plus a reloadable `app-project.json`. It can load a project from the saved project folder by asking the user to select `app-project.json`. It also supports browser-saved projects and JSON import/export.

**Questions**

| Question                                                                                                                                                | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Should every project automatically require a local records folder before work starts?                                                                   |             |                           |          |
| Should users be allowed to continue without choosing a project folder?                                                                                  |             |                           |          |
| What exact files should be written for long-term records: JSON, line list CSV, register CSV, MTO CSV, PDF, summary TXT, screenshots, calculation notes? |             |                           |          |
| Should the app track whether the local folder copy is up to date?                                                                                       |             |                           |          |
| Should project loading be limited to folder archives, or should browser-saved and JSON imports remain available?                                        |             |                           |          |

## 5. Project Inputs

**What the app currently does**

The Inputs page captures project name, area, phase, line number, pipe size, schedule, material, fluid/service, design pressure, design temperature, operating temperature, layout, insulation, and insulation thickness. Pipe size, schedule, and material are dropdowns while preserving imported/custom values.

**Questions**

| Question                                                                                                                                      | Your answer | Fit / Partial / Deviation | Priority |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Are the current input fields enough to make a support selection?                                                                              |             |                           |          |
| Which fields are mandatory before support selection can run?                                                                                  |             |                           |          |
| Should pipe size, schedule, and material be controlled lists only, or should users be allowed to import/customize values?                     |             |                           |          |
| Should the app support metric DN as well as NPS?                                                                                              |             |                           |          |
| Should design code, project support standard, corrosion allowance, pipe spec, insulation density, line class, or stress criticality be added? |             |                           |          |

## 6. Line List Loading and Line-Focused Workflow

**What the app currently does**

Users can enter a line manually, add/update it in the project line list, export a line-list template, import CSV/TSV/TXT, or paste a line list. Repeated line numbers are allowed when assigned to sections such as rack bay, skid, or pump nozzle area. The line list shows active line, section, area, NPS, schedule, material, service, support count, and support tags. Clicking/managing a line opens line-focused support tracking.

**Questions**

| Question                                                                                                                            | Your answer | Fit / Partial / Deviation | Priority |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Should line-list import be the default workflow and manual entry the fallback?                                                      |             |                           |          |
| What columns must exist in the line-list template?                                                                                  |             |                           |          |
| Should repeated line numbers be allowed only with a required section name?                                                          |             |                           |          |
| How should the app warn users that they are loading the same line multiple times intentionally?                                     |             |                           |          |
| Should all supports be created from the active line only, or can users add supports from a separate register view?                  |             |                           |          |
| What line-level summary do you need: support count, support type, support tags, structure tags, MTO status, review status, remarks? |             |                           |          |

## 7. Support Selection Wizard

**What the app currently does**

The Wizard asks for orientation, nearby feature, thermal movement, uplift, vibration, vertical adjustment, axial/lateral movement strategy, permanence, welding permission, and special service. It also supports markup override mode, where the user selects the intended support function and the app validates/recommends hardware. Mobile layout has been simplified with a compact stepper and line summary.

**Questions**

| Question                                                                                                                                                          | Your answer | Fit / Partial / Deviation | Priority |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Does the wizard ask the right engineering questions for your support-selection process?                                                                           |             |                           |          |
| Which questions are missing: pipe stress criticality, nozzle proximity, span, load class, seismic/wind, accessibility, maintenance removal, hot/cold shoe detail? |             |                           |          |
| Should the wizard recommend support function, support hardware, or both?                                                                                          |             |                           |          |
| Should markup override mode be treated as normal workflow or advanced mode?                                                                                       |             |                           |          |
| Should users select multiple support locations along a line in one wizard run?                                                                                    |             |                           |          |
| Should the wizard force structural assignment before a support can enter the register?                                                                            |             |                           |          |

## 8. Recommendation Report and Add-to-Register

**What the app currently does**

The Recommendation page shows primary support, alternates, function, allowed/restrained movement, design checks, follow-up checks, risk flags, code/reference basis, learning notes, and preliminary support MTO. Adding to register opens an assignment workflow so each support is tied to an existing structure, new structure, or grade/pedestal option.

**Questions**

| Question                                                                                                           | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------------- | -------- |
| Does the recommendation output explain enough for an engineer to accept/reject it?                                 |             |                           |          |
| Should the recommendation show calculation assumptions or just engineering rationale?                              |             |                           |          |
| Should alternates be selectable directly from the report?                                                          |             |                           |          |
| When multiple supports are added to one line, should the app ask location/structure for each support individually? |             |                           |          |
| Should unsupported or risky recommendations be blocked from register entry?                                        |             |                           |          |
| What approval status should be stored with each support: draft, reviewed, IFC, hold, rejected?                     |             |                           |          |

## 9. Structures and Support Linking

**What the app currently does**

The Structures page creates structural carriers such as goal post, inverted L, pedestal, pipe rack beam, wall bracket, and existing steel. Users can define dimensions, load class, dynamic/shock service, max supports, area, and preliminary structure MTO. Supports can be added to, assigned to, viewed on, edited from, or removed from structures. A structure can carry multiple supports.

**Questions**

| Question                                                                                           | Your answer | Fit / Partial / Deviation | Priority |
| -------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Is the distinction between pipe support hardware and structural carrier clear enough?              |             |                           |          |
| Should every support be forced to have a structural carrier before entering the register?          |             |                           |          |
| Are the current structure types enough for your projects?                                          |             |                           |          |
| Should structural load class be selected manually, calculated, or imported from structural design? |             |                           |          |
| Should the app estimate steel sizes or only track structure type and MTO placeholders?             |             |                           |          |
| Should existing steel require a mandatory verification flag/comment?                               |             |                           |          |

## 10. Review / System Checks

**What the app currently does**

The Review page checks project context, wizard completion, support register, structure/linking status, and material continuity. It shows blockers and warnings before MTO generation. Material continuity compares active line, line-list rows, repeated sections, and register snapshots.

**Questions**

| Question                                                                                                                                                      | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| What conditions should block MTO generation completely?                                                                                                       |             |                           |          |
| What conditions should be warnings only?                                                                                                                      |             |                           |          |
| Should unlinked supports be blockers or warnings?                                                                                                             |             |                           |          |
| Is material continuity the right check, and what other continuity checks are needed: size, schedule, insulation, line number, service, pressure, temperature? |             |                           |          |
| Should review require a named reviewer, date, and remarks before export?                                                                                      |             |                           |          |
| Should the app generate a formal QA checklist report?                                                                                                         |             |                           |          |

## 11. Support Register

**What the app currently does**

The Register lists saved supports with tag, line, location, type, function, structure assignment, shared structure flag, movement allowed/restrained, insulation, stress review flag, structural review flag, and remarks. Users can select rows, bulk edit, edit individual supports, delete supports, and export CSV.

**Questions**

| Question                                                                                                                                                        | Your answer | Fit / Partial / Deviation | Priority |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Is the register the main deliverable, or just an intermediate step before MTO?                                                                                  |             |                           |          |
| Are the current columns correct for your support index?                                                                                                         |             |                           |          |
| What columns are missing: iso number, support mark-up ID, grid/elevation, stress package, drawing number, revision, hold status, reviewer, construction status? |             |                           |          |
| Should bulk edit allow structure assignment, review flags, remarks, location, and status?                                                                       |             |                           |          |
| Should tags be generated from support type, line number, project standard, or user-defined scheme?                                                              |             |                           |          |
| Should deletion require confirmation or preserve audit history?                                                                                                 |             |                           |          |

## 12. MTO and BOM

**What the app currently does**

The MTO page compiles support hardware and shared structure MTO. Structure components are counted once per structure, while pipe-contact support hardware is counted per support. It shows detailed MTO, structure MTO, summary BOM, preview, print, CSV export, and warnings that quantities are preliminary.

**Questions**

| Question                                                                                                                                        | Your answer | Fit / Partial / Deviation | Priority |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Should the MTO be a preliminary screening MTO or a procurement-ready MTO?                                                                       |             |                           |          |
| Should MTO quantities be generated from support type only, or from detailed dimensions and standard details?                                    |             |                           |          |
| Should shared steel be counted by structure, by line, by area, or by support?                                                                   |             |                           |          |
| What export formats are required: CSV, XLSX, PDF, print, JSON, project folder package?                                                          |             |                           |          |
| Should the MTO include weights, coatings, bolts/nuts/washers, weld length, clamps, plates, shoes, anchors, concrete, galvanizing, paint system? |             |                           |          |
| Should the MTO show source traceability back to line, support tag, structure tag, and recommendation?                                           |             |                           |          |

## 13. Standards, Codes, and Reference Data

**What the app currently does**

The app has a support standards library with standard support types, categories, movement functions, codes, tag prefixes, notes, and graphics. It also has Codes & References pages for standards such as ASME B31.3, MSS SP-58/69/89/127, PFI ES-26, PIP, API 610, and NEMA SM-23.

**Questions**

| Question                                                                             | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------ | ----------- | ------------------------- | -------- |
| Should users be able to edit standards permanently per company/project?              |             |                           |          |
| Should standards be locked for production use?                                       |             |                           |          |
| Are the current support types complete enough?                                       |             |                           |          |
| Should code references include clause-level citations or only standard names?        |             |                           |          |
| Should the app support project-specific support details and client standard numbers? |             |                           |          |

## 14. Deliverables and Records

**What the app currently does**

The app can export JSON, line-list template/data, register CSV, MTO CSV/BOM CSV, printable MTO, and local project archive files. It keeps a browser-local working state and saved projects.

**Questions**

| Question                                                                                         | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------------------ | ----------- | ------------------------- | -------- |
| What deliverable package should a user hand over at the end of a project?                        |             |                           |          |
| Should exports include revision, author, reviewer, date, client, project number, and disclaimer? |             |                           |          |
| Should the app create a single zipped project package?                                           |             |                           |          |
| Should every export be reproducible from `app-project.json`?                                     |             |                           |          |
| Should old revisions be preserved instead of overwritten?                                        |             |                           |          |

## 15. Accessibility, Desktop, and Mobile Experience

**What the app currently does**

The app has skip link, keyboard-focus styling, semantic navigation, mobile bottom navigation, compact mobile wizard stepper, improved touch targets, accessible table captions, reduced-motion handling, and high-contrast/forced-colors CSS support.

**Questions**

| Question                                                                             | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------ | ----------- | ------------------------- | -------- |
| Which device is primary: desktop engineering workstation, tablet, phone, or all?     |             |                           |          |
| Should mobile support full production work or only review/field checks?              |             |                           |          |
| Are tables acceptable on mobile with horizontal scroll, or should they become cards? |             |                           |          |
| Should the app be fully keyboard navigable for all workflows?                        |             |                           |          |
| Are larger text, high contrast, and screen-reader support production requirements?   |             |                           |          |

## 16. Governance, Audit Trail, and Approval

**What the app currently does**

The app stores current state locally and has review flags/remarks, but it does not yet enforce named approvals, immutable history, revision control, or role-based permissions.

**Questions**

| Question                                                                              | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Do you need a formal audit trail of who changed what and when?                        |             |                           |          |
| Should users have roles such as editor, checker, approver, viewer?                    |             |                           |          |
| Should supports have lifecycle statuses: draft, checked, approved, issued, installed? |             |                           |          |
| Should changes after approval require revision bump and reason-for-change?            |             |                           |          |
| Should the app be usable offline only, or eventually sync to a server/database?       |             |                           |          |

## 17. Known Current Boundaries

**What the app currently does not fully do yet**

- It is not a stress analysis package.
- It does not calculate structural member adequacy.
- It does not produce procurement-ready detailed fabrication drawings.
- It does not enforce named reviewer/approver workflows.
- It does not yet maintain immutable revision history.
- It does not yet support multi-user collaboration or server sync.
- It does not yet include full project/client-specific support standard catalogs.

**Questions**

| Question                                                                  | Your answer | Fit / Partial / Deviation | Priority |
| ------------------------------------------------------------------------- | ----------- | ------------------------- | -------- |
| Which of these boundaries are acceptable for v1?                          |             |                           |          |
| Which boundary must be removed before production use?                     |             |                           |          |
| Which function should remain explicitly outside the app's responsibility? |             |                           |          |
| What is the minimum production-ready scope for your first release?        |             |                           |          |

## 18. Final Alignment Summary

After answering the sections above, complete this summary.

| Summary item                                            | Your answer |
| ------------------------------------------------------- | ----------- |
| The app's primary purpose should be                     |             |
| The most important user workflow is                     |             |
| The current app matches intent in these areas           |             |
| The largest deviations are                              |             |
| Functions to remove or hide                             |             |
| Functions to add before production                      |             |
| Required deliverables for v1                            |             |
| Required approvals/checks for v1                        |             |
| Release decision: ready / not ready / ready with limits |             |
