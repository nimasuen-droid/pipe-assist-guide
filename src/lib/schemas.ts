import { z } from "zod";

export const lineInputSchema = z.object({
  projectName: z.string(),
  area: z.string(),
  lineNumber: z.string(),
  pipeSize: z.string(),
  schedule: z.string(),
  material: z.string(),
  service: z.string(),
  designPressure: z.string(),
  designTemp: z.string(),
  operatingTemp: z.string(),
  insulation: z.enum(["none", "hot", "cold", "cryogenic", "personnel"]),
  insulationThickness: z.string().optional(),
  layout: z.enum([
    "aboveground",
    "pipe-rack",
    "equipment-piping",
    "underground-transition",
    "skid",
    "structure-mounted",
  ]),
  phase: z.enum(["new-build", "brownfield", "retrofit"]),
});

export const projectLineSchema = lineInputSchema.extend({
  id: z.string(),
  sectionName: z.string().optional(),
  notes: z.string().optional(),
});

export const wizardInputSchema = z.object({
  orientation: z.enum(["horizontal", "vertical", "sloped", "change-direction"]),
  nearFeature: z.enum([
    "none",
    "equipment-nozzle",
    "valve",
    "flange",
    "anchor-point",
    "bend",
    "branch",
    "expansion-loop",
  ]),
  thermalMovement: z.boolean(),
  upliftPossible: z.boolean(),
  vibration: z.boolean(),
  axialMovement: z.enum(["allow", "restrain"]),
  lateralMovement: z.enum(["allow", "restrain"]),
  verticalAdjustment: z.boolean(),
  permanent: z.boolean(),
  weldingAllowed: z.boolean(),
  specialService: z.enum(["none", "cryogenic", "hot", "sour", "corrosive", "firewater"]),
  overrideMode: z.boolean().optional(),
  manualFunction: z
    .enum([
      "rest",
      "guide",
      "anchor",
      "line-stop",
      "hold-down",
      "spring",
      "hanger",
      "vibration-restraint",
    ])
    .optional(),
});

export const projectImportSchema = z.object({
  line: lineInputSchema.optional(),
  wizard: wizardInputSchema.optional(),
  lineList: z.array(projectLineSchema).optional(),
  activeLineId: z.string().nullable().optional(),
});
