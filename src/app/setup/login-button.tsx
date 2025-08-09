"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export default function LoginButton() {
    const { t } = useI18n();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.button
            onClick={() => signIn('microsoft-entra-id', { redirectTo: '/token' })}
            className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-full hover:bg-gray-800 active:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 transition duration-300 shadow-md flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.span
                animate={isHovered ? { x: -5 } : { x: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {t("setup.login.button")}
            </motion.span>
            <motion.div
                animate={isHovered ? { x: 5, rotate: 10 } : { x: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <LogIn size={18} />
            </motion.div>
        </motion.button>
    );
}
