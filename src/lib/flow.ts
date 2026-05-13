import type { LucideIcon } from "lucide-react";
import {
  Gauge,
  Sparkles,
  FileBarChart2,
  Building2,
  ClipboardCheck,
  Boxes,
  ListChecks,
} from "lucide-react";

export interface FlowStep {
  id: string;
  num: number;
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
  blurb: string;
}

export const FLOW_STEPS: FlowStep[] = [
  {
    id: "context",
    num: 1,
    to: "/inputs",
    label: "Project Context",
    short: "Context",
    icon: Gauge,
    blurb: "Define project, line and area data.",
  },
  {
    id: "select",
    num: 2,
    to: "/wizard",
    label: "Support Selection",
    short: "Select",
    icon: Sparkles,
    blurb: "Answer engineering questions to drive selection.",
  },
  {
    id: "recommend",
    num: 3,
    to: "/report",
    label: "Recommendation",
    short: "Recommend",
    icon: FileBarChart2,
    blurb: "Review the recommended support and add to register.",
  },
  {
    id: "structure",
    num: 4,
    to: "/arrangements",
    label: "Structure & Linking",
    short: "Structure",
    icon: Building2,
    blurb: "Place structures and link supports to them.",
  },
  {
    id: "review",
    num: 5,
    to: "/review",
    label: "Review Inputs",
    short: "Review",
    icon: ClipboardCheck,
    blurb: "Verify everything before generating MTO.",
  },
  {
    id: "register",
    num: 6,
    to: "/register",
    label: "Support Register",
    short: "Register",
    icon: ListChecks,
    blurb: "Confirm the project support register before MTO.",
  },
  {
    id: "output",
    num: 7,
    to: "/mto",
    label: "Material Take-Off",
    short: "Output",
    icon: Boxes,
    blurb: "Generate, export and save the final output.",
  },
];

export const FLOW_PATHS = FLOW_STEPS.map((s) => s.to);

export function isFlowPath(pathname: string): boolean {
  return FLOW_PATHS.includes(pathname);
}

export function getStepByPath(pathname: string): FlowStep | undefined {
  return FLOW_STEPS.find((s) => s.to === pathname);
}

export function getStepIndex(pathname: string): number {
  return FLOW_STEPS.findIndex((s) => s.to === pathname);
}

export function getNextStep(pathname: string): FlowStep | undefined {
  const i = getStepIndex(pathname);
  if (i < 0 || i >= FLOW_STEPS.length - 1) return undefined;
  return FLOW_STEPS[i + 1];
}

export function getPrevStep(pathname: string): FlowStep | undefined {
  const i = getStepIndex(pathname);
  if (i <= 0) return undefined;
  return FLOW_STEPS[i - 1];
}

export type StepStatus = "complete" | "current" | "blocked" | "available";

export interface FlowState {
  hasContext: boolean;
  hasWizard: boolean;
  hasRecommendation: boolean;
  hasRegister: boolean;
  hasStructures: boolean;
  hasLinkedSupport?: boolean;
}

export function computeStepStatus(stepId: string, currentPath: string, s: FlowState): StepStatus {
  const step = FLOW_STEPS.find((x) => x.id === stepId);
  if (!step) return "blocked";
  const isCurrent = step.to === currentPath;
  if (isCurrent) return "current";
  switch (stepId) {
    case "context":
      return s.hasContext ? "complete" : "available";
    case "select":
      if (!s.hasContext) return "blocked";
      return s.hasWizard ? "complete" : "available";
    case "recommend":
      if (!s.hasContext) return "blocked";
      return s.hasRecommendation ? "complete" : "available";
    case "structure":
      if (!s.hasContext) return "blocked";
      return s.hasStructures && s.hasLinkedSupport ? "complete" : "available";
    case "review":
      if (!s.hasContext) return "blocked";
      return "available";
    case "register":
      if (!s.hasContext) return "blocked";
      return s.hasRegister ? "complete" : "available";
    case "output":
      if (!s.hasRegister) return "blocked";
      return "available";
    default:
      return "available";
  }
}
