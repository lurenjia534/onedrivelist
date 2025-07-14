import { auth } from '@/auth'
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import Image from "next/image";

export default async function DashboardPage(){
    const session = await auth();
    if (!session) redirect('/login'); // 未登陆跳转

    return (
        <main className="p-8">
            <h1 className="text-2xl mb-4">欢迎，{session.user?.name}</h1>
            <Image
                src={session.user?.image ?? '/default-avatar.svg'}
                alt="avatar"
                width={48}
                height={48}
                className="rounded-full mb-4"
            />

            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
            <SignOutButton />
        </main>
    )
}