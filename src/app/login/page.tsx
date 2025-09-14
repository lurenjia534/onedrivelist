import { redirect } from "next/navigation";
import LoginUI from "./LoginView";
import { getAuthTokens } from "@/lib/authToken";
import { getDict } from "@/i18n/server";

export default function LoginPage() {
    // 如果未配置任意密码，则不需要登录
    if (!process.env.password && !process.env.ADMIN_PASSWORD && !process.env.admin_password) {
        redirect("/");
    }

    async function login(formData: FormData) {
        "use server";
        const { dict } = await getDict();
        const input = formData.get("password");
        const adminPwd = process.env.ADMIN_PASSWORD ?? process.env.admin_password;
        const userPwd = process.env.password;

        if (typeof input === "string") {
            const { user, admin } = await getAuthTokens();
            const cookieStore = await import("next/headers").then((m) => m.cookies());
            // 优先匹配管理员密码
            if (adminPwd && input === adminPwd && admin) {
                (await cookieStore).set("pwd-auth", admin, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                (await cookieStore).set("pwd-role", "admin", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                redirect("/");
            }
            // 其次匹配普通用户密码
            if (userPwd && input === userPwd && user) {
                (await cookieStore).set("pwd-auth", user, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                (await cookieStore).set("pwd-role", "user", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                redirect("/");
            }
        }
        return { error: dict["login.error.invalid"] };
    }

    return <LoginUI loginAction={login} />;
}
