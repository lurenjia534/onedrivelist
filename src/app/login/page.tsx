// /app/login/page.tsx
import { SignInButton } from '@/components/SignInButton';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await auth();
    if (session) redirect('/dashboard')

    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl">使用 Microsoft 账号登录</h1>
            <SignInButton />
        </div>
    )
}