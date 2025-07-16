import { auth } from "@/auth"

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0"

/** 列出当前用户 OneDrive 根目录的子项（文件 + 文件夹） */
export async function listRootChildren() {
    const session = await auth();
    if (!session?.accessToken) throw new Error("Not authenticated");

    const res = await fetch(
        `${GRAPH_ROOT}/me/drive/root/children?$select=id,name,folder,file,webUrl,size,lastModifiedDateTime`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );

    if (!res.ok) throw new Error(`Graph error ${res.status}`);
    return (await res.json()) as {
        value: {
            id: string;
            name: string;
            webUrl: string;
            folder?: object;
            file?: object;
            size: number;
            lastModifiedDateTime: string;
        }[];
        "@odata.nextLink"?: string;          // 如需分页可继续请求
    };
}