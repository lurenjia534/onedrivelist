"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkAutolinkHeadings from "remark-autolink-headings";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import { useState } from "react";
import type { Plugin } from "unified";
import { Copy } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function MarkdownPreview({
                                            content,
                                            toc,
                                        }: {
    content: string;
    toc: TocItem[];
}) {
    const CodeBlock = ({ children }: { children: React.ReactNode }) => {
        const [copied, setCopied] = useState(false);
        const code = String(children).trim();

        const handleCopy = () => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <pre className="relative">
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-sm p-1 rounded bg-gray-700 text-white opacity-80 hover:opacity-100"
        >
          {copied ? "✓" : <Copy size={14} />}
        </button>
        <code>{code}</code>
      </pre>
        );
    };

    return (
        <div className="relative">
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[
                        remarkGfm,
                        remarkMath,
                        remarkSlug as Plugin,
                        [remarkAutolinkHeadings as Plugin, { behavior: "wrap" }],
                    ]}
                    rehypePlugins={[rehypeRaw, rehypePrism, rehypeKatex]}
                    components={{
                        code({ children }) {
                            return <CodeBlock>{children}</CodeBlock>;
                        },
                        img({ ...props }) {
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img loading="lazy" alt={props.alt ?? ""} {...props} />;
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            {toc.length > 0 && (
                <aside className="hidden lg:block fixed right-10 top-24 w-52 text-sm">
                    <ul className="space-y-1 border-l pl-4">
                        {toc.map((item) => (
                            <li
                                key={item.id}
                                style={{ marginLeft: (item.level - 1) * 8 }}
                            >
                                <a href={`#${item.id}`} className="hover:underline">
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>
            )}
        </div>
    );
}