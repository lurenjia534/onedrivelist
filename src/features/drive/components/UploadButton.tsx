"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";

import { useI18n } from "@/i18n/I18nProvider";
import type { DriveListItem } from "./DriveList";

type UploadButtonProps = {
  parentId?: string;
  disabled?: boolean;
  onSuccess?: (item: DriveListItem) => void;
};

export default function UploadButton({ parentId, disabled = false, onSuccess }: UploadButtonProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    formData.set("filename", file.name);
    formData.set("conflictBehavior", "rename");
    if (parentId) {
      formData.set("parentId", parentId);
    }

    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/onedrive/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = await res.text().catch(() => res.statusText);
        throw new Error(message || res.statusText);
      }

      const item = (await res.json()) as DriveListItem;
      onSuccess?.(item);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "unknown");
      setError(t("upload.error", { message }));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-stretch">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={disabled || uploading}
      />
      <button
        type="button"
        onClick={trigger}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <UploadCloud size={16} />
        <span>{uploading ? t("upload.uploading") : t("upload.action")}</span>
      </button>
      {error ? (
        <span className="mt-1 text-xs text-rose-600 dark:text-rose-400" aria-live="polite">
          {error}
        </span>
      ) : null}
    </div>
  );
}
