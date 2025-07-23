import { getItem, getDownloadUrl } from "@/lib/onedrive";
import remarkSlug from "remark-slug";
import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Heading } from "mdast";
import MarkdownPreview from "@/components/MarkdownPreview";

export const revalidate = 0;

function getExtension(name: string): string {
    const idx = name.lastIndexOf(".");
    return idx !== -1 ? name.slice(idx + 1).toLowerCase() : "";
}

export default async function PreviewPage({
    params,
}: { params: Promise<{ itemId: string }> }) {
    const { itemId } = await params;
    try {
        const [item, url] = await Promise.all([
            getItem(itemId),
            getDownloadUrl(itemId),
        ]);

        const ext = getExtension(item.name);
        const isMarkdown =
            item.file?.mimeType === "text/markdown" || ["md", "markdown"].includes(ext);
        if (isMarkdown) {
            const res = await fetch(url);
            const text = await res.text();

            const processor = unified().use(remarkParse).use(remarkSlug as Plugin);
            const tree = processor.parse(text);
            const ast = processor.runSync(tree);
            const toc: { id: string; text: string; level: number }[] = [];
            visit(ast, "heading", (node: Heading) => {
                if (node.depth && node.depth <= 3) {
                    const id = (node.data as Record<string, unknown>)?.id as string;
                    const title = toString(node);
                    toc.push({ id, text: title, level: node.depth });
                }
            });

            return (
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                    <MarkdownPreview content={text} toc={toc} />
                </div>
            );
        }

        if (ext === "txt") {
            const res = await fetch(url);
            const text = await res.text();
            return (
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                    <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        {text}
                    </pre>
                </div>
            );
        }

        if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) {
            return (
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                    <audio controls src={url} className="w-full" />
                </div>
            );
        }

        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={url}
                    alt={item.name}
                    className="max-w-full h-auto mx-auto border"
                />
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p className="text-red-600">Error: {message}</p>;
    }
}
