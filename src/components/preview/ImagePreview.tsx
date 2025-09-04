"use client";
import { useState } from "react";
import { ExternalLink, CopyIcon, CheckIcon, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImagePreviewProps {
    src: string;
    alt: string;
    maxHeight?: string;
}

export default function ImagePreview({ src, alt, maxHeight = "60vh" }: ImagePreviewProps) {
    const [copied, setCopied] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(src);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleZoom = () => setIsZoomed(!isZoomed);

    const buttonVariants = {
        initial: { opacity: 0 },
        hover: { opacity: 1 },
        tap: { scale: 0.95 }
    };

    const iconVariants = {
        hover: { rotate: 10, scale: 1.1 },
        tap: { rotate: 0, scale: 1 }
    };

    return (
        <div className="relative inline-block group">
            <motion.div
                layout
                className="overflow-hidden rounded-xl"
                whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
                <motion.img
                    src={src}
                    alt={alt}
                    style={{ maxHeight: isZoomed ? "85vh" : maxHeight }}
                    className={`rounded-xl border max-w-full h-auto transition-all duration-300 ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                    onClick={toggleZoom}
                    layoutId={`image-${src}`}
                    whileHover={{ scale: 1.01 }}
                />
            </motion.div>

            {/* Action buttons */}
            <motion.div 
                className="absolute top-3 right-3 flex space-x-2"
                initial="initial"
                whileHover="hover"
                variants={{
                    initial: { opacity: 0.6 },
                    hover: { opacity: 1 }
                }}
            >
                <motion.a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm shadow-sm"
                    variants={buttonVariants}
                    whileTap="tap"
                    title="在新标签页中打开"
                >
                    <motion.div variants={iconVariants}>
                        <ExternalLink className="w-4 h-4" />
                    </motion.div>
                </motion.a>

                <motion.button
                    onClick={handleCopy}
                    className="p-2 rounded-full bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm shadow-sm"
                    variants={buttonVariants}
                    whileTap="tap"
                    title="复制图片链接"
                >
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.div
                                key="checked"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="copy"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                variants={iconVariants}
                            >
                                <CopyIcon className="w-4 h-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                <motion.button
                    onClick={toggleZoom}
                    className="p-2 rounded-full bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm shadow-sm"
                    variants={buttonVariants}
                    whileTap="tap"
                    title={isZoomed ? "缩小图片" : "放大图片"}
                >
                    <motion.div variants={iconVariants}>
                        <ZoomIn className="w-4 h-4" />
                    </motion.div>
                </motion.button>
            </motion.div>
        </div>
    );
}

