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
  setLine: (p: Partial<LineInput>) => void;
  setWizard: (p: Partial<WizardInput>) => void;
  setRecommendation: (r: SupportRecommendation | null) => void;
  addToRegister: (e: SupportRegisterEntry) => void;
  removeFromRegister: (id: string) => void;
  reset: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      line: defaultLine,
      wizard: defaultWizard,
      recommendation: null,
      register: [],
      setLine: (p) => set((s) => ({ line: { ...s.line, ...p } })),
      setWizard: (p) => set((s) => ({ wizard: { ...s.wizard, ...p } })),
      setRecommendation: (r) => set({ recommendation: r }),
      addToRegister: (e) => set((s) => ({ register: [...s.register, e] })),
      removeFromRegister: (id) =>
        set((s) => ({ register: s.register.filter((x) => x.id !== id) })),
      reset: () =>
        set({ line: defaultLine, wizard: defaultWizard, recommendation: null }),
    }),
    { name: "pipe-support-smart-assist" },
  ),
);