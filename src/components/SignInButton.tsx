'use client';

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

// 一个简单的 Microsoft Logo SVG 组件
const MicrosoftLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
        <title>MS-SymbolLockup</title>
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
);

export function SignInButton() {
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('microsoft-entra-id', {
                // 在生产环境中，通常建议移除 prompt: "consent"
                // 除非您有特殊理由每次都强制用户授权。
                // prompt: "consent",
                callbackUrl: '/dashboard' // 登录后直接跳转到仪表盘
            })}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
            <MicrosoftLogo />
            <span>使用 Microsoft 账号登录</span>
        </motion.button>
    );
}
