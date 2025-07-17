import { redirect } from "next/navigation";
import LoginButton from "./login-button";

export default function SetupPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    return (
        <div className="container mx-auto p-8 space-y-6">
            <h1 className="text-2xl font-bold">首次运行设置</h1>
            <p>
                尚未检测到 <code>ONEDRIVE_REFRESH_TOKEN</code> 环境变量。请登录您的
                Microsoft 账号以生成 Refresh Token。
            </p>
            <LoginButton />
        </div>
    );
}