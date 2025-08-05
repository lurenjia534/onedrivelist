import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginUI from "./login-ui";

export default function LoginPage() {
    if (!process.env.password) {
        redirect("/");
    }

    async function login(formData: FormData) {
        "use server";
        const input = formData.get("password");
        if (input && input === process.env.password) {
            const cookieStore = await cookies();
            cookieStore.set("pwd-auth", String(input), { httpOnly: true });
            redirect("/");
        }
        return { error: "密码错误，请重试" };
    }

    return <LoginUI loginAction={login} />;
}
