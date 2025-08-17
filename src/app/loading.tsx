"use client";

import React from "react";

/**
 * 更轻量的全局 Loading 骨架屏：
 * - 避免大面积动态背景，降低分心与能耗
 * - 与文件列表布局一致，提升感知性能
 * - 支持明暗主题与无障碍（aria-busy）
 */
export default function Loading() {
  const rows = Array.from({ length: 10 });

  return (
    <div
      className="min-h-screen bg-white dark:bg-black"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 sm:px-8 py-6">
        {/* 顶部条形骨架，模拟搜索栏与切换器区域 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="h-8 w-40 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse" />
          <div className="flex-1 h-10 rounded-xl bg-black/5 dark:bg-white/10 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse" />
        </div>

        {/* 内容容器 */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur p-5 rounded-2xl border border-black/5 dark:border-white/10">
          {/* 面包屑骨架 */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-16 rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />
            <div className="h-6 w-24 rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />
            <div className="h-6 w-20 rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />
          </div>

          {/* 列表骨架 */}
          <ul className="space-y-2">
            {rows.map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 px-4 sm:px-5 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]"
              >
                {/* 图标骨架 */}
                <div className="h-9 w-9 rounded-lg bg-black/10 dark:bg-white/10 animate-pulse" />
                {/* 标题骨架（可变宽） */}
                <div className="flex-1">
                  <div
                    className="h-4 rounded-md bg-black/10 dark:bg-white/10 animate-pulse"
                    style={{ width: `${60 + ((i * 13) % 35)}%` }}
                  />
                  <div className="mt-2 flex gap-4 text-xs">
                    <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                  </div>
                </div>
                {/* 预览按钮骨架 */}
                <div className="h-7 w-16 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
              </li>
            ))}
          </ul>
        </div>

        {/* 页面底部徽标/信息骨架 */}
        <div className="mt-6 flex justify-center">
          <div className="h-5 w-52 rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
