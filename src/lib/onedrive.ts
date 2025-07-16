import { auth } from "@/auth";

const GRAPH = "https://graph.microsoft.com/v1.0";

/** 列出指定 DriveItem（或根）的 children */
export async function listChildren(itemId?: string) {
    const session = await auth();
    if (!session?.accessToken) throw new Error("Not authenticated");

    const endpoint = itemId
        ? `/me/drive/items/${itemId}/children`
        : "/me/drive/root/children";

    const res = await fetch(
        `${GRAPH}${endpoint}?$select=id,name,folder,file,webUrl,size,lastModifiedDateTime`,
        {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            cache: "no-store", // 开发期禁用 Next.js 路由缓存
        },
    );

    if (!res.ok) throw new Error(`Graph error ${res.status}`);
    return await res.json() as Promise<{
        value: {
            id: string;
            name: string;
            webUrl: string;
            folder?: object;
            file?: object;
            size: number;
            lastModifiedDateTime: string;
        }[];
    }>;
}
