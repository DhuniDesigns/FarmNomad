"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onCancel,
  onConfirm
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="confirm-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/45 px-5 py-8"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCancel();
          }}
          role="dialog"
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-[0_24px_70px_rgba(23,35,27,0.22)]"
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl font-semibold text-ink-900" id="confirm-dialog-title">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-700">{description}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button ref={cancelRef} type="button" variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
              <Button type="button" variant={destructive ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
