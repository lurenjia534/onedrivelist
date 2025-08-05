import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form action={login} className="space-y-4">
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border px-4 py-2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
