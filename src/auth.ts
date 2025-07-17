import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

async function refreshAccessToken(refreshToken: string) {
    // MS OAuth2 token endpoint（tenant = common/organizations/具体租户均可）
    const url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

    const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
            client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            scope: "offline_access openid profile email User.Read Files.ReadWrite",
        }),
    });

    if (!res.ok) throw await res.json();
    return (await res.json()) as {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
    };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
        issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,

        /** 要拿到 refresh_token 必须声明 offline_access（Entra 规范） */
        authorization: {
            params: {
                scope: "offline_access openid profile email User.Read Files.ReadWrite",
            },
        },
    }),
  ],
    // 建议在生产环境开启 database / adapter；此处演示用 JWT
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // 回调中可解构 profile / account 获取 access_token
    /** ① 首次登录，把 access/refresh/expires 都写进 JWT */
    callbacks: {
      async jwt({token, account}) {
          if (account) {
              token.accessToken = account.access_token;
              token.refreshToken = account.refresh_token;
              token.expiresAt = (account.expires_at ?? 0) * 1000; // s → ms
              return token;
          }
          /** ② 后续请求，如果 access_token 过期就使用 refresh_token 静默续期 */
          if (
              token.refreshToken &&
              typeof token.expiresAt === "number" &&
              Date.now() > token.expiresAt - 5 * 60_000 // 提前 5 min 触发
          ) {
              try {
                  const refreshed = await refreshAccessToken(token.refreshToken);
                  token.accessToken = refreshed.access_token;
                  token.expiresAt = Date.now() + refreshed.expires_in * 1000;
                  token.refreshToken = refreshed.refresh_token ?? token.refreshToken; // 轮换
              } catch (err) {
                  console.error("🔑 刷新 access_token 失败", err);
                  // token.error = 'RefreshAccessTokenError'  // 如需前端感知可加
              }
          }
          return token;
      },
        /**
         * ③ 只把 access_token 暴露给浏览器，refresh_token 绝不外泄。
         *    但在首次运行（环境变量未配置）时，需要把 refreshToken 暴露给 /token 页面。
         */
        async session({ session, token }) {
            // 把 JWT 里的字段暴露给客户端
            session.accessToken = token.accessToken;
            session.expiresAt = token.expiresAt;
            // 仅在未配置 Refresh Token 的情况下，临时暴露 refresh_token
            if (!process.env.ONEDRIVE_REFRESH_TOKEN) {
                session.refreshToken = token.refreshToken;
            }
            return session;
        },
    },
});