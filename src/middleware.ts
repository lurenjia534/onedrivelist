import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/authToken";

export async function middleware(req: NextRequest) {
    const token = await getAuthToken();
    if (!token) {
        return NextResponse.next();
    }

    const { pathname } = req.nextUrl;

    if (pathname === "/login" || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    const cookie = req.cookies.get("pwd-auth");
    if (cookie && cookie.value === token) {
        return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
