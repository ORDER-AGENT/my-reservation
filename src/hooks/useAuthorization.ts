'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRequiredRoles } from '@/lib/auth/pageRoles';
import { useAppSession } from './useAppSession';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UserRole } from '@/types/user';

type AuthorizationStatus = {
  isLoading: boolean;
  isAuthorized: boolean;
  isUnauthenticated: boolean;
  isSystemInitialized: boolean;
};

const useAuthorization = (): AuthorizationStatus => {
  const { session, status } = useAppSession();
  const usersCount = useQuery(api.users.getUsersCount);
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus>({
    isLoading: true,
    isAuthorized: false,
    isUnauthenticated: false,
    isSystemInitialized: false,
  });

  useEffect(() => {
    if (status === 'loading' || usersCount === undefined) {
      setAuthStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    const isSystemInitialized = usersCount > 0;
    const requiredRoles = getRequiredRoles(pathname);

    // 認証が不要なページ
    if (!requiredRoles || requiredRoles.length === 0) {
      setAuthStatus({
        isLoading: false,
        isAuthorized: true,
        isUnauthenticated: status === 'unauthenticated',
        isSystemInitialized,
      });
      return;
    }

    const userRole = (session?.user?.role) as UserRole;
    const hasRequiredRole = requiredRoles.some(role => userRole.includes(role));

    if (hasRequiredRole) {
      setAuthStatus({
        isLoading: false,
        isAuthorized: true,
        isUnauthenticated: false,
        isSystemInitialized,
      });
    } else {
      setAuthStatus({
        isLoading: false,
        isAuthorized: false,
        isUnauthenticated: status === 'unauthenticated',
        isSystemInitialized,
      });
    }
  }, [session, status, pathname, usersCount]);

  return authStatus;
};

export default useAuthorization;
