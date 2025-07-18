// src/app/api/onedrive/download/[itemId]/route.ts
import type { NextRequest } from "next/server";
import { getDownloadUrl } from '@/lib/onedrive'

export async function GET(
 _req: NextRequest,
 { params}: { params: Promise<{ itemId: string }> }
){
    try {
        const { itemId } = await params;
        const url = await getDownloadUrl(itemId);
        return new Response(null, { status: 302, headers: { Location: url } });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const status = message.startsWith("Not authenticated") ? 401 : 500;
        return new Response(message, { status });
    }
}