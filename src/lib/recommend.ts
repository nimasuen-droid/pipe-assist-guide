import type {
  LineInput,
  WizardInput,
  SupportRecommendation,
  Verdict,
  SupportFunction,
} from "./types";

const FUNCTION_LABEL: Record<SupportFunction, string> = {
  rest: "Rest",
  guide: "Guide",
  anchor: "Anchor",
  "line-stop": "Line Stop / Axial Stop",
  "hold-down": "Hold-Down",
  spring: "Spring Support",
  hanger: "Hanger",
  "vibration-restraint": "Vibration Restraint",
};

function recommendFromMarkup(line: LineInput, w: WizardInput): SupportRecommendation {
  const fn: SupportFunction = w.manualFunction ?? "rest";
  const tDes = parseFloat(line.designTemp || "0");
  const dn = parseFloat(line.pipeSize || "0");
  const insulated = line.insulation !== "none";
  const hot = tDes >= 150;
  const cryo = tDes <= -100 || w.specialService === "cryogenic";
  const ori = w.orientation;

  const why: string[] = [];
  const movementAllowed: string[] = [];
  const movementRestrained: string[] = [];
  const designChecks: string[] = [];
  const followUpChecks: string[] = [];
  const riskFlags: string[] = [];
  const refs: { code: string; note: string }[] = [];
  const alternates: string[] = [];

  let primary = "Rest Support";
  let func = "Carry sustained vertical load.";
  let verdict: Verdict = "ACCEPTABLE";

  switch (fn) {
    case "rest":
      if (ori === "vertical") {
        primary = "Riser Clamp / Vertical Pipe Clamp";
        alternates.push("Lug + clamp", "Trunnion at base elbow");
        func = "Carry vertical pipe weight via clamp bearing on steel.";
        movementRestrained.push("Vertical (down)");
        riskFlags.push(
          "Standard horizontal shoe is not suitable on a vertical run — riser clamp required.",
        );
      } else if (ori === "change-direction") {
        primary = "Trunnion (Dummy Leg) at Elbow";
        alternates.push("Pipe shoe on adjacent run");
        func = "Carry pipe weight off the elbow while allowing thermal growth.";
        movementAllowed.push("Axial (small)");
        movementRestrained.push("Vertical");
      } else {
        primary = insulated || hot ? "Pipe Shoe (Welded T-Shoe)" : "Saddle / Clamp Rest Support";
        alternates.push("Pipe shoe", "Saddle support", "Clamp rest");
        if (insulated) alternates.push("Slide plate (PTFE) for high friction lines");
        func = "Carry sustained vertical load and allow free axial sliding.";
        movementAllowed.push("Axial", "Lateral");
        movementRestrained.push("Vertical (down)");
      }
      break;

    case "guide":
      if (ori === "vertical") {
        primary = "Vertical Guide Clamp";
        func = "Restrain lateral displacement on a vertical riser.";
        movementAllowed.push("Vertical");
        movementRestrained.push("Lateral (both axes)");
      } else {
        primary = "Guided Shoe / Guide Plates";
        alternates.push("Guide bracket on rack beam");
        func = "Control lateral displacement, allow axial sliding.";
        movementAllowed.push("Axial", "Vertical (within clearance)");
        movementRestrained.push("Lateral");
      }
      if (w.thermalMovement && w.axialMovement === "restrain") {
        riskFlags.push(
          "Guide selected but axial restraint also requested — confirm intent (guide allows axial growth).",
        );
      }
      break;

    case "anchor":
      primary = "Anchor Shoe with Stop Plates";
      alternates.push("Welded anchor block", "Bolted anchor frame");
      func = "Fix pipe in all directions to define expansion zones.";
      movementRestrained.push("Axial", "Lateral", "Vertical");
      verdict = "STRESS CHECK REQUIRED";
      riskFlags.push("Anchor selected: stress engineer approval and structural review required.");
      followUpChecks.push(
        "Confirm anchor loads and structural capacity.",
        "Verify expansion zone layout each side of anchor.",
      );
      if (w.thermalMovement)
        riskFlags.push(
          "Thermal movement expected on this line — anchor will fully restrain growth and induce loads.",
        );
      break;

    case "line-stop":
      primary = "Line Stop / Axial Stop";
      alternates.push("Two-sided stop on guided shoe");
      func = "Restrain axial movement, allow lateral and vertical (within guide).";
      movementAllowed.push("Lateral", "Vertical (within clearance)");
      movementRestrained.push("Axial");
      verdict = "STRESS CHECK REQUIRED";
      riskFlags.push("Line stop: coordinate with stress analysis to avoid overload.");
      break;

    case "hold-down":
      if (ori === "horizontal") {
        primary = "Hold-Down Clamp";
        alternates.push("U-bolt (small bore only)");
        func = "Restrain uplift while allowing axial sliding.";
        movementAllowed.push("Axial");
        movementRestrained.push("Vertical (up)");
        if (dn >= 8 && insulated) {
          riskFlags.push(
            "U-bolt not recommended on large insulated lines — use hold-down clamp with saddle.",
          );
        }
        if (hot)
          riskFlags.push(
            "Hot insulated line — avoid direct U-bolt contact; use shoe + hold-down clamp.",
          );
      } else {
        primary = "Hold-Down Clamp (Vertical Application)";
        riskFlags.push(
          "Hold-down requested on a vertical/sloped run — verify intent (uplift restraint is typically a horizontal-line concept).",
        );
      }
      break;

    case "spring":
      primary =
        Math.abs(tDes) >= 200 || w.nearFeature === "equipment-nozzle"
          ? "Constant Spring Support"
          : "Variable Spring Support";
      func = "Carry sustained load through thermal vertical movement.";
      movementAllowed.push("Vertical (thermal travel)");
      verdict = "REVIEW REQUIRED";
      followUpChecks.push(
        "Provide hot/cold loads & travel from stress analysis.",
        "Confirm spring rate and travel range from vendor.",
      );
      if (!w.verticalAdjustment)
        riskFlags.push(
          "Spring selected but vertical movement not flagged in inputs — confirm thermal travel is real.",
        );
      break;

    case "hanger":
      primary = "Rigid Rod Hanger";
      alternates.push("Clevis hanger", "Trapeze hanger");
      func = "Carry pipe weight from overhead steel.";
      movementAllowed.push("Axial (swing)", "Lateral (swing)");
      movementRestrained.push("Vertical (down)");
      if (w.thermalMovement && Math.abs(tDes) >= 100) {
        riskFlags.push(
          "Significant thermal movement on rigid hanger — consider spring hanger to avoid load shift.",
        );
      }
      break;

    case "vibration-restraint":
      primary = "Vibration Restraint / Snubber";
      alternates.push("U-bolt with elastomer", "Hold-down clamp with damping pad");
      func = "Damp dynamic loads from pulsation, vibration or transient events.";
      movementAllowed.push("Slow thermal");
      movementRestrained.push("Dynamic / shock");
      verdict = "REVIEW REQUIRED";
      followUpChecks.push(
        "Perform dynamic / pulsation analysis.",
        "Schedule periodic snubber functional test.",
      );
      riskFlags.push("Dynamic restraint: dynamic / pulsation review required.");
      break;
  }

  // Cross-cutting checks
  if (cryo) {
    riskFlags.push("Cryogenic service: use insulated shoe / cold block to avoid thermal bridging.");
    alternates.push("Cryogenic insulated shoe");
  }
  if (insulated && fn === "rest" && ori !== "vertical") {
    designChecks.push("Shoe height ≥ insulation thickness + clearance.");
  }
  if (w.nearFeature === "equipment-nozzle") {
    riskFlags.push(
      "Located at equipment nozzle: nozzle allowable load check required (vendor data).",
    );
    followUpChecks.push("Verify nozzle allowable loads with vendor data sheet.");
    if (verdict === "ACCEPTABLE") verdict = "STRESS CHECK REQUIRED";
  }
  if (line.phase === "brownfield") {
    riskFlags.push("Brownfield tie-in: field verification of existing steel & access required.");
  }

  // Conflict warnings
  if (fn === "rest" && ori === "vertical") {
    // already handled above, but ensure verdict reflects review
    if (verdict === "ACCEPTABLE") verdict = "REVIEW REQUIRED";
  }
  if (w.thermalMovement && (fn === "anchor" || fn === "line-stop")) {
    designChecks.push("Verify thermal expansion is intentionally restrained at this point.");
  }

  if (movementAllowed.length === 0) movementAllowed.push("Per selected function");
  if (movementRestrained.length === 0) movementRestrained.push("Per selected function");

  designChecks.push(
    "Sustained load capacity per MSS SP-58 component allowables.",
    "Friction coefficient assumed (steel/steel 0.3, PTFE 0.1).",
    "Bolt / weld sizing per project standard.",
  );

  refs.push(
    {
      code: "ASME B31.3",
      note: "Process piping flexibility, allowable stresses, support spacing.",
    },
    { code: "MSS SP-58", note: "Materials, design and manufacture of pipe hangers and supports." },
    { code: "MSS SP-69", note: "Selection and application of standard support types." },
    { code: "MSS SP-89", note: "Fabrication and installation practices for supports." },
  );
  if (fn === "vibration-restraint")
    refs.push({
      code: "MSS SP-127",
      note: "Bracing for piping subject to seismic & dynamic loads.",
    });

  why.push(
    `Markup mode: engineer-selected function "${FUNCTION_LABEL[fn]}" on a ${ori.replace("-", " ")} run.`,
    `Hardware chosen to deliver this function given DN${line.pipeSize}, ${line.insulation} insulation, T_des ${line.designTemp}°C.`,
  );

  return {
    primary,
    alternates,
    function: func,
    why,
    movementAllowed,
    movementRestrained,
    designChecks,
    followUpChecks,
    references: refs,
    riskFlags,
    learningMoment:
      "Markup mode lets the engineer follow the issued isometric or GA support intent, but the app still validates the selected function and recommends suitable hardware based on orientation, load, movement and service.",
    verdict,
  };
}

