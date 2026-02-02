"use client";

import { useEffect } from "react";

export function SplashDismiss() {
  useEffect(() => {
    const el = document.getElementById("splash-screen");
    if (!el) return;

    // Fade out, then remove from DOM
    el.style.opacity = "0";
    const timer = setTimeout(() => el.remove(), 350);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
