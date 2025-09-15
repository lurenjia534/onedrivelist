import { searchItems } from "@/services/onedrive/repo";
import { toErrorResponse } from "@/lib/errors";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return Response.json({ value: [] });
    const data = await searchItems(q);
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
