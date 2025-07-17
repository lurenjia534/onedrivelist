"use client";

import { Folder, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Item = {
    id: string;
    name: string;
    webUrl: string;
    folder?: object;
    file?: object;
    size: number;
};

interface DriveListProps {
    items: Item[];
    basePathSegments?: string[];
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
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                        {/* 图标 */}
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
                            {item.folder ? <Folder size={20} /> : <FileText size={20} />}
                        </span>

                        {/* 名称（可点击） */}
                        {item.folder ? (
                            <Link href={href} className="flex-1 truncate hover:underline cursor-pointer">
                                {item.name}
                            </Link>
                        ) : (
                            <a
                                href={item.webUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 truncate hover:underline cursor-pointer"
                            >
                                {item.name}
                            </a>
                        )}

                        {/* 大小 */}
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {(item.size / 1024).toFixed(1)} KB
                        </span>
                    </motion.li>
                );
            })}
        </ul>
    );
}
