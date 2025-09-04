import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { User, Session } from "next-auth";
import { ConvexClient } from "convex/browser"; // ConvexClient を使用
import bcrypt from "bcryptjs"; // パスワード検証用
import { api } from "@/convex/_generated/api"; // Convex APIのインポート
import { UserRole } from '@/types/user';
import { Id } from '@/convex/_generated/dataModel';

// ConvexClient の初期化
const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = NextAuth({
  providers: [
    // メールアドレスとパスワード認証用のCredentialsProviderを追加
    CredentialsProvider({
      id: "email-password", // プロバイダーに一意のIDを追加
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log("Attempting to authorize user with email:", credentials.email);

          // Convex からユーザーを取得
          const user = await convex.query(api.users.getUserByEmail, {
            email: credentials.email,
          });

          if (!user) {
            console.log("User not found for email:", credentials.email);
            return null;
          }

          console.log("User found:", user._id, user.email);

          if (!user.hashedPassword) {
            console.error("User has no hashedPassword:", user._id);
            return null;
          }

          // パスワードの検証
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          console.log("Password validation result (isValidPassword):", isValidPassword);

          if (isValidPassword) {
            // 認証成功
            return {
              id: user._id, // Convex のドキュメントIDをユーザーIDとして使用
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
              storeId: user.storeId,
            };
          } else {
            console.log("Invalid password for user:", user.email);
            return null;
          }
        } catch (error) {
          console.error("Authentication error during email-password provider:", error);
          throw new Error("認証中にエラーが発生しました。詳細についてはサーバーログを確認してください。");
        }
      },
    }),
  ],
  // セッション戦略をJWTに設定
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // JWT設定
  jwt: {
    secret: process.env.NEXTAUTH_SECRET, // 環境変数で秘密鍵を設定
  },
  // ページの設定 (NextAuth.jsが提供するデフォルトページをカスタマイズする場合)
  pages: {
    signIn: "/admin", // ログインページへのパス
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) {
        // user.id, user.name, user.email は authorize コールバックで string として返されるため、
        // ここではこれらのプロパティが string であることを明示的にアサートします。
        token.id = user.id as string;
        token.name = user.name as string;
        token.email = user.email as string;
        if (user.role) {
          token.role = user.role;
        }
        if (user.storeId) {
          token.storeId = user.storeId;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // JWTからの情報をセッションに渡す
      // next-auth.d.ts で型を拡張したため、session.user は常に存在すると仮定できる
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
        if (token.storeId) {
          session.user.storeId = token.storeId as Id<'stores'>;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // 環境変数で秘密鍵を設定
});

export { handler as GET, handler as POST }; 