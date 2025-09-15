import { appConfig } from "@/lib/config";
import {
  AuthError,
  ExternalServiceError,
  NotFoundError,
} from "@/lib/errors";
import { getAccessToken, graphFetch } from "./client";

const ITEM_SELECT = "$select=id,name,folder,file,webUrl,size,lastModifiedDateTime";
const DOWNLOAD_URL_SELECT = "$select=@microsoft.graph.downloadUrl";
const DRIVE_TYPE_SELECT = "$select=driveType";
const SEARCH_CACHE_TTL = 45 * 1000;

export type DriveItemSummary = {
  id: string;
  name: string;
  webUrl: string;
  folder?: Record<string, unknown>;
  file?: { mimeType?: string };
  size: number;
  lastModifiedDateTime: string;
};

export type DriveItemListResponse = {
  value: DriveItemSummary[];
};

export type SearchResponse = DriveItemListResponse & {
  "@odata.nextLink"?: string;
};

const searchCache = new Map<string, { expiresAt: number; value: SearchResponse }>();

function normaliseCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

export async function listChildren(itemId?: string): Promise<DriveItemListResponse> {
  const endpoint = itemId ? `/me/drive/items/${itemId}/children` : "/me/drive/root/children";
  const res = await graphFetch(`${endpoint}?${ITEM_SELECT}`, {
    next: { revalidate: 600 },
  });
  return (await res.json()) as DriveItemListResponse;
}

export async function getDriveType(): Promise<"personal" | "business"> {
  const res = await graphFetch(`/me/drive?${DRIVE_TYPE_SELECT}`, {
    next: { revalidate: 600 },
  });
  const json = (await res.json()) as { driveType: "personal" | "business" };
  return json.driveType;
}

export type DriveItemMetadata = {
  id: string;
  name: string;
  webUrl: string;
  file?: { mimeType?: string };
};

export async function getItem(itemId: string): Promise<DriveItemMetadata> {
  const res = await graphFetch(`/me/drive/items/${itemId}?$select=id,name,webUrl,file`, {
    next: { revalidate: 600 },
  });
  return (await res.json()) as DriveItemMetadata;
}

export async function getDownloadUrl(itemId: string): Promise<string> {
  try {
    const res = await graphFetch(`/me/drive/items/${itemId}?${DOWNLOAD_URL_SELECT}`, {
      next: { revalidate: 0 },
    });
    const data = (await res.json()) as { "@microsoft.graph.downloadUrl"?: string };
    if (data["@microsoft.graph.downloadUrl"]) {
      return data["@microsoft.graph.downloadUrl"] as string;
    }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthError) {
      throw error;
    }
    // fall through to /content fallback for other errors
  }

  const token = await getAccessToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
    next: { revalidate: 0 },
  });

  if (res.status === 302) {
    const url = res.headers.get("location");
    if (url) {
      return url;
    }
  }

  if (res.status === 404) {
    throw new NotFoundError("Download target was not found");
  }

  if (res.status === 401) {
    throw new AuthError("Access token rejected when requesting download URL");
  }

  if (!res.ok) {
    throw new ExternalServiceError(`Graph content endpoint error ${res.status}`);
  }

  return res.url;
}

export async function searchItems(query: string): Promise<SearchResponse> {
  const key = normaliseCacheKey(query);
  const now = Date.now();
  const cached = searchCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const res = await graphFetch(`/me/drive/root/search(q='${encodeURIComponent(query)}')?${ITEM_SELECT}`, {
    next: { revalidate: 0 },
  });
  const data = (await res.json()) as SearchResponse;
  searchCache.set(key, { value: data, expiresAt: now + SEARCH_CACHE_TTL });
  return data;
}

export function isOriginAllowed(origin: string | null, selfOrigin: string): boolean {
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    if (originUrl.origin === selfOrigin) {
      return true;
    }

    return appConfig.downloadAllowedOrigins.includes(originUrl.origin);
  } catch {
    return false;
  }
}
