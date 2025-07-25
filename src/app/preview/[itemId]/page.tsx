import { getItem, getDownloadUrl } from "@/lib/onedrive";
import {
    getExtension,
    isAudioExtension,
    isTextExtension,
    isMarkdownExtension,
} from "@/lib/fileTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 0;


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
        if (isTextExtension(ext)) {
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

        if (isMarkdownExtension(ext)) {
            const res = await fetch(url);
            const md = await res.text();
            return (
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                    <div className="prose dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {md}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        if (isAudioExtension(ext)) {
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
