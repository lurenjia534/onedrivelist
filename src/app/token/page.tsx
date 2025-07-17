import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TokenPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    const session = await auth();
    const token = session?.refreshToken;

    return (
        <div className="container mx-auto p-8 space-y-6">
            <h1 className="text-2xl font-bold">获取 Refresh Token 成功</h1>
            {token ? (
                <>
                    <p>请复制下面的 Refresh Token，并在部署平台的环境变量中设置 <code>ONEDRIVE_REFRESH_TOKEN</code>。</p>
                    <pre className="p-4 bg-gray-100 dark:bg-gray-800 overflow-x-auto break-all">
                        {token}
                    </pre>
                </>
            ) : (
                <p className="text-red-600">未能获取到 Refresh Token，请返回重试。</p>
            )}
        </div>
    );
}