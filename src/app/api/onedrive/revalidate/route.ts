import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { toErrorResponse } from "@/lib/errors";
import { assertAdmin } from "@/app/api/onedrive/utils";

export const runtime = "nodejs";
export const maxDuration = 60;
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    const body = (await req.json().catch(() => null)) as { parentId?: unknown } | null;
    const parentId =
      typeof body?.parentId === "string" && body.parentId.trim().length > 0
        ? body.parentId.trim()
        : undefined;

    const tag = parentId ? `drive-list-${parentId}` : "drive-list-root";
    revalidateTag(tag);

    return Response.json({ revalidated: true, tag });
  } catch (error) {
    return toErrorResponse(error);
  }
}
