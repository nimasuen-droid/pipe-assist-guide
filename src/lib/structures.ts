import type { Structure, StructureKind, StructureMtoLine } from "./types";

export type LoadClass = "Light" | "Medium" | "Heavy";

export const STRUCTURE_KINDS: {
  id: StructureKind;
  name: string;
  prefix: string;
  defaultMax: number;
  description: string;
}[] = [
  {
    id: "goal-post",
    name: "Goal Post (Portal Frame)",
    prefix: "GP",
    defaultMax: 4,
    description: "Two posts + top beam, can carry several supports.",
  },
  {
    id: "inverted-l",
    name: "Inverted L Cantilever",
    prefix: "IL",
    defaultMax: 1,
    description: "Single post + cantilever; default one support, override allowed.",
  },
  {
    id: "pipe-rack-beam",
    name: "Pipe Rack Beam",
    prefix: "RB",
    defaultMax: 8,
    description: "Existing rack tier beam carrying multiple lines.",
  },
  {
    id: "wall-bracket",
    name: "Wall Bracket",
    prefix: "WB",
    defaultMax: 1,
    description: "Cantilever bracket fixed to wall/column.",
  },
  {
    id: "pedestal",
    name: "Ground-Mounted Pedestal",
    prefix: "PD",
    defaultMax: 1,
    description: "Concrete or steel pedestal from grade.",
  },
  {
    id: "existing-steel",
    name: "Existing Steel Tie-In",
    prefix: "EX",
    defaultMax: 4,
    description: "Reuse of existing structural member — no structural MTO, connection check only.",
  },
];

export function pickClass(c: LoadClass) {
  if (c === "Light")
    return {
      post: "W6x20 / HSS4x4x1/4",
      beam: "W6x20",
      basePlate: "PL 250x250x16",
      anchor: "M16 (4 nos.)",
      gusset: "PL 150x150x10",
    };
  if (c === "Medium")
    return {
      post: "W8x31 / HSS6x6x3/8",
      beam: "W8x31",
      basePlate: "PL 350x350x20",
      anchor: "M20 (4 nos.)",
      gusset: "PL 200x200x12",
    };
  return {
    post: "W10x49 / HSS8x8x1/2",
    beam: "W10x49",
    basePlate: "PL 450x450x25",
    anchor: "M24 (4 nos.)",
    gusset: "PL 250x250x16",
  };
}

export interface DimsInput {
  pipeCL: number;
  topOfSteel: number;
  groupWidth: number;
  sideClearance: number;
  columnToCL: number;
}

export function computeStructureDims(kind: StructureKind, d: DimsInput) {
  const out: { label: string; value: string; formula: string }[] = [];
  const needsPost = kind === "goal-post" || kind === "inverted-l" || kind === "pedestal";
  const needsBeam = kind === "goal-post";
  const needsCant = kind === "inverted-l" || kind === "wall-bracket";
  if (needsPost) {
    const h = Math.max(0, d.pipeCL - d.topOfSteel);
    out.push({
      label: "Post height",
      value: `${h} mm`,
      formula: "Pipe CL − foundation/top-of-steel",
    });
  }
  if (needsBeam) {
    const l = d.groupWidth + 2 * d.sideClearance;
    out.push({
      label: "Beam length",
      value: `${l} mm`,
      formula: "Pipe group width + 2 × side clearance",
    });
  }
  if (needsCant) {
    const l = d.columnToCL + d.sideClearance;
    out.push({
      label: "Cantilever length",
      value: `${l} mm`,
      formula: "Column/wall → pipe CL + clearance",
    });
  }
  return out;
}

export function buildStructureMTO(
  kind: StructureKind,
  cls: LoadClass,
  heavyOrDynamic: boolean,
): StructureMtoLine[] {
  if (kind === "existing-steel") return [];
  const sz = pickClass(cls);
  const items: StructureMtoLine[] = [];
  if (kind === "goal-post") {
    items.push({ component: "Vertical Post", qty: 2, size: sz.post });
    items.push({ component: "Top Beam", qty: 1, size: sz.beam });
    items.push({ component: "Base Plate", qty: 2, size: sz.basePlate });
    items.push({
      component: "Anchor Bolt Set",
      qty: 2,
      size: sz.anchor,
      remarks: "Per base plate",
    });
    if (heavyOrDynamic)
      items.push({ component: "Gusset / Stiffener Plate", qty: 4, size: sz.gusset });
  } else if (kind === "inverted-l") {
    items.push({ component: "Vertical Post (or column tie-in)", qty: 1, size: sz.post });
    items.push({ component: "Cantilever Beam", qty: 1, size: sz.beam });
    items.push({ component: "Connection / Base Plate", qty: 1, size: sz.basePlate });
    items.push({
      component: "Anchor Bolt Set / Weld",
      qty: 1,
      size: `${sz.anchor} or fillet weld`,
    });
    if (heavyOrDynamic) items.push({ component: "Gusset Plate", qty: 2, size: sz.gusset });
  } else if (kind === "wall-bracket") {
    items.push({ component: "Cantilever Beam", qty: 1, size: sz.beam });
    items.push({ component: "Wall Plate", qty: 1, size: sz.basePlate });
    items.push({ component: "Anchor Bolt Set", qty: 1, size: sz.anchor });
    if (heavyOrDynamic) items.push({ component: "Gusset Plate", qty: 2, size: sz.gusset });
  } else if (kind === "pedestal") {
    items.push({ component: "Pedestal (concrete or steel)", qty: 1, size: sz.post });
    items.push({ component: "Top Cap Plate", qty: 1, size: sz.basePlate });
    items.push({ component: "Anchor Bolt Set", qty: 1, size: sz.anchor });
  } else if (kind === "pipe-rack-beam") {
    items.push({
      component: "Rack Tier Beam",
      qty: 1,
      size: sz.beam,
      remarks: "Existing rack — verify spare capacity",
    });
  }
  return items;
}

export function nextStructureTag(existing: Structure[], kind: StructureKind) {
  const meta = STRUCTURE_KINDS.find((k) => k.id === kind)!;
  const same = existing.filter((s) => s.kind === kind).length + 1;
  return `${meta.prefix}-${String(same).padStart(3, "0")}`;
}
