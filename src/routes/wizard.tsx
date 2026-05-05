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
    const rec = recommendSupport(line, wizard);
    setRecommendation(rec);
    nav({ to: "/report" });
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Support Selection Wizard</h1>
        <p className="text-sm text-muted-foreground">Answer the practical questions a piping engineer would ask on site.</p>
      </div>

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

      <FlowFooter
        primaryLabel="Generate Recommendation"
        onPrimary={generate}
        hint="Answers drive the recommendation engine."
      />
    </div>
  );
}