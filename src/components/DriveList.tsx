"use client";

import {
    Folder,
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    FileSpreadsheet,
    Files, Presentation, FileType2, FileArchive, FileCode,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export type Item = {
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
    items: Item[];
    basePathSegments?: string[];
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

function getExtension(name: string): string {
    const idx = name.lastIndexOf(".");
    return idx !== -1 ? name.slice(idx + 1).toLowerCase() : "";
}

function getIconByExtension(ext: string): LucideIcon {
    if (["txt", "md", "rtf", "odt"].includes(ext)) return FileText;
    if (["xls", "xlsx", "xlsb", "xlsm", "csv", "tsv"].includes(ext)) return FileSpreadsheet;
    if (["doc", "docx"].includes(ext)) return FileText;
    if (["ppt", "pptx", "key", "odp"].includes(ext)) return Presentation;  // 或 FileType
    if (["pdf"].includes(ext)) return FileType2;
    if (["mp4", "mkv", "mov", "avi", "wmv", "webm", "flv", "mpeg", "mpg"].includes(ext)) return FileVideo;
    if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) return FileAudio;
    if (["jpg", "jpeg", "png", "svg", "gif", "bmp", "webp", "tiff"].includes(ext)) return FileImage;
    if (["zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "iso"].includes(ext)) return FileArchive;
    if (["js", "jsx", "ts", "tsx", "json", "yml", "yaml", "py", "rb", "go", "rs", "php", "java", "c", "cpp", "h", "hpp", "css", "scss", "html", "sh", "mdx"].includes(ext)) return FileCode;
    return Files; // 默认
}

function getFileIcon(name: string): LucideIcon {
    return getIconByExtension(getExtension(name));
}

function isImageFile(item: Item): boolean {
    const ext = getExtension(item.name);
    const imageExts = [
        "jpg",
        "jpeg",
        "png",
        "svg",
        "gif",
        "bmp",
        "webp",
        "tiff",
    ];
    return (
        !!item.file &&
        (item.file.mimeType?.startsWith("image/") || imageExts.includes(ext))
    );
}

function isTextFile(item: Item): boolean {
    const ext = getExtension(item.name);
    return (
        !!item.file &&
        (item.file.mimeType?.startsWith("text/") || ext === "txt")
    );
}

export default function DriveList({ items, basePathSegments = [] }: DriveListProps) {
    return (
        <ul className="space-y-2">
            {items.map((item, idx) => {
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

                        {/* 预览按钮，图片和文本文件可预览 */}
                        {(isImageFile(item) || isTextFile(item)) && (
                            <Link
                                href={`/preview/${item.id}`}
                                className="inline-flex text-sm bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0 font-medium text-black dark:text-white"
                            >
                                预览
                            </Link>
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
    );
}
