// /components/SignOutButton.tsx
'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
            退出 / Sign out
        </button>
    );
}