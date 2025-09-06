'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPageAccessDef } from '@/lib/auth/pageRoles';
import { useAppSession } from './useAppSession';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// フックが返す状態の型定義
type AuthorizationStatus = {
  isLoading: boolean; // 認証状態を読み込み中か
  isAuthorized: boolean; // ページへのアクセスが許可されているか
  isReadOnly: boolean; // 読み取り専用アクセスか
  isUnauthenticated: boolean; // 未認証状態か
  isSystemInitialized: boolean; // システムが初期化済みか
};

const useAuthorization = (): AuthorizationStatus => {
  const { session, status } = useAppSession();
  const usersCount = useQuery(api.users.getUsersCount);
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus>({
    isLoading: true,
    isAuthorized: false,
    isReadOnly: false,
    isUnauthenticated: false,
    isSystemInitialized: false,
  });

  useEffect(() => {
    // セッション情報またはシステム初期化状態の読み込み中
    if (status === 'loading' || usersCount === undefined) {
      setAuthStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    const isSystemInitialized = usersCount > 0;
    const accessDef = getPageAccessDef(pathname);

    console.log("accessDef", accessDef);

    // 権限定義がないページ (誰でもアクセス可能)
    if (!accessDef) {
      setAuthStatus({
        isLoading: false,
        isAuthorized: true,
        isReadOnly: false,
        isUnauthenticated: status === 'unauthenticated',
        isSystemInitialized,
      });
      return;
    }

    const userRole = session?.user?.role || 'guest';

    // 未認証またはロールがない場合
    if (!userRole) {
      setAuthStatus({
        isLoading: false,
        isAuthorized: false,
        isReadOnly: false,
        isUnauthenticated: true,
        isSystemInitialized,
      });
      return;
    }

    // 権限チェック
    const canReadWrite = accessDef.readWrite.includes(userRole);
    const canReadOnly = accessDef.readOnly.includes(userRole);

    const isAuthorized = canReadWrite || canReadOnly;
    const isReadOnly = !canReadWrite && canReadOnly;

    setAuthStatus({
      isLoading: false,
      isAuthorized,
      isReadOnly,
      isUnauthenticated: false,
      isSystemInitialized,
    });
  }, [session, status, pathname, usersCount]);

  return authStatus;
};

export default useAuthorization;
