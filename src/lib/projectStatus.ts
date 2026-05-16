import type { LineInput, ProjectLine, WizardInput } from "./types";

export interface SavedProjectSnapshot {
  id: string;
  name: string;
  savedAt: string;
  line: LineInput;
  wizard: WizardInput;
  lineList?: ProjectLine[];
  activeLineId?: string | null;
}

export function getActiveSavedProject(
  savedProjects: SavedProjectSnapshot[],
  activeProjectId: string | null | undefined,
  projectName: string,
) {
  return (
    savedProjects.find((project) => project.id === activeProjectId) ??
    savedProjects.find((project) => project.name === projectName) ??
    null
  );
}

export function hasUnsavedProjectChanges({
  line,
  wizard,
  lineList,
  activeLineId,
  savedProject,
}: {
  line: LineInput;
  wizard: WizardInput;
  lineList: ProjectLine[];
  activeLineId: string | null;
  savedProject: SavedProjectSnapshot | null;
}) {
  if (!savedProject) {
    return Boolean(
      line.projectName ||
      line.lineNumber ||
      lineList.length ||
      line.service ||
      line.area ||
      line.designPressure ||
      line.designTemp,
    );
  }

  return (
    JSON.stringify({
      line,
      wizard,
      lineList,
      activeLineId,
    }) !==
    JSON.stringify({
      line: savedProject.line,
      wizard: savedProject.wizard,
      lineList: savedProject.lineList ?? [],
      activeLineId: savedProject.activeLineId ?? null,
    })
  );
}

export function confirmBeforeReplacingProject({
  projectName,
  hasUnsavedChanges,
}: {
  projectName: string;
  hasUnsavedChanges: boolean;
}) {
  if (!hasUnsavedChanges) return true;

  return window.confirm(
    `Save changes to ${projectName || "the current project"} before loading another project?\n\nChoose Cancel to stay here and save first. Choose OK to continue loading without saving.`,
  );
}
