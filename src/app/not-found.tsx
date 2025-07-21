"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, RefreshCw, Cloud, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function NotFound() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-white">
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto"
                >
                    {/* Icon and 404 */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative"
                            >
                                <h1 className="text-[120px] md:text-[160px] font-black text-gray-100 select-none">
                                    404
                                </h1>
                                <motion.div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    animate={{ 
                                        scale: isHovered ? 1.2 : 1,
                                        rotate: isHovered ? 180 : 0 
                                    }}
                                    transition={{ duration: 0.3 }}
                                    onHoverStart={() => setIsHovered(true)}
                                    onHoverEnd={() => setIsHovered(false)}
                                >
                                    <Cloud className="w-16 h-16 md:w-24 md:h-24 text-gray-300" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Error message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 space-y-4"
                    >
                        <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">页面未找到</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            看起来您迷路了
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            您访问的页面不存在或已被移动。让我们帮您找到正确的方向。
                        </p>
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/"
                                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Home className="w-4 h-4" />
                                <span>返回首页</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <button
                                onClick={() => window.location.reload()}
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                                <span>刷新页面</span>
                            </button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="pt-8"
                        >
                            <p className="text-sm text-gray-500">
                                需要帮助？
                                <Link href="/" className="text-gray-900 hover:underline ml-1">
                                    查看文档
                                </Link>
                                或
                                <Link href="/" className="text-gray-900 hover:underline ml-1">
                                    联系支持
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Decorative elements */}
                    <motion.div
                        className="absolute top-10 left-10 w-20 h-20 bg-gray-100 rounded-full blur-3xl"
                        animate={{ 
                            x: [0, 30, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-10 right-10 w-32 h-32 bg-gray-100 rounded-full blur-3xl"
                        animate={{ 
                            x: [0, -30, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ 
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-8 left-0 right-0 text-center"
            >
                <p className="text-xs text-gray-400">
                    © 2025 OneDriveList. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}