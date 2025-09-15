import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

import { appConfig } from "@/lib/config";
import { ForbiddenError, toErrorResponse } from "@/lib/errors";
import { getDownloadUrl, isOriginAllowed } from "@/services/onedrive/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    assertAllowedOrigin(req);
    verifySignature(req, itemId);

    const url = await getDownloadUrl(itemId);
    return new Response(null, { status: 302, headers: { Location: url } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function assertAllowedOrigin(req: NextRequest) {
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const selfOrigin = req.nextUrl.origin;

  const originAllowed = originHeader ? isOriginAllowed(originHeader, selfOrigin) : false;
  const refererAllowed = refererHeader ? isOriginAllowed(refererHeader, selfOrigin) : false;

  if (originAllowed || refererAllowed) {
    return;
  }

  throw new ForbiddenError("Request origin not allowed");
}

function verifySignature(req: NextRequest, itemId: string) {
  const secret = appConfig.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    return;
  }

  const params = req.nextUrl.searchParams;
  const signature = params.get("sig") ?? params.get("signature");
  const expires = params.get("exp") ?? params.get("expires");

  if (!signature || !expires) {
    throw new ForbiddenError("Missing download signature");
  }

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt)) {
    throw new ForbiddenError("Invalid signature expiry");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (expiresAt < nowSeconds) {
    throw new ForbiddenError("Download link expired");
  }

  const payload = `${itemId}:${expiresAt}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");

  let providedBuffer: Buffer;
  let expectedBuffer: Buffer;
  try {
    providedBuffer = Buffer.from(signature, "base64url");
    expectedBuffer = Buffer.from(expected, "base64url");
  } catch {
    throw new ForbiddenError("Malformed download signature");
  }

  if (providedBuffer.length !== expectedBuffer.length) {
    throw new ForbiddenError("Invalid download signature");
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new ForbiddenError("Invalid download signature");
  }
}
