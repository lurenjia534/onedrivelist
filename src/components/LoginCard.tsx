'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { SignInButton } from './SignInButton';

export function LoginCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white dark:bg-gray-950/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
            <div className="mx-auto w-fit bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-6">
                <Globe className="text-blue-600 dark:text-blue-400" size={32} />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                访问您的云端文件
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                使用您的 Microsoft 账号安全登录
            </p>

            <SignInButton />

            <p className="text-xs text-gray-400 dark:text-gray-600 mt-8">
                © 2024 OneList. All rights reserved.
            </p>
        </motion.div>
    );
}
