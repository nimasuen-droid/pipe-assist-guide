import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LineInput,
  WizardInput,
  SupportRecommendation,
  SupportRegisterEntry,
  Structure,
} from "./types";

const defaultLine: LineInput = {
  projectName: "",
  area: "",
  lineNumber: "",
  pipeSize: "6",
  schedule: "STD",
  material: "CS A106 Gr.B",
  service: "",
  designPressure: "10",
  designTemp: "150",
  operatingTemp: "120",
  insulation: "none",
  insulationThickness: "50",
  layout: "pipe-rack",
  phase: "new-build",
};

const defaultWizard: WizardInput = {
  orientation: "horizontal",
  nearFeature: "none",
  thermalMovement: true,
  upliftPossible: false,
  vibration: false,
  axialMovement: "allow",
  lateralMovement: "allow",
  verticalAdjustment: false,
  permanent: true,
  weldingAllowed: true,
  specialService: "none",
  overrideMode: false,
  manualFunction: "rest",
};

interface AppState {
  line: LineInput;
  wizard: WizardInput;
  recommendation: SupportRecommendation | null;
  register: SupportRegisterEntry[];
  structures: Structure[];
  savedProjects: { id: string; name: string; savedAt: string; line: LineInput; wizard: WizardInput }[];
  eulaAccepted: boolean;
  tagging: TaggingConfig;
  tagCounter: number;
  standards: SupportStandard[];
  setLine: (p: Partial<LineInput>) => void;
  setWizard: (p: Partial<WizardInput>) => void;
  setRecommendation: (r: SupportRecommendation | null) => void;
  addToRegister: (e: SupportRegisterEntry) => void;
  removeFromRegister: (id: string) => void;
  updateRegisterEntry: (id: string, p: Partial<SupportRegisterEntry>) => void;
  bulkUpdateRegister: (ids: string[], p: Partial<SupportRegisterEntry>) => void;
  addStructure: (s: Structure) => void;
  updateStructure: (id: string, p: Partial<Structure>) => void;
  removeStructure: (id: string) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadSample: () => void;
  acceptEula: () => void;
  setTagging: (p: Partial<TaggingConfig>) => void;
  resetTagCounter: (n?: number) => void;
  nextTag: (supportType?: string) => string;
  previewTag: (n: number, supportType?: string) => string;
  updateStandard: (id: string, p: Partial<SupportStandard>) => void;
  resetStandards: () => void;
  reset: () => void;
}

export interface TaggingConfig {
  prefix: string;
  separator: string;
  includeLine: boolean;
  padding: number;
  startIndex: number;
}

export interface SupportStandard {
  id: string;
  name: string;
  category: "Rigid" | "Variable" | "Constant" | "Restraint" | "Guide" | "Anchor" | "Special" | "Structure";
  function: string;
  typicalUse: string;
  movementAllowed: string[];
  movementRestrained: string[];
  codes: string[];
  tagPrefix: string; // editable
  notes: string;
}

