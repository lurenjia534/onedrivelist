'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 全局 Loading 组件
 * Next.js 会在页面或布局的 `loading.tsx` 中断显示时自动渲染它。
 */
export default function Loading() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-white dark:bg-black overflow-hidden">
      {/* Grid pattern background - matching not-found.tsx */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-black dark:via-gray-900/50 dark:to-black" />

      {/* Main loading container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Cloud icon with subtle animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl backdrop-blur-md">
            <Cloud className="h-12 w-12 text-gray-800 dark:text-gray-200" />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
            <h2 className="text-2xl md:text-3xl font-semibold tracking-wide text-gray-900 dark:text-white">
                Loading<span className="animate-pulse">...</span>
            </h2>
            <div className="flex items-center gap-1">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative elements - matching not-found.tsx style */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full blur-3xl opacity-50"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-gray-100 dark:bg-gray-800 rounded-full blur-3xl opacity-50"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}