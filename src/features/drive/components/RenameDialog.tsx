"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, X } from "lucide-react";

import { useI18n } from "@/i18n/I18nProvider";

type RenameDialogProps = {
  open: boolean;
  initialName: string;
  submitting: boolean;
  error?: string | null;
  onConfirm: (name: string) => Promise<boolean>;
  onClose: () => void;
};

export default function RenameDialog({
  open,
  initialName,
  submitting,
  error,
  onConfirm,
  onClose,
}: RenameDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setValidationError(null);
      const handle = window.setTimeout(() => inputRef.current?.select(), 120);
      return () => window.clearTimeout(handle);
    }
    return undefined;
  }, [open, initialName]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError(t("rename.validation.required"));
      return;
    }

    if (trimmed === initialName.trim()) {
      setValidationError(t("rename.validation.unchanged"));
      return;
    }

    setValidationError(null);
    const success = await onConfirm(trimmed);
    if (success) {
      setName(trimmed);
    }
  };

  const helperText = validationError ?? error ?? null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            aria-hidden
            onClick={handleClose}
            className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-gray-100 p-3 text-gray-700 dark:bg-gray-800 dark:text-white">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("rename.dialog.title")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("rename.dialog.subtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-800"
                onClick={handleClose}
                aria-label={t("rename.cancel")}
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <label htmlFor="rename-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("rename.name.label")}
              </label>
              <input
                id="rename-input"
                ref={inputRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={t("rename.name.placeholder")}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white/40"
                disabled={submitting}
              />
              {helperText && (
                <p className="text-sm text-rose-600 dark:text-rose-400">{helperText}</p>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("rename.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {submitting ? t("rename.saving") : t("rename.submit")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