const defaultStandards: SupportStandard[] = [
  {
    id: "rest-shoe",
    name: "Pipe Shoe (Resting)",
    category: "Rigid",
    function: "Vertical load transfer; allows axial & lateral sliding",
    typicalUse: "Horizontal lines on pipe rack / sleeper",
    movementAllowed: ["Axial", "Lateral"],
    movementRestrained: ["Vertical (down)"],
    codes: ["MSS SP-58 Type 36", "PFI ES-26"],
    tagPrefix: "RS",
    notes: "T-shoe or rectangular shoe; height suits insulation thickness.",
  },
  {
    id: "guide",
    name: "Pipe Guide",
    category: "Guide",
    function: "Restrains lateral movement; allows axial movement",
    typicalUse: "Long straight runs, near expansion loops",
    movementAllowed: ["Axial"],
    movementRestrained: ["Lateral"],
    codes: ["MSS SP-58 Type 35", "ASME B31.3"],
    tagPrefix: "GD",
    notes: "Maintain clearance for thermal growth in axial direction.",
  },
  {
    id: "anchor",
    name: "Anchor",
    category: "Anchor",
    function: "Restrains all six DoF",
    typicalUse: "Loop midpoints, equipment isolation",
    movementAllowed: [],
    movementRestrained: ["Axial", "Lateral", "Vertical", "Rotational"],
    codes: ["MSS SP-58", "ASME B31.3"],
    tagPrefix: "AN",
    notes: "Requires structural and stress verification.",
  },
  {
    id: "ubolt",
    name: "U-Bolt",
    category: "Restraint",
    function: "Two-direction restraint (lateral + vertical up)",
    typicalUse: "Small-bore lines, uplift restraint",
    movementAllowed: ["Axial"],
    movementRestrained: ["Lateral", "Vertical (up)"],
    codes: ["MSS SP-58 Type 24"],
    tagPrefix: "UB",
    notes: "Avoid on hot insulated lines without saddle.",
  },
  {
    id: "clamp",
    name: "Riser / Pipe Clamp",
    category: "Rigid",
    function: "Vertical pipe weight support",
    typicalUse: "Vertical risers",
    movementAllowed: [],
    movementRestrained: ["Vertical (down)"],
    codes: ["MSS SP-58 Type 8"],
    tagPrefix: "CL",
    notes: "Use lugs welded to pipe for hot service.",
  },
  {
    id: "trunnion",
    name: "Trunnion (Dummy Leg)",
    category: "Rigid",
    function: "Off-elbow vertical support",
    typicalUse: "Elbows, corners with insulation",
    movementAllowed: ["Axial (small)"],
    movementRestrained: ["Vertical"],
    codes: ["MSS SP-58", "PFI ES-26"],
    tagPrefix: "TR",
    notes: "Stress check required at elbow attachment.",
  },
  {
    id: "spring-variable",
    name: "Variable Spring Hanger",
    category: "Variable",
    function: "Supports weight while allowing thermal vertical movement",
    typicalUse: "Hot lines with vertical thermal growth",
    movementAllowed: ["Vertical"],
    movementRestrained: [],
    codes: ["MSS SP-58 Type 51-59", "MSS SP-69"],
    tagPrefix: "VS",
    notes: "Acceptable load variation typically <25%.",
  },
  {
    id: "spring-constant",
    name: "Constant Spring Hanger",
    category: "Constant",
    function: "Constant load through full vertical travel",
    typicalUse: "Critical hot lines, equipment nozzle relief",
    movementAllowed: ["Vertical (large)"],
    movementRestrained: [],
    codes: ["MSS SP-58 Type 55", "MSS SP-69"],
    tagPrefix: "CS",
    notes: "Use when load variation >25% or near sensitive nozzles.",
  },
  {
    id: "snubber",
    name: "Hydraulic / Mechanical Snubber",
    category: "Special",
    function: "Restrains dynamic/shock loads, allows thermal motion",
    typicalUse: "Seismic, water hammer, slug flow",
    movementAllowed: ["Slow thermal"],
    movementRestrained: ["Dynamic / shock"],
    codes: ["MSS SP-58", "ASME B31.3 Appendix S"],
    tagPrefix: "SN",
    notes: "Periodic functional testing required.",
  },
  {
    id: "slide-plate",
    name: "Low-Friction Slide Plate (PTFE/Graphite)",
    category: "Rigid",
    function: "Reduces friction at sliding shoe interface",
    typicalUse: "High thermal movement, hot lines on rack",
    movementAllowed: ["Axial", "Lateral"],
    movementRestrained: ["Vertical (down)"],
    codes: ["MSS SP-58", "PFI ES-26"],
    tagPrefix: "SP",
    notes: "Reduces friction coefficient to ~0.10–0.15.",
  },
  // ── Structural arrangements (carry hardware; not pipe support hardware themselves) ──
  {
    id: "str-rack-beam",
    name: "Pipe Rack Beam",
    category: "Structure",
    function: "Primary horizontal steel carrying multiple pipes on a rack tier",
    typicalUse: "Main process pipe racks, sleepers",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["AISC 360", "PIP STE05121"],
    tagPrefix: "RB",
    notes: "Structural member, not pipe hardware. Sized by structural design.",
  },
  {
    id: "str-goal-post",
    name: "Goal Post (Portal Frame)",
    category: "Structure",
    function: "Two vertical posts + top beam carrying single pipe or small group",
    typicalUse: "Standalone runs, road crossings, rack extensions",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["AISC 360", "PIP STE05121"],
    tagPrefix: "GP",
    notes: "Carries pipe support hardware (shoe, guide, U-bolt). Final size per structural design.",
  },
  {
    id: "str-inverted-l",
    name: "Inverted L Cantilever",
    category: "Structure",
    function: "Vertical post (or column tie-in) with cantilever beam supporting pipe",
    typicalUse: "Single pipes off existing column/wall, tight corridors",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["AISC 360", "PIP STE05121"],
    tagPrefix: "IL",
    notes: "Cantilever deflection and connection moment govern design.",
  },
  {
    id: "str-wall-bracket",
    name: "Wall Bracket",
    category: "Structure",
    function: "Bracket fixed to wall/structure carrying pipe hardware",
    typicalUse: "Building penetrations, utility runs along walls",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["AISC 360"],
    tagPrefix: "WB",
    notes: "Verify wall capacity and anchor pull-out.",
  },
  {
    id: "str-existing-steel",
    name: "Existing Steel Tie-In",
    category: "Structure",
    function: "Reuse of existing structural member to carry new pipe hardware",
    typicalUse: "Brownfield, retrofit additions",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["AISC 360", "Owner brownfield procedure"],
    tagPrefix: "EX",
    notes: "Requires structural verification of spare capacity before tie-in.",
  },
  {
    id: "str-pedestal",
    name: "Ground-Mounted Pedestal",
    category: "Structure",
    function: "Concrete or steel pedestal from grade carrying low-elevation pipe",
    typicalUse: "Sleeper alternatives, isolated runs at low elevation",
    movementAllowed: [],
    movementRestrained: [],
    codes: ["ACI 318", "AISC 360"],
    tagPrefix: "PD",
    notes: "Foundation design and settlement check required.",
  },
];

