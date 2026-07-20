"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function Toast({ message, onClear }: { message?: string; onClear: () => void }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClear, 2600);
    return () => window.clearTimeout(timer);
  }, [message, onClear]);

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 w-[min(calc(100vw-2.5rem),360px)] overflow-hidden rounded-xl border border-border bg-white text-sm font-semibold text-ink-900 shadow-[0_18px_42px_rgba(23,35,27,0.16)]"
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
          key={message}
          role="status"
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <CheckCircle2 aria-hidden="true" className="shrink-0 text-primary-600" size={18} />
            <span className="min-w-0 flex-1 break-words">{message}</span>
            <button className="rounded-md px-2 py-1 text-xs font-semibold text-ink-500 transition-colors hover:bg-soft hover:text-ink-900" type="button" onClick={onClear}>
              Dismiss
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
