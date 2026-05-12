import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
      { name: "description", content: "Answer engineering questions to drive the support recommendation." },
    ],
  }),
  component: WizardPage,
});

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
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
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Support Selection Wizard</h1>
        <p className="text-sm text-muted-foreground">Answer the practical questions a piping engineer would ask on site.</p>
      </div>

      <Card className="border-accent/40 bg-accent/5">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="override-mode"
              checked={override}
              onCheckedChange={(v) => setWizard({ overrideMode: !!v })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="override-mode" className="text-sm font-medium cursor-pointer">
                Override wizard logic / Use markup-based support function
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                Pick the support function from your isometric / GA / stress markup. The app will still recommend the actual hardware and run validation checks.
              </p>
            </div>
          </div>

          {override && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-accent/30">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Support function (from markup)</Label>
                <Select
                  value={wizard.manualFunction ?? "rest"}
                  onValueChange={(v) => setWizard({ manualFunction: v as never })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">Rest</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="anchor">Anchor</SelectItem>
                    <SelectItem value="line-stop">Line Stop / Axial Stop</SelectItem>
                    <SelectItem value="hold-down">Hold-down</SelectItem>
                    <SelectItem value="spring">Spring Support</SelectItem>
                    <SelectItem value="hanger">Hanger</SelectItem>
                    <SelectItem value="vibration-restraint">Vibration Restraint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Line orientation / location</Label>
                <Select
                  value={wizard.orientation}
                  onValueChange={(v) => setWizard({ orientation: v as never })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal run</SelectItem>
                    <SelectItem value="vertical">Vertical run</SelectItem>
                    <SelectItem value="sloped">Sloped line</SelectItem>
                    <SelectItem value="change-direction">Elbow / change in direction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">At feature</Label>
                <Select value={wizard.nearFeature} onValueChange={(v) => setWizard({ nearFeature: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Mid-run</SelectItem>
                    <SelectItem value="branch">Branch connection</SelectItem>
                    <SelectItem value="equipment-nozzle">Equipment nozzle connection</SelectItem>
                    <SelectItem value="valve">Valve</SelectItem>
                    <SelectItem value="flange">Flange</SelectItem>
                    <SelectItem value="bend">Bend</SelectItem>
                    <SelectItem value="anchor-point">Anchor point</SelectItem>
                    <SelectItem value="expansion-loop">Expansion loop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="sm:col-span-2 text-xs text-muted-foreground italic">
                Markup mode selects the intended support function only. Hardware, movement and validations are still derived from line data, insulation, temperature and structure availability.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!override && (
        <>
      <Card>
        <CardHeader><CardTitle className="text-base">Geometry & location</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Orientation</Label>
            <Select value={wizard.orientation} onValueChange={(v) => setWizard({ orientation: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="sloped">Sloped</SelectItem>
                <SelectItem value="change-direction">Changing Direction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Near feature</Label>
            <Select value={wizard.nearFeature} onValueChange={(v) => setWizard({ nearFeature: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / mid-run</SelectItem>
                <SelectItem value="equipment-nozzle">Equipment Nozzle</SelectItem>
                <SelectItem value="valve">Valve</SelectItem>
                <SelectItem value="flange">Flange</SelectItem>
                <SelectItem value="anchor-point">Anchor Point</SelectItem>
                <SelectItem value="bend">Bend</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="expansion-loop">Expansion Loop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Movement & loading</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Thermal movement expected" hint="Allow axial growth or restrain via stop/anchor." value={wizard.thermalMovement} onChange={(v) => setWizard({ thermalMovement: v })} />
          <Toggle label="Uplift possible" hint="Two-phase / thermal bowing / vertical loops." value={wizard.upliftPossible} onChange={(v) => setWizard({ upliftPossible: v })} />
          <Toggle label="Vibration / pulsation / dynamic" value={wizard.vibration} onChange={(v) => setWizard({ vibration: v })} />
          <Toggle label="Vertical adjustment required" hint="Spring vs rigid hanger." value={wizard.verticalAdjustment} onChange={(v) => setWizard({ verticalAdjustment: v })} />
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Axial movement</Label>
            <Select value={wizard.axialMovement} onValueChange={(v) => setWizard({ axialMovement: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="restrain">Restrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Lateral movement</Label>
            <Select value={wizard.lateralMovement} onValueChange={(v) => setWizard({ lateralMovement: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="restrain">Restrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Constructability & service</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Permanent support" value={wizard.permanent} onChange={(v) => setWizard({ permanent: v })} />
          <Toggle label="Welding to pipe permitted" value={wizard.weldingAllowed} onChange={(v) => setWizard({ weldingAllowed: v })} />
          <div className="sm:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">Special service</Label>
            <Select value={wizard.specialService} onValueChange={(v) => setWizard({ specialService: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Standard</SelectItem>
                <SelectItem value="cryogenic">Cryogenic</SelectItem>
                <SelectItem value="hot">Hot Service</SelectItem>
                <SelectItem value="sour">Sour</SelectItem>
                <SelectItem value="corrosive">Corrosive</SelectItem>
                <SelectItem value="firewater">Firewater</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      <FlowFooter
        primaryLabel="Generate Recommendation"
        onPrimary={generate}
        hint={override ? "Markup mode: app validates your selection and recommends hardware." : "Answers drive the recommendation engine."}
      />
    </div>
  );
}