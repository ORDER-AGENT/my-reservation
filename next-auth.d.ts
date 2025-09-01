import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from 'next-auth';

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string; // idをstring | null から string に変更
      role?: string; // rolesをroleに変更
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string; // rolesをroleに変更
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string; // idをstring | undefined に変更
    name?: string; // nameをstring | undefined に変更
    email?: string; // emailをstring | undefined に変更
    role?: string; // rolesをroleに変更
  }
} 