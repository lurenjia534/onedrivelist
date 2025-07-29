"use client"
import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = text.split('\n');

    return (
        <div className="relative group">
            <div 
                className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
                {language && (
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {language.toUpperCase()}
                    </div>
                )}
                <div className="relative">
                    <div 
                        className="overflow-auto p-4 font-mono text-sm"
                        style={{ maxHeight }}
                    >
                        <pre className="whitespace-pre-wrap">
                            {showLineNumbers ? (
                                <div className="flex">
                                    <div className="mr-4 text-gray-400 dark:text-gray-500 select-none">
                                        {lines.map((_, i) => (
                                            <div key={i} className="text-right pr-2">
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 text-gray-800 dark:text-gray-200 overflow-x-auto">
                                        {lines.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <code className="text-gray-800 dark:text-gray-200 break-all">
                                    {text}
                                </code>
                            )}
                        </pre>
                    </div>
                </div>
            </div>

            <motion.button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                title="复制到剪贴板"
            >
                {copied ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                    <CopyIcon className="w-4 h-4" />
                )}
            </motion.button>
        </div>
    );
}
