"use client";

import { useEffect } from "react";

export function SplashDismiss() {
  useEffect(() => {
    const el = document.getElementById("splash-screen");
    if (!el) return;

    // Fade out, then hide — do NOT use el.remove() because React manages this
    // node as part of its fiber tree. Removing it from the real DOM while React
    // still tracks it causes "removeChild" errors on every subsequent re-render.
    el.style.opacity = "0";
    const timer = setTimeout(() => {
      el.style.display = "none";
      el.style.pointerEvents = "none";
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
