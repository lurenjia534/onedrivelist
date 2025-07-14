// /components/SignInButton.tsx
'use client';

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
      <button
          onClick={() => signIn('microsoft-entra-id')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
          登录 / Sign in
      </button>
  );
}