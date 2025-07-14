// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    /** 在服务端/客户端调用 auth() 或 useSession() 时拿到的结构 */
    interface Session extends DefaultSession {
        /** OAuth access_token，用来直连 Graph API 等 */
        accessToken?: string;
        refreshToken?: string;   // ← 新增
        expiresAt?: number;      // 可选：暴露过期时间检查我的代码, 令牌刷新是否正常工作
    }
}

declare module "next-auth/jwt" {
    /** jwt() 回调里用的 token 对象 */
    interface JWT extends DefaultJWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    }
}

export {}; // 让文件成为模块
