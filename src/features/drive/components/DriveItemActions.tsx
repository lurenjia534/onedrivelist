"use client";

import { useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

type DriveItemActionsProps = {
  isOpen: boolean;
  disabled?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function DriveItemActions({
  isOpen,
  disabled = false,
  onOpen,
  onClose,
  onRename,
  onDelete,
}: DriveItemActionsProps) {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative z-30" ref={menuRef}>
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("actions.more")}
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRename();
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Pencil size={16} />
            <span>{t("rename.action")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 size={16} />
            <span>{t("delete.action")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
