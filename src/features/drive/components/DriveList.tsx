"use client";

import {
    Folder,
    FolderPlus,
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    FileSpreadsheet,
    Files,
    Presentation,
    FileType2,
    FileArchive,
    FileCode,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import {
    getExtension,
    isAudioExtension,
    isImageExtension,
    isTextExtension,
    isMarkdownExtension,
} from "@/lib/fileTypes";
import { useEffect, useState } from "react";
import CreateFolderDialog from "./CreateFolderDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import RenameDialog from "./RenameDialog";
import DriveItemActions from "./DriveItemActions";
import ConfirmBulkDeleteDialog from "./ConfirmBulkDeleteDialog";
import UploadButton from "./UploadButton";

export type DriveListItem = {
    id: string;
    name: string;
    webUrl: string;
    folder?: object;
    file?: {
        mimeType?: string;
    };
    size: number;
    lastModifiedDateTime: string;
};

interface DriveListProps {
    items: DriveListItem[];
    basePathSegments?: string[];
    isAdmin?: boolean;
    onDeleteSuccess?: (id: string) => void;
}

function formatSize(size: number): string {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    if (size < KB) {
        return `${size} B`;
    }

    if (size >= GB) {
        return `${(size / GB).toFixed(1).replace(/\.0$/, "")} GB`;
    }

    if (size >= MB) {
        return `${(size / MB).toFixed(1).replace(/\.0$/, "")} MB`;
    }

    return `${(size / KB).toFixed(1).replace(/\.0$/, "")} KB`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString();
}


function getIconByExtension(ext: string): LucideIcon {
    if (isTextExtension(ext) || isMarkdownExtension(ext)) return FileText;
    if (["xls", "xlsx", "xlsb", "xlsm", "csv", "tsv"].includes(ext)) return FileSpreadsheet;
    if (["doc", "docx"].includes(ext)) return FileText;
    if (["ppt", "pptx", "key", "odp"].includes(ext)) return Presentation;  // 或 FileType
    if (["pdf"].includes(ext)) return FileType2;
    if (["mp4", "mkv", "mov", "avi", "wmv", "webm", "flv", "mpeg", "mpg"].includes(ext)) return FileVideo;
    if (isAudioExtension(ext)) return FileAudio;
    if (isImageExtension(ext)) return FileImage;
    if (["zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "iso"].includes(ext)) return FileArchive;
    if (["js", "jsx", "ts", "tsx", "json", "yml", "yaml", "py", "rb", "go", "rs", "php", "java", "c", "cpp", "h", "hpp", "css", "scss", "html", "sh", "mdx"].includes(ext)) return FileCode;
    return Files; // 默认
}

function getFileIcon(name: string): LucideIcon {
    return getIconByExtension(getExtension(name));
}

function isImageFile(item: DriveListItem): boolean {
    const ext = getExtension(item.name);
    return (
        !!item.file &&
        (item.file.mimeType?.startsWith("image/") || isImageExtension(ext))
    );
}

function isTextFile(item: DriveListItem): boolean {
    const ext = getExtension(item.name);
    return (
        !!item.file &&
        (item.file.mimeType?.startsWith("text/") || isTextExtension(ext) || isMarkdownExtension(ext))
    );
}

function isAudioFile(item: DriveListItem): boolean {
    const ext = getExtension(item.name);
    return (
        !!item.file &&
        (item.file.mimeType?.startsWith("audio/") || isAudioExtension(ext))
    );
}

function isMarkdownFile(item: DriveListItem): boolean {
    const ext = getExtension(item.name);
    return !!item.file && ["md", "markdown"].includes(ext);
}

export default function DriveList({ items, basePathSegments = [], isAdmin = false, onDeleteSuccess }: DriveListProps) {
    const { t } = useI18n();
    const [localItems, setLocalItems] = useState(items);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [deleteDialogItem, setDeleteDialogItem] = useState<DriveListItem | null>(null);
    const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);
    const [renameDialogItem, setRenameDialogItem] = useState<DriveListItem | null>(null);
    const [renameDialogError, setRenameDialogError] = useState<string | null>(null);
    const [renaming, setRenaming] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
    const currentFolderId = basePathSegments.at(-1);

    const isSelecting = selectionMode || selectedIds.length > 0;
    const selectedItems = localItems.filter((item) => selectedIds.includes(item.id));
    const selectedCount = selectedItems.length;
    const allSelected = selectedCount > 0 && selectedCount === localItems.length && localItems.length > 0;

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => items.some((entry) => entry.id === id)));
    }, [items]);

    useEffect(() => {
        if (isSelecting && openMenuId) {
            setOpenMenuId(null);
        }
    }, [isSelecting, openMenuId]);

    const handleSelectionModeToggle = () => {
        if (isSelecting) {
            setSelectionMode(false);
            setSelectedIds([]);
            setBulkDeleteError(null);
        } else {
            setSelectionMode(true);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectionMode(true);
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectionMode(true);
            setSelectedIds(localItems.map((entry) => entry.id));
        }
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
    };

    const handleCreateFolder = async (name: string): Promise<boolean> => {
        const parentId = currentFolderId;
        setCreating(true);
        setDialogError(null);
        try {
            const response = await fetch("/api/onedrive/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, parentId }),
            });

            if (!response.ok) {
                const message = await response.text().catch(() => response.statusText);
                throw new Error(message);
            }

            const created = (await response.json()) as DriveListItem;
            setLocalItems((prev) => [created, ...prev]);
            setDialogOpen(false);
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error ?? "unknown");
            setDialogError(t("folder.error", { message }));
            return false;
        } finally {
            setCreating(false);
        }
    };

    const performDelete = async (item: DriveListItem) => {
        setDeletingId(item.id);
        setDeleteDialogError(null);
        try {
            const response = await fetch(`/api/onedrive/items/${item.id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const message = await response.text().catch(() => response.statusText);
                throw new Error(message);
            }
            setLocalItems((prev) => prev.filter((entry) => entry.id !== item.id));
            onDeleteSuccess?.(item.id);
            setDeleteDialogItem(null);
            setOpenMenuId(null);
            setSelectedIds((prev) => prev.filter((value) => value !== item.id));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error ?? "unknown");
            setDeleteDialogError(t("delete.error", { message }));
        } finally {
            setDeletingId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialogItem) return;
        await performDelete(deleteDialogItem);
    };

    const handleBulkDelete = async () => {
        if (!selectedCount) return;
        const idsToDelete = [...selectedIds];
        setBulkDeleting(true);
        setBulkDeleteError(null);

        const failures: Array<{ name: string; message: string }> = [];

        for (const id of idsToDelete) {
            const item = localItems.find((entry) => entry.id === id);
            if (!item) {
                setSelectedIds((prev) => prev.filter((value) => value !== id));
                continue;
            }

            try {
                const response = await fetch(`/api/onedrive/items/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    const message = await response.text().catch(() => response.statusText);
                    throw new Error(message);
                }

                setLocalItems((prev) => prev.filter((entry) => entry.id !== id));
                setSelectedIds((prev) => prev.filter((value) => value !== id));
                onDeleteSuccess?.(id);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error ?? "unknown");
                failures.push({ name: item.name, message });
            }
        }

        if (failures.length > 0) {
            const names = failures
                .map((entry) => `${entry.name} (${entry.message})`)
                .join("、");
            setBulkDeleteError(t("bulk.delete.error", { names }));
        } else {
            setBulkDialogOpen(false);
            setSelectionMode(false);
            setSelectedIds([]);
        }

        setBulkDeleting(false);
    };

    const handleUploadSuccess = (item: DriveListItem) => {
        setLocalItems((prev) => {
            const filtered = prev.filter((entry) => entry.id !== item.id);
            return [item, ...filtered];
        });
    };

    const handleRename = async (name: string): Promise<boolean> => {
        if (!renameDialogItem) return false;
        setRenaming(true);
        setRenameDialogError(null);
        try {
            const response = await fetch(`/api/onedrive/items/${renameDialogItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                const message = await response.text().catch(() => response.statusText);
                throw new Error(message);
            }

            const updated = (await response.json()) as DriveListItem;
            setLocalItems((prev) =>
                prev.map((entry) => (entry.id === updated.id ? { ...entry, ...updated } : entry))
            );
            setRenameDialogItem(null);
            setOpenMenuId(null);
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error ?? "unknown");
            setRenameDialogError(t("rename.error", { message }));
            return false;
        } finally {
            setRenaming(false);
        }
    };

    return (
        <>
            {isAdmin && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSelectionModeToggle}
                            disabled={bulkDeleting}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            {isSelecting ? t("bulk.select.exit") : t("bulk.select.enter")}
                        </button>
                        {isSelecting && localItems.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                    disabled={!localItems.length}
                                >
                                    {allSelected ? t("bulk.select.none") : t("bulk.select.all")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearSelection}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                    disabled={!selectedCount}
                                >
                                    {t("bulk.select.clear")}
                                </button>
                                {selectedCount > 0 && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("bulk.selected.count", { count: selectedCount })}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {isSelecting && selectedCount > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setBulkDeleteError(null);
                                    setBulkDialogOpen(true);
                                }}
                                disabled={bulkDeleting}
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {bulkDeleting ? t("bulk.delete.deleting") : t("bulk.delete.action")}
                            </button>
                        )}
                        <UploadButton
                            parentId={currentFolderId ?? undefined}
                            disabled={creating || bulkDeleting}
                            onSuccess={handleUploadSuccess}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setDialogError(null);
                                setDialogOpen(true);
                            }}
                            disabled={creating}
                            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-white/90"
                        >
                            <FolderPlus size={16} />
                            <span>{t("folder.create")}</span>
                        </button>
                    </div>
                </div>
            )}
            <ul className="space-y-2">
                {localItems.map((item, idx) => {
                    const newPathSegments = [...basePathSegments, item.id];
                    const href = `/files/${newPathSegments.join("/")}`;

                    const Icon = item.folder ? Folder : getFileIcon(item.name);
                    const actionsOpen = openMenuId === item.id;
                    const isSelected = selectedIds.includes(item.id);
                    const itemClasses = [
                        "relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3 mb-1 rounded-xl transition-all duration-200 group",
                        "hover:bg-white dark:hover:bg-black",
                        isSelected ? "ring-2 ring-black/30 dark:ring-white/40" : "",
                        isSelecting ? "bg-gray-50/60 dark:bg-white/5" : "",
                        actionsOpen ? "z-40" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");
                    const nameClass = [
                        "flex-1 truncate text-black dark:text-white font-medium transition-transform",
                        !isSelecting ? "group-hover:translate-x-1 cursor-pointer" : "opacity-70",
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <motion.li
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            whileHover={isSelecting ? undefined : { scale: 1.01, x: 4 }}
                            className={itemClasses}
                        >
                            <div className="flex items-center gap-3">
                                {isSelecting && (
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelection(item.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-white"
                                        aria-label={t("bulk.select.item", { name: item.name })}
                                    />
                                )}
                                <span className="text-black dark:text-white opacity-70 group-hover:opacity-100 transition-opacity shrink-0 rounded-lg bg-gray-100 p-2 dark:bg-gray-900">
                                    <Icon size={20} />
                                </span>
                            </div>

                            {isSelecting ? (
                                <span className={nameClass}>{item.name}</span>
                            ) : item.folder ? (
                                <Link href={href} className={nameClass}>
                                    {item.name}
                                </Link>
                            ) : (
                                <a href={`/api/onedrive/download/${item.id}`} className={nameClass}>
                                    {item.name}
                                </a>
                            )}

                            {!isSelecting &&
                                (isImageFile(item) ||
                                    isTextFile(item) ||
                                    isAudioFile(item) ||
                                    isMarkdownFile(item)) && (
                                    <Link
                                        href={`/preview/${item.id}`}
                                        className="inline-flex text-sm bg-black/5 px-3 py-1 font-medium text-black transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                                    >
                                        {t("preview")}
                                    </Link>
                                )}

                            {isAdmin && !isSelecting && (
                                <DriveItemActions
                                    isOpen={actionsOpen}
                                    disabled={
                                        deletingId === item.id ||
                                        (renaming && renameDialogItem?.id === item.id)
                                    }
                                    onOpen={() => setOpenMenuId(item.id)}
                                    onClose={() => setOpenMenuId(null)}
                                    onRename={() => {
                                        setRenameDialogItem(item);
                                        setRenameDialogError(null);
                                    }}
                                    onDelete={() => {
                                        setDeleteDialogItem(item);
                                        setDeleteDialogError(null);
                                    }}
                                />
                            )}

                            <div className="flex w-full flex-col gap-0.5 text-sm text-black/50 transition-colors group-hover:text-black dark:text-white/50 dark:group-hover:text-white sm:ml-auto sm:w-auto sm:flex-row sm:gap-4">
                                <span>{formatSize(item.size)}</span>
                                <span className="sm:text-right">{formatDate(item.lastModifiedDateTime)}</span>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
            {isAdmin && (
                <CreateFolderDialog
                    open={isDialogOpen}
                    submitting={creating}
                    error={dialogError}
                    onConfirm={handleCreateFolder}
                    onClose={() => {
                        setDialogOpen(false);
                        setDialogError(null);
                    }}
                />
            )}
            {isAdmin && deleteDialogItem && (
                <ConfirmDeleteDialog
                    open={!!deleteDialogItem}
                    itemName={deleteDialogItem.name}
                    loading={deletingId === deleteDialogItem.id}
                    error={deleteDialogError}
                    onConfirm={handleConfirmDelete}
                    onClose={() => {
                        if (deletingId === deleteDialogItem.id) return;
                        setDeleteDialogItem(null);
                        setDeleteDialogError(null);
                    }}
                />
            )}
            {isAdmin && bulkDialogOpen && selectedCount > 0 && (
                <ConfirmBulkDeleteDialog
                    open={bulkDialogOpen}
                    count={selectedCount}
                    names={selectedItems.map((entry) => entry.name)}
                    loading={bulkDeleting}
                    error={bulkDeleteError}
                    onConfirm={handleBulkDelete}
                    onClose={() => {
                        if (bulkDeleting) return;
                        setBulkDialogOpen(false);
                        setBulkDeleteError(null);
                    }}
                />
            )}
            {isAdmin && renameDialogItem && (
                <RenameDialog
                    open={!!renameDialogItem}
                    initialName={renameDialogItem.name}
                    submitting={renaming}
                    error={renameDialogError}
                    onConfirm={handleRename}
                    onClose={() => {
                        if (renaming) return;
                        setRenameDialogItem(null);
                        setRenameDialogError(null);
                    }}
                />
            )}
        </>
    );
}
