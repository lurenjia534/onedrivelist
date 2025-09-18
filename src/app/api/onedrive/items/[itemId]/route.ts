import type { NextRequest } from "next/server";

import { deleteDriveItem } from "@/services/onedrive/repo";
import { toErrorResponse } from "@/lib/errors";
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
