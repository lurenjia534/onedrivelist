"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

type ConfirmDeleteDialogProps = {
  open: boolean;
  itemName: string;
  loading: boolean;
  error?: string | null;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  itemName,
  loading,
  error,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  const { t } = useI18n();

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
            onClick={() => {
              if (!loading) onClose();
            }}
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
                <span className="rounded-xl bg-red-50 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-200">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("delete.dialog.title")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("delete.dialog.subtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-800"
                onClick={() => {
                  if (!loading) onClose();
                }}
                aria-label={t("delete.cancel")}
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                {t("delete.confirm", { name: itemName })}
              </div>
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!loading) onClose();
                }}
                disabled={loading}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("delete.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!loading) onConfirm();
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("delete.deleting") : t("delete.action")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
