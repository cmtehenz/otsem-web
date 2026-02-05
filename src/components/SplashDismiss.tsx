"use client";

import { useEffect } from "react";

export function SplashDismiss() {
  useEffect(() => {
    const el = document.getElementById("splash-screen");
    if (!el) return;

    // Small delay so the page renders behind the splash before we fade out.
    const delay = setTimeout(() => {
      el.style.opacity = "0";
    }, 50);
    const hide = setTimeout(() => {
      el.style.display = "none";
      el.style.pointerEvents = "none";
    }, 250);
    return () => {
      clearTimeout(delay);
      clearTimeout(hide);
    };
  }, []);

  return null;
}
