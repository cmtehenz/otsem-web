"use client";

import { useEffect } from "react";

export function SplashDismiss() {
  useEffect(() => {
    const el = document.getElementById("splash-screen");
    if (!el) return;

    // Small delay so the page renders behind the splash before we fade out.
    // Without this, the splash disappears before content is painted, causing a flash.
    const delay = setTimeout(() => {
      el.style.opacity = "0";
    }, 100);
    const hide = setTimeout(() => {
      el.style.display = "none";
      el.style.pointerEvents = "none";
    }, 500);
    return () => {
      clearTimeout(delay);
      clearTimeout(hide);
    };
  }, []);

  return null;
}
