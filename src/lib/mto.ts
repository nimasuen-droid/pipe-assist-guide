import type { LineInput, MTOItem, SupportRegisterEntry } from "./types";

function thicknessFor(dn: number) {
  if (dn <= 4) return 6;
  if (dn <= 12) return 8;
  if (dn <= 24) return 10;
  return 12;
}
function boltSizeFor(dn: number) {
  if (dn <= 4) return "M12";
  if (dn <= 12) return "M16";
  if (dn <= 24) return "M20";
  return "M24";
}
function shoeHeightFor(line: LineInput) {
  const t = parseFloat(line.insulationThickness || "0");
  const base = 100;
  return line.insulation === "none" ? base : base + t + 25;
}
function materialFor(line: LineInput) {
  if (line.material?.toUpperCase().includes("SS")) return "SS316";
  if (line.material?.toUpperCase().includes("LTCS")) return "LTCS A350 LF2";
  return "Carbon Steel A36";
}

export function generateMTO(entry: SupportRegisterEntry): MTOItem[] {
  const dnRaw = parseFloat(entry.line.pipeSize || "4");
  const dn = Number.isFinite(dnRaw) && dnRaw > 0 ? dnRaw : 4;
  const mat = materialFor(entry.line);
  const th = thicknessFor(dn);
  const bolt = boltSizeFor(dn);
  const shoeH = shoeHeightFor(entry.line);
  const t = entry.supportType.toLowerCase();
  const base = {
    supportTag: entry.tag,
    lineNumber: entry.lineNumber,
    supportType: entry.supportType,
  };
  const items: MTOItem[] = [];
  const add = (
    component: string,
    size: string,
    qty: number,
    unit: string,
    category: MTOItem["category"],
    remarks = "",
    material = mat,
  ) => items.push({ ...base, component, size, qty, unit, category, remarks, material });

  if (t.includes("shoe") || t.includes("cryogenic")) {
    add("Shoe top plate", `${dn * 25 + 50}×${100}×${th} mm`, 1, "Nos", "Fabricated");
    add("Shoe web plate", `${shoeH}×${80}×${th} mm`, 2, "Nos", "Fabricated");
    add("Shoe base plate", `${dn * 25 + 80}×${120}×${th + 2} mm`, 1, "Nos", "Fabricated");
    add("Wear pad", `${dn * 30}×${dn * 30}×6 mm`, 1, "Nos", "Fabricated", "Per PFI ES-26");
    if (t.includes("cryogenic"))
      add("Cryo insulation block", "PUF / wood block", 1, "Nos", "Bought-out", "Low conductivity");
    if (entry.recommendation.movementAllowed.join(",").toLowerCase().includes("slid"))
      add(
        "PTFE sliding plate",
        `${dn * 25 + 80}×${120}×3 mm`,
        1,
        "Nos",
        "Bought-out",
        "Low friction",
      );
  } else if (t.includes("guide")) {
    add("Guide plate", `100×${th}×${shoeH} mm`, 2, "Nos", "Fabricated");
    add("Base plate", `${dn * 25 + 100}×120×${th + 2} mm`, 1, "Nos", "Fabricated");
    add("Anchor bolt", bolt, 4, "Nos", "Bought-out");
  } else if (t.includes("anchor")) {
    add("Anchor saddle", `${dn * 30}×${dn * 30}×${th + 2} mm`, 1, "Nos", "Fabricated");
    add("Stiffener plates", `100×100×${th} mm`, 4, "Nos", "Fabricated");
    add("Anchor bolts", bolt, 6, "Nos", "Bought-out");
    add("Wear pad", `${dn * 30}×${dn * 30}×6 mm`, 1, "Nos", "Fabricated");
  } else if (t.includes("spring")) {
    add(
      "Spring can assembly",
      `Vendor sized — pipe DN${dn}`,
      1,
      "Nos",
      "Bought-out",
      "Specify hot/cold loads & travel",
    );
    add("Top rod", `${bolt} threaded rod`, 1, "Nos", "Bought-out");
    add("Bottom clamp", `DN${dn} pipe clamp`, 1, "Nos", "Bought-out");
    add("Turnbuckle", bolt, 1, "Nos", "Bought-out");
    add("Pins & connectors", "Vendor std", 1, "Set", "Bought-out");
  } else if (t.includes("trunnion")) {
    add(
      "Trunnion pipe",
      `DN${Math.max(2, Math.round(dn / 2))} × ${shoeH + 100} mm`,
      1,
      "Nos",
      "Fabricated",
    );
    add("Base plate", `${dn * 25 + 100}×${dn * 25 + 100}×${th + 2} mm`, 1, "Nos", "Fabricated");
    add("Stiffener plates", `100×100×${th} mm`, 4, "Nos", "Fabricated");
    add("Weld details (full pen)", "Per PFI ES-26", 1, "Lot", "Fabricated");
  } else if (t.includes("u-bolt")) {
    add("U-bolt", `${bolt} for DN${dn}`, 1, "Nos", "Bought-out");
    add("Cross plate", `${dn * 25 + 80}×60×${th} mm`, 1, "Nos", "Fabricated");
    add("Hex nuts & washers", bolt, 4, "Nos", "Bought-out");
  } else if (t.includes("hold-down") || t.includes("clamp")) {
    add("Pipe clamp", `DN${dn} 2-bolt clamp`, 1, "Nos", "Bought-out");
    add("Anchor bolts", bolt, 2, "Nos", "Bought-out");
  } else if (t.includes("snubber") || t.includes("vibration")) {
    add(
      "Snubber assembly",
      `Vendor — load class TBD`,
      1,
      "Nos",
      "Bought-out",
      "Dynamic review required",
    );
    add("Pipe clamp", `DN${dn}`, 1, "Nos", "Bought-out");
    add("Bracket", `Plate ${th} mm`, 1, "Nos", "Fabricated");
  } else if (t.includes("valve")) {
    add("Valve saddle", `Custom for valve body`, 1, "Nos", "Fabricated");
    add("Support post", `Pipe DN${Math.round(dn / 2)}`, 1, "Nos", "Fabricated");
    add("Base plate + bolts", bolt, 1, "Set", "Fabricated");
  } else if (t.includes("vertical") || t.includes("riser")) {
    add("Riser clamp", `DN${dn} 2-bolt riser clamp`, 1, "Nos", "Bought-out");
    add("Bearing lugs", `Plate ${th + 2} mm`, 2, "Nos", "Fabricated");
  } else {
    add("Rest plate", `${dn * 25 + 80}×100×${th} mm`, 1, "Nos", "Fabricated");
    add(
      "Wear pad (optional)",
      `${dn * 30}×${dn * 30}×6 mm`,
      1,
      "Nos",
      "Fabricated",
      "If insulated/hot",
    );
  }

  return items;
}
