// /components/SignInButton.tsx
'use client';

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
      <button
          onClick={() => signIn('microsoft-entra-id',{
              /** 
               * 强制每次登录时显示微软的授权确认页面
               * 即使用户之前已经授权过该应用，也会重新请求用户授权
               * 这在获取新的 refresh_token 或开发测试阶段很有用
               **/
              prompt: "consent",
          })
      }
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
          登录 / Sign in
      </button>
  );
}