// src/app/api/onedrive/list/route.ts
import { listRootChildren } from "@/lib/onedrive";

export async function GET() {
    try {
        const data = await listRootChildren();
        return Response.json(data);        // 200 OK
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const status = message.startsWith("Not authenticated") ? 401 : 500;
        return new Response(message, {status});
    }
}