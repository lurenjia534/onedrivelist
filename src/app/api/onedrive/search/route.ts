import type { NextRequest } from "next/server";
import { searchItems } from "@/lib/onedrive";

export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        if (!q.trim()) {
            return Response.json({ value: [] });
        }
        const data = await searchItems(q);
        return Response.json(data);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const status = message.startsWith("Not authenticated") ? 401 : 500;
        return new Response(message, { status });
    }
}
