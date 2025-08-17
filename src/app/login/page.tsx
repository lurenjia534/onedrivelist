import { redirect } from "next/navigation";
import LoginUI from "./login-ui";
import { getAuthToken } from "@/lib/authToken";
import { getDict } from "@/i18n/server";

export default function LoginPage() {
    if (!process.env.password) {
        redirect("/");
    }

    async function login(formData: FormData) {
        "use server";
        const { dict } = await getDict();
        const input = formData.get("password");
        if (input && input === process.env.password) {
            const token = await getAuthToken();
            if (token) {
                const cookieStore = await import("next/headers").then(m => m.cookies());
                (await cookieStore).set("pwd-auth", token, {
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
