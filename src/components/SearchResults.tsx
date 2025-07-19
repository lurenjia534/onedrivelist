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
      className="container mx-auto p-4"
    >
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        <span>搜索结果：{query}</span>
      </h1>
      <DriveList items={items} />
    </motion.div>
  );
}
