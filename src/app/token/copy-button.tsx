"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.button 
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1 bg-gray-900 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 flex items-center space-x-1"
            whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait">
                {copied ? (
                    <motion.div 
                        key="copied"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center space-x-1"
                    >
                        <Check size={14} />
                        <span>已复制</span>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="copy"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="flex items-center space-x-1"
                    >
                        <motion.div
                            animate={isHovered ? { rotate: 15 } : { rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Copy size={14} />
                        </motion.div>
                        <span>复制</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
