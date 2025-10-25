"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  details?: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
  className?: string;
};

export default function ErrorState({ title, description, details, actions, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={("mx-auto mt-16 max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900" + (className ? ` ${className}` : ""))}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-black dark:text-white">{title}</h2>
          {description && (
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{description}</p>
          )}
          {details && (
            <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">{details}</pre>
          )}
          {actions && actions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {actions.map((a) => (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={a.href + a.label}>
                  <Link
                    href={a.href}
                    className={
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                      (a.variant === "secondary"
                        ? "border border-gray-200 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90")
                    }
                  >
                    {a.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
