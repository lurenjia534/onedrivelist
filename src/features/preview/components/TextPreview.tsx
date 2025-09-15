"use client"
import { useState } from 'react';
import { CheckIcon, CopyIcon, Code, DownloadIcon, ExpandIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextPreviewProps {
    text: string;
    language?: string;
    showLineNumbers?: boolean;
    maxHeight?: string;
}

export default function TextPreview({ 
    text, 
    language = 'text', 
    showLineNumbers = false,
    maxHeight = '500px'
}: TextPreviewProps) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);
    const lines = text.split('\n');

    const buttonVariants = {
        initial: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        hover: { scale: 1.05, y: 0 },
        tap: { scale: 0.95 }
    };

    // 控制每行代码的动画
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.01,
                delayChildren: 0.1
            }
        }
    };

    const lineVariants = {
        hidden: { opacity: 0, x: -5 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className="relative group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.div 
                className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all duration-300"
                whileHover={{ boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                layout
            >
                {language && (
                    <motion.div 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-medium flex items-center justify-between"
                        layout
                    >
                        <div className="flex items-center space-x-2">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                whileTap={{ rotate: 0 }}
                            >
                                <Code size={14} className="text-gray-500 dark:text-gray-400" />
                            </motion.div>
                            <span className="text-gray-500 dark:text-gray-400">{language.toUpperCase()}</span>
                        </div>
                    </motion.div>
                )}
                <div className="relative">
                    <motion.div 
                        className="overflow-auto p-4 font-mono text-sm"
                        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
                        layout
                    >
                        <motion.pre 
                            className="whitespace-pre-wrap"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            layout
                        >
                            {showLineNumbers ? (
                                <div className="flex">
                                    <div className="mr-4 text-gray-400 dark:text-gray-500 select-none">
                                        {lines.map((_, i) => (
                                            <motion.div 
                                                key={i} 
                                                className="text-right pr-2"
                                                variants={lineVariants}
                                            >
                                                {i + 1}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex-1 text-gray-800 dark:text-gray-200 overflow-x-auto">
                                        {lines.map((line, i) => (
                                            <motion.div 
                                                key={i}
                                                variants={lineVariants}
                                            >
                                                {line}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <motion.code 
                                    className="text-gray-800 dark:text-gray-200 break-all"
                                    variants={lineVariants}
                                >
                                    {text}
                                </motion.code>
                            )}
                        </motion.pre>
                    </motion.div>
                </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div 
                className="absolute top-2 right-2 flex space-x-1.5"
                initial="initial"
                animate={isHovered ? "visible" : "initial"}
            >
                <motion.button
                    onClick={toggleExpand}
                    className="p-1.5 rounded-md bg-gray-100/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title={isExpanded ? "收起代码" : "展开代码"}
                >
                    <motion.div animate={isExpanded ? { rotate: 180 } : { rotate: 0 }}>
                        <ExpandIcon className="w-4 h-4" />
                    </motion.div>
                </motion.button>

                <motion.button
                    onClick={handleDownload}
                    className="p-1.5 rounded-md bg-gray-100/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title="下载代码文件"
                >
                    <DownloadIcon className="w-4 h-4" />
                </motion.button>

                <motion.button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-gray-100/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 backdrop-blur-sm"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title="复制到剪贴板"
                >
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="copy"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CopyIcon className="w-4 h-4" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

