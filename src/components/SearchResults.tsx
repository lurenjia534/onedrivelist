"use client";

import DriveList, { Item } from "./DriveList";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchResultsProps {
  items: Item[];
  query: string;
}

export default function SearchResults({ items, query }: SearchResultsProps) {
  return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 sm:px-8 py-10"
      >
      <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm p-8 rounded-2xl">
        <h1 className="text-2xl font-medium mb-8 flex items-center gap-3 text-black dark:text-white">
          <Search className="w-5 h-5" />
          <span>搜索结果：{query}</span>
        </h1>
        <DriveList items={items} />
      </div>
    </motion.div>
  );
}
