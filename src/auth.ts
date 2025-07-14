import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
    // 建议在生产环境开启 database / adapter；此处演示用 JWT
    session: { strategy: 'jwt' },

    // 回调中可解构 profile / account 获取 access_token
    callbacks: {
      async jwt({token, account}) {
          if (account?.access_token){
              token.accessToken = account.access_token;
          }
          return token;
      },
        async session({ session, token }) {
            // 把 JWT 里的字段暴露给客户端
            return {
                ...session,
                accessToken: token.accessToken as string | undefined,
            };
        },
    },
});