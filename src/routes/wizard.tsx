import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";
import { recommendSupport } from "@/lib/recommend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlowFooter } from "@/components/FlowFooter";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wizard")({
  head: () => ({
    meta: [
      { title: "Selection Wizard — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "Answer engineering questions to drive the support recommendation.",
      },
    ],
  }),
  component: WizardPage,
});

function Toggle({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-16 items-start justify-between gap-3 rounded-md border border-border bg-card/70 p-3">
      <div className="min-w-0 pr-1">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium leading-snug">
          {label}
        </Label>
        {hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function WizardPage() {
  const { wizard, setWizard, line, setRecommendation } = useApp();
  const nav = useNavigate();

  const generate = () => {
    if (!line.lineNumber || !line.projectName) {
      toast.error("Add project name and line number first.");
      nav({ to: "/inputs" });
      return;
    }
    const rec = recommendSupport(line, wizard);
    setRecommendation(rec);
    nav({ to: "/report" });
  };

  const override = !!wizard.overrideMode;

  return (
    <div className="space-y-4 pb-36 md:space-y-6 md:pb-24">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          Step 2 · Support selection
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Support Selection Wizard
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Answer the practical questions a piping engineer would ask on site.
        </p>
        <div className="grid gap-2 rounded-md border border-border bg-muted/20 p-3 text-xs sm:grid-cols-3">
          <div>
            <span className="block text-muted-foreground">Line</span>
            <span className="font-medium">{line.lineNumber || "Not set"}</span>
          </div>
          <div>
            <span className="block text-muted-foreground">Service</span>
            <span className="font-medium">{line.service || "Not set"}</span>
          </div>
          <div>
            <span className="block text-muted-foreground">Mode</span>
            <span className="font-medium">{override ? "Markup override" : "Guided questions"}</span>
          </div>
        </div>
      </div>

      <Card className="border-accent/40 bg-accent/5">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3 rounded-md border border-accent/30 bg-background/30 p-3">
            <Checkbox
              id="override-mode"
              checked={override}
              onCheckedChange={(v) => setWizard({ overrideMode: !!v })}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <Label htmlFor="override-mode" className="text-sm font-medium cursor-pointer">
                Override wizard logic / Use markup-based support function
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                Pick the support function from your isometric / GA / stress markup. The app will
                still recommend the actual hardware and run validation checks.
              </p>
            </div>
          </div>

          {override && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-accent/30">
              <SelectField
                label="Support function from markup"
                value={wizard.manualFunction ?? "rest"}
                onValueChange={(v) => setWizard({ manualFunction: v as never })}
              >
                <SelectItem value="rest">Rest</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="anchor">Anchor</SelectItem>
                <SelectItem value="line-stop">Line Stop / Axial Stop</SelectItem>
                <SelectItem value="hold-down">Hold-down</SelectItem>
                <SelectItem value="spring">Spring Support</SelectItem>
                <SelectItem value="hanger">Hanger</SelectItem>
                <SelectItem value="vibration-restraint">Vibration Restraint</SelectItem>
              </SelectField>
              <SelectField
                label="Line orientation / location"
                value={wizard.orientation}
                onValueChange={(v) => setWizard({ orientation: v as never })}
              >
                <SelectItem value="horizontal">Horizontal run</SelectItem>
                <SelectItem value="vertical">Vertical run</SelectItem>
                <SelectItem value="sloped">Sloped line</SelectItem>
                <SelectItem value="change-direction">Elbow / change in direction</SelectItem>
              </SelectField>
              <SelectField
                label="At feature"
                value={wizard.nearFeature}
                onValueChange={(v) => setWizard({ nearFeature: v as never })}
                className="sm:col-span-2"
              >
                <SelectItem value="none">Mid-run</SelectItem>
                <SelectItem value="branch">Branch connection</SelectItem>
                <SelectItem value="equipment-nozzle">Equipment nozzle connection</SelectItem>
                <SelectItem value="valve">Valve</SelectItem>
                <SelectItem value="flange">Flange</SelectItem>
                <SelectItem value="bend">Bend</SelectItem>
                <SelectItem value="anchor-point">Anchor point</SelectItem>
                <SelectItem value="expansion-loop">Expansion loop</SelectItem>
              </SelectField>
              <p className="sm:col-span-2 text-xs text-muted-foreground italic">
                Markup mode selects the intended support function only. Hardware, movement and
                validations are still derived from line data, insulation, temperature and structure
                availability.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!override && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Geometry & location</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Orientation"
                value={wizard.orientation}
                onValueChange={(v) => setWizard({ orientation: v as never })}
              >
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="sloped">Sloped</SelectItem>
                <SelectItem value="change-direction">Changing Direction</SelectItem>
              </SelectField>
              <SelectField
                label="Near feature"
                value={wizard.nearFeature}
                onValueChange={(v) => setWizard({ nearFeature: v as never })}
              >
                <SelectItem value="none">None / mid-run</SelectItem>
                <SelectItem value="equipment-nozzle">Equipment Nozzle</SelectItem>
                <SelectItem value="valve">Valve</SelectItem>
                <SelectItem value="flange">Flange</SelectItem>
                <SelectItem value="anchor-point">Anchor Point</SelectItem>
                <SelectItem value="bend">Bend</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="expansion-loop">Expansion Loop</SelectItem>
              </SelectField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Movement & loading</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Toggle
                id="thermal-movement"
                label="Thermal movement expected"
                hint="Allow axial growth or restrain via stop/anchor."
                value={wizard.thermalMovement}
                onChange={(v) => setWizard({ thermalMovement: v })}
              />
              <Toggle
                id="uplift-possible"
                label="Uplift possible"
                hint="Two-phase / thermal bowing / vertical loops."
                value={wizard.upliftPossible}
                onChange={(v) => setWizard({ upliftPossible: v })}
              />
              <Toggle
                id="vibration"
                label="Vibration / pulsation / dynamic"
                value={wizard.vibration}
                onChange={(v) => setWizard({ vibration: v })}
              />
              <Toggle
                id="vertical-adjustment"
                label="Vertical adjustment required"
                hint="Spring vs rigid hanger."
                value={wizard.verticalAdjustment}
                onChange={(v) => setWizard({ verticalAdjustment: v })}
              />
              <SelectField
                label="Axial movement"
                value={wizard.axialMovement}
                onValueChange={(v) => setWizard({ axialMovement: v as never })}
              >
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="restrain">Restrain</SelectItem>
              </SelectField>
              <SelectField
                label="Lateral movement"
                value={wizard.lateralMovement}
                onValueChange={(v) => setWizard({ lateralMovement: v as never })}
              >
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="restrain">Restrain</SelectItem>
              </SelectField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Constructability & service</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Toggle
                id="permanent-support"
                label="Permanent support"
                value={wizard.permanent}
                onChange={(v) => setWizard({ permanent: v })}
              />
              <Toggle
                id="welding-allowed"
                label="Welding to pipe permitted"
                value={wizard.weldingAllowed}
                onChange={(v) => setWizard({ weldingAllowed: v })}
              />
              <SelectField
                label="Special service"
                value={wizard.specialService}
                onValueChange={(v) => setWizard({ specialService: v as never })}
                className="sm:col-span-2"
              >
                <SelectItem value="none">Standard</SelectItem>
                <SelectItem value="cryogenic">Cryogenic</SelectItem>
                <SelectItem value="hot">Hot Service</SelectItem>
                <SelectItem value="sour">Sour</SelectItem>
                <SelectItem value="corrosive">Corrosive</SelectItem>
                <SelectItem value="firewater">Firewater</SelectItem>
              </SelectField>
            </CardContent>
          </Card>
        </>
      )}

      <FlowFooter
        primaryLabel="Generate Recommendation"
        onPrimary={generate}
        hint={
          override
            ? "Markup mode: app validates your selection and recommends hardware."
            : "Answers drive the recommendation engine."
        }
      />
    </div>
  );
}
