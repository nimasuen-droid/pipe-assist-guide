import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LineInput,
  WizardInput,
  SupportRecommendation,
  SupportRegisterEntry,
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
};

interface AppState {
  line: LineInput;
  wizard: WizardInput;
  recommendation: SupportRecommendation | null;
  register: SupportRegisterEntry[];
  savedProjects: { id: string; name: string; savedAt: string; line: LineInput; wizard: WizardInput }[];
  eulaAccepted: boolean;
  tagging: TaggingConfig;
  tagCounter: number;
  setLine: (p: Partial<LineInput>) => void;
  setWizard: (p: Partial<WizardInput>) => void;
  setRecommendation: (r: SupportRecommendation | null) => void;
  addToRegister: (e: SupportRegisterEntry) => void;
  removeFromRegister: (id: string) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadSample: () => void;
  acceptEula: () => void;
  setTagging: (p: Partial<TaggingConfig>) => void;
  resetTagCounter: (n?: number) => void;
  nextTag: () => string;
  previewTag: (n: number) => string;
  reset: () => void;
}

export interface TaggingConfig {
  prefix: string;
  separator: string;
  includeLine: boolean;
  padding: number;
  startIndex: number;
}

const defaultTagging: TaggingConfig = {
  prefix: "SUP",
  separator: "-",
  includeLine: true,
  padding: 3,
  startIndex: 1,
};

function buildTag(t: TaggingConfig, lineNumber: string, n: number) {
  const num = String(n).padStart(t.padding, "0");
  const lineToken = lineNumber.replace(/[^A-Z0-9]/gi, "").slice(0, 8);
  const parts = [t.prefix];
  if (t.includeLine && lineToken) parts.push(lineToken);
  parts.push(num);
  return parts.filter(Boolean).join(t.separator);
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
      savedProjects: [],
      eulaAccepted: false,
      tagging: defaultTagging,
      tagCounter: defaultTagging.startIndex,
      setLine: (p) => set((s) => ({ line: { ...s.line, ...p } })),
      setWizard: (p) => set((s) => ({ wizard: { ...s.wizard, ...p } })),
      setRecommendation: (r) => set({ recommendation: r }),
      addToRegister: (e) => set((s) => ({ register: [...s.register, e] })),
      removeFromRegister: (id) =>
        set((s) => ({ register: s.register.filter((x) => x.id !== id) })),
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
      nextTag: (): string => {
        const { tagging, tagCounter, line } = get();
        const tag = buildTag(tagging, line.lineNumber || "", tagCounter);
        set({ tagCounter: tagCounter + 1 });
        return tag;
      },
      previewTag: (n: number): string => {
        const { tagging, line } = get();
        return buildTag(tagging, line.lineNumber || "", n);
      },
      reset: () =>
        set({ line: defaultLine, wizard: defaultWizard, recommendation: null }),
    }),
    { name: "pipe-support-smart-assist" },
  ),
);