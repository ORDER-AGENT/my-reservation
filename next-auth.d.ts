import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from './src/types/user';

declare module 'next-auth' {
  interface User extends DefaultUser { // User インターフェースを拡張
    role: UserRole;
    storeId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      storeId?: string;
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    storeId?: string;
  }
} 