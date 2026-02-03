"use client";

import { useEffect } from "react";
import { toast } from "sonner";

function promptReload(waitingSw: ServiceWorker) {
  toast("Nova versão disponível", {
    description: "Atualize para obter as melhorias mais recentes.",
    duration: Infinity,
    action: {
      label: "Atualizar",
      onClick: () => {
        waitingSw.postMessage({ type: "SKIP_WAITING" });
      },
    },
  });
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Reload the page when a new SW takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // A new SW is already waiting (e.g. user revisits after deploy)
        if (registration.waiting) {
          promptReload(registration.waiting);
          return;
        }

        // A new SW is installing — wait for it to become waiting
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              // New SW installed while an old one is still controlling — prompt
              promptReload(installing);
            }
          });
        });
      })
      .catch(() => {
        // Registration failed — likely localhost without HTTPS or unsupported browser
      });
  }, []);

  return null;
}
