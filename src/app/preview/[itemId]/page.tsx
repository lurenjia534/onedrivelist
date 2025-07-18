import {getItem, getDownloadUrl} from "@/lib/onedrive";

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
