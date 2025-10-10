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
const SMALL_FILE_MAX_BYTES = 240 * 1024 * 1024; // keep headroom below 250 MB API limit
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MiB
const MAX_CHUNK_SIZE = 60 * 1024 * 1024; // < 60 MiB per Graph spec
const CHUNK_SIZE_INCREMENT = 320 * 1024; // 320 KiB

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

type DriveItemPayload = {
  id: string;
  name: string;
  webUrl: string;
  folder?: Record<string, unknown>;
  file?: { mimeType?: string };
  size?: number;
  lastModifiedDateTime: string;
};

export type CreateFolderInput = {
  name: string;
  parentId?: string;
  conflictBehavior?: "fail" | "replace" | "rename";
};

export type SearchResponse = DriveItemListResponse & {
  "@odata.nextLink"?: string;
};

const searchCache = new Map<string, { expiresAt: number; value: SearchResponse }>();

function normaliseCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

type ConflictBehavior = "fail" | "replace" | "rename";

export async function listChildren(itemId?: string): Promise<DriveItemListResponse> {
  const endpoint = itemId ? `/me/drive/items/${itemId}/children` : "/me/drive/root/children";
  const res = await graphFetch(`${endpoint}?${ITEM_SELECT}`, {
    next: { revalidate: 600 },
  });
  return (await res.json()) as DriveItemListResponse;
}

function toDriveItemSummary(item: DriveItemPayload): DriveItemSummary {
  return {
    id: item.id,
    name: item.name,
    webUrl: item.webUrl,
    folder: item.folder,
    file: item.file,
    size: item.size ?? 0,
    lastModifiedDateTime: item.lastModifiedDateTime,
  };
}

export async function createFolder({
  name,
  parentId,
  conflictBehavior = "rename",
}: CreateFolderInput): Promise<DriveItemSummary> {
  const endpoint = parentId
    ? `/me/drive/items/${parentId}/children`
    : "/me/drive/root/children";
  const res = await graphFetch(`${endpoint}?${ITEM_SELECT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      folder: {},
      "@microsoft.graph.conflictBehavior": conflictBehavior,
    }),
    next: { revalidate: 0 },
  });

  const payload = (await res.json()) as DriveItemPayload;
  searchCache.clear();
  return toDriveItemSummary(payload);
}

export async function renameDriveItem(
  itemId: string,
  name: string,
  options: { ifMatch?: string } = {}
): Promise<DriveItemSummary> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.ifMatch) {
    headers.set("If-Match", options.ifMatch);
  }

  const res = await graphFetch(`/me/drive/items/${itemId}?${ITEM_SELECT}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name }),
    next: { revalidate: 0 },
  });

  const payload = (await res.json()) as DriveItemPayload;
  searchCache.clear();
  return toDriveItemSummary(payload);
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

function assertValidChunkSize(size: number): void {
  if (size <= 0) {
    throw new ExternalServiceError("Upload chunk size must be positive");
  }
  if (size > MAX_CHUNK_SIZE) {
    throw new ExternalServiceError("Upload chunk size exceeds Graph limit of 60 MiB");
  }
  if (size % CHUNK_SIZE_INCREMENT !== 0) {
    throw new ExternalServiceError("Upload chunk size must be a multiple of 320 KiB");
  }
}

async function toUint8Array(
  data: Blob | ArrayBuffer | ArrayBufferView | Uint8Array
): Promise<Uint8Array> {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const buffer = await data.arrayBuffer();
    return new Uint8Array(buffer);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  throw new ExternalServiceError("Unsupported upload data type");
}

type UploadBaseOptions = {
  filename: string;
  conflictBehavior?: ConflictBehavior;
  contentType?: string;
};

