import type { NextRequest } from "next/server";

import { deleteDriveItem, renameDriveItem } from "@/services/onedrive/repo";
import { BadRequestError, toErrorResponse } from "@/lib/errors";
import { assertAdmin } from "@/app/api/onedrive/utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await assertAdmin(req);
    const { itemId } = await params;
    const ifMatch = req.headers.get("if-match") ?? undefined;

    await deleteDriveItem(itemId, { ifMatch });
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await assertAdmin(req);
    const { itemId } = await params;
    const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      throw new BadRequestError("Name is required");
    }

    const ifMatch = req.headers.get("if-match") ?? undefined;
    const updated = await renameDriveItem(itemId, name, { ifMatch });
    return Response.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
