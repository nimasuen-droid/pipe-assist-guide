import { useEffect, useMemo, useState, type ComponentType } from "react";
import { CheckCircle2, Download, HardDrive, MonitorDown, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function OfflineInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    setStandalone(isStandalone());
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setStandalone(true);
      setInstallPrompt(null);
      toast.success("Desktop app installed");
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(() => setServiceWorkerReady(true))
        .catch(() => setServiceWorkerReady(false));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const status = useMemo(() => {
    if (standalone) return "Installed";
    if (installPrompt) return "Ready to install";
    if (serviceWorkerReady) return "Offline cache ready";
    return "Browser install available";
  }, [installPrompt, serviceWorkerReady, standalone]);

  const handleInstall = async () => {
    if (!installPrompt) {
      toast.info("Use your browser menu, then choose Install app or Install Pipe Support.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("Installing desktop app");
    }
    setInstallPrompt(null);
  };

  return (
    <section
      className="rounded-lg border border-primary/30 bg-card p-4"
      aria-labelledby="offline-install-title"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
              <MonitorDown className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="offline-install-title" className="text-base font-semibold">
                Offline desktop installation
              </h2>
              <p className="text-xs text-muted-foreground">
                Install the app on this computer and keep core screens available without a network.
              </p>
            </div>
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <StatusItem
              icon={HardDrive}
              label="App shell"
              value={serviceWorkerReady || standalone ? "Cached" : "Caches after production load"}
            />
            <StatusItem
              icon={WifiOff}
              label="Network"
              value={online ? "Online now" : "Offline mode"}
            />
            <StatusItem icon={CheckCircle2} label="Install status" value={status} />
          </div>

          <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            <li>Open this app in Chrome or Edge on the desktop computer.</li>
            <li>Choose Install from the browser address bar or menu when prompted.</li>
            <li>Save each project to a local records folder so project data remains available.</li>
          </ol>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Badge
            variant="outline"
            className="justify-center border-primary/40 bg-primary/10 text-primary"
          >
            {standalone ? "Running as desktop app" : "Offline-first PWA"}
          </Badge>
          <Button onClick={handleInstall} disabled={standalone}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {standalone ? "Installed" : "Install Desktop App"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function StatusItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}
