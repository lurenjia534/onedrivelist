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

    setUploading(true);
    setError(null);
    try {
      const sessionRes = await fetch("/api/onedrive/upload/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          conflictBehavior: "rename",
          parentId,
        }),
      });
      if (!sessionRes.ok) {
        const message = await sessionRes.text().catch(() => sessionRes.statusText);
        throw new Error(message || sessionRes.statusText);
      }

      const { uploadUrl } = (await sessionRes.json()) as { uploadUrl: string };
      if (!uploadUrl) {
        throw new Error("Missing upload session URL");
      }

      const CHUNK_SIZE = 10 * 1024 * 1024;
      let offset = 0;
      let finalResponse: Response | null = null;

      while (offset < file.size) {
        const end = Math.min(offset + CHUNK_SIZE, file.size);
        const chunk = file.slice(offset, end);

        const chunkRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Length": String(chunk.size),
            "Content-Range": `bytes ${offset}-${end - 1}/${file.size}`,
          },
          body: chunk,
        });

        if (chunkRes.status === 202) {
          let nextOffset = end;
          const progress = await chunkRes.json().catch(() => null);
          const nextRange = progress?.nextExpectedRanges?.[0];
          if (typeof nextRange === "string") {
            const [rangeStart] = nextRange.split("-");
            const parsed = Number.parseInt(rangeStart, 10);
            if (Number.isFinite(parsed) && parsed >= 0) {
              nextOffset = parsed;
            }
          }
          if (nextOffset <= offset) {
            nextOffset = end;
          }
          offset = Math.min(nextOffset, file.size);
          continue;
        }

        if (!chunkRes.ok) {
          const message = await chunkRes.text().catch(() => chunkRes.statusText);
          throw new Error(message || chunkRes.statusText);
        }

        finalResponse = chunkRes;
        break;
      }

      if (!finalResponse) {
        throw new Error("Upload did not complete");
      }

      const item = (await finalResponse.json()) as DriveListItem;
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
