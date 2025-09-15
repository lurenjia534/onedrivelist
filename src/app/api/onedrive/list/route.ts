import { listChildren } from "@/services/onedrive/repo";
import { toErrorResponse } from "@/lib/errors";

export const revalidate = 600;

export async function GET() {
  try {
    const data = await listChildren();
    return Response.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
