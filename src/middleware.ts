import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/authToken";

export async function middleware(req: NextRequest) {
    const token = await getAuthToken();
    // 未配置站点密码则放行所有请求
    if (!token) {
        return NextResponse.next();
    }

    const { pathname } = req.nextUrl;

    // 放行认证相关 API
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // 保护 OneDrive API：需要有效的 pwd-auth cookie，否则返回 401
    if (pathname.startsWith("/api/onedrive")) {
        const cookie = req.cookies.get("pwd-auth");
        if (cookie && cookie.value === token) {
            return NextResponse.next();
        }
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 放行其他 API（如有）
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // 页面路由：需要有效的 pwd-auth，否则跳转登录
    if (pathname === "/login") {
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
