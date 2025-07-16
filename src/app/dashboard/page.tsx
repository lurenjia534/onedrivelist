import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import { SignOutButton } from "@/components/SignOutButton";

interface DashboardProps {
    searchParams?: { item?: string; path?: string };
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = (await searchParams) ?? {};
    const currentItemId = params.item;
    const currentPath = params.path ?? "根目录";

    const list = await listChildren(currentItemId);

    return (
        <main className="p-8 max-w-5xl mx-auto font-extralight">
            {/* 顶部 */}
            <div className="flex items-center gap-4 mb-8">
                <Image
                    src={session.user?.image ?? "/default-avatar.svg"}
                    alt="avatar"
                    width={48}
                    height={48}
                    className="rounded-full grayscale hover:grayscale-0 transition"
                />
                <h1 className="text-2xl font-normal tracking-tight">
                    欢迎，{session.user?.name}
                </h1>
                <div className="ml-auto">
                    <SignOutButton />
                </div>
            </div>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
                当前位置：<span className="font-normal">{currentPath}</span>
            </p>

            {/* ⬇️ 把数据交给客户端组件渲染动画 */}
            <DriveList items={list.value} currentPath={currentPath} />
        </main>
    );
}
