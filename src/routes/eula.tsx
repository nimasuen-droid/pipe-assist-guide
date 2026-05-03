import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "EULA & Disclaimer — Pipe Support Smart Assist" },
      { name: "description", content: "End User License Agreement and engineering disclaimer." },
    ],
  }),
  component: EulaPage,
});

const SECTIONS: { h: string; b: string }[] = [
  { h: "1. Acceptance of Terms", b: "By using the Software, you confirm that you have read, understood, and agreed to be legally bound by this Agreement. If you are using the Software on behalf of an organization, you represent that you are authorized to bind that organization." },
  { h: "2. License Grant", b: "Subject to your compliance with this Agreement, you are granted a limited, non-exclusive, non-transferable, revocable license to use the Software for internal engineering screening, education, and design-support purposes only. You may not sublicense, rent, lease, sell, redistribute, reverse engineer, decompile, or create derivative works." },
  { h: "3. Engineering Disclaimer", b: "The Software is a decision-support tool only. It does not replace professional engineering judgment, qualified review, or compliance verification against the latest approved revisions of project codes, client specifications, and governing standards (ASME B31.3, MSS SP-58/69/89/127, PFI ES-26, API, ISO and applicable national codes). All outputs must be independently verified by a qualified piping engineer before being used for procurement, fabrication, construction, commissioning, or operation." },
  { h: "4. No Professional Liability", b: "The Software does not constitute professional engineering services, certification, or stamped deliverables. The User is solely responsible for verifying every result and obtaining sign-off from a qualified, licensed engineer." },
  { h: "5. Local Data Storage", b: "The Software stores design inputs, saved projects and overrides locally on your device using browser storage. You are solely responsible for backing up this data." },
  { h: "6. No Warranties (AS IS)", b: "THE SOFTWARE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE." },
  { h: "7. Limitation of Liability", b: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE OWNERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES — EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. USE OF THE SOFTWARE IS ENTIRELY AT THE USER'S OWN RISK." },
  { h: "8. Intellectual Property", b: "References to ASME, API, ISO and other third-party standards are the property of their respective organizations and are used solely for identification." },
  { h: "9. Termination", b: "This license remains in effect until terminated. Upon termination you must cease all use of the Software." },
  { h: "10. Updates", b: "Continued use after a material update to this Agreement constitutes acceptance of the revised terms." },
];

function EulaPage() {
  const { eulaAccepted, acceptEula } = useApp();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> EULA & Disclaimer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">End User License Agreement v1.0 · Effective 2026</p>
      </div>

      <div className="rounded-md border border-warning/40 bg-warning/10 p-3 flex items-start gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-foreground/90">
          <b>Decision-support tool only.</b> All outputs must be independently verified by a qualified piping engineer before being used for procurement, fabrication, construction, commissioning, or operation.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Agreement</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>This End User License Agreement (&quot;Agreement&quot;) is a binding legal agreement between you (the &quot;User&quot;) and the Owners governing your use of the Pipe Support Smart Assist (the &quot;Software&quot;).</p>
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h3 className="font-semibold mb-1">{s.h}</h3>
              <p className="text-muted-foreground">{s.b}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground border-t border-border pt-3">© 2026 Pipe Support Smart Assist. All rights reserved.</p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-md border border-border bg-card p-4">
        <div className="text-sm">
          {eulaAccepted ? (
            <span className="text-success">✓ You have accepted this agreement.</span>
          ) : (
            <span className="text-muted-foreground">You have not yet accepted this agreement.</span>
          )}
        </div>
        <Button onClick={acceptEula} disabled={eulaAccepted}>
          {eulaAccepted ? "Accepted" : "I Accept"}
        </Button>
      </div>
    </div>
  );
}