import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2 } from "lucide-react";
import { exportRegisterCSV } from "@/lib/export";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Support Register — Pipe Support Smart Assist" },
      { name: "description", content: "Project support register with tag, type, function, movement and review flags." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, removeFromRegister } = useApp();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support Register</h1>
          <p className="text-sm text-muted-foreground">{register.length} support(s) saved.</p>
        </div>
        <Button onClick={() => exportRegisterCSV(register)} disabled={!register.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      {register.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No supports added yet. Generate a recommendation and click <b>Add to Register</b>.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  {["Tag","Line","Location","Type","Function","Load","Allowed","Restrained","Insul.","Stress","Struct.","Remarks",""].map((h) => (
                    <th key={h} className="text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {register.map((e) => (
                  <tr key={e.id} className="border-t border-border align-top">
                    <td className="py-2 px-3 font-medium">{e.tag}</td>
                    <td className="py-2 px-3">{e.lineNumber}</td>
                    <td className="py-2 px-3">{e.location}</td>
                    <td className="py-2 px-3">{e.supportType}</td>
                    <td className="py-2 px-3 max-w-[200px]">{e.function}</td>
                    <td className="py-2 px-3">{e.loadClass}</td>
                    <td className="py-2 px-3">{e.movementAllowed}</td>
                    <td className="py-2 px-3">{e.movementRestrained}</td>
                    <td className="py-2 px-3">{e.insulation}</td>
                    <td className="py-2 px-3">{e.stressReview ? <Badge className="bg-warning text-warning-foreground">Yes</Badge> : "—"}</td>
                    <td className="py-2 px-3">{e.structuralReview ? <Badge className="bg-warning text-warning-foreground">Yes</Badge> : "—"}</td>
                    <td className="py-2 px-3 max-w-[220px] text-xs text-muted-foreground">{e.remarks}</td>
                    <td className="py-2 px-3"><Button size="icon" variant="ghost" onClick={() => removeFromRegister(e.id)}><Trash2 className="h-4 w-4"/></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}