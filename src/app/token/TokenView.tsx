"use client";

import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import CopyButton from "./copy-button";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TokenUI({ token }: { token: string | undefined }) {
    const { t } = useI18n();
    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <div className="flex justify-end mb-4"><LanguageSwitcher /></div>
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OneDriveList</h1>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                        >
                            {token ? (
                                <motion.div
                                    initial={{ rotate: -180, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                >
                                    <CheckCircle className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ rotate: 180, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                >
                                    <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                        >
                            {token ? t("token.success") : t("token.failure")}
                        </motion.h1>

                        {token ? (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-500 dark:text-gray-400 mt-2"
                            >
                                {t("token.success.instruction", { token: "ONEDRIVE_REFRESH_TOKEN" })}
                            </motion.p>
                        ) : (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-500 dark:text-gray-400 mt-2"
                            >
                                {t("token.failure.instruction")}
                            </motion.p>
                        )}
                    </div>

                    {token ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <pre className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl overflow-x-auto break-all text-gray-900 dark:text-white font-mono text-sm">
                                    {token}
                                </pre>
                                <CopyButton text={token} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="pt-2"
                        >
                            <motion.a 
                                href="/setup" 
                                className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-full hover:bg-gray-800 active:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 shadow-md flex items-center justify-center space-x-2"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <motion.div
                                    animate={{ x: [-3, 0, -3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ArrowLeft size={18} />
                                </motion.div>
                                <span>{t("token.back")}</span>
                            </motion.a>
                        </motion.div>
                    )}
                </motion.div>

                <motion.footer 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-6"
                >
                    <p className="text-xs text-gray-500 dark:text-gray-500">&copy; 2025 OneDriveList. All rights reserved.</p>
                </motion.footer>
            </div>
        </div>
    );
}

