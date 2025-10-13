import type { NextRequest } from "next/server";

import { BadRequestError, toErrorResponse } from "@/lib/errors";
import { assertAdmin } from "@/app/api/onedrive/utils";
import { createUploadSessionToFolder } from "@/services/onedrive/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    const body = (await req.json().catch(() => null)) as {
      filename?: unknown;
      parentId?: unknown;
      conflictBehavior?: unknown;
    } | null;

    const filename =
      typeof body?.filename === "string" && body.filename.trim().length > 0
        ? body.filename.trim()
        : "";
    if (!filename) {
      throw new BadRequestError("filename is required");
    }

    const parentId =
      typeof body?.parentId === "string" && body.parentId.trim().length > 0
        ? body.parentId.trim()
        : undefined;

    const conflictInput =
      typeof body?.conflictBehavior === "string" && body.conflictBehavior.trim().length > 0
        ? body.conflictBehavior.trim()
        : undefined;
    const conflictBehavior =
      conflictInput === "fail" || conflictInput === "replace" || conflictInput === "rename"
        ? conflictInput
        : "rename";

    const session = await createUploadSessionToFolder(parentId, {
      filename,
      conflictBehavior,
    });
    return Response.json(session);
  } catch (error) {
    return toErrorResponse(error);
  }
}
