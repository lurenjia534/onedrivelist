import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginUI from "./login-ui";
import { getAuthToken } from "@/lib/authToken";
import zh from "@/i18n/dictionaries/zh";
import en from "@/i18n/dictionaries/en";

export default function LoginPage() {
    if (!process.env.password) {
        redirect("/");
    }

    async function login(formData: FormData) {
        "use server";
        const cookieStore = await cookies();
        const locale = cookieStore.get("lang")?.value === "en" ? "en" : "zh";
        const dict = locale === "zh" ? zh : en;
        const input = formData.get("password");
        if (input && input === process.env.password) {
            const token = await getAuthToken();
            if (token) {
                cookieStore.set("pwd-auth", token, { httpOnly: true });
                redirect("/");
            }
        }
        return { error: dict["login.error.invalid"] };
    }

    return <LoginUI loginAction={login} />;
}
