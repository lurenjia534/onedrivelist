"use client";

import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import LoginButton from "./login-button";
import Head from "next/head";

export default function SetupUI() {
    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>OneDriveList - 首次运行设置</title>
                <meta name="description" content="OneDriveList 首次运行设置页面" />
            </Head>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OneDriveList</h1>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10"
                >
                    {/* 头部区域 */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                        >
                            <LockKeyhole className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                        >
                            首次运行设置
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 dark:text-gray-400 mt-2"
                        >
                            尚未检测到 <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">ONEDRIVE_REFRESH_TOKEN</code> 环境变量。
                            <p className="mt-2">请登录您的 Microsoft 账号以生成 Refresh Token。</p>
                        </motion.div>
                    </div>

                    {/* 登录按钮区域 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="pt-2"
                    >
                        <LoginButton />
                    </motion.div>
                </motion.div>

                {/* 页脚 */}
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
