"use client";

import { useState, useEffect } from "react";

/**
 * Tracks the actual visible viewport height via the Visual Viewport API.
 * On iOS, this adjusts dynamically when the software keyboard opens/closes,
 * preventing the floating dock or bottom sheets from being covered or jumping.
 *
 * Returns `window.innerHeight` as fallback when Visual Viewport API is unavailable.
 */
export function useVisualViewport() {
    const [viewportHeight, setViewportHeight] = useState(
        () => (typeof window !== "undefined" ? (window.visualViewport?.height ?? window.innerHeight) : 800)
    );

    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                setViewportHeight(window.visualViewport.height);
            }
        };

        window.visualViewport?.addEventListener("resize", handleResize);
        return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }, []);

    return viewportHeight;
}
