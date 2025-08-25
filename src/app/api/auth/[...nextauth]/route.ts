import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { User, Session } from "next-auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 環境変数から管理者パスワードを取得
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
          console.error("ADMIN_PASSWORD is not set in environment variables.");
          // 認証失敗時にエラーをスロー
          throw new Error('サーバー設定エラー: 管理者パスワードが設定されていません。');
        }

        // 入力されたパスワードと環境変数のパスワードを比較
        if (credentials?.password === adminPassword) {
          // 認証成功: ユーザーオブジェクトを返す
          // ここで返されるオブジェクトはセッションに保存されます。
          // 実際のアプリケーションでは、データベースからユーザー情報を取得します。
          return { id: 'admin', name: '管理者', email: 'admin@example.com', roles: ['admin'] };
        } else {
          // 認証失敗時にエラーをスロー
          throw new Error('パスワードが間違っています。');
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
        if (user.roles) {
          token.roles = user.roles;
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
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // 環境変数で秘密鍵を設定
});

export { handler as GET, handler as POST }; 