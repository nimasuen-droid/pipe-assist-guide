import { cn } from "@/lib/utils";

interface Props {
  id: string;
  className?: string;
}

/**
 * Schematic graphics for each Support Standard card.
 * Pure presentational SVG using semantic tokens (currentColor + muted/primary).
 */
export function SupportStandardGraphic({ id, className }: Props) {
  return (
    <div
      className={cn(
        "w-full rounded-md border border-border bg-muted/30 p-2 flex items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 90"
        className="w-full h-[90px] text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {renderShape(id)}
      </svg>
    </div>
  );
}

const PIPE_FILL = "hsl(var(--primary) / 0.15)";
const STEEL = "hsl(var(--muted-foreground))";
const ACCENT = "hsl(var(--primary))";

function Pipe({ cx = 100, cy = 40, r = 14 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={PIPE_FILL} stroke={ACCENT} strokeWidth={1.8} />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke={ACCENT} strokeWidth={0.8} opacity={0.6} />
    </>
  );
}

function GroundLine({ y = 80 }: { y?: number }) {
  return (
    <>
      <line x1={10} y1={y} x2={190} y2={y} stroke={STEEL} strokeWidth={1.5} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={15 + i * 22} y1={y} x2={20 + i * 22} y2={y + 6} stroke={STEEL} strokeWidth={1} />
      ))}
    </>
  );
}

