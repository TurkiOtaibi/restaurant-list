"use client";

import { useEffect } from "react";

export function PwaServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    function registerServiceWorker() {
      void navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .catch(() => undefined);
    }

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker);
    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  return null;
}
