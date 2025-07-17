import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // 仪表盘页面现在总是显示根目录的内容
    const list = await listChildren(); // 无参数调用，获取根目录

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

            {/* 面包屑导航 - 根目录 */}
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                <Link href="/dashboard" className="hover:underline">根目录</Link>
            </p>

            <DriveList items={list.value} basePathSegments={[]} />
        </main>
    );
}
