"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type BottomSheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const BottomSheetContext = React.createContext<BottomSheetContextValue>({
  open: false,
  onOpenChange: () => {},
});

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function BottomSheet({ open = false, onOpenChange, children }: BottomSheetProps) {
  const handleChange = React.useCallback(
    (v: boolean) => onOpenChange?.(v),
    [onOpenChange]
  );

  return (
    <BottomSheetContext.Provider value={{ open, onOpenChange: handleChange }}>
      {children}
    </BottomSheetContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual Viewport hook — tracks keyboard open/close on iOS          */
/* ------------------------------------------------------------------ */

function useVisualViewportHeight(enabled: boolean) {
  // Initialize with the current viewport height to avoid a null→number jump on first render
  const [height, setHeight] = React.useState<number>(
    () => (typeof window !== "undefined" ? (window.visualViewport?.height ?? window.innerHeight) : 800)
  );

  React.useEffect(() => {
    if (!enabled) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setHeight(vv.height);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return height;
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const DRAG_CLOSE_THRESHOLD = 100;
const DRAG_VELOCITY_THRESHOLD = 500;

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  side?: "bottom" | "center";
}

function BottomSheetContent({
  children,
  className,
  showCloseButton = true,
  side = "bottom",
}: BottomSheetContentProps) {
  const { open, onOpenChange } = React.useContext(BottomSheetContext);
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const vvHeight = useVisualViewportHeight(open);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Auto-scroll focused input into view when keyboard opens — scoped to sheet
  React.useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        // Wait for keyboard animation to complete on iOS (~300ms)
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
      }
    };

    el.addEventListener("focusin", handleFocusIn);
    return () => el.removeEventListener("focusin", handleFocusIn);
  }, [open]);

  const handleDragEnd = React.useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (
        info.offset.y > DRAG_CLOSE_THRESHOLD ||
        info.velocity.y > DRAG_VELOCITY_THRESHOLD
      ) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  if (!mounted) return null;

  // Cap sheet height to 94% of visual viewport — shrinks when iOS keyboard opens
  const maxHeightStyle: React.CSSProperties = {
    maxHeight: `${vvHeight * 0.94}px`,
    transition: "max-height 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bs-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            key="bs-sheet"
            ref={contentRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 36,
              mass: 0.8,
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col",
              "max-h-[92dvh]",
              "bg-[#0d0518]/95",
              "backdrop-blur-xl",
              "border-t border-white/10",
              "rounded-t-[24px]",
              "shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)]",
              "pwa-sheet-safe-bottom",
              side === "center" && "sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:border",
              className
            )}
            style={maxHeightStyle}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="h-1 w-9 rounded-full bg-white/20" />
            </div>

            {/* Inner content — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 scrollbar-hide">
              {children}
            </div>

            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Header / Title / Description / Footer / Close                      */
/* ------------------------------------------------------------------ */

function BottomSheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 pb-4", className)}
      {...props}
    />
  );
}

function BottomSheetTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-[17px] font-semibold text-white", className)}
      {...props}
    />
  );
}

function BottomSheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[13px] text-white/60", className)}
      {...props}
    />
  );
}

function BottomSheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 pt-4", className)}
      {...props}
    />
  );
}

function BottomSheetClose({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(BottomSheetContext);

  return (
    <button
      onClick={() => onOpenChange(false)}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetClose,
};
