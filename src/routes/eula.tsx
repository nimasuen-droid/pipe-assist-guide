import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { EulaContent } from "@/components/EulaContent";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "EULA & Disclaimer - Pipe Support Smart Assist" },
      { name: "description", content: "End User License Agreement and engineering disclaimer." },
    ],
  }),
  component: EulaPage,
});

function EulaPage() {
  const { eulaAccepted, acceptEula, revokeEula } = useApp();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ShieldCheck className="h-7 w-7 text-primary" /> EULA & Disclaimer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          End User License Agreement v1.0 - Effective 2026
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-foreground/90">
          <b>Decision-support tool only.</b> All outputs must be independently verified by a
          qualified piping engineer before being used for procurement, fabrication, construction,
          commissioning, or operation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <EulaContent />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-md border border-border bg-card p-4">
        <div className="text-sm">
          {eulaAccepted ? (
            <span className="text-success">You have accepted this agreement.</span>
          ) : (
            <span className="text-muted-foreground">You have not yet accepted this agreement.</span>
          )}
        </div>
        <div className="flex gap-2">
          {eulaAccepted && (
            <Button variant="outline" onClick={revokeEula}>
              Require acceptance again
            </Button>
          )}
          <Button onClick={acceptEula} disabled={eulaAccepted}>
            {eulaAccepted ? "Accepted" : "I Accept"}
          </Button>
        </div>
      </div>
    </div>
  );
}
