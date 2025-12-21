"use client";

import { List, LayoutGrid } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export type ViewMode = "list" | "grid";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    const { t } = useI18n();

    return (
        <div className="inline-flex items-center rounded-lg border border-gray-200 p-1 dark:border-gray-700">
            <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${
                    viewMode === "list"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                }`}
                aria-label={t("view.list")}
                title={t("view.list")}
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${
                    viewMode === "grid"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                }`}
                aria-label={t("view.grid")}
                title={t("view.grid")}
            >
                <LayoutGrid size={18} />
            </button>
        </div>
    );
}