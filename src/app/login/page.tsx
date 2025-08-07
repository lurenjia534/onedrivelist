import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginUI from "./login-ui";
import { getAuthToken } from "@/lib/authToken";

export default function LoginPage() {
    if (!process.env.password) {
        redirect("/");
    }

    async function login(formData: FormData) {
        "use server";
        const input = formData.get("password");
        if (input && input === process.env.password) {
            const token = await getAuthToken();
            if (token) {
                const cookieStore = await cookies();
                cookieStore.set("pwd-auth", token, { httpOnly: true });
                redirect("/");
            }
        }
        return { error: "密码错误，请重试" };
    }

    return <LoginUI loginAction={login} />;
}
