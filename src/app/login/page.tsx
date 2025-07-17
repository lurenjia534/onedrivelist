import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LoginCard } from '@/components/LoginCard';

export default async function LoginPage() {
    const session = await auth();
    if (session) redirect('/dashboard');

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <LoginCard />
        </div>
    );
}