const defaultTagging: TaggingConfig = {
  prefix: "SUP",
  separator: "-",
  includeLine: true,
  padding: 3,
  startIndex: 1,
};

function buildTag(t: TaggingConfig, lineNumber: string, n: number, prefixOverride?: string) {
  const num = String(n).padStart(t.padding, "0");
  const lineToken = lineNumber.replace(/[^A-Z0-9]/gi, "").slice(0, 8);
  const parts = [prefixOverride || t.prefix];
  if (t.includeLine && lineToken) parts.push(lineToken);
  parts.push(num);
  return parts.filter(Boolean).join(t.separator);
}

function resolveTypePrefix(standards: SupportStandard[], supportType?: string): string | undefined {
  if (!supportType) return undefined;
  const t = supportType.toLowerCase();
  // Direct keyword map for common recommendation phrasings not exactly matching standard names
  const aliases: { match: RegExp; id: string }[] = [
    { match: /constant\s*spring/, id: "spring-constant" },
    { match: /variable\s*spring|spring\s*hanger/, id: "spring-variable" },
    { match: /u-?bolt/, id: "ubolt" },
    { match: /guide/, id: "guide" },
    { match: /anchor/, id: "anchor" },
    { match: /snubber|vibration/, id: "snubber" },
    { match: /trunnion|dummy\s*leg/, id: "trunnion" },
    { match: /riser|hold-?down|clamp/, id: "clamp" },
    { match: /slide\s*plate|ptfe|graphite/, id: "slide-plate" },
    { match: /shoe|rest/, id: "rest-shoe" },
    { match: /stop/, id: "anchor" },
  ];
  for (const a of aliases) {
    if (a.match.test(t)) {
      const std = standards.find((s) => s.id === a.id);
      if (std?.tagPrefix) return std.tagPrefix;
    }
  }
  // Fallback: substring match against standard names
  const std = standards.find((s) => t.includes(s.name.toLowerCase()));
  return std?.tagPrefix;
}

const sampleLine: LineInput = {
  projectName: "PX Revamp Phase 2",
  area: "Unit 200 — Aromatics",
  lineNumber: "8\"-P-2104-A1A-H",
  pipeSize: "8",
  schedule: "40",
  material: "CS A106 Gr.B",
  service: "HP Steam, 42 barg",
  designPressure: "46",
  designTemp: "385",
  operatingTemp: "360",
  insulation: "hot",
  insulationThickness: "100",
  layout: "pipe-rack",
  phase: "brownfield",
};

