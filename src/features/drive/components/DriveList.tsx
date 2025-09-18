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
    Trash2,
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

    if (size >= GB) {
        return `${(size / GB).toFixed(1)} GB`;
    }

    if (size >= MB) {
        return `${(size / MB).toFixed(1)} MB`;
    }

    return `${(size / KB).toFixed(1)} KB`;
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

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const handleCreateFolder = async (name: string): Promise<boolean> => {
        const parentId = basePathSegments.at(-1);
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

    return (
        <>
            {isAdmin && (
                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            setDialogError(null);
                            setDialogOpen(true);
                        }}
                        disabled={creating}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <FolderPlus size={16} />
                        <span>{t("folder.create")}</span>
                    </button>
                </div>
            )}
            <ul className="space-y-2">
            {localItems.map((item, idx) => {
                // 构建新的动态路径
                const newPathSegments = [...basePathSegments, item.id];
                const href = `/files/${newPathSegments.join('/')}`;

                const Icon = item.folder ? Folder : getFileIcon(item.name);

                return (
                    <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3 mb-1 rounded-xl hover:bg-white dark:hover:bg-black transition-all duration-200 group"
                    >
                        {/* 图标 */}
                        <span className="text-black dark:text-white opacity-70 group-hover:opacity-100 transition-opacity shrink-0 bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
                            <Icon size={20} />
                        </span>

                        {/* 名称（可点击） */}
                        {item.folder ? (
                            <Link href={href} className="flex-1 truncate text-black dark:text-white font-medium group-hover:translate-x-1 transition-transform cursor-pointer">
                                {item.name}
                            </Link>
                        ) : (
                            <a
                                href={`/api/onedrive/download/${item.id}`}
                                className="flex-1 truncate text-black dark:text-white font-medium group-hover:translate-x-1 transition-transform cursor-pointer"
                            >
                                {item.name}
                            </a>
                        )}

                        {/* 预览按钮，图片、文本、音频及 Markdown 文件可预览 */}
                        {(isImageFile(item) ||
                            isTextFile(item) ||
                            isAudioFile(item) ||
                            isMarkdownFile(item)) && (
                            <Link
                                href={`/preview/${item.id}`}
                                className="inline-flex text-sm bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0 font-medium text-black dark:text-white"
                            >
                                {t("preview")}
                            </Link>
                        )}

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteDialogItem(item);
                                    setDeleteDialogError(null);
                                }}
                                disabled={deletingId === item.id}
                                className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={16} />
                                {deletingId === item.id ? t("delete.deleting") : t("delete.action")}
                            </button>
                        )}

                        <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:ml-auto gap-0.5 sm:gap-4 text-sm text-black/50 dark:text-white/50">
                            <span className="group-hover:text-black dark:group-hover:text-white transition-colors">
                                {formatSize(item.size)}
                            </span>
                            <span className="sm:text-right group-hover:text-black dark:group-hover:text-white transition-colors">
                                {formatDate(item.lastModifiedDateTime)}
                            </span>
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
        </>
    );
}
