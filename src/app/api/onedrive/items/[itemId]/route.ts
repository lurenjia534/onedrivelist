import type { NextRequest } from "next/server";

import { deleteDriveItem } from "@/services/onedrive/repo";
import { toErrorResponse, ForbiddenError } from "@/lib/errors";
import { getAuthTokens } from "@/lib/authToken";

async function assertAdmin(req: NextRequest) {
  const authCookie = req.cookies.get("pwd-auth")?.value;
  const { admin } = await getAuthTokens();

  if (!admin || !authCookie || authCookie !== admin) {
    throw new ForbiddenError("Admin privileges required");
  }
}

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
