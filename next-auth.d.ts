import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from 'next-auth';

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string | null;
      roles?: string[] | null; // rolesプロパティを追加
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    roles?: string[] | null; // rolesプロパティを追加
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    name: string;
    email: string;
    roles?: string[] | null;
  }
} 