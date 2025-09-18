import type { NextRequest } from "next/server";

import { ForbiddenError } from "@/lib/errors";
import { getAuthTokens } from "@/lib/authToken";

export async function assertAdmin(req: NextRequest): Promise<void> {
  const authCookie = req.cookies.get("pwd-auth")?.value;
  const { admin } = await getAuthTokens();

  if (!admin || !authCookie || authCookie !== admin) {
    throw new ForbiddenError("Admin privileges required");
  }
}
