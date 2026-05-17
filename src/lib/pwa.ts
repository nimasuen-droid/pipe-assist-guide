const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const isPreviewHost = () => {
  const host = window.location.hostname;
  return host.includes("id-preview--") || host.includes("lovable");
};

const shouldRegisterServiceWorker = () => {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (window.location.protocol === "file:") return false;
  if (isInIframe() || isPreviewHost()) return false;
  return import.meta.env.PROD || import.meta.env.VITE_ENABLE_PWA === "true";
};

export async function registerOfflineApp() {
  if (!shouldRegisterServiceWorker()) {
    if ("serviceWorker" in navigator && (isInIframe() || isPreviewHost())) {
      const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