export async function uploadSmallFileToFolder(
  parentId: string | undefined,
  data: ArrayBuffer | ArrayBufferView | Blob | Uint8Array,
  options: UploadBaseOptions
): Promise<DriveItemSummary> {
  const { filename, conflictBehavior = "rename", contentType = "application/octet-stream" } = options;
  const base = parentId ? `/me/drive/items/${parentId}` : "/me/drive/root";
  const encodedName = encodeURIComponent(filename);
  const endpoint = `${base}:/${encodedName}:/content?@microsoft.graph.conflictBehavior=${conflictBehavior}&${ITEM_SELECT}`;

  const res = await graphFetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: data as BodyInit,
    next: { revalidate: 0 },
  });

  const payload = (await res.json()) as DriveItemPayload;
  searchCache.clear();
  return toDriveItemSummary(payload);
}

export async function createUploadSessionToFolder(
  parentId: string | undefined,
  options: UploadBaseOptions
): Promise<{ uploadUrl: string; expirationDateTime?: string }> {
  const { filename, conflictBehavior = "rename" } = options;
  const base = parentId ? `/me/drive/items/${parentId}` : "/me/drive/root";
  const encodedName = encodeURIComponent(filename);
  const endpoint = `${base}:/${encodedName}:/createUploadSession`;

  const res = await graphFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      item: {
        "@microsoft.graph.conflictBehavior": conflictBehavior,
        name: filename,
      },
    }),
    next: { revalidate: 0 },
  });

  const session = (await res.json()) as { uploadUrl: string; expirationDateTime?: string };
  return session;
}

export async function uploadLargeFileToFolder(
  parentId: string | undefined,
  data: Blob | ArrayBuffer | ArrayBufferView | Uint8Array,
  options: UploadBaseOptions & {
    chunkSize?: number;
    onProgress?: (uploaded: number, total: number) => void;
    signal?: AbortSignal;
  }
): Promise<DriveItemSummary> {
  const { filename, conflictBehavior = "rename", chunkSize = DEFAULT_CHUNK_SIZE, onProgress, signal } = options;
  assertValidChunkSize(chunkSize);

  const bytes = await toUint8Array(data);
  const total = bytes.byteLength;
  const session = await createUploadSessionToFolder(parentId, { filename, conflictBehavior });

  let offset = 0;
  while (offset < total) {
    const end = Math.min(offset + chunkSize, total);
    const chunk = bytes.subarray(offset, end)

    const res = await fetch(session.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${offset}-${end - 1}/${total}`,
      },
      body: chunk,
      signal,
    });

    if (res.status === 202) {
      let nextOffset = end;
      const progress = await res.json().catch(() => null);
      if (progress && Array.isArray(progress.nextExpectedRanges) && progress.nextExpectedRanges[0]) {
        const [rangeStart] = String(progress.nextExpectedRanges[0]).split("-");
        const parsed = Number.parseInt(rangeStart, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          nextOffset = parsed;
        }
      }
      if (nextOffset === offset) {
        nextOffset = end;
      }
      offset = Math.min(nextOffset, total);
      onProgress?.(offset, total);
      continue;
    }

    if (res.ok) {
      const payload = (await res.json()) as DriveItemPayload;
      searchCache.clear();
      onProgress?.(total, total);
      return toDriveItemSummary(payload);
    }

    const errorText = await res.text().catch(() => `status ${res.status}`);
    throw new ExternalServiceError(`Upload failed: ${errorText}`, { status: res.status });
  }

  throw new ExternalServiceError("Upload session completed without final response");
}

export { SMALL_FILE_MAX_BYTES };

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

export async function deleteDriveItem(itemId: string, options: { ifMatch?: string } = {}): Promise<void> {
  const headers = new Headers();
  if (options.ifMatch) {
    headers.set("If-Match", options.ifMatch);
  }

  const res = await graphFetch(`/me/drive/items/${itemId}`, {
    method: "DELETE",
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok && res.status !== 204) {
    throw new ExternalServiceError(`Failed to delete drive item ${itemId}`, {
      status: res.status,
    });
  }

  searchCache.clear();
}