export function recommendSupport(line: LineInput, w: WizardInput): SupportRecommendation {
  if (w.overrideMode) return recommendFromMarkup(line, w);
  const tDes = parseFloat(line.designTemp || "0");
  const tOp = parseFloat(line.operatingTemp || "0");
  const dn = parseFloat(line.pipeSize || "0");
  const hot = tDes >= 150 || tOp >= 150;
  const cold = tDes <= -29 || tOp <= -29 || w.specialService === "cryogenic";
  const cryo = tDes <= -100 || w.specialService === "cryogenic";
  const insulated = line.insulation !== "none";

  const why: string[] = [];
  const movementAllowed: string[] = [];
  const movementRestrained: string[] = [];
  const designChecks: string[] = [];
  const followUpChecks: string[] = [];
  const riskFlags: string[] = [];
  const refs: { code: string; note: string }[] = [];
  const alternates: string[] = [];

  let primary = "Rest Support";
  let func = "Carry sustained vertical load while allowing pipe movement.";
  let learning =
    "A support's job is to carry weight without locking thermal growth. Match function to behaviour, not just shape.";
  let verdict: Verdict = "ACCEPTABLE";

  // Special features dominate
  if (w.nearFeature === "equipment-nozzle") {
    primary = "Equipment Nozzle Support / First Support";
    func =
      "Carry pipe weight close to nozzle so reaction loads on nozzle remain within vendor allowables.";
    why.push("Support placed near nozzle reduces moment and shear on equipment connection.");
    riskFlags.push("Equipment nozzle connection: nozzle load check required (vendor allowable).");
    followUpChecks.push("Confirm nozzle allowable loads with vendor data sheet.");
    verdict = "STRESS CHECK REQUIRED";
  } else if (w.nearFeature === "valve" && dn >= 6) {
    primary = "Independent Valve Support";
    func = "Carry valve and actuator weight independent of pipe.";
    why.push("Large valves and actuators create local concentrated loads.");
    riskFlags.push("Large valve / actuator: independent valve support required.");
    verdict = "REVIEW REQUIRED";
  } else if (
    w.vibration ||
    line.service.toLowerCase().includes("pump") ||
    line.service.toLowerCase().includes("compressor")
  ) {
    primary = "Vibration Restraint / Snubber";
    alternates.push("U-bolt with elastomer", "Hold-down clamp");
    func = "Damp dynamic loads from pulsation, vibration or transient events.";
    riskFlags.push("Pump/compressor or dynamic line: vibration & dynamic review required.");
    followUpChecks.push("Perform dynamic / pulsation analysis.");
    verdict = "REVIEW REQUIRED";
  } else if (cryo) {
    primary = "Cryogenic Insulated Shoe";
    func = "Carry pipe weight while preventing thermal bridging through support steel.";
    why.push("Cryogenic service requires low-conductivity insert (e.g. PUF/wood block).");
    riskFlags.push("Cryogenic service: avoid steel-to-pipe thermal bridge.");
    verdict = "REVIEW REQUIRED";
  } else if (w.thermalMovement && w.orientation === "horizontal" && hot) {
    primary = "Pipe Shoe (Welded T-Shoe)";
    alternates.push("Sliding plate / PTFE", "Trunnion (for vertical pipe)");
    func = "Lift pipe above steel for insulation clearance and allow axial sliding.";
    why.push("Hot insulated pipe needs height for insulation and free axial growth.");
  } else if (w.upliftPossible) {
    primary = "Hold-Down Clamp";
    func = "Restrain uplift while allowing axial sliding.";
    why.push("Vertical lift can occur due to thermal bowing or two-phase flow.");
  } else if (w.axialMovement === "restrain" && w.lateralMovement === "restrain") {
    primary = "Anchor";
    func = "Fix pipe in all directions to define expansion zones.";
    riskFlags.push("Anchor selected: stress engineer approval required.");
    followUpChecks.push("Confirm anchor loads and structural capacity.");
    verdict = "STRESS CHECK REQUIRED";
    movementRestrained.push("Axial", "Lateral", "Vertical");
  } else if (w.axialMovement === "restrain") {
    primary = "Line Stop / Axial Stop";
    func = "Restrain axial movement only.";
    riskFlags.push("Line stop: coordinate with stress analysis to avoid overload.");
    verdict = "STRESS CHECK REQUIRED";
    movementRestrained.push("Axial");
    movementAllowed.push("Lateral", "Vertical (if guided rest)");
  } else if (w.lateralMovement === "restrain") {
    primary = "Guide Support";
    func = "Control lateral displacement while allowing axial sliding.";
    learning =
      "A guide is not an anchor. It controls lateral movement while still allowing axial thermal growth.";
    movementAllowed.push("Axial", "Vertical (within clearance)");
    movementRestrained.push("Lateral");
  } else if (w.orientation === "vertical") {
    primary = "Vertical Pipe Support (Riser Clamp)";
    func = "Carry vertical pipe weight via clamp bearing on structural steel.";
    alternates.push("Trunnion", "Lug + clamp");
  } else if (w.verticalAdjustment) {
    primary = "Variable Spring Support";
    if (Math.abs(tDes) >= 200) {
      primary = "Constant Spring Support";
      why.push("Significant vertical thermal travel — constant effort support keeps load steady.");
    }
    func = "Carry sustained load through thermal vertical movement.";
    verdict = "REVIEW REQUIRED";
    followUpChecks.push("Provide hot/cold loads & travel from stress analysis.");
  } else if (line.layout === "pipe-rack") {
    primary = "Rest Support on Pipe Rack";
    alternates.push("Shoe (if insulated/hot)", "Guide at every 4th support");
    func = "Support pipe on rack beam — allow free thermal sliding.";
  } else if (!w.weldingAllowed) {
    primary = "U-Bolt Support";
    alternates.push("Pipe Clamp", "Trapeze");
    func = "Mechanically clamp pipe where welding is not permitted.";
  } else {
    primary = "Rest Support";
    func = "Carry sustained load with minimal restraint.";
  }

  // Common additions
  if (
    insulated &&
    !primary.toLowerCase().includes("shoe") &&
    !primary.toLowerCase().includes("cryo")
  ) {
    alternates.push("Shoe (raise pipe above insulation thickness)");
    designChecks.push("Shoe height ≥ insulation thickness + clearance.");
  }
  if (line.phase === "brownfield") {
    riskFlags.push("Brownfield tie-in: field verification of existing steel & access required.");
    followUpChecks.push("Survey existing structure, hot-work permits and clash check.");
  }
  if (hot) riskFlags.push("High temperature line: thermal expansion review required.");
  if (cold) riskFlags.push("Low temperature line: cold insulation continuity required.");

  // Movement defaults if empty
  if (movementAllowed.length === 0)
    movementAllowed.push(w.thermalMovement ? "Axial sliding" : "Minor settling");
  if (movementRestrained.length === 0) movementRestrained.push("Vertical (downward)");

  designChecks.push(
    "Sustained load capacity per MSS SP-58 component allowables.",
    "Friction coefficient assumed (steel/steel 0.3, PTFE 0.1).",
    "Bolt / weld sizing per project standard.",
  );

  refs.push(
    {
      code: "ASME B31.3",
      note: "Process piping flexibility, allowable stresses, support spacing.",
    },
    { code: "MSS SP-58", note: "Materials, design and manufacture of pipe hangers and supports." },
    { code: "MSS SP-69", note: "Selection and application of standard support types." },
    { code: "MSS SP-89", note: "Fabrication and installation practices for supports." },
  );
  if (w.vibration)
    refs.push({
      code: "MSS SP-127",
      note: "Bracing for piping subject to seismic & dynamic loads.",
    });
  if (w.weldingAllowed)
    refs.push({
      code: "PFI ES-26",
      note: "Welded load-bearing attachments to pressure-retaining piping.",
    });
  if (w.nearFeature === "equipment-nozzle")
    refs.push({
      code: "Vendor Data",
      note: "Nozzle allowable loads (API 610 / NEMA SM-23 / vendor).",
    });

  return {
    primary,
    alternates,
    function: func,
    why: why.length
      ? why
      : ["Selected based on orientation, service, restraint and constructability inputs."],
    movementAllowed,
    movementRestrained,
    designChecks,
    followUpChecks,
    references: refs,
    riskFlags,
    learningMoment: learning,
    verdict,
  };
}
