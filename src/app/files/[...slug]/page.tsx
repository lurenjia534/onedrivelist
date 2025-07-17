import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";

// 辅助函数，用于解码路径段
// 注意：在实际生产中，您可能需要一个更强大的 slug 到 name 的映射
const decodeSegment = (segment: string) => decodeURIComponent(segment);

export default async function FilesPage({ params }: { params: Promise<{slug?: string[] }> }) {
    const session = await auth();
    if (!session) redirect("/login");

    const  data  = await params;
    const slug: string[] = data.slug ?? [];
    const currentItemId = slug.length > 0 ? slug[slug.length - 1] : undefined;

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

            {/* 面包屑导航 */}
            <div className="mb-6 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Link href="/dashboard" className="hover:underline">根目录</Link>
                {slug.map((segment, index) => {
                    // 我们假设 slug 的每一段都是 item ID
                    const href = `/files/${slug.slice(0, index + 1).join('/')}`;
                    // 为了显示名称，我们需要从 list 中找到对应的 item
                    // 这是一个简化的实现，更健壮的方案需要更复杂的路径解析
                    const itemName = `项目 ${index + 1}` // 临时占位符
                    return (
                        <span key={segment} className="flex items-center gap-2">
                            <span>/</span>
                            <Link href={href} className="hover:underline">{decodeSegment(itemName)}</Link>
                        </span>
                    );
                })}
            </div>

            <DriveList items={list.value} basePathSegments={slug} />
        </main>
    );
}
