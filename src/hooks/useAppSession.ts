'use client';

import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { UserRole } from '@/types/user';

// ゲストユーザー用のセッション情報
const guestSession: Session = {
  expires: '1', // 適当な値でOK
  user: {
    id: 'guest',
    role: 'guest' as UserRole,
  },
};

/**
 * next-authのuseSessionをラップし、未認証ユーザーにゲストセッションを提供するカスタムフック
 */
export const useAppSession = () => {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    return { session: guestSession, status };
  }

  return { session, status };
};
