"use client";

import { Folder, FileText } from "lucide-react";
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

export default function DriveList({ items, basePathSegments = [] }: DriveListProps) {
    return (
        <ul className="space-y-2">
            {items.map((item, idx) => {
                // 构建新的动态路径
                const newPathSegments = [...basePathSegments, item.id];
                const href = `/files/${newPathSegments.join('/')}`;

                return (
                    <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="flex items-center gap-4 px-5 py-4 mb-1 rounded-xl hover:bg-white dark:hover:bg-black transition-all duration-200 group"
                    >
                        {/* 图标 */}
                        <span className="text-black dark:text-white opacity-70 group-hover:opacity-100 transition-opacity shrink-0 bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
                            {item.folder ? <Folder size={20} /> : <FileText size={20} />}
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

                        {/* 预览按钮，仅在图片文件时显示 */}
                        {item.file?.mimeType?.startsWith("image/") && (
                            <Link
                                href={`/preview/${item.id}`}
                                className="text-sm bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0 font-medium text-black dark:text-white"
                            >
                                预览
                            </Link>
                        )}

                        {/* 大小 */}
                        <span className="text-sm text-black/50 dark:text-white/50 shrink-0 group-hover:text-black dark:group-hover:text-white transition-colors">
                            {formatSize(item.size)}
                        </span>
                        {/* 修改时间 */}
                        <span className="text-sm text-black/50 dark:text-white/50 shrink-0 min-w-24 text-right group-hover:text-black dark:group-hover:text-white transition-colors">
                            {formatDate(item.lastModifiedDateTime)}
                        </span>
                    </motion.li>
                );
            })}
        </ul>
    );
}