function renderShape(id: string) {
  switch (id) {
    case "rest-shoe":
      return (
        <>
          <Pipe />
          {/* shoe */}
          <rect x={82} y={54} width={36} height={8} fill={STEEL} stroke={STEEL} />
          <rect x={70} y={62} width={60} height={6} fill={ACCENT} opacity={0.7} stroke={ACCENT} />
          <GroundLine />
        </>
      );
    case "guide":
      return (
        <>
          <Pipe />
          {/* guide cradle */}
          <path d="M70 40 L70 60 L130 60 L130 40" stroke={ACCENT} strokeWidth={2} />
          <line x1={70} y1={60} x2={70} y2={78} stroke={STEEL} />
          <line x1={130} y1={60} x2={130} y2={78} stroke={STEEL} />
          <GroundLine />
        </>
      );
    case "anchor":
      return (
        <>
          <Pipe />
          {/* welded clamp + brace */}
          <rect x={82} y={26} width={36} height={28} fill="none" stroke={ACCENT} strokeWidth={2} />
          <line x1={100} y1={54} x2={100} y2={78} stroke={STEEL} strokeWidth={2.5} />
          <line x1={70} y1={78} x2={130} y2={78} stroke={STEEL} strokeWidth={2.5} />
          <line x1={85} y1={70} x2={100} y2={54} stroke={STEEL} />
          <line x1={115} y1={70} x2={100} y2={54} stroke={STEEL} />
          <GroundLine />
        </>
      );
    case "ubolt":
      return (
        <>
          <Pipe />
          {/* U-bolt */}
          <path d="M82 22 L82 40 A18 18 0 0 0 118 40 L118 22" stroke={ACCENT} strokeWidth={2} />
          <rect x={70} y={54} width={60} height={6} fill={STEEL} />
          <line x1={82} y1={22} x2={82} y2={18} stroke={ACCENT} />
          <line x1={118} y1={22} x2={118} y2={18} stroke={ACCENT} />
          <GroundLine />
        </>
      );
    case "clamp":
      return (
        <>
          <Pipe />
          {/* split clamp halves with bolts */}
          <path d="M82 26 A18 18 0 0 1 82 54" stroke={ACCENT} strokeWidth={2.5} />
          <path d="M118 26 A18 18 0 0 0 118 54" stroke={ACCENT} strokeWidth={2.5} />
          <line x1={78} y1={30} x2={78} y2={50} stroke={STEEL} strokeWidth={2} />
          <line x1={122} y1={30} x2={122} y2={50} stroke={STEEL} strokeWidth={2} />
          <line x1={100} y1={26} x2={100} y2={10} stroke={STEEL} />
          <circle cx={100} cy={10} r={3} fill={STEEL} />
        </>
      );
    case "trunnion":
      return (
        <>
          <Pipe cx={100} cy={32} r={14} />
          {/* trunnion stub welded to bottom */}
          <rect x={94} y={46} width={12} height={26} fill={PIPE_FILL} stroke={ACCENT} strokeWidth={1.8} />
          <rect x={80} y={72} width={40} height={6} fill={STEEL} />
          <GroundLine />
        </>
      );
    case "spring-variable":
      return (
        <>
          <Pipe cx={100} cy={62} r={12} />
          {/* hanger rod + spring can */}
          <line x1={100} y1={50} x2={100} y2={36} stroke={STEEL} strokeWidth={1.5} />
          <rect x={86} y={14} width={28} height={22} fill="none" stroke={ACCENT} strokeWidth={1.8} />
          <path d="M90 18 L110 22 L90 26 L110 30 L90 34" stroke={ACCENT} strokeWidth={1} />
          <line x1={100} y1={14} x2={100} y2={6} stroke={STEEL} />
          <line x1={88} y1={6} x2={112} y2={6} stroke={STEEL} strokeWidth={2} />
        </>
      );
    case "spring-constant":
      return (
        <>
          <Pipe cx={100} cy={66} r={11} />
          <line x1={100} y1={55} x2={100} y2={42} stroke={STEEL} strokeWidth={1.5} />
          {/* constant-effort housing (rectangular box with lever) */}
          <rect x={74} y={14} width={52} height={28} fill="none" stroke={ACCENT} strokeWidth={1.8} />
          <line x1={80} y1={28} x2={120} y2={20} stroke={ACCENT} strokeWidth={1.5} />
          <circle cx={80} cy={28} r={2} fill={ACCENT} />
          <circle cx={120} cy={20} r={2} fill={ACCENT} />
          <line x1={88} y1={6} x2={112} y2={6} stroke={STEEL} strokeWidth={2} />
          <line x1={100} y1={6} x2={100} y2={14} stroke={STEEL} />
        </>
      );
    case "snubber":
      return (
        <>
          <Pipe cx={100} cy={40} r={13} />
          {/* hydraulic cylinder at angle */}
          <line x1={100} y1={53} x2={140} y2={75} stroke={STEEL} strokeWidth={2} />
          <rect x={138} y={66} width={28} height={12} fill={PIPE_FILL} stroke={ACCENT} strokeWidth={1.8} transform="rotate(28 152 72)" />
          <circle cx={100} cy={53} r={2.5} fill={ACCENT} />
          <circle cx={170} cy={82} r={2.5} fill={ACCENT} />
          <GroundLine />
        </>
      );
    case "slide-plate":
      return (
        <>
          <Pipe />
          <rect x={80} y={54} width={40} height={5} fill={STEEL} />
          {/* PTFE plates with slide arrows */}
          <rect x={68} y={59} width={64} height={4} fill={ACCENT} opacity={0.7} />
          <rect x={68} y={63} width={64} height={4} fill={STEEL} />
          <line x1={50} y1={61} x2={62} y2={61} stroke={ACCENT} strokeWidth={1.2} />
          <path d="M50 61 L54 58 M50 61 L54 64" stroke={ACCENT} />
          <line x1={138} y1={61} x2={150} y2={61} stroke={ACCENT} strokeWidth={1.2} />
          <path d="M150 61 L146 58 M150 61 L146 64" stroke={ACCENT} />
          <GroundLine />
        </>
      );
    case "str-rack-beam":
      return (
        <>
          {/* two columns + tier beams */}
          <line x1={30} y1={10} x2={30} y2={80} stroke={STEEL} strokeWidth={3} />
          <line x1={170} y1={10} x2={170} y2={80} stroke={STEEL} strokeWidth={3} />
          <rect x={28} y={28} width={144} height={5} fill={STEEL} />
          <rect x={28} y={56} width={144} height={5} fill={ACCENT} opacity={0.8} />
          <Pipe cx={70} cy={48} r={7} />
          <Pipe cx={100} cy={48} r={7} />
          <Pipe cx={130} cy={48} r={7} />
          <GroundLine />
        </>
      );
    case "str-goal-post":
      return (
        <>
          <line x1={40} y1={20} x2={40} y2={80} stroke={STEEL} strokeWidth={3} />
          <line x1={160} y1={20} x2={160} y2={80} stroke={STEEL} strokeWidth={3} />
          <rect x={36} y={18} width={128} height={6} fill={ACCENT} opacity={0.8} />
          <Pipe cx={75} cy={36} r={8} />
          <Pipe cx={125} cy={36} r={8} />
          <rect x={30} y={78} width={20} height={4} fill={STEEL} />
          <rect x={150} y={78} width={20} height={4} fill={STEEL} />
          <GroundLine />
        </>
      );
    case "str-inverted-l":
      return (
        <>
          <line x1={40} y1={10} x2={40} y2={80} stroke={STEEL} strokeWidth={3} />
          <rect x={36} y={26} width={120} height={6} fill={ACCENT} opacity={0.8} />
          <Pipe cx={120} cy={44} r={9} />
          {/* gusset */}
          <path d="M40 32 L60 32 L40 52 Z" fill={STEEL} opacity={0.4} stroke={STEEL} />
          <rect x={30} y={78} width={20} height={4} fill={STEEL} />
          <GroundLine />
        </>
      );
    case "str-wall-bracket":
      return (
        <>
          {/* wall hatching */}
          <line x1={20} y1={10} x2={20} y2={80} stroke={STEEL} strokeWidth={3} />
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={10} y1={12 + i * 10} x2={20} y2={20 + i * 10} stroke={STEEL} strokeWidth={0.8} />
          ))}
          <rect x={20} y={36} width={120} height={6} fill={ACCENT} opacity={0.8} />
          <path d="M20 42 L40 42 L20 62 Z" fill={STEEL} opacity={0.4} stroke={STEEL} />
          <Pipe cx={110} cy={54} r={9} />
        </>
      );
    case "str-existing-steel":
      return (
        <>
          {/* I-beam cross-section + tie-in clamp */}
          <rect x={30} y={28} width={140} height={6} fill={STEEL} />
          <rect x={30} y={54} width={140} height={6} fill={STEEL} />
          <rect x={94} y={34} width={12} height={20} fill={STEEL} />
          <Pipe cx={100} cy={20} r={10} />
          {/* clamp connecting pipe to existing steel */}
          <line x1={92} y1={28} x2={92} y2={34} stroke={ACCENT} strokeWidth={2} />
          <line x1={108} y1={28} x2={108} y2={34} stroke={ACCENT} strokeWidth={2} />
          <text x={150} y={78} fontSize={8} fill={STEEL} stroke="none">EXIST</text>
        </>
      );
    case "str-pedestal":
      return (
        <>
          {/* concrete pedestal */}
          <rect x={80} y={36} width={40} height={44} fill={STEEL} opacity={0.25} stroke={STEEL} />
          <line x1={86} y1={42} x2={114} y2={42} stroke={STEEL} strokeWidth={0.6} />
          <line x1={86} y1={56} x2={114} y2={56} stroke={STEEL} strokeWidth={0.6} />
          <line x1={86} y1={70} x2={114} y2={70} stroke={STEEL} strokeWidth={0.6} />
          <rect x={74} y={32} width={52} height={5} fill={ACCENT} opacity={0.8} />
          <Pipe cx={100} cy={20} r={9} />
          <GroundLine />
        </>
      );
    default:
      return (
        <>
          <Pipe />
          <rect x={70} y={54} width={60} height={6} fill={STEEL} />
          <GroundLine />
        </>
      );
  }
}