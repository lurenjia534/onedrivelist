"use client";

import { Search, Cloud } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
    const { t } = useI18n();
    return (
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-lg"
                    >
                        <Cloud className="w-6 h-6" />
                    </motion.div>

                    <span className="text-xl font-medium text-black dark:text-white group-hover:opacity-80 transition-opacity">OneDriveList</span>
                </Link>
                <div className="flex items-center gap-3 w-full sm:max-w-md">
                    <motion.form
                        action="/search"
                        className="flex items-center gap-3 w-full"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <input
                            type="text"
                            name="q"
                            placeholder={t("search.placeholder")}
                            className="flex-1 px-5 py-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 focus:outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity focus:outline-none"
                        >
                            <Search className="w-4 h-4" />
                            <span className="sr-only">{t("search")}</span>
                        </motion.button>
                    </motion.form>
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
