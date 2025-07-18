// src/lib/onedrive.ts

const GRAPH = "https://graph.microsoft.com/v1.0";

/**
 * 使用环境变量中的 Refresh Token 获取 Access Token。
 * 这是应用的核心认证机制，允许服务器代表管理员访问 OneDrive。
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
    const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN;
    if (!refreshToken) {
        throw new Error("ONEDRIVE_REFRESH_TOKEN is not set in environment variables.");
    }

    const now = Date.now();
    if (cachedToken && now < cachedToken.expiresAt - 5 * 60_000) {
        return cachedToken.value;
    }

    // MS OAuth2 token endpoint
    const url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
            client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            scope: "offline_access openid profile email User.Read Files.ReadWrite",
        }),
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        const errorDetails = await res.json();
        console.error("Failed to refresh access token:", errorDetails);
        throw new Error(`Graph error ${res.status}: ${errorDetails.error_description}`);
    }

    const tokenData = await res.json() as { access_token: string; expires_in: number };
    cachedToken = {
        value: tokenData.access_token,
        expiresAt: now + tokenData.expires_in * 1000,
    };
    return cachedToken.value;
}

/**
 * 列出指定 DriveItem（或根目录）的子项目。
 * @param itemId 可选，要列出其子项目的文件夹 ID。如果未提供，则列出根目录。
 */
export async function listChildren(itemId?: string) {
    const accessToken = await getAccessToken();
    const endpoint = itemId
        ? `/me/drive/items/${itemId}/children`
        : "/me/drive/root/children";

    const res = await fetch(
        `${GRAPH}${endpoint}?$select=id,name,folder,file,webUrl,size,lastModifiedDateTime`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            next: { revalidate: 600 },
        }
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

/**
 * 获取单个 DriveItem 的元数据。
 * @param itemId 要获取其元数据的文件或文件夹的 ID。
 */
export async function getItem(itemId: string) {
    const accessToken = await getAccessToken();
    const endpoint = `/me/drive/items/${itemId}`;

    const res = await fetch(
        `${GRAPH}${endpoint}?$select=id,name,webUrl`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            next: { revalidate: 600 },
        }
    );

    if (!res.ok) throw new Error(`Graph error ${res.status}`);
    return await res.json() as Promise<{
        id: string;
        name: string;
        webUrl: string;
    }>;
}

/**
 * 获取文件的下载链接（@microsoft.graph.downloadUrl）。
 * @param itemId 要下载的文件 ID。
 */
export async function getDownloadUrl(itemId: string) {
    const accessToken = await getAccessToken();
    const endpoint = `/me/drive/items/${itemId}/content`;

    const res = await fetch(`${GRAPH}${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        // 手动处理重定向以取得真实下载链接
        redirect: "manual",
        next: { revalidate: 0 },
    });

    if (res.status === 302) {
        const url = res.headers.get("Location");
        if (url) return url;
    }

    if (!res.ok) throw new Error(`Graph error ${res.status}`);
    // 如果 fetch 自动跟随了重定向，返回最终的 URL
    return res.url;
}