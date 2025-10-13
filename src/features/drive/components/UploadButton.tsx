"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";

import { useI18n } from "@/i18n/I18nProvider";
import type { DriveListItem } from "./DriveList";

type UploadButtonProps = {
  parentId?: string;
  disabled?: boolean;
  onSuccess?: (item: DriveListItem) => void;
};

type UploadStatus = "pending" | "uploading" | "success" | "error" | "canceled";

type UploadTask = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string | null;
  controller?: AbortController | null;
  targetParentId?: string;
};

const CHUNK_SIZE = 10 * 1024 * 1024;

export default function UploadButton({ parentId, disabled = false, onSuccess }: UploadButtonProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const queueProcessorRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const [queue, setQueue] = useState<UploadTask[]>([]);
  const queueRef = useRef<UploadTask[]>([]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(
    () => () => {
      queueRef.current.forEach((task) => task.controller?.abort());
    },
    [],
  );

  const trigger = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const createTaskId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const updateTask = useCallback((id: string, updater: (task: UploadTask) => UploadTask) => {
    setQueue((prev) => prev.map((task) => (task.id === id ? updater(task) : task)));
  }, []);

  const formatSize = (size: number): string => {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    if (size < KB) return `${size} B`;
    if (size >= GB) return `${(size / GB).toFixed(1).replace(/\.0$/, "")} GB`;
    if (size >= MB) return `${(size / MB).toFixed(1).replace(/\.0$/, "")} MB`;
    return `${(size / KB).toFixed(1).replace(/\.0$/, "")} KB`;
  };

  const startUpload = useCallback(
    async (task: UploadTask) => {
      const controller = new AbortController();
      const taskId = task.id;

      updateTask(taskId, (current) => ({
        ...current,
        status: "uploading",
        progress: current.progress > 0 ? current.progress : 0,
        error: null,
        controller,
      }));

      try {
        const sessionRes = await fetch("/api/onedrive/upload/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: task.file.name,
            conflictBehavior: "rename",
            parentId: task.targetParentId,
          }),
          signal: controller.signal,
        });

        if (!sessionRes.ok) {
          const message = await sessionRes.text().catch(() => sessionRes.statusText);
          throw new Error(message || sessionRes.statusText);
        }

        const { uploadUrl } = (await sessionRes.json()) as { uploadUrl?: string };
        if (!uploadUrl) {
          throw new Error("Missing upload session URL");
        }

        const total = Math.max(task.file.size, 1);
        let offset = 0;
        let finalResponse: Response | null = null;

        while (offset < total) {
          const end = Math.min(offset + CHUNK_SIZE, total);
          const chunk = task.file.slice(offset, end);

          const chunkRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Length": String(chunk.size),
              "Content-Range": `bytes ${offset}-${end - 1}/${task.file.size}`,
            },
            body: chunk,
            signal: controller.signal,
          });

          if (chunkRes.status === 202) {
            let nextOffset = end;
            const progressDetails = await chunkRes.json().catch(() => null);
            const nextRange = progressDetails?.nextExpectedRanges?.[0];
            if (typeof nextRange === "string") {
              const [rangeStart] = nextRange.split("-");
              const parsed = Number.parseInt(rangeStart ?? "", 10);
              if (Number.isFinite(parsed) && parsed >= 0) {
                nextOffset = parsed;
              }
            }
            if (nextOffset <= offset) {
              nextOffset = end;
            }
            offset = Math.min(nextOffset, task.file.size);
            const progress = Math.max(0, Math.min(offset / total, 0.99));
            updateTask(taskId, (current) => ({
              ...current,
              progress,
            }));
            continue;
          }

          if (!chunkRes.ok) {
            const message = await chunkRes.text().catch(() => chunkRes.statusText);
            throw new Error(message || chunkRes.statusText);
          }

          finalResponse = chunkRes;
          offset = total;
        }

        if (!finalResponse) {
          throw new Error("Upload did not complete");
        }

        const item = (await finalResponse.json()) as DriveListItem;
        updateTask(taskId, (current) => ({
          ...current,
          status: "success",
          progress: 1,
          controller: null,
        }));
        onSuccessRef.current?.(item);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          updateTask(taskId, (current) => ({
            ...current,
            status: "canceled",
            controller: null,
          }));
          return;
        }

        const message = error instanceof Error ? error.message : String(error ?? "unknown");
        updateTask(taskId, (current) => ({
          ...current,
          status: "error",
          error: message,
          controller: null,
        }));
      }
    },
    [updateTask],
  );

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const tasks = Array.from(files).map<UploadTask>((file) => ({
      id: createTaskId(),
      file,
      status: "pending",
      progress: 0,
      error: null,
      controller: null,
      targetParentId: parentId,
    }));

    setQueue((prev) => [...prev, ...tasks]);
    event.target.value = "";
  };

  useEffect(() => {
    if (queueProcessorRef.current) return;
    const nextTask = queue.find((task) => task.status === "pending");
    if (!nextTask) return;

    queueProcessorRef.current = true;
    void (async () => {
      await startUpload(nextTask);
      queueProcessorRef.current = false;
      setQueue((prev) => [...prev]);
    })();
  }, [queue, startUpload]);

  const cancelTask = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        task.controller?.abort();
        return {
          ...task,
          status: "canceled",
          controller: null,
        };
      }),
    );
  }, []);

  const retryTask = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "pending",
              progress: 0,
              error: null,
            }
          : task,
      ),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setQueue((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const activeCount = useMemo(
    () => queue.filter((task) => task.status === "pending" || task.status === "uploading").length,
    [queue],
  );

  const hasActiveUpload = activeCount > 0;

  const progressClassName = (status: UploadStatus) => {
    if (status === "success") return "bg-emerald-500";
    if (status === "error") return "bg-rose-500";
    if (status === "canceled") return "bg-gray-400";
    return "bg-blue-500";
  };

  const renderStatusLabel = (task: UploadTask) => {
    const percent = Math.round(task.progress * 100);
    switch (task.status) {
      case "pending":
        return t("upload.status.pending");
      case "uploading":
        return t("upload.status.uploading", { progress: percent });
      case "success":
        return t("upload.status.success");
      case "error":
        return t("upload.status.error", { message: task.error ?? "unknown" });
      case "canceled":
        return t("upload.status.canceled");
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={trigger}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <UploadCloud size={16} />
        <span>{hasActiveUpload ? t("upload.uploading") : t("upload.action")}</span>
      </button>
      {queue.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 text-sm shadow-sm dark:border-gray-700/60 dark:bg-gray-900/80">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {t("upload.queue.title")}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeCount > 0 ? `${activeCount}/${queue.length}` : t("upload.queue.empty")}
            </span>
          </div>
          <ul className="mt-2 space-y-2">
            {queue.map((task) => {
              const percent = Math.round(task.progress * 100);
              return (
                <li
                  key={task.id}
                  className="rounded-xl border border-gray-100 bg-white/90 p-3 dark:border-gray-800 dark:bg-black/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex-1 truncate font-medium text-gray-800 dark:text-gray-100">
                      {task.file.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSize(task.file.size)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${progressClassName(task.status)}`}
                      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{renderStatusLabel(task)}</span>
                    <div className="flex items-center gap-2">
                      {task.status === "uploading" ? (
                        <button
                          type="button"
                          onClick={() => cancelTask(task.id)}
                          className="text-gray-500 underline-offset-2 transition hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {t("upload.cancel")}
                        </button>
                      ) : null}
                      {(task.status === "error" || task.status === "canceled") && (
                        <button
                          type="button"
                          onClick={() => retryTask(task.id)}
                          className="text-gray-500 underline-offset-2 transition hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {t("upload.retry")}
                        </button>
                      )}
                      {(task.status === "success" ||
                        task.status === "error" ||
                        task.status === "canceled") && (
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="text-gray-400 underline-offset-2 transition hover:text-gray-700 hover:underline dark:text-gray-500 dark:hover:text-gray-200"
                        >
                          {t("upload.remove")}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
