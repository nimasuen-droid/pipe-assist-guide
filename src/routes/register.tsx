import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Pencil, Layers } from "lucide-react";
import { exportRegisterCSV } from "@/lib/export";
import { FlowFooter } from "@/components/FlowFooter";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportRegisterEntry, Structure } from "@/lib/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Support Register — Pipe Support Smart Assist" },
      {
        name: "description",
        content: "Project support register with tag, type, function, movement and review flags.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, removeFromRegister, structures, updateRegisterEntry, bulkUpdateRegister } =
    useApp();
  const counts = new Map<string, number>();
  register.forEach((r) => {
    if (r.structureId) counts.set(r.structureId, (counts.get(r.structureId) ?? 0) + 1);
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<SupportRegisterEntry | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const allChecked = register.length > 0 && selected.size === register.length;
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(register.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support Register</h1>
          <p className="text-sm text-muted-foreground">
            {register.length} support(s) saved{selected.size ? ` · ${selected.size} selected` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={selected.size === 0}
            onClick={() => setBulkOpen(true)}
          >
            <Layers className="mr-2 h-4 w-4" /> Edit selected ({selected.size})
          </Button>
          <Button onClick={() => exportRegisterCSV(register)} disabled={!register.length}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      {register.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No supports added yet. Generate a recommendation and click <b>Add to Register</b>.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent
            className="overflow-x-auto p-0"
            tabIndex={0}
            aria-label="Support register table"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                Project support register with line, support type, structural assignment, review
                flags, remarks, and row actions.
              </caption>
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th scope="col" className="py-2 px-3 w-8">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  {[
                    "Tag",
                    "Line",
                    "Location",
                    "Type",
                    "Function",
                    "Structure",
                    "Shared",
                    "Allowed",
                    "Restrained",
                    "Insul.",
                    "Stress",
                    "Struct.",
                    "Remarks",
                    "",
                  ].map((h) => (
                    <th key={h} scope="col" className="text-left py-2 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {register.map((e) => {
                  const struct = structures.find((s) => s.id === e.structureId);
                  const shared = e.structureId ? (counts.get(e.structureId) ?? 0) > 1 : false;
                  return (
                    <tr key={e.id} className="border-t border-border align-top">
                      <td className="py-2 px-3">
                        <Checkbox
                          checked={selected.has(e.id)}
                          onCheckedChange={() => toggleOne(e.id)}
                          aria-label={`Select ${e.tag}`}
                        />
                      </td>
                      <td className="py-2 px-3 font-medium">{e.tag}</td>
                      <td className="py-2 px-3">{e.lineNumber}</td>
                      <td className="py-2 px-3">{e.location}</td>
                      <td className="py-2 px-3">{e.supportType}</td>
                      <td className="py-2 px-3">{e.function}</td>
                      <td className="py-2 px-3">
                        {struct ? (
                          <span className="font-mono">{struct.tag}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {shared ? (
                          <Badge className="bg-warning text-warning-foreground">Shared</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3">{e.movementAllowed}</td>
                      <td className="py-2 px-3">{e.movementRestrained}</td>
                      <td className="py-2 px-3">{e.insulation}</td>
                      <td className="py-2 px-3">
                        {e.stressReview ? (
                          <Badge className="bg-warning text-warning-foreground">Yes</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {e.structuralReview ? (
                          <Badge className="bg-warning text-warning-foreground">Yes</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{e.remarks}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(e)}
                          aria-label={`Edit support ${e.tag}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromRegister(e.id)}
                          aria-label={`Delete support ${e.tag}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {editing && (
        <EditDialog
          entry={editing}
          structures={structures}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateRegisterEntry(editing.id, patch);
            setEditing(null);
          }}
        />
      )}

      <BulkEditDialog
        open={bulkOpen}
        count={selectedIds.length}
        structures={structures}
        onClose={() => setBulkOpen(false)}
        onApply={(patch) => {
          bulkUpdateRegister(selectedIds, patch);
          setBulkOpen(false);
          setSelected(new Set());
        }}
      />
      <FlowFooter
        primaryDisabled={register.length === 0}
        hint={register.length === 0 ? "Add at least one support to continue." : undefined}
      />
    </div>
  );
}

function EditDialog({
  entry,
  structures,
  onClose,
  onSave,
}: {
  entry: SupportRegisterEntry;
  structures: Structure[];
  onClose: () => void;
  onSave: (p: Partial<SupportRegisterEntry>) => void;
}) {
  const [tag, setTag] = useState(entry.tag);
  const [lineNumber, setLineNumber] = useState(entry.lineNumber);
  const [location, setLocation] = useState(entry.location);
  const [supportType, setSupportType] = useState(entry.supportType);
  const [func, setFunc] = useState(entry.function);
  const [loadClass, setLoadClass] = useState(entry.loadClass);
  const [movementAllowed, setMovementAllowed] = useState(entry.movementAllowed);
  const [movementRestrained, setMovementRestrained] = useState(entry.movementRestrained);
  const [insulation, setInsulation] = useState(entry.insulation);
  const [stressReview, setStressReview] = useState(entry.stressReview);
  const [structuralReview, setStructuralReview] = useState(entry.structuralReview);
  const [remarks, setRemarks] = useState(entry.remarks);
  const [structureId, setStructureId] = useState<string>(entry.structureId ?? "__none__");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit support — {entry.tag}</DialogTitle>
          <DialogDescription>
            Update tagging, function, movement, reviews and structure assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tag">
            <Input value={tag} onChange={(e) => setTag(e.target.value)} />
          </Field>
          <Field label="Line">
            <Input value={lineNumber} onChange={(e) => setLineNumber(e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Support type">
            <Input value={supportType} onChange={(e) => setSupportType(e.target.value)} />
          </Field>
          <Field label="Function" className="col-span-2">
            <Input value={func} onChange={(e) => setFunc(e.target.value)} />
          </Field>
          <Field label="Load class">
            <Input value={loadClass} onChange={(e) => setLoadClass(e.target.value)} />
          </Field>
          <Field label="Insulation">
            <Input value={insulation} onChange={(e) => setInsulation(e.target.value)} />
          </Field>
          <Field label="Movement allowed">
            <Input value={movementAllowed} onChange={(e) => setMovementAllowed(e.target.value)} />
          </Field>
          <Field label="Movement restrained">
            <Input
              value={movementRestrained}
              onChange={(e) => setMovementRestrained(e.target.value)}
            />
          </Field>
          <Field label="Structure" className="col-span-2">
            <Select value={structureId} onValueChange={setStructureId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Unassigned —</SelectItem>
                {structures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.tag} · {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={stressReview} onCheckedChange={(v) => setStressReview(!!v)} /> Stress
            review
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={structuralReview}
              onCheckedChange={(v) => setStructuralReview(!!v)}
            />{" "}
            Structural review
          </label>
          <Field label="Remarks" className="col-span-2">
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                tag,
                lineNumber,
                location,
                supportType,
                function: func,
                loadClass,
                movementAllowed,
                movementRestrained,
                insulation,
                stressReview,
                structuralReview,
                remarks,
                structureId: structureId === "__none__" ? undefined : structureId,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkEditDialog({
  open,
  count,
  structures,
  onClose,
  onApply,
}: {
  open: boolean;
  count: number;
  structures: Structure[];
  onClose: () => void;
  onApply: (p: Partial<SupportRegisterEntry>) => void;
}) {
  // Each field is opt-in via its checkbox; only checked fields are applied.
  const [useLine, setUseLine] = useState(false);
  const [lineNumber, setLineNumber] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState("");
  const [useType, setUseType] = useState(false);
  const [supportType, setSupportType] = useState("");
  const [useFunc, setUseFunc] = useState(false);
  const [func, setFunc] = useState("");
  const [useLoad, setUseLoad] = useState(false);
  const [loadClass, setLoadClass] = useState("");
  const [useInsul, setUseInsul] = useState(false);
  const [insulation, setInsulation] = useState("");
  const [useStress, setUseStress] = useState(false);
  const [stressReview, setStressReview] = useState(false);
  const [useStruct, setUseStruct] = useState(false);
  const [structuralReview, setStructuralReview] = useState(false);
  const [useStructure, setUseStructure] = useState(false);
  const [structureId, setStructureId] = useState<string>("__none__");
  const [useRemarks, setUseRemarks] = useState(false);
  const [remarks, setRemarks] = useState("");

  const apply = () => {
    const p: Partial<SupportRegisterEntry> = {};
    if (useLine) p.lineNumber = lineNumber;
    if (useLocation) p.location = location;
    if (useType) p.supportType = supportType;
    if (useFunc) p.function = func;
    if (useLoad) p.loadClass = loadClass;
    if (useInsul) p.insulation = insulation;
    if (useStress) p.stressReview = stressReview;
    if (useStruct) p.structuralReview = structuralReview;
    if (useStructure) p.structureId = structureId === "__none__" ? undefined : structureId;
    if (useRemarks) p.remarks = remarks;
    onApply(p);
  };

  const Row = ({
    on,
    setOn,
    label,
    children,
  }: {
    on: boolean;
    setOn: (v: boolean) => void;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="grid grid-cols-[24px_140px_1fr] items-center gap-2">
      <Checkbox checked={on} onCheckedChange={(v) => setOn(!!v)} />
      <Label className="text-sm">{label}</Label>
      <div className={on ? "" : "opacity-50 pointer-events-none"}>{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk edit · {count} support(s)</DialogTitle>
          <DialogDescription>
            Tick a field to apply that value to every selected support. Untouched fields are left
            as-is.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Row on={useLine} setOn={setUseLine} label="Line">
            <Input value={lineNumber} onChange={(e) => setLineNumber(e.target.value)} />
          </Row>
          <Row on={useLocation} setOn={setUseLocation} label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Row>
          <Row on={useType} setOn={setUseType} label="Support type">
            <Input value={supportType} onChange={(e) => setSupportType(e.target.value)} />
          </Row>
          <Row on={useFunc} setOn={setUseFunc} label="Function">
            <Input value={func} onChange={(e) => setFunc(e.target.value)} />
          </Row>
          <Row on={useLoad} setOn={setUseLoad} label="Load class">
            <Input value={loadClass} onChange={(e) => setLoadClass(e.target.value)} />
          </Row>
          <Row on={useInsul} setOn={setUseInsul} label="Insulation">
            <Input value={insulation} onChange={(e) => setInsulation(e.target.value)} />
          </Row>
          <Row on={useStructure} setOn={setUseStructure} label="Structure">
            <Select value={structureId} onValueChange={setStructureId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Unassigned —</SelectItem>
                {structures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.tag} · {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row on={useStress} setOn={setUseStress} label="Stress review">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={stressReview} onCheckedChange={(v) => setStressReview(!!v)} /> Mark
              as required
            </label>
          </Row>
          <Row on={useStruct} setOn={setUseStruct} label="Structural review">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={structuralReview}
                onCheckedChange={(v) => setStructuralReview(!!v)}
              />{" "}
              Mark as required
            </label>
          </Row>
          <Row on={useRemarks} setOn={setUseRemarks} label="Remarks">
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={apply}>Apply to {count}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
