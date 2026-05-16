import { generateMTO } from "./mto";
import type {
  LineInput,
  ProjectArchiveData,
  ProjectLine,
  Structure,
  SupportRegisterEntry,
  WizardInput,
} from "./types";

interface FileSystemWritableFileStream {
  write(data: BlobPart): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface DirectoryPickerOptions {
  mode?: "read" | "readwrite";
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  }
}

export interface ArchiveSourceState {
  line: LineInput;
  wizard: WizardInput;
  lineList: ProjectLine[];
  activeLineId: string | null;
  register: SupportRegisterEntry[];
  structures: Structure[];
  tagging: ProjectArchiveData["tagging"];
  tagCounter: number;
}

export function createProjectArchiveData(state: ArchiveSourceState): ProjectArchiveData {
  return {
    app: "pipe-support-smart-assist",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    line: state.line,
    wizard: state.wizard,
    lineList: state.lineList,
    activeLineId: state.activeLineId,
    register: state.register,
    structures: state.structures,
    tagging: state.tagging,
    tagCounter: state.tagCounter,
  };
}

export async function saveProjectArchiveToFolder(data: ProjectArchiveData): Promise<string> {
  if (!window.showDirectoryPicker) {
    throw new Error("folder-picker-unavailable");
  }

  const root = await window.showDirectoryPicker({ mode: "readwrite" });
  const projectFolderName = safeName(data.line.projectName || "Untitled Project");
  const projectFolder = await root.getDirectoryHandle(projectFolderName, { create: true });

  await writeText(projectFolder, "app-project.json", JSON.stringify(data, null, 2));
  await writeText(projectFolder, "line-list.csv", serializeLineList(data.lineList));
  await writeText(projectFolder, "support-register.csv", serializeRegister(data.register));
  await writeText(projectFolder, "material-takeoff.csv", serializeMto(data.register));
  await writeText(projectFolder, "project-summary.txt", buildSummary(data));
  await writeText(projectFolder, "README-FIRST.txt", buildReadme(projectFolderName));

  return projectFolderName;
}

export async function loadProjectArchiveFromFile(): Promise<ProjectArchiveData> {
  if (!window.showOpenFilePicker) {
    throw new Error("file-picker-unavailable");
  }

  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: "Pipe Support Smart Assist project archive",
        accept: { "application/json": [".json"] },
      },
    ],
  });
  const file = await handle.getFile();
  const data = JSON.parse(await file.text()) as ProjectArchiveData;
  if (data.app !== "pipe-support-smart-assist" || data.schemaVersion !== 1) {
    throw new Error("invalid-project-archive");
  }
  return data;
}

function buildReadme(projectFolderName: string): string {
  return [
    "Pipe Support Smart Assist Project Records",
    "",
    `Project folder: ${projectFolderName}`,
    "",
    "To reload this project in the app:",
    "1. Open Pipe Support Smart Assist.",
    "2. Choose Load From Project Folder.",
    "3. Select app-project.json from this folder.",
    "",
    "Files for long-term records:",
    "- app-project.json: full app-format archive for reloading.",
    "- line-list.csv: user-readable project line list.",
    "- support-register.csv: user-readable support register.",
    "- material-takeoff.csv: user-readable preliminary MTO.",
    "- project-summary.txt: plain-text project summary.",
  ].join("\n");
}

function buildSummary(data: ProjectArchiveData): string {
  return [
    `Project: ${data.line.projectName || "Untitled"}`,
    `Area: ${data.line.area || "-"}`,
    `Active line: ${data.line.lineNumber || "-"}`,
    `Exported: ${data.exportedAt}`,
    "",
    `Project line rows: ${data.lineList.length}`,
    `Support register rows: ${data.register.length}`,
    `Structures: ${data.structures.length}`,
  ].join("\n");
}

async function writeText(folder: FileSystemDirectoryHandle, name: string, content: string) {
  const handle = await folder.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

function serializeLineList(lines: ProjectLine[]): string {
  return toCSV([
    [
      "Project Name",
      "Area",
      "Line Number",
      "Section Name",
      "Pipe Size",
      "Schedule",
      "Material",
      "Service",
      "Design Pressure",
      "Design Temp",
      "Operating Temp",
      "Insulation",
      "Insulation Thickness",
      "Layout",
      "Phase",
      "Notes",
    ],
    ...lines.map((line) => [
      line.projectName,
      line.area,
      line.lineNumber,
      line.sectionName ?? "",
      line.pipeSize,
      line.schedule,
      line.material,
      line.service,
      line.designPressure,
      line.designTemp,
      line.operatingTemp,
      line.insulation,
      line.insulationThickness ?? "",
      line.layout,
      line.phase,
      line.notes ?? "",
    ]),
  ]);
}

function serializeRegister(entries: SupportRegisterEntry[]): string {
  return toCSV([
    [
      "Tag",
      "Line",
      "Section",
      "Location",
      "Support Type",
      "Function",
      "Load Class",
      "Movement Allowed",
      "Movement Restrained",
      "Insulation",
      "Stress Review",
      "Structural Review",
      "Remarks",
    ],
    ...entries.map((entry) => [
      entry.tag,
      entry.lineNumber,
      entry.sectionName ?? "",
      entry.location,
      entry.supportType,
      entry.function,
      entry.loadClass,
      entry.movementAllowed,
      entry.movementRestrained,
      entry.insulation,
      entry.stressReview,
      entry.structuralReview,
      entry.remarks,
    ]),
  ]);
}

function serializeMto(entries: SupportRegisterEntry[]): string {
  return toCSV([
    [
      "Support Tag",
      "Line",
      "Support Type",
      "Component",
      "Material",
      "Size",
      "Qty",
      "Unit",
      "Category",
      "Remarks",
    ],
    ...entries.flatMap((entry) =>
      generateMTO(entry).map((item) => [
        item.supportTag,
        item.lineNumber,
        item.supportType,
        item.component,
        item.material,
        item.size,
        item.qty,
        item.unit,
        item.category,
        item.remarks,
      ]),
    ),
  ]);
}

function toCSV(rows: Array<Array<string | number | boolean>>): string {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function safeName(value: string): string {
  const cleaned = Array.from(value)
    .map((char) => (char.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(char) ? "-" : char))
    .join("");
  return cleaned.replace(/\s+/g, " ").trim().slice(0, 80) || "Untitled Project";
}
