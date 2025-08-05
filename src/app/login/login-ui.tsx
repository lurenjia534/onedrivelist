"use client";

import { motion } from "framer-motion";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function LoginUI({
  loginAction,
}: {
  loginAction: (formData: FormData) => Promise<{ error?: string } | undefined>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (error: unknown) {
      console.error("登录失败:", error);
      setError("登录过程中发生错误");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <Image
              src="/loginback.png"
              alt="Login Banner"
              width={1024}
              height={1024}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex flex-col items-center gap-3"
            >
              {/* Animated Lock icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white p-3 rounded-full shadow-lg"
              >
                <Lock className="w-8 h-8" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">OneDriveList</h1>
            </motion.div>

            <div className="text-left mb-8">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
              >
                账户登录
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 dark:text-gray-400 mt-2"
              >
                请输入管理员密码以访问
              </motion.p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-6 h-6" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.form
              action={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="请输入管理员密码"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all text-lg"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-bold py-3 px-4 rounded-full hover:bg-black/90 active:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-gray-900 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-white dark:border-gray-900 border-t-transparent dark:border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn size={22} />
                    <span>登录</span>
                  </>
                )}
              </motion.button>
            </motion.form>
             <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-8"
              >
                <p className="text-xs text-gray-500 dark:text-gray-500">&copy; 2025 OneDriveList. All rights reserved.</p>
              </motion.footer>
          </div>
        </div>
      </div>
    </div>
  );
}
