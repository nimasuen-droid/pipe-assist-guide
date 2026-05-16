import { FolderOpen, HardDriveDownload, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import {
  createProjectArchiveData,
  loadProjectArchiveFromFile,
  saveProjectArchiveToFolder,
} from "@/lib/localArchive";

export function LocalRecordsBar() {
  const {
    line,
    wizard,
    lineList,
    activeLineId,
    register,
    structures,
    tagging,
    tagCounter,
    loadProjectArchive,
  } = useApp();

  const archiveData = createProjectArchiveData({
    line,
    wizard,
    lineList,
    activeLineId,
    register,
    structures,
    tagging,
    tagCounter,
  });

  const handleSave = async () => {
    try {
      const folderName = await saveProjectArchiveToFolder(archiveData);
      toast.success(`Saved records to folder: ${folderName}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(
        "Local folder saving is not available in this browser. Use Export JSON as a fallback.",
      );
    }
  };

  const handleLoad = async () => {
    try {
      toast.info("Select app-project.json from the saved project folder.");
      const data = await loadProjectArchiveFromFile();
      loadProjectArchive(data);
      toast.success(`Loaded project: ${data.line.projectName || "Untitled"}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not load that project archive. Choose the app-project.json file.");
    }
  };

  return (
    <section
      className="rounded-md border border-primary/30 bg-primary/5 p-3"
      aria-label="Local project records"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Local project records</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Save each project to a local folder. The app writes a reloadable{" "}
              <span className="font-mono text-foreground">app-project.json</span> plus CSV/TXT
              records for long-term access if the app is unavailable.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleSave}>
            <HardDriveDownload className="h-3.5 w-3.5" aria-hidden="true" />
            Save to Local Folder
          </Button>
          <Button size="sm" variant="outline" onClick={handleLoad}>
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Load From Project Folder
          </Button>
        </div>
      </div>
    </section>
  );
}
