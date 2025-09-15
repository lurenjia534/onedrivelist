import { appConfig } from "@/lib/config";
import {
  AuthError,
  ConfigurationError,
  ExternalServiceError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const TOKEN_LEEWAY = 5 * 60 * 1000; // 5 minutes safety window

let cachedToken: { value: string; expiresAt: number } | null = null;

export type GraphFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

async function requestAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken) {
    const now = Date.now();
    if (now < cachedToken.expiresAt - TOKEN_LEEWAY) {
      return cachedToken.value;
    }
  }

  const refreshToken = appConfig.ONEDRIVE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new ConfigurationError("ONEDRIVE_REFRESH_TOKEN is not configured");
  }

  const body = new URLSearchParams({
    client_id: appConfig.AUTH_MICROSOFT_ENTRA_ID_ID,
    client_secret: appConfig.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "offline_access openid profile email User.Read Files.ReadWrite",
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    cachedToken = null;
    const errorPayload = await res
      .json()
      .catch(() => ({ error: "token_error", error_description: res.statusText }));

    if (res.status === 400 || res.status === 401) {
      throw new AuthError(
        `Failed to refresh access token: ${errorPayload.error_description ?? res.statusText}`
      );
    }

    throw new ExternalServiceError(
      `Graph token endpoint error ${res.status}: ${errorPayload.error_description ?? res.statusText}`,
      { status: res.status, cause: errorPayload }
    );
  }

  const tokenData = (await res.json()) as { access_token: string; expires_in?: number };
  const expiresIn = tokenData.expires_in ?? 3600;
  cachedToken = {
    value: tokenData.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return cachedToken.value;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  return requestAccessToken(forceRefresh);
}

export async function graphFetch(path: string, init: GraphFetchInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${GRAPH_ENDPOINT}${path}`;

  const perform = async (forceRefresh: boolean): Promise<Response> => {
    const token = await requestAccessToken(forceRefresh);
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const { next, ...rest } = init;
    const res = await fetch(url, {
      ...rest,
      headers,
      next,
    });

    if (res.status === 401 && !forceRefresh) {
      cachedToken = null;
      return perform(true);
    }

    if (res.status === 401) {
      throw new AuthError("Access token rejected by Microsoft Graph");
    }

    if (res.status === 403) {
      throw new ForbiddenError("Access to the requested resource is forbidden");
    }

    if (!res.ok) {
      if (res.status === 404) {
        throw new NotFoundError("Requested resource was not found");
      }

      throw new ExternalServiceError(`Graph error ${res.status}`, {
        status: res.status,
      });
    }

    return res;
  };

  return perform(false);
}
