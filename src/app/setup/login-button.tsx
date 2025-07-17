"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn('microsoft-entra-id', { redirectTo: '/token' })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
        >
            登录 Microsoft 账户
        </button>
    );
}