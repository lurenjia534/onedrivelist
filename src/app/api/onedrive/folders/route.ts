import type { NextRequest } from "next/server";

import { createFolder } from "@/services/onedrive/repo";
import { BadRequestError, toErrorResponse } from "@/lib/errors";
import { assertAdmin } from "../utils";

const CONFLICT_BEHAVIORS = new Set(["fail", "replace", "rename"] as const);

type ConflictBehavior = "fail" | "replace" | "rename";

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);

    const body = (await req.json().catch(() => null)) as
      | {
          name?: unknown;
          parentId?: unknown;
          conflictBehavior?: unknown;
        }
      | null;

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      throw new BadRequestError("Folder name is required");
    }

    let parentId: string | undefined;
    if (typeof body?.parentId === "string" && body.parentId.trim()) {
      parentId = body.parentId.trim();
    }

    let conflictBehavior: ConflictBehavior | undefined;
    if (typeof body?.conflictBehavior === "string") {
      const normalised = body.conflictBehavior.trim().toLowerCase();
      if (CONFLICT_BEHAVIORS.has(normalised as ConflictBehavior)) {
        conflictBehavior = normalised as ConflictBehavior;
      }
    }

    const created = await createFolder({ name, parentId, conflictBehavior });

    return Response.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
