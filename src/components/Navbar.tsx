"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="font-semibold hover:underline">OneList</Link>
                <motion.form
                    action="/search"
                    className="flex items-center gap-2 max-w-md"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <input
                        type="text"
                        name="q"
                        placeholder="Search files..."
                        className="flex-1 px-3 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-blue-600 text-white rounded-full"
                    >
                        <Search className="w-4 h-4" />
                        <span className="sr-only">Search</span>
                    </motion.button>
                </motion.form>
            </div>
        </header>
    );
}