import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookMarked, Pencil, RotateCcw, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { SupportStandard } from "@/lib/store";
import { SupportStandardGraphic } from "@/components/SupportStandardGraphic";

export const Route = createFileRoute("/standards")({
  head: () => ({
    meta: [
      { title: "Pipe Support Standards — Pipe Support Smart Assist" },
      { name: "description", content: "Browse standard pipe support types, functions, codes and editable tag prefixes." },
    ],
  }),
  component: StandardsPage,
});

const categories = ["All", "Rigid", "Variable", "Constant", "Restraint", "Guide", "Anchor", "Special", "Structure"] as const;

function StandardsPage() {
  const { standards, updateStandard, resetStandards } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [editing, setEditing] = useState<SupportStandard | null>(null);
  const [draft, setDraft] = useState<{ tagPrefix: string; notes: string }>({ tagPrefix: "", notes: "" });

  const filtered = useMemo(() => {
    return standards.filter((s) => {
      if (cat !== "All" && s.category !== cat) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return (
        s.name.toLowerCase().includes(t) ||
        s.function.toLowerCase().includes(t) ||
        s.codes.some((c) => c.toLowerCase().includes(t))
      );
    });
  }, [standards, cat, q]);

  const openEdit = (s: SupportStandard) => {
    setEditing(s);
    setDraft({ tagPrefix: s.tagPrefix, notes: s.notes });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateStandard(editing.id, {
      tagPrefix: draft.tagPrefix.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || editing.tagPrefix,
      notes: draft.notes,
    });
    toast.success(`Updated ${editing.name}`);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Pipe Support Standards</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Catalogue of standard support types per MSS SP-58/69 & PFI ES-26. Tag prefixes are editable and persist for future projects.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { resetStandards(); toast.success("Standards restored to defaults"); }}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset to defaults
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, function, or code…"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <Button
              key={c}
              variant={cat === c ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setCat(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.id} className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                    <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
                      {s.tagPrefix}
                    </Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)} aria-label="Edit tag">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2.5">
              <SupportStandardGraphic id={s.id} />
              <p>{s.function}</p>
              <p className="text-xs text-muted-foreground"><b className="text-foreground">Typical use:</b> {s.typicalUse}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="uppercase text-muted-foreground mb-1 text-[10px]">Allowed</div>
                  {s.movementAllowed.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <ul className="space-y-0.5">{s.movementAllowed.map((m) => (
                      <li key={m} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success"/>{m}</li>
                    ))}</ul>
                  )}
                </div>
                <div>
                  <div className="uppercase text-muted-foreground mb-1 text-[10px]">Restrained</div>
                  {s.movementRestrained.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <ul className="space-y-0.5">{s.movementRestrained.map((m) => (
                      <li key={m} className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-warning"/>{m}</li>
                    ))}</ul>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {s.codes.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                ))}
              </div>
              {s.notes && <p className="text-xs text-muted-foreground italic border-t border-border pt-2">{s.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 text-center py-12 text-sm text-muted-foreground">
            No standards match your search.
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit · {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Tag Prefix</Label>
              <Input
                value={draft.tagPrefix}
                onChange={(e) => setDraft((d) => ({ ...d, tagPrefix: e.target.value.toUpperCase() }))}
                maxLength={6}
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Up to 6 letters/digits. Used when this support type is tagged.</p>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Notes</Label>
              <Input value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
        Reference catalogue only. Final selection must follow project specifications and stress analysis.
      </p>
    </div>
  );
}