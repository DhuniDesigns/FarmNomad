"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { triggerHaptic } from "@/lib/interactions";

export function Toast({ message, onClear }: { message?: string; onClear: () => void }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClear, 2600);
    return () => window.clearTimeout(timer);
  }, [message, onClear]);

  function dismiss() {
    triggerHaptic("selection");
    onClear();
  }

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 w-[min(calc(100vw-2.5rem),360px)] touch-pan-y overflow-hidden rounded-xl border border-border bg-white text-sm font-semibold text-ink-900 shadow-[0_18px_42px_rgba(23,35,27,0.16)]"
          drag={reduceMotion ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
          key={message}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 92 || Math.abs(info.velocity.x) > 520) dismiss();
          }}
          role="status"
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          whileDrag={reduceMotion ? undefined : { scale: 0.985 }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <CheckCircle2 aria-hidden="true" className="shrink-0 text-primary-600" size={18} />
            <span className="min-w-0 flex-1 break-words">{message}</span>
            <button className="grid size-8 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-soft hover:text-ink-900 focus-visible:ring-3 focus-visible:ring-primary-600/30" type="button" onClick={dismiss} aria-label="Dismiss notification">
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <motion.div
            aria-hidden="true"
            className="h-0.5 origin-left bg-primary-600"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 2.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
