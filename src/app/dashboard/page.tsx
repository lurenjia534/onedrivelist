import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { listRootChildren } from "@/lib/onedrive";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const list = await listRootChildren();

    return (
        <main className="p-8">
            <h1 className="text-2xl mb-4">欢迎，{session.user?.name}</h1>
            {/* OneDrive 文件列表 */}
            <h2 className="text-xl mt-8 mb-2">OneDrive 根目录</h2>
            <ul className="space-y-1">
                {list.value.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                        {item.folder ? "📁" : "📄"}
                        <a
                            href={item.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600"
                        >
                            {item.name}
                        </a>
                        <span className="text-sm text-gray-500">
              ({(item.size / 1024).toFixed(1)} KB)
            </span>
                    </li>
                ))}
            </ul>

            <SignOutButton />
        </main>
    );
}
