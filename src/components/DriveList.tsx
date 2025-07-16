"use client";

import { Folder, FileText } from "lucide-react";
import { motion } from "framer-motion";

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
    currentPath: string;
}

export default function DriveList({ items, currentPath }: DriveListProps) {
    return (
        <ul className="space-y-2">
            {items.map((item, idx) => {
                const nextPath =
                    currentPath === "根目录" ? item.name : `${currentPath}/${item.name}`;

                return (
                    <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                    >
                        {/* 图标 */}
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
              {item.folder ? <Folder size={20} /> : <FileText size={20} />}
            </span>

                        {/* 名称（可点击） */}
                        {item.folder ? (
                            <a
                                href={`/dashboard?item=${item.id}&path=${encodeURIComponent(
                                    nextPath,
                                )}`}
                                className="flex-1 truncate hover:underline"
                            >
                                {item.name}
                            </a>
                        ) : (
                            <a
                                href={item.webUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 truncate hover:underline"
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
