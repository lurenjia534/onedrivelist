import { getItem, getDownloadUrl } from "@/lib/onedrive";
import {
    getExtension,
    isAudioExtension,
    isTextExtension,
    isMarkdownExtension,
} from "@/lib/fileTypes";
import AudioPlayer from "@/components/preview/AudioPlayer";
import TextPreview from "@/components/preview/TextPreview";
import ImagePreview from "@/components/preview/ImagePreview";
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
                    <TextPreview text={text} />
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
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    {/* 标题放上方，留出更多间距 */}
                    <h1 className="text-2xl font-bold mb-6 text-center max-w-xl">{item.name}</h1>

                    {/* 限定播放器最大宽度，避免大屏过宽 */}
                    <div className="w-full max-w-xl">
                        <AudioPlayer src={url} />
                    </div>
                </div>
            );
        }

        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
                <ImagePreview src={url} alt={item.name} />
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p className="text-red-600">Error: {message}</p>;
    }
}
