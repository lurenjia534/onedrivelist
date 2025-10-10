import type { NextRequest } from "next/server";

import { BadRequestError, toErrorResponse } from "@/lib/errors";
import { assertAdmin } from "@/app/api/onedrive/utils";
import { SMALL_FILE_MAX_BYTES, uploadLargeFileToFolder, uploadSmallFileToFolder } from "@/services/onedrive/repo";

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new BadRequestError("Expected multipart/form-data payload");
    }
    const fileEntry = form.get("file");
    if (!(fileEntry instanceof File)) {
      throw new BadRequestError("Missing file");
    }

    const parentIdRaw = form.get("parentId");
    const parentId =
      typeof parentIdRaw === "string" && parentIdRaw.trim().length > 0 ? parentIdRaw.trim() : undefined;

    const conflictRaw = form.get("conflictBehavior");
    const conflictBehavior =
      typeof conflictRaw === "string" && ["fail", "replace", "rename"].includes(conflictRaw)
        ? (conflictRaw as "fail" | "replace" | "rename")
        : "rename";

    const filenameRaw = form.get("filename");
    const filename =
      typeof filenameRaw === "string" && filenameRaw.trim().length > 0
        ? filenameRaw.trim()
        : fileEntry.name || "upload.bin";

    const chunkSizeRaw = form.get("chunkSize");
    const chunkSize =
      typeof chunkSizeRaw === "string" && chunkSizeRaw.trim().length > 0
        ? Number(chunkSizeRaw)
        : undefined;
    if (chunkSize !== undefined && (!Number.isFinite(chunkSize) || chunkSize <= 0)) {
      throw new BadRequestError("Invalid chunk size");
    }

    if (fileEntry.size <= SMALL_FILE_MAX_BYTES) {
      const buffer = await fileEntry.arrayBuffer();
      const item = await uploadSmallFileToFolder(parentId, buffer, {
        filename,
        conflictBehavior,
        contentType: fileEntry.type || "application/octet-stream",
      });
      return Response.json(item, { status: 201 });
    }

    const item = await uploadLargeFileToFolder(parentId, fileEntry, {
      filename,
      conflictBehavior,
      chunkSize,
    });
    return Response.json(item, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