const sampleWizard: WizardInput = {
  orientation: "horizontal",
  nearFeature: "expansion-loop",
  thermalMovement: true,
  upliftPossible: false,
  vibration: false,
  axialMovement: "allow",
  lateralMovement: "restrain",
  verticalAdjustment: true,
  permanent: true,
  weldingAllowed: true,
  specialService: "hot",
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      line: defaultLine,
      wizard: defaultWizard,
      recommendation: null,
      register: [],
      structures: [],
      savedProjects: [],
      eulaAccepted: false,
      tagging: defaultTagging,
      tagCounter: defaultTagging.startIndex,
      standards: defaultStandards,
      setLine: (p) => set((s) => ({ line: { ...s.line, ...p } })),
      setWizard: (p) => set((s) => ({ wizard: { ...s.wizard, ...p } })),
      setRecommendation: (r) => set({ recommendation: r }),
      addToRegister: (e) => set((s) => ({ register: [...s.register, e] })),
      removeFromRegister: (id) =>
        set((s) => ({ register: s.register.filter((x) => x.id !== id) })),
      updateRegisterEntry: (id, p) =>
        set((s) => ({ register: s.register.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      bulkUpdateRegister: (ids, p) =>
        set((s) => {
          const idSet = new Set(ids);
          return { register: s.register.map((x) => (idSet.has(x.id) ? { ...x, ...p } : x)) };
        }),
      addStructure: (st) => set((s) => ({ structures: [...s.structures, st] })),
      updateStructure: (id, p) =>
        set((s) => ({ structures: s.structures.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      removeStructure: (id) =>
        set((s) => ({
          structures: s.structures.filter((x) => x.id !== id),
          // detach any supports that pointed to this structure
          register: s.register.map((r) => (r.structureId === id ? { ...r, structureId: undefined } : r)),
        })),
      saveProject: () =>
        set((s) => ({
          savedProjects: [
            ...s.savedProjects.filter((p) => p.name !== (s.line.projectName || "Untitled")),
            {
              id: crypto.randomUUID(),
              name: s.line.projectName || "Untitled",
              savedAt: new Date().toISOString(),
              line: s.line,
              wizard: s.wizard,
            },
          ],
        })),
      loadProject: (id) =>
        set((s) => {
          const p = s.savedProjects.find((x) => x.id === id);
          return p ? { line: p.line, wizard: p.wizard } : {};
        }),
      deleteProject: (id) =>
        set((s) => ({ savedProjects: s.savedProjects.filter((p) => p.id !== id) })),
      loadSample: () => set({ line: sampleLine, wizard: sampleWizard }),
      acceptEula: () => set({ eulaAccepted: true }),
      setTagging: (p) =>
        set((s) => {
          const tagging = { ...s.tagging, ...p };
          // if startIndex changed and counter is below it, lift counter
          const tagCounter =
            "startIndex" in p && (p.startIndex ?? 0) > s.tagCounter ? (p.startIndex as number) : s.tagCounter;
          return { tagging, tagCounter };
        }),
      resetTagCounter: (n) => set((s) => ({ tagCounter: n ?? s.tagging.startIndex })),
      nextTag: (supportType?: string): string => {
        const { tagging, tagCounter, line, standards } = get();
        const prefix = resolveTypePrefix(standards, supportType);
        const tag = buildTag(tagging, line.lineNumber || "", tagCounter, prefix);
        set({ tagCounter: tagCounter + 1 });
        return tag;
      },
      previewTag: (n: number, supportType?: string): string => {
        const { tagging, line, standards } = get();
        const prefix = resolveTypePrefix(standards, supportType);
        return buildTag(tagging, line.lineNumber || "", n, prefix);
      },
      updateStandard: (id, p) =>
        set((s) => ({
          standards: s.standards.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      resetStandards: () => set({ standards: defaultStandards }),
      reset: () =>
        set({ line: defaultLine, wizard: defaultWizard, recommendation: null }),
    }),
    { name: "pipe-support-smart-assist" },
  ),
);